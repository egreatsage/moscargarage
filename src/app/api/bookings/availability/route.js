// src/app/api/bookings/availability/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import Staff from '@/models/Staff'; // Import Staff to fix MissingSchemaError
import { validateBookingDate } from '@/lib/bookingUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

   
    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    

    if (!serviceId) {
        return NextResponse.json(
          { success: false, error: 'Service ID is required to check availability' },
          { status: 400 }
        );
    }

   
    const validation = validateBookingDate(new Date(dateStr));
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    await connectDB();

 
    const service = await Service.findById(serviceId);
    if (!service) {
        return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    
    const qualifiedStaffIds = service.assignedStaff
      .filter(s => s.staffId)
      .map(s => s.staffId.toString());

  
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const dayBookings = await Booking.find({
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['confirmed', 'in_progress', 'pending_payment'] },
    }).select('timeSlot staff');

    
    const slots = [];
    const startHour = 8; 
    const endHour = 18;  
    const slotDuration = 2;

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
      const slotString = `${startTime}-${endTime}`;

      // Find bookings that fall in this specific slot
      const bookingsInSlot = dayBookings.filter(b => b.timeSlot === slotString);
      
      // Get IDs of staff members who are busy in this slot
      const busyStaffIds = bookingsInSlot.map(b => b.staff ? b.staff.toString() : null).filter(Boolean);

      // Check: Is there ANY qualified staff member who is NOT in the busy list?
      const hasAvailableStaff = qualifiedStaffIds.some(qualifiedId => !busyStaffIds.includes(qualifiedId));

      // If no qualified staff are assigned at all, the slot is effectively unavailable
      const isAvailable = qualifiedStaffIds.length > 0 && hasAvailableStaff;

      slots.push({
        slot: slotString,
        available: isAvailable,
        startTime,
        endTime,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        slots: slots,
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