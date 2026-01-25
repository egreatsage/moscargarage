// src/app/(admin)/admin/bookings/edit/[id]/BookingEditForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Edit, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function BookingEditForm({ booking }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    status: booking?.status || 'pending_payment',
    bookingDate: booking?.bookingDate ? format(new Date(booking.bookingDate), 'yyyy-MM-dd') : '',
    timeSlot: booking?.timeSlot || '',
    adminNotes: booking?.adminNotes || '',
    staffId: booking.staff?.id || booking.staff || '',
  });
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const isEditing = !!booking;

  const fetchAvailability = async (date) => {
    if (!date || !booking?.service?._id) return;
    setSlotsLoading(true);
    try {
      const response = await fetch(`/api/bookings/availability?date=${date}&serviceId=${booking.service._id}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data);
      } else {
        setAvailableSlots([]);
        toast.error(data.error || 'Failed to fetch slots.');
      }
    } catch (error) {
      toast.error('Error fetching time slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.bookingDate) {
      fetchAvailability(formData.bookingDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bookingDate, booking?.service?._id]);

   const qualifiedStaff = booking.service?.assignedStaff || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const url = `/api/bookings/${booking.id}`;
        const method = 'PUT';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update booking');
        }
        
        router.push('/admin/bookings');
        router.refresh();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: 'Updating booking...',
      success: 'Booking updated successfully!',
      error: (err) => err.message,
    });
  };

  const bookingStatusOptions = [
    'pending_payment',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 sm:px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg">
              <Edit className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Edit Booking Details</h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Booking Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">
              Booking Status
            </label>
            <select 
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
            >
              {bookingStatusOptions.map(status => (
                <option key={status} value={status}>
                  {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Staff</label>
            <div className="flex gap-2">
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Unassigned --</option>
                {qualifiedStaff.map((staffMember) => {
                    // Handle both populated object and direct structure
                    const id = staffMember.staffId?._id || staffMember.staffId;
                    const name = staffMember.staffId?.name || staffMember.name;
                    return (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    );
                })}
                </select>
            </div>
          </div>


<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Schedule Management
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="08:00-10:00">08:00 - 10:00</option>
              <option value="10:00-12:00">10:00 - 12:00</option>
              <option value="12:00-14:00">12:00 - 14:00</option>
              <option value="14:00-16:00">14:00 - 16:00</option>
              <option value="16:00-18:00">16:00 - 18:00</option>
            </select>
          </div>
        </div>
          
          {/* Admin Notes */}
          <div>
            <label htmlFor="adminNotes" className="block text-sm font-semibold text-slate-700 mb-2">
              Admin Notes
            </label>
            <textarea
              name="adminNotes"
              id="adminNotes"
              value={formData.adminNotes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 resize-none"
              placeholder="Add internal notes for this booking..."
            />
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
          disabled={loading || slotsLoading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
