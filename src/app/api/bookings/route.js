// src/app/api/bookings/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import Staff from '@/models/Staff'; 
import { sendBookingNotification, sendCustomerBookingConfirmation } from '@/lib/mailer';


export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = {};

    
    if (session.user.role === 'customer') {
      query.user = session.user.id;
    }else if (session.user.role === 'staff') {
      query.staff = session.user.id;
    } else if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = { $in: status.split(',') };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration category')
      .populate('staff', 'name') 

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      serviceId,
      bookingDate,
      timeSlot,
      vehicle,
      issueDescription,
    } = body;

    
    if (!serviceId || !bookingDate || !timeSlot || !vehicle ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.registration) {
      return NextResponse.json(
        { success: false, error: 'Complete vehicle information is required' },
        { status: 400 }
      );
    }

    
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    if (!service.isActive) {
      return NextResponse.json({ success: false, error: 'Service is not available' }, { status: 400 });
    }

    
    const qualifiedStaffIds = service.assignedStaff
      .filter(s => s.staffId)
      .map(s => s.staffId.toString());

    if (qualifiedStaffIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No staff members are currently assigned to this service.' },
        { status: 400 }
      );
    }

    const conflictingBookings = await Booking.find({
      bookingDate: new Date(bookingDate),
      timeSlot: timeSlot,
      status: { $in: ['confirmed', 'in_progress', 'pending_payment'] },
    }).select('staff');

    const busyStaffIds = conflictingBookings.map(b => b.staff ? b.staff.toString() : null).filter(Boolean);

   
    const availableStaffIds = qualifiedStaffIds.filter(id => !busyStaffIds.includes(id));

    if (availableStaffIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'This time slot is fully booked for the selected service.' },
        { status: 400 }
      );
    }

    
    const assignedStaffId = availableStaffIds[0];

   
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastBooking = await Booking.findOne({
      bookingNumber: new RegExp(`^MOS-${dateStr}-`),
    }).sort({ bookingNumber: -1 });

    let sequence = 1;
    if (lastBooking) {
      const lastSequence = parseInt(lastBooking.bookingNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    const bookingNumber = `MOS-${dateStr}-${sequence.toString().padStart(4, '0')}`;

  
    const booking = await Booking.create({
      bookingNumber,
      user: session.user.id,
      service: serviceId,
      staff: assignedStaffId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      vehicle,
      issueDescription,
      totalAmount: service.price,
      status: 'pending_payment',
      paymentStatus: 'pending',
    });


    await booking.populate('service', 'name price duration category');
    await booking.populate('user', 'name email phone');


    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: 'Booking created successfully. Please proceed with payment.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error while creating booking' },
      { status: 500 }
    );
  }
}