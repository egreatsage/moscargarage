// src/components/booking/PaymentForm.js
'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PaymentForm({ bookingId, amount, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, checking, success, failed
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Poll payment status
  useEffect(() => {
    if (checkoutRequestID && paymentStatus === 'checking') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/mpesa/status?checkoutRequestID=${checkoutRequestID}`);
          const data = await response.json();

          if (data.success) {
            const { payment, booking } = data.data;

            if (payment.status === 'completed') {
              setPaymentStatus('success');
              setStatusMessage('Payment successful! Your booking is confirmed.');
              clearInterval(interval);
              
              // Call success callback after a short delay
              setTimeout(() => {
                onSuccess(booking);
              }, 2000);
            } else if (payment.status === 'failed') {
              setPaymentStatus('failed');
              setError(payment.resultDesc || 'Payment failed. Please try again.');
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000); // Check every 3 seconds

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (paymentStatus === 'checking') {
          setPaymentStatus('failed');
          setError('Payment timeout. Please check your phone and try again.');
        }
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [checkoutRequestID, paymentStatus, onSuccess]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If starts with +254, remove the +
    if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // Validate phone number
      if (!phoneNumber || phoneNumber.length !== 12 || !phoneNumber.startsWith('254')) {
        throw new Error('Please enter a valid phone number (e.g., 254712345678)');
      }

      // Initiate STK push
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestID(data.data.checkoutRequestID);
        setPaymentStatus('checking');
        setStatusMessage('Please check your phone and enter your M-Pesa PIN...');
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      setError(err.message);
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setError('');
    setCheckoutRequestID('');
    setStatusMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Payment Amount */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
        <div className="text-sm font-medium mb-1">Total Amount</div>
        <div className="text-4xl font-bold">KES {amount.toLocaleString()}</div>
      </div>

      {/* Payment Form */}
      {paymentStatus === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4 mr-2" />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="254712345678"
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
              disabled={processing}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your M-Pesa registered phone number (format: 254XXXXXXXXX)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={processing || !phoneNumber}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initiating Payment...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                <span>Pay with M-Pesa</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Processing Status */}
      {paymentStatus === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sending Payment Request...
          </h3>
          <p className="text-gray-600">Please wait while we process your request.</p>
        </div>
      )}

      {/* Checking Status */}
      {paymentStatus === 'checking' && (
        <div className="text-center py-8">
          <div className="relative mb-6">
            <Smartphone className="w-16 h-16 text-blue-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Waiting for Payment Confirmation
          </h3>
          <p className="text-gray-600 mb-4">{statusMessage}</p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-1">Steps to complete payment:</p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Check your phone for the M-Pesa prompt</li>
              <li>Enter your M-Pesa PIN</li>
              <li>Confirm the payment</li>
            </ol>
          </div>
        </div>
      )}

      {/* Success Status */}
      {paymentStatus === 'success' && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600">{statusMessage}</p>
        </div>
      )}

      {/* Failed Status */}
      {paymentStatus === 'failed' && (
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Failed
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payment Info */}
      {paymentStatus === 'idle' && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Secure M-Pesa payment processing</li>
            <li>• You will receive an M-Pesa prompt on your phone</li>
            <li>• Enter your PIN to complete the payment</li>
            <li>• Your booking will be confirmed immediately after payment</li>
          </ul>
        </div>
      )}
    </div>
  );
}
