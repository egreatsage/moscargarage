// src/app/(admin)/admin/dashboard/page.js
import React from 'react';
import { Briefcase, Users, Wrench, BookOpen } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Staff from '@/models/Staff';
import Service from '@/models/Service';
import User from '@/models/User';
import MessageList from '../messages/MessageList';

async function getStats() {
  try {
    await connectDB();
    const bookingCount = await Booking.countDocuments();
    const staffCount = await Staff.countDocuments();
    const serviceCount = await Service.countDocuments();
    const customerCount = await User.countDocuments();
    return { bookingCount, staffCount, serviceCount, customerCount };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // In case of an error, return zero for all counts
    return { bookingCount: 0, staffCount: 0, serviceCount: 0, customerCount: 0 };
  }
}

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md flex items-center justify-between border-l-4 ${color}`}>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="text-gray-400">
        <Icon className="w-10 h-10" />
      </div>
    </div>
  );
};

export default async function AdminDashboard() {
  const { bookingCount, staffCount, serviceCount, customerCount } = await getStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">A quick overview of your garage's activities.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Bookings" value={bookingCount} icon={BookOpen} color="border-blue-500" />
          <StatCard title="Team Members" value={staffCount} icon={Briefcase} color="border-purple-500" />
          <StatCard title="Services Offered" value={serviceCount} icon={Wrench} color="border-orange-500" />
          <StatCard title="Registered Customers" value={customerCount} icon={Users} color="border-green-500" />
        </div>

        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <MessageList />
            </div>
        </div>
      </div>
    </div>
  );
}
