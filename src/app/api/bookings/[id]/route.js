// src/app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import Service from '@/models/Service'; // Ensure Service is registered
import User from '@/models/User';       // Ensure User is registered
import Staff from '@/models/Staff'

// GET a single booking by ID
export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Populate service and its assignedStaff to let Admin see who else can do the job
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone')
      .populate({
        path: 'service',
        select: 'name price duration category assignedStaff', 
        populate: {
            path: 'assignedStaff.staffId',
            select: 'name'
        }
      })
      .populate('staff', 'name email phone'); // Populate current staff details

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Security: Customers can only view their own bookings
    if (session.user.role === 'customer' && booking.user._id.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT update a booking
export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      status, 
      notes, 
      adminNotes, 
      bookingDate, 
      timeSlot,
      staffId // <--- Capture the new Staff ID
    } = body;

    // --- Admin Only Updates ---
    if (session.user.role === 'admin' || session.user.role === 'staff') {
        if (status) {
            booking.status = status;
            if (status === 'completed') booking.completedAt = new Date();
            // If cancelled, we might want to free up the staff (logic handled in double-booking check by ignoring cancelled)
        }
        if (adminNotes !== undefined) booking.adminNotes = adminNotes;
        
        // Allow Admin to change Date/Time
        if (bookingDate) booking.bookingDate = new Date(bookingDate);
        if (timeSlot) booking.timeSlot = timeSlot;

        // 👇👇👇 RE-ASSIGN STAFF LOGIC 👇👇👇
        if (staffId && staffId !== booking.staff?.toString()) {
            // Optional: You could add a check here to ensure the new staff is qualified
            // But for "Admin Power", we often allow overriding constraints.
            booking.staff = staffId;
        }
    }

    // --- Customer Updates (Restricted) ---
    if (session.user.role === 'customer') {
       // Customers can only update notes/issue if pending
       if (booking.status === 'pending_payment' && body.issueDescription) {
           booking.issueDescription = body.issueDescription;
       }
       // Customers cannot change status directly via PUT (use DELETE for cancel)
    }

    // Common Updates
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    // Re-populate for response
    await booking.populate('service');
    await booking.populate('user');
    await booking.populate('staff');

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
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
    if (session.user.role !== 'admin' ||session.user.role !== 'staff') {
      const now = new Date();
      const bookingDateTime = new Date(booking.bookingDate);
      const [hours] = booking.timeSlot.split('-')[0].split(':').map(Number);
      bookingDateTime.setHours(hours, 0, 0, 0);

      if (status === 'completed') {
                booking.completedAt = new Date();
                // TODO: Trigger Notification Function here (e.g., sendCompletionEmail(booking))
            }

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
