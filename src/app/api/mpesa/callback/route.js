
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { processCallback } from '@/lib/mpesa';
import { sendBookingNotification, sendCustomerBookingConfirmation } from '@/lib/mailer';


export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    await connectDB();

   
    const callbackData = processCallback(body);

    
    const payment = await Payment.findOne({
      checkoutRequestID: callbackData.checkoutRequestID,
    });

    if (!payment) {
      console.error('Payment not found for checkoutRequestID:', callbackData.checkoutRequestID);
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }

    
    payment.resultCode = callbackData.resultCode.toString();
    payment.resultDesc = callbackData.resultDesc;

    
    if (callbackData.resultCode === 0) {
      
      payment.status = 'completed';
      payment.mpesaReceiptNumber = callbackData.mpesaReceiptNumber;
      
      
      const mpesaDate = callbackData.transactionDate?.toString() || '';
      let parsedDate;
      if (mpesaDate.length === 14) {
        
        parsedDate = new Date(`${mpesaDate.slice(0, 4)}-${mpesaDate.slice(4, 6)}-${mpesaDate.slice(6, 8)}T${mpesaDate.slice(8, 10)}:${mpesaDate.slice(10, 12)}:${mpesaDate.slice(12, 14)}`);
      } else {
        parsedDate = new Date(); 
      }
      payment.transactionDate = parsedDate;

      payment.metadata = {
        amount: callbackData.amount,
        phoneNumber: callbackData.phoneNumber,
      };

      await payment.save();

     
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.paymentReference = callbackData.mpesaReceiptNumber;
        await booking.save();
        
        
        await booking.populate('service', 'name price duration category');
        await booking.populate('user', 'name email phone');

        
        sendBookingNotification(booking).catch(err => console.error("Failed to send admin booking notification:", err));
        sendCustomerBookingConfirmation(booking).catch(err => console.error("Failed to send customer confirmation:", err));

        console.log(`Booking ${booking.bookingNumber} confirmed with payment ${callbackData.mpesaReceiptNumber}`);
      }
    } else {
     
      payment.status = 'failed';
      await payment.save();

      console.log(`Payment failed for booking ${payment.booking}: ${callbackData.resultDesc}`);
    }

    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
}
