// src/app/api/bookings/availability/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { generateTimeSlots, validateBookingDate } from '@/lib/bookingUtils';

// GET available time slots for a specific date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate the booking date
    const validation = validateBookingDate(new Date(date));
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all bookings for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['confirmed', 'in_progress', 'pending_payment'] },
    }).select('timeSlot status');

    // Generate available time slots
    const timeSlots = generateTimeSlots(new Date(date), existingBookings);

    return NextResponse.json({
      success: true,
      data: {
        date,
        slots: timeSlots,
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
