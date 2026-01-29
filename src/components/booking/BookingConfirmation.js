// src/components/booking/BookingConfirmation.js
'use client';

import { CheckCircle, Calendar, Clock, Car, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function BookingConfirmation({ booking }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600">
          Your booking has been successfully confirmed and payment received.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="text-sm font-medium mb-1">Booking Number</div>
          <div className="text-2xl font-bold">{booking.bookingNumber}</div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Service
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {booking.service?.name || 'Service'}
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </h3>
              <p className="text-gray-900">{formatDate(booking.bookingDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Time
              </h3>
              <p className="text-gray-900">{booking.timeSlot}</p>
            </div>
          </div>

          {/* Vehicle */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center">
              <Car className="w-4 h-4 mr-1" />
              Vehicle
            </h3>
            <p className="text-gray-900">
              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
            </p>
            <p className="text-sm text-gray-600">
              Registration: {booking.vehicle.registration}
            </p>
          </div>

          {/* Amount */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount Paid</span>
              <span className="text-2xl font-bold text-green-600">
                KES {booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Please arrive 10 minutes before your scheduled time</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>A confirmation email has been sent to your registered email</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>You can cancel or reschedule up to 24 hours before your appointment</span>
          </li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>Moscar Garage, Nairobi, Kenya</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span>+254 712 345 678</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span>info@moscar.co.ke</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/bookings"
          className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View My Bookings
        </Link>
        <Link
          href="/services"
          className="flex-1 bg-white text-blue-600 border-2 border-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Book Another Service
        </Link>
      </div>
    </div>
  );
}
