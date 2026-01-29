'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, Shield, Lock, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserForm({ user = null, isNew = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'customer',
    isActive: user?.isActive ?? true,
    password: '',
    confirmPassword: '',
    vehicle: {
      make: user?.vehicle?.make || '',
      model: user?.vehicle?.model || '',
      year: user?.vehicle?.year || '',
      registration: user?.vehicle?.registration || '',
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (isNew && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    setLoading(true);

    try {
      const url = isNew ? '/api/users' : `/api/users/${user._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      delete payload.confirmPassword;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      toast.success(isNew ? 'User created successfully!' : 'User updated successfully!');
      router.push('/admin/users');
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          {isNew ? 'Create New User' : `Edit User: ${user.name}`}
        </h2>
        <Link href="/admin/users" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Account Info
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="254712345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">Account Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" /> Security
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                {isNew ? 'Set a password for the new user.' : 'Leave blank to keep current password.'}
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle (Only relevant for customers usually, but kept in User model) */}
            <div className="pt-2">
               <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Vehicle Details</h3>
               <div className="grid grid-cols-2 gap-3">
                 <input 
                   type="text" placeholder="Make" name="vehicle.make"
                   value={formData.vehicle.make} onChange={handleChange}
                   className="px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                 />
                 <input 
                   type="text" placeholder="Model" name="vehicle.model"
                   value={formData.vehicle.model} onChange={handleChange}
                   className="px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                 />
                 <input 
                   type="text" placeholder="Reg. No" name="vehicle.registration"
                   value={formData.vehicle.registration} onChange={handleChange}
                   className="px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                 />
                 <input 
                   type="number" placeholder="Year" name="vehicle.year"
                   value={formData.vehicle.year} onChange={handleChange}
                   className="px-3 py-2 border border-gray-300 text-gray-800 rounded-md text-sm"
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-100 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}