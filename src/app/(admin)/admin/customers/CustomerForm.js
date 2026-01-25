// src/app/(admin)/admin/customers/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Loader2, User, Mail, Phone, Car } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomerForm() {
  const router = useRouter();
  const { id } = useParams();
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
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const res = await fetch(`/api/customers/${id}`);
          const data = await res.json();
          if (data.success) {
            setFormData({
              ...data.data,
              password: '',
              confirmPassword: '',
            });
          } else {
            setError(data.error);
            toast.error(data.error);
          }
        } catch (err) {
          const errorMessage = 'Failed to fetch customer data.';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

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

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const { confirmPassword, ...updateData } = formData;
        if (!updateData.password) {
            delete updateData.password;
        }

        const response = await fetch(`/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update customer');
        }
        
        router.push('/admin/customers');
        router.refresh();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: 'Updating customer...',
      success: 'Customer updated successfully!',
      error: (err) => err.message,
    });
  };

  if (loading && !formData.name) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
            <p>Error: {error}</p>
            <Link href="/admin/customers">
                <h1 className="text-orange-600 hover:underline ml-4">Go back</h1>
            </Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-start mb-8">
          <Link href="/admin/customers"     >
              <h1 className="text-gray-600 hover:text-gray-800 flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Customers
              </h1>
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Customer</h1>
          <p className="text-slate-500 mt-2">Update the customer's details below.</p>
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
                  value={formData.vehicle?.make || ''}
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
                  value={formData.vehicle?.model || ''}
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
                  value={formData.vehicle?.year || ''}
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
                  value={formData.vehicle?.registration || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="KXX 123Y"
                />
              </div>
            </div>
          </div> 

          {/* Password */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Password <span className="text-sm font-normal text-slate-500">(Optional)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
          </div>
          
           <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-orange-600"
              />
              <span className="ml-2 text-gray-700">User is Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Updating Customer...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
