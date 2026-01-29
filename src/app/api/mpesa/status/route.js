
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { querySTKPushStatus } from '@/lib/mpesa';


export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const checkoutRequestID = searchParams.get('checkoutRequestID');
    const bookingId = searchParams.get('bookingId');

    if (!checkoutRequestID && !bookingId) {
      return NextResponse.json(
        { success: false, error: 'checkoutRequestID or bookingId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let payment;

    if (checkoutRequestID) {
      payment = await Payment.findOne({ checkoutRequestID });
    } else {
      payment = await Payment.findOne({ booking: bookingId }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

   
    if (payment.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    
    if (payment.status === 'processing' || payment.status === 'pending') {
      const statusResult = await querySTKPushStatus(payment.checkoutRequestID);
      
      if (statusResult.success) {
        const { ResultCode, ResultDesc } = statusResult.data;
        
        
        if (ResultCode === '0') {
          payment.status = 'completed';
          payment.resultCode = ResultCode;
          payment.resultDesc = ResultDesc;
          await payment.save();

          
          await Booking.findByIdAndUpdate(payment.booking, {
            status: 'confirmed',
            paymentStatus: 'paid',
          });
        }
        
      }
    }

    
    const booking = await Booking.findById(payment.booking)
      .populate('service', 'name')
      .select('bookingNumber status paymentStatus bookingDate timeSlot vehicle totalAmount service');

    return NextResponse.json({
      success: true,
      data: {
        payment,
        booking,
      },
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
