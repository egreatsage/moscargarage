'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User, Calendar, Car, LogOut, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Moscar Garage</span>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Customer Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back! Manage your bookings and profile settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bookings Link */}
          <Link 
            href="/bookings" 
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">My Bookings</h2>
            <p className="text-slate-600 text-sm">View your upcoming appointments and past service history.</p>
          </Link>

          {/* Profile Link */}
          <Link 
            href="/profile" 
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">My Profile</h2>
            <p className="text-slate-600 text-sm">Update your personal details, contact info, and vehicle data.</p>
          </Link>

          {/* Quick Action: New Booking */}
          <Link 
            href="/" 
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <PlusCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Book a Service</h2>
            <p className="text-slate-600 text-sm">Schedule a new repair, maintenance, or inspection.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}