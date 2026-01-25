// src/app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';

// GET a single booking by ID
export async function GET(request, context) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration category image');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this booking
    if (session.user.role === 'customer' && booking.user._id.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a booking
export async function PUT(request, context) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = booking.user.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Customers can only update certain fields
    if (session.user.role === 'customer') {
      const { vehicle, issueDescription } = body;
      
      // Only allow updates if booking is still pending payment
      if (booking.status !== 'pending_payment') {
        return NextResponse.json(
          { success: false, error: 'Cannot update confirmed booking' },
          { status: 400 }
        );
      }

      if (vehicle) booking.vehicle = { ...booking.vehicle, ...vehicle };
      if (issueDescription) booking.issueDescription = issueDescription;
    }

    // Admins can update more fields
    if (session.user.role === 'admin') {
      const { status, adminNotes, notes, bookingDate, timeSlot } = body;
      
      if (status) booking.status = status;
      if (adminNotes) booking.adminNotes = adminNotes;
      if (notes) booking.notes = notes;
      if (bookingDate) booking.bookingDate = bookingDate;
      if (timeSlot) booking.timeSlot = timeSlot;

      // If marking as completed, set completedAt
      if (status === 'completed' && !booking.completedAt) {
        booking.completedAt = new Date();
      }
    }

    await booking.save();

    // Populate before returning
    await booking.populate('user', 'name email phone');
    await booking.populate('service', 'name price duration category');

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error while updating booking' },
      { status: 500 }
    );
  }
}

// DELETE cancel a booking
export async function DELETE(request, context) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = booking.user.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel completed booking' },
        { status: 400 }
      );
    }

    // Apply time-based restrictions only for non-admin users
    if (session.user.role !== 'admin') {
      const now = new Date();
      const bookingDateTime = new Date(booking.bookingDate);
      const [hours] = booking.timeSlot.split('-')[0].split(':').map(Number);
      bookingDateTime.setHours(hours, 0, 0, 0);

      if (bookingDateTime < now) {
        return NextResponse.json(
          { success: false, error: 'Cannot cancel past bookings' },
          { status: 400 }
        );
      }

      // Check 24-hour cancellation policy (customers only)
      if (session.user.role === 'customer') {
        const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
        if (hoursUntilBooking < 24) {
          return NextResponse.json(
            { success: false, error: 'Cannot cancel bookings less than 24 hours in advance' },
            { status: 400 }
          );
        }
      }
    }

    // Get cancellation reason from request body
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = session.user.id;
    booking.cancellationReason = reason || 'No reason provided';

    await booking.save();

    // If payment was made, update payment status
    if (booking.paymentStatus === 'paid') {
      await Payment.updateOne(
        { booking: booking._id },
        { status: 'refunded', refundedAt: new Date() }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error(`Error cancelling booking ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error while cancelling booking' },
      { status: 500 }
    );
  }
}
