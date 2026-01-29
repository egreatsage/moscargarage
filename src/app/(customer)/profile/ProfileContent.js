'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Car, ImageIcon, Save, X, Edit2, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/ui/Toast';

// Helper Components
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
  <div className="bg-slate-50 rounded-xl w-full h-48 sm:h-56 md:h-64 flex items-center justify-center border-2 border-dashed border-slate-300">
    <div className="text-center text-slate-400">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3 shadow-sm">
        <ImageIcon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-xs text-slate-500 mt-1">No image uploaded</p>
    </div>
  </div>
);

const ImageDisplay = ({ src, alt }) => (
  <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden shadow-md ring-2 ring-slate-200">
    <Image src={src} alt={alt} layout="fill" className="object-cover" />
  </div>
);

export default function ProfileContent({ user: initialUser }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: initialUser.name || '',
    phone: initialUser.phone || '',
    'vehicle.make': initialUser.vehicle?.make || '',
    'vehicle.model': initialUser.vehicle?.model || '',
    'vehicle.year': initialUser.vehicle?.year || '',
    'vehicle.registration': initialUser.vehicle?.registration || '',
  });

  // File State
  const [files, setFiles] = useState({
    profilePicture: null,
    vehiclePhoto: null
  });

  // Previews
  const [previews, setPreviews] = useState({
    profilePicture: initialUser.profilePicture,
    vehiclePhoto: initialUser.vehicle?.photo
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      // Append text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append files if changed
      if (files.profilePicture) {
        data.append('profilePicture', files.profilePicture);
      }
      if (files.vehiclePhoto) {
        data.append('vehicle.photo', files.vehiclePhoto);
      }

      const res = await fetch(`/api/users/${initialUser._id}`, {
        method: 'PUT',
        body: data, // No Content-Type header needed for FormData, browser sets it with boundary
      });

      const result = await res.json();

      if (result.success) {
        setToast({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditing(false);
        router.refresh(); // Refresh server data
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const vehicle = initialUser.vehicle || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast 
            type={toast.type} 
            message={toast.message} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 via-orange-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-3 rounded-xl backdrop-blur-sm border border-orange-400/30">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">My Profile</h1>
                  <p className="text-slate-300 mt-1">Manage your personal and vehicle details</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-lg ${
                  isEditing 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-5 h-5" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5 " /> Edit Profile
                  </>
                )}
              </button>
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Picture Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-orange-600" /> Profile Picture
                  </h3>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      {previews.profilePicture ? (
                        <ImageDisplay src={previews.profilePicture} alt="Preview" />
                      ) : (
                        <ImagePlaceholder title="No Image" />
                      )}
                      <label className="flex items-center justify-center w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors border border-slate-300 text-gray-800">
                        <UploadCloud className="w-5 h-5 mr-2" />
                        <span>Change Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'profilePicture')} 
                        />
                      </label>
                    </div>
                  ) : (
                    initialUser.profilePicture ? (
                      <ImageDisplay src={initialUser.profilePicture} alt="Profile Picture" />
                    ) : (
                      <ImagePlaceholder title="Your Photo" />
                    )
                  )}
                </div>
              </div>

              {/* Vehicle Picture Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-orange-600" /> Vehicle Picture
                  </h3>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      {previews.vehiclePhoto ? (
                        <ImageDisplay src={previews.vehiclePhoto} alt="Vehicle Preview" />
                      ) : (
                        <ImagePlaceholder title="No Image" />
                      )}
                      <label className="flex items-center justify-center w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors border border-slate-300 text-gray-800">
                        <UploadCloud className="w-5 h-5 mr-2" />
                        <span>Change Vehicle Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'vehiclePhoto')} 
                        />
                      </label>
                    </div>
                  ) : (
                    vehicle.photo ? (
                      <ImageDisplay src={vehicle.photo} alt="Vehicle Picture" />
                    ) : (
                      <ImagePlaceholder title="Vehicle Photo" />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-orange-600" /> Personal Information
                  </h3>
                  {!isEditing && (
                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                      initialUser.isActive 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {initialUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2 opacity-60 pointer-events-none">
                         <label className="text-sm font-semibold text-slate-700">Email (Cannot be changed)</label>
                        <input
                          type="email"
                          value={initialUser.email}
                          readOnly
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 bg-slate-50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 divide-y md:divide-y-0 divide-slate-100">
                      <DetailItem label="Full Name" value={initialUser.name} />
                      <DetailItem label="Email Address" value={initialUser.email} />
                      <DetailItem label="Phone Number" value={initialUser.phone} />
                      <DetailItem 
                        label="Account Role" 
                        value={initialUser.role ? initialUser.role.charAt(0).toUpperCase() + initialUser.role.slice(1) : 'N/A'} 
                      />
                      <DetailItem label="Email Verified" value={initialUser.emailVerified} isStatus={true} />
                      <DetailItem 
                        label="Member Since" 
                        value={new Date(initialUser.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                 <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-orange-600" /> Vehicle Information
                  </h3>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Vehicle Make</label>
                        <input
                          type="text"
                          name="vehicle.make"
                          value={formData['vehicle.make']}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Vehicle Model</label>
                        <input
                          type="text"
                          name="vehicle.model"
                          value={formData['vehicle.model']}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Year of Manufacture</label>
                        <input
                          type="number"
                          name="vehicle.year"
                          value={formData['vehicle.year']}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Registration Plate</label>
                        <input
                          type="text"
                          name="vehicle.registration"
                          value={formData['vehicle.registration']}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 divide-y md:divide-y-0 divide-slate-100">
                      <DetailItem label="Vehicle Make" value={vehicle.make} />
                      <DetailItem label="Vehicle Model" value={vehicle.model} />
                      <DetailItem label="Year of Manufacture" value={vehicle.year} />
                      <DetailItem label="Registration Plate" value={vehicle.registration} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}