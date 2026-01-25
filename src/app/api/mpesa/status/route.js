// src/app/api/mpesa/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { querySTKPushStatus } from '@/lib/mpesa';

// GET check payment status
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

    // Check if user owns this payment
    if (payment.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If payment is still processing, query M-Pesa for status
    if (payment.status === 'processing' || payment.status === 'pending') {
      const statusResult = await querySTKPushStatus(payment.checkoutRequestID);
      
      if (statusResult.success) {
        const { ResultCode, ResultDesc } = statusResult.data;
        
        // If the query result is a definitive success, update the status
        if (ResultCode === '0') {
          payment.status = 'completed';
          payment.resultCode = ResultCode;
          payment.resultDesc = ResultDesc;
          await payment.save();

          // Update booking
          await Booking.findByIdAndUpdate(payment.booking, {
            status: 'confirmed',
            paymentStatus: 'paid',
          });
        }
        // For any other code (including '1032' - pending, or '1037' - timeout),
        // we don't mark it as failed here. We wait for the callback to provide the final status.
        // This prevents a race condition where the poller fails the transaction before the success callback arrives.
      }
    }

    // Get updated booking info, populating all necessary fields for the confirmation page
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
