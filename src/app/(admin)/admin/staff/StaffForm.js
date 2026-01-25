// src/app/(admin)/admin/services/ServiceForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, Loader2, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StaffForm({ staff: initialStaff = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialStaff?.name || '',
    phone: initialStaff?.phone || '',
    email: initialStaff?.email || '',
    password: initialStaff?.password || '',
    workdesignation: initialStaff?.workdesignation || '',
    isActive: initialStaff?.isActive ?? true,
   
  });
  const [image, setImage] = useState({ file: null, preview: initialStaff?.image || '' });
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialStaff;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ file, preview: URL.createObjectURL(file) });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (image.file) {
      data.append('image', image.file);
    }
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const url = isEditing ? `/api/staff/${initialStaff.id}` : '/api/staff';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: data });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} staff`);
        }
        
        router.push('/admin/staff');
        router.refresh();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: isEditing ? 'Updating staff...' : 'Creating staff...',
      success: `Staff ${isEditing ? 'updated' : 'created'} successfully!`,
      error: (err) => err.message,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Staff Details Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-4 sm:px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Staff Details</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Staff Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Staff Name <span className="text-orange-500">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
              placeholder="e.g., John Doe"
            />
          </div>
          {/* Phone Number */}
            <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number <span className="text-orange-500">*</span>
            </label>
            <input 
              type="text" 
              name="phone" 
              id="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
              placeholder="e.g., 254712345678"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address <span className="text-orange-500">*</span>
            </label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
              placeholder="e.g., john.doe@example.com"
            />
          </div>
            {/* Password */}
            <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password <span className="text-orange-500">*</span>
            </label>
            <input 
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
                placeholder="Enter a secure password"
            />
          </div>
          {/* Work Designation */}
            <div>
            <label htmlFor="workdesignation" className="block text-sm font-semibold text-slate-700 mb-2">
              Specialization <span className="text-orange-500">*</span>
            </label>
            <input 
                type="text"
                name="workdesignation"
                id="workdesignation"
                value={formData.workdesignation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., Mechanic, Electrician"
            />
          </div>


          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Staff Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative h-32 w-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                {image.preview ? (
                  <img src={image.preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer bg-white hover:bg-orange-50 py-3 px-5 border-2 border-orange-200 rounded-xl shadow-sm text-sm font-semibold text-orange-600 hover:text-orange-700 transition-all duration-200 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {image.preview ? 'Change Image' : 'Upload Image'}
                <input 
                  id="image-upload" 
                  name="image" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleFileChange} 
                  accept="image/*" 
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="w-full sm:w-auto bg-white border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Staff Member'}
        </button>
      </div>
    </form>
  );
}