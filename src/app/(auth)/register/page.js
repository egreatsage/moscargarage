// app/(auth)/register/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, User, Mail, Phone, Car, Upload, Image as ImageIcon } from 'lucide-react';

const FileInput = ({ label, onFileSelect, preview }) => (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="mt-1 flex items-center space-x-4">
      <span className="inline-block h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-full w-full text-slate-300" />
        )}
      </span>
      <label htmlFor={label.toLowerCase().replace(' ', '-')} className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors">
        <Upload className="w-4 h-4 inline-block mr-2" />
        Change
        <input id={label.toLowerCase().replace(' ', '-')} name={label.toLowerCase().replace(' ', '-')} type="file" className="sr-only" onChange={onFileSelect} accept="image/*" />
      </label>
    </div>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      registration: '',
    },
  });
  const [profilePicture, setProfilePicture] = useState({ file: null, preview: '' });
  const [vehiclePhoto, setVehiclePhoto] = useState({ file: null, preview: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, setter) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [vehicleField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('password', formData.password);
    data.append('confirmPassword', formData.confirmPassword);
    data.append('vehicleMake', formData.vehicle.make);
    data.append('vehicleModel', formData.vehicle.model);
    data.append('vehicleYear', formData.vehicle.year);
    data.append('vehicleRegistration', formData.vehicle.registration);

    if (profilePicture.file) {
      data.append('profilePicture', profilePicture.file);
    }
    if (vehiclePhoto.file) {
      data.append('vehiclePhoto', vehiclePhoto.file);
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-600 mt-2">Join Moscar Garage today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                    placeholder="254712345678"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Format: 254XXXXXXXXX</p>
              </div>
              <FileInput label="Profile Picture" onFileSelect={(e) => handleFileChange(e, setProfilePicture)} preview={profilePicture.preview} />
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Vehicle Information <span className="text-sm font-normal text-slate-500">(Optional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicle.make" className="block text-sm font-medium text-slate-700 mb-2">
                  Make
                </label>
                <input
                  type="text"
                  id="vehicle.make"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="Toyota"
                />
              </div>

              <div>
                <label htmlFor="vehicle.model" className="block text-sm font-medium text-slate-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  id="vehicle.model"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="Corolla"
                />
              </div>

              <div>
                <label htmlFor="vehicle.year" className="block text-sm font-medium text-slate-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  id="vehicle.year"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label htmlFor="vehicle.registration" className="block text-sm font-medium text-slate-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="vehicle.registration"
                  name="vehicle.registration"
                  value={formData.vehicle.registration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="KXX 123Y"
                />
              </div>
              <FileInput label="Vehicle Photo (take a front photo of your vehicle)" onFileSelect={(e) => handleFileChange(e, setVehiclePhoto)} preview={vehiclePhoto.preview} />
            </div>
          </div> 

          {/* Password */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 transition-shadow"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 transition-shadow"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Password must be at least 6 characters long</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}