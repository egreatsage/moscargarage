// src/app/api/analytics/counts/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Staff from '@/models/Staff';
import Service from '@/models/Service';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const bookingCount = await Booking.countDocuments();
    const staffCount = await Staff.countDocuments();
    const serviceCount = await Service.countDocuments();
    // Assuming all users in the User model are customers for this count
    const customerCount = await User.countDocuments();

    const counts = {
      bookings: bookingCount,
      staff: staffCount,
      services: serviceCount,
      customers: customerCount,
    };

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    return NextResponse.json({ success: false, error: 'Server error while fetching counts' }, { status: 500 });
  }
}
