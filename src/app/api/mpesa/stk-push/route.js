// src/app/api/mpesa/stk-push/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { initiateSTKPush, validatePhoneNumber } from '@/lib/mpesa';

// POST initiate STK push payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { bookingId, phoneNumber } = body;

    if (!bookingId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and phone number are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use 254XXXXXXXXX or 0XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await Booking.findById(bookingId).populate('service', 'name');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns this booking
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if booking is in correct status
    if (booking.status !== 'pending_payment') {
      return NextResponse.json(
        { success: false, error: 'Booking is not pending payment' },
        { status: 400 }
      );
    }

    // Check if payment already exists and is processing
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ['pending', 'processing'] },
    });

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment is already being processed' },
        { status: 400 }
      );
    }

    // Initiate STK push
    const stkResult = await initiateSTKPush(
      phoneValidation.formatted,
      booking.totalAmount,
      booking.bookingNumber,
      `Payment for ${booking.service.name}`
    );

    if (!stkResult.success) {
      return NextResponse.json(
        { success: false, error: stkResult.error },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: session.user.id,
      amount: booking.totalAmount,
      phoneNumber: phoneValidation.formatted,
      merchantRequestID: stkResult.data.MerchantRequestID,
      checkoutRequestID: stkResult.data.CheckoutRequestID,
      status: 'processing',
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        message: 'STK push sent. Please check your phone and enter your M-Pesa PIN.',
        checkoutRequestID: stkResult.data.CheckoutRequestID,
      },
    });
  } catch (error) {
    console.error('Error initiating STK push:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while initiating payment' },
      { status: 500 }
    );
  }
}
