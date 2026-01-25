// src/app/api/bookings/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingNotification } from '@/lib/mailer';
import Service from '@/models/Service';

// GET all bookings (with filters)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions); // Pass authOptions
    
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

    // Build query
    let query = {};

    // If user is customer, only show their bookings
    if (session.user.role === 'customer') {
      query.user = session.user.id;
    } else if (userId) {
      // Admin can filter by userId
      query.user = userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration category')
      .sort({ createdAt: -1 });

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

// POST create a new booking
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions); // Pass authOptions
    
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

    // Validate required fields
    if (!serviceId || !bookingDate || !timeSlot || !vehicle || !issueDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vehicle information
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.registration) {
      return NextResponse.json(
        { success: false, error: 'Complete vehicle information is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if service is active
    if (!service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Service is not available' },
        { status: 400 }
      );
    }

    // Check if time slot is already booked
    const existingBooking = await Booking.findOne({
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: { $in: ['confirmed', 'in_progress', 'pending_payment'] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // --- Start: Generate Booking Number ---
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
    // --- End: Generate Booking Number ---


    // Create booking
    const booking = await Booking.create({
      bookingNumber, // Add generated bookingNumber
      user: session.user.id,
      service: serviceId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      vehicle,
      issueDescription,
      totalAmount: service.price,
      status: 'pending_payment',
      paymentStatus: 'pending',
    });

    // Populate the booking before returning
    await booking.populate('service', 'name price duration category');
    await booking.populate('user', 'name email phone');

    // Send email notification
    try {
      await sendBookingNotification(booking);
    } catch (emailError) {
      console.error('Failed to send booking notification email:', emailError);
      // Don't block the response for email failure
    }

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
