// src/app/(admin)/admin/dashboard/RecentBookings.js
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import React from 'react';
import Link from 'next/link';
import { CheckCircle, User, Car, Calendar } from 'lucide-react';

async function getRecentCompletedBookings() {
  try {
    await connectDB();
    const bookings = await Booking.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('service', 'name');
    return JSON.parse(JSON.stringify(bookings));
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
}

export default async function RecentBookings() {
  const bookings = await getRecentCompletedBookings();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recently Completed Bookings</h3>
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No completed bookings yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <li key={booking._id} className="py-4">
              <Link href={`/admin/bookings/${booking._id}`} className="block hover:bg-gray-50 p-2 rounded-lg -m-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {booking.service.name}
                    </p>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1.5" />
                      <span>{booking.user.name}</span>
                    </div>
                     <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Car className="w-4 h-4 mr-1.5" />
                      <span>{booking.vehicle.make} {booking.vehicle.model}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>{new Date(booking.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
