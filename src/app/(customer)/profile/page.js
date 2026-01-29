import React from 'react';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { User as UserIcon, Car, Mail, Phone, Calendar, Shield, ImageIcon } from 'lucide-react';
import Link from 'next/link';

const DetailItem = ({ label, value, isStatus = false }) => {
  let valueClasses = "text-slate-800 font-medium";
  if (isStatus) {
    valueClasses = value ? "text-green-600 font-semibold" : "text-red-500 font-semibold";
  }
  return (
    <div className="py-3">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={valueClasses}>{isStatus ? (value ? 'Yes' : 'No') : value || 'Not set'}</p>
    </div>
  );
};

const ImagePlaceholder = ({ title }) => (
  <div className=" from-slate-100 to-orange-50 rounded-xl w-full h-48 sm:h-56 md:h-64 flex items-center justify-center border-2 border-dashed border-slate-300">
    <div className="text-center text-slate-400">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3 shadow-sm">
        <ImageIcon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-xs text-slate-500 mt-1">To be added later</p>
    </div>
  </div>
);

const ImageDisplay = ({ src, alt }) => (
  <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden shadow-md ring-2 ring-slate-200">
    <Image 
      src={src}
      alt={alt}
      layout="fill"
      className="object-cover"
      priority
    />
  </div>
);

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-600">Could not find user details in the database.</p>
        </div>
      </div>
    );
  }

  const vehicle = user.vehicle || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 via-orange-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-orange-500/20 p-3 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">My Profile</h1>
                <p className="text-slate-300 mt-1">Manage your personal and vehicle details</p>
              </div>
            </div>
          </div>
        </header>
        <div className="my-6 border-t border-slate-200 flex justify-between items-center">

           <Link href="/dashboard" className="inline-flex items-center text-lg text-orange-600 hover:text-orange-800 font-bold py-2">
            &larr; View your Dashboard
           </Link>
            <Link href='/contact' className="inline-flex items-center text-lg text-orange-600 hover:text-orange-800 font-bold py-2">
            Contact Us for Support &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                </div>
              </div>
              <div className="p-6">
                {user.profilePicture ? (
                  <ImageDisplay src={user.profilePicture} alt="Profile Picture" />
                ) : (
                  <ImagePlaceholder title="Your Photo" />
                )}
              </div>
            </div>

            {/* Vehicle Picture Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                    <Car className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Vehicle Picture</h3>
                </div>
              </div>
              <div className="p-6">
                {vehicle.photo ? (
                  <ImageDisplay src={vehicle.photo} alt="Vehicle Picture" />
                ) : (
                  <ImagePlaceholder title="Vehicle Photo" />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  </div>
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 divide-y md:divide-y-0 divide-slate-100">
                  <DetailItem label="Full Name" value={user.name} />
                  <DetailItem label="Email Address" value={user.email} />
                  <DetailItem label="Phone Number" value={user.phone} />
                  <DetailItem 
                    label="Account Role" 
                    value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'} 
                  />
                  <DetailItem label="Email Verified" value={user.emailVerified} isStatus={true} />
                  <DetailItem 
                    label="Member Since" 
                    value={new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} 
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                    <Car className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Vehicle Information</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 divide-y md:divide-y-0 divide-slate-100">
                  <DetailItem label="Vehicle Make" value={vehicle.make} />
                  <DetailItem label="Vehicle Model" value={vehicle.model} />
                  <DetailItem label="Year of Manufacture" value={vehicle.year} />
                  <DetailItem label="Registration Plate" value={vehicle.registration} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}