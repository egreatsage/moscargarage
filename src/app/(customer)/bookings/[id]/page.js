// src/app/(customer)/bookings/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Car,
  FileText,
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function BookingDetailsPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [id, setId] = useState(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && id) {
      fetchBooking();
    }
  }, [status, id, router]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.error || 'Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation (optional):');

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'No reason provided' }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled successfully');
        router.push('/bookings');
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canCancelBooking = () => {
    if (!booking) return false;
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursUntil = (bookingDate - now) / (1000 * 60 * 60);

    return hoursUntil >= 24;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to My Bookings</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking #{booking.bookingNumber}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                booking.status
              )}`}
            >
              {formatStatus(booking.status)}
            </span>
          </div>

          {/* Status Message */}
          {booking.status === 'confirmed' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Your booking is confirmed! We look forward to seeing you.</span>
            </div>
          )}

          {booking.status === 'pending_payment' && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <span>Payment pending. Please complete payment to confirm your booking.</span>
            </div>
          )}
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Service Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                Service
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {booking.service?.name}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {booking.service?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                </h3>
                <p className="text-gray-900">{formatDate(booking.bookingDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time
                </h3>
                <p className="text-gray-900">{booking.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Vehicle Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                Vehicle
              </h3>
              <p className="text-gray-900">
                {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                Registration
              </h3>
              <p className="text-gray-900">{booking.vehicle.registration}</p>
            </div>

            {booking.vehicle.color && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Color
                </h3>
                <p className="text-gray-900">{booking.vehicle.color}</p>
              </div>
            )}

            {booking.vehicle.mileage && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Mileage
                </h3>
                <p className="text-gray-900">
                  {parseInt(booking.vehicle.mileage).toLocaleString()} km
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Issue Description
            </h3>
            <p className="text-gray-900">{booking.issueDescription}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Amount</span>
              <span className="text-gray-900 font-semibold">
                KES {booking.totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-600">Payment Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>

            {booking.paymentReference && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">M-Pesa Receipt</span>
                <span className="text-gray-900 font-mono text-sm">
                  {booking.paymentReference}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total Paid</span>
              <span className="text-2xl font-bold text-green-600">
                KES {booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {booking.status === 'pending_payment' && (
            <Link
              href={`/bookings/new?serviceId=${booking.service.id}&bookingId=${booking.id}`}
              className="flex-1 bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Payment
            </Link>
          )}

          {canCancelBooking() && (
            <button
              onClick={handleCancelBooking}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {booking.status === 'completed' && (
            <Link
              href="/services"
              className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Another Service
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
