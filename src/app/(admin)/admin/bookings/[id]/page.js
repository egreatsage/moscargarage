// src/app/(admin)/admin/bookings/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Car,
  FileText,
  CreditCard,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Edit2,
} from 'lucide-react';

export default function AdminBookingDetailsPage({ params }) {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [id, setId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
        setAdminNotes(data.data.adminNotes || '');
      } else {
        setError(data.error || 'Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to change the status to "${formatStatus(newStatus)}"?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
        alert('Status updated successfully');
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status. Please try again.');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
        setEditingNotes(false);
        alert('Notes saved successfully');
      } else {
        alert(data.error || 'Failed to save notes');
      }
    } catch (err) {
      alert('Failed to save notes. Please try again.');
      console.error('Error saving notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to All Bookings</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking #{booking.bookingNumber}</p>
              <p className="text-sm text-gray-500 mt-1">
                Created: {formatDateTime(booking.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-semibold border text-center ${getStatusColor(
                  booking.status
                )}`}
              >
                {formatStatus(booking.status)}
              </span>
            </div>
          </div>

          {/* Status Update */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Update Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={booking.status === status || updatingStatus}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    booking.status === status
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  {updatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    formatStatus(status)
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Service
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.service?.name}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {booking.service?.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Date
                    </h3>
                    <p className="text-gray-900">{formatDate(booking.bookingDate)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Time
                    </h3>
                    <p className="text-gray-900">{booking.timeSlot}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Vehicle
                  </h3>
                  <p className="text-gray-900">
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Registration
                  </h3>
                  <p className="text-gray-900 font-mono">{booking.vehicle.registration}</p>
                </div>

                {booking.vehicle.color && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                      Color
                    </h3>
                    <p className="text-gray-900">{booking.vehicle.color}</p>
                  </div>
                )}

                {booking.vehicle.mileage && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                      Mileage
                    </h3>
                    <p className="text-gray-900">
                      {parseInt(booking.vehicle.mileage).toLocaleString()} km
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Issue Description
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{booking.issueDescription}</p>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Admin Notes</h2>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editingNotes ? (
                <div>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {savingNotes ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Notes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(false);
                        setAdminNotes(booking.adminNotes || '');
                      }}
                      disabled={savingNotes}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {adminNotes || (
                    <p className="text-gray-500 italic">No notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Name
                  </h3>
                  <p className="text-gray-900">{booking.user?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Phone
                  </h3>
                  <a
                    href={`tel:${booking.user?.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {booking.user?.phone}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </h3>
                  <a
                    href={`mailto:${booking.user?.email}`}
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    {booking.user?.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Amount</span>
                  <span className="text-gray-900 font-semibold">
                    KES {booking.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>

                {booking.paymentReference && (
                  <div className="pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                      M-Pesa Receipt
                    </h3>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {booking.paymentReference}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    KES {booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Info */}
            {booking.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-red-900 mb-3">
                  Cancellation Details
                </h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-red-700 font-semibold">Cancelled At:</span>
                    <p className="text-red-900">
                      {formatDateTime(booking.cancelledAt)}
                    </p>
                  </div>
                  {booking.cancellationReason && (
                    <div>
                      <span className="text-red-700 font-semibold">Reason:</span>
                      <p className="text-red-900">{booking.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
