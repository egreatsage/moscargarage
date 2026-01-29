
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import Service from '@/models/Service'; 
import User from '@/models/User';       
import Staff from '@/models/Staff'
import { sendEmail } from '@/lib/mailer';


export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    
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
      .populate('staff', 'name email phone'); 

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    
    if (session.user.role === 'customer' && booking.user._id.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}


export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const booking = await Booking.findById(id)
      .populate('user', 'name email')
      .populate('service', 'name')
      .populate('vehicle', 'make model registration')
      .populate('staff', 'name');

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
      staffId 
    } = body;

    
    if (session.user.role === 'admin' || session.user.role === 'staff') {
        if (status) {
            booking.status = status;
            if (status === 'completed') booking.completedAt = new Date();
            
        }
        if (adminNotes !== undefined) booking.adminNotes = adminNotes;
        
        
        if (bookingDate) booking.bookingDate = new Date(bookingDate);
        if (timeSlot) booking.timeSlot = timeSlot;

        
        if (staffId && staffId !== booking.staff?.toString()) {
 
            booking.staff = staffId;
        }
    }

  
    if (session.user.role === 'customer') {
       
       if (booking.status === 'pending_payment' && body.issueDescription) {
           booking.issueDescription = body.issueDescription;
       }
      
    }

  if (status === 'in_progress') {
       await sendEmail({
         to: booking.user.email,
         subject: 'Your Service has Started',
         text: `Hello ${booking.user.name}, your mechanic has started working on your ${booking.vehicle.registration}.`,
         html: `
           <h2>Service Started</h2>
           <p>Hello ${booking.user.name},</p>
           <p>Your mechanic has started working on your ${booking.vehicle.make} ${booking.vehicle.model}.</p>
           <p>We'll notify you when it's ready for pickup.</p>
         `
       });
    }
 if (status === 'completed') {
       await sendEmail({
         to: booking.user.email,
         subject: 'Vehicle Ready for Pickup',
         text: `Good news! Your ${booking.service.name} is complete.`,
         html: `
           <h2>Service Completed!</h2>
           <p>Good news ${booking.user.name}!</p>
           <p>Your ${booking.service.name} is complete.</p>
           <p><strong>Total Amount: KSh ${booking.totalAmount}</strong></p>
           <p>Your vehicle is ready for pickup.</p>
         `
       });
    }
  
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

  
    await booking.populate('service');
    await booking.populate('user');
    await booking.populate('staff');

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}


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

    
    const isOwner = booking.user.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

   
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

    
    if (session.user.role !== 'admin' ||session.user.role !== 'staff') {
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
