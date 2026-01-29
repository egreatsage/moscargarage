// src/app/api/bookings/[id]/force/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';


export async function DELETE(request, context) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);
    
    
    if (!session || session.user.role !== 'admin') {
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

    
    await Booking.findByIdAndDelete(id);

   
    await Payment.deleteMany({ booking: id });

    return NextResponse.json({
      success: true,
      message: 'Booking permanently deleted',
    });
  } catch (error) {
    console.error(`Error permanently deleting booking ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error while deleting booking' },
      { status: 500 }
    );
  }
}
