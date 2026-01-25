// src/app/(admin)/admin/services/ServiceForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, Loader2, Wrench, Users, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ServiceForm({ service: initialService = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialService?.name || '',
    description: initialService?.description || '',
    price: initialService?.price || '',
    priceType: initialService?.priceType || 'starting_from',
    duration: initialService?.duration || '',
    category: initialService?.category || '',
    isActive: initialService?.isActive ?? true,
  });
  const [image, setImage] = useState({ file: null, preview: initialService?.image || '' });
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(initialService?.assignedStaff || []);
  const [manualStaffName, setManualStaffName] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(true);

  const isEditing = !!initialService;

  // Fetch staff list on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      if (data.success) {
        setStaffList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoadingStaff(false);
    }
  };

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

  const handleAddStaffFromDropdown = (e) => {
    const staffId = e.target.value;
    if (!staffId) return;

    const staff = staffList.find(s => s._id === staffId);
    if (!staff) return;

    // Check if staff is already added
    const alreadyAdded = selectedStaff.some(s => s.staffId === staffId);
    if (alreadyAdded) {
      toast.error('This staff member is already assigned');
      e.target.value = '';
      return;
    }

    setSelectedStaff(prev => [...prev, {
      staffId: staff._id,
      name: staff.name,
      isManualEntry: false
    }]);

    // Reset dropdown
    e.target.value = '';
  };

  const handleAddManualStaff = () => {
    const trimmedName = manualStaffName.trim();
    if (!trimmedName) {
      toast.error('Please enter a name');
      return;
    }

    // Check if name is already added
    const alreadyAdded = selectedStaff.some(s => 
      s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyAdded) {
      toast.error('This person is already assigned');
      return;
    }

    setSelectedStaff(prev => [...prev, {
      name: trimmedName,
      isManualEntry: true
    }]);

    setManualStaffName('');
  };

  const handleRemoveStaff = (index) => {
    setSelectedStaff(prev => prev.filter((_, i) => i !== index));
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
    
    // Add assigned staff as JSON string
    data.append('assignedStaff', JSON.stringify(selectedStaff));
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const url = isEditing ? `/api/services/${initialService.id}` : '/api/services';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: data });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} service`);
        }
        
        router.push('/admin/services');
        router.refresh();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: isEditing ? 'Updating service...' : 'Creating service...',
      success: `Service ${isEditing ? 'updated' : 'created'} successfully!`,
      error: (err) => err.message,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Service Details Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-orange-50 px-4 sm:px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Service Details</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Service Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Service Name <span className="text-orange-500">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
              placeholder="e.g., Oil Change Service"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-orange-500">*</span>
            </label>
            <textarea 
              name="description" 
              id="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows="4" 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400 resize-none"
              placeholder="Describe the service in detail..."
            />
          </div>

          {/* Price and Price Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">
                Price (KES) <span className="text-orange-500">*</span>
              </label>
              <input 
                type="number" 
                name="price" 
                id="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900"
                min="0" 
                step="0.01"
                placeholder="5000"
              />
            </div>
            <div>
              <label htmlFor="priceType" className="block text-sm font-semibold text-slate-700 mb-2">
                Price Type <span className="text-orange-500">*</span>
              </label>
              <select 
                name="priceType" 
                id="priceType" 
                value={formData.priceType} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 bg-white"
              >
                <option value="starting_from">Starting From</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
          </div>

          {/* Duration and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-700 mb-2">
                Duration <span className="text-orange-500">*</span>
              </label>
              <input 
                type="text" 
                name="duration" 
                id="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., 2-3 hours"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-orange-500">*</span>
              </label>
              <input 
                type="text" 
                name="category" 
                id="category" 
                value={formData.category} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
                placeholder="e.g., Maintenance"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Service Image
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

          {/* Active Status */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive" 
                  checked={formData.isActive} 
                  onChange={handleChange} 
                  className="h-5 w-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500 focus:ring-2"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="isActive" className="font-semibold text-slate-900 cursor-pointer">
                  Active Service
                </label>
                <p className="text-sm text-slate-600 mt-1">
                  Make this service visible and bookable by customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Assignment Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 sm:px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Assign Staff Members</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Select from existing staff */}
          <div>
            <label htmlFor="staff-select" className="block text-sm font-semibold text-slate-700 mb-2">
              Select from Staff List
            </label>
            {loadingStaff ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : (
              <select
                id="staff-select"
                onChange={handleAddStaffFromDropdown}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 bg-white"
                defaultValue=""
              >
                <option value="" disabled>Choose a staff member...</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} - {staff.workdesignation}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Manual entry for non-registered staff */}
          <div>
            <label htmlFor="manual-staff" className="block text-sm font-semibold text-slate-700 mb-2">
              Or Add Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="manual-staff"
                value={manualStaffName}
                onChange={(e) => setManualStaffName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualStaff();
                  }
                }}
                placeholder="Enter staff member name..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddManualStaff}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Add staff members who aren't registered in the system
            </p>
          </div>

          {/* Selected Staff List */}
          {selectedStaff.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Assigned Staff ({selectedStaff.length})
              </h4>
              <div className="space-y-2">
                {selectedStaff.map((staff, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        staff.isManualEntry ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{staff.name}</p>
                        <p className="text-xs text-slate-500">
                          {staff.isManualEntry ? 'Manual Entry' : 'Registered Staff'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedStaff.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No staff assigned yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Select from the list or add manually above
              </p>
            </div>
          )}
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
          {isEditing ? 'Save Changes' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}