'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Trash2, Loader2, Eye, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BookingActions({ booking, onAction }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = async () => {
    // Prevent cancelling completed or already cancelled bookings from the UI
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      toast.error(`Cannot cancel a ${booking.status} booking.`);
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE', // This is a soft delete (updates status to 'cancelled')
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by admin' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }
      
      toast.success('Booking cancelled successfully.');
      if (onAction) {
        onAction();
      }
      router.refresh();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/force`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking.');
      }
      
      toast.success('Booking permanently deleted.');
      if (onAction) {
        onAction();
      }
      router.refresh();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmCancel = () => {
    toast((t) => (
      <div className="flex flex-col items-center p-2">
        <p className="text-center font-semibold">Are you sure you want to cancel this booking?</p>
        <p className="text-center text-sm text-gray-500 mt-1 mb-3">This will mark the booking as 'Cancelled'.</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleCancel();
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Nevermind
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
    });
  };

  const confirmDelete = () => {
    toast((t) => (
      <div className="flex flex-col items-center p-2">
        <p className="text-center font-semibold text-red-600">Permanently Delete Booking?</p>
        <p className="text-center text-sm text-gray-500 mt-1 mb-3">This action is irreversible and will remove the booking from the database.</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Nevermind
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
    });
  };
  
  const canCancel = booking.status !== 'completed' && booking.status !== 'cancelled';

  return (
    <div className="flex items-center justify-end space-x-3">
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="text-gray-500 hover:text-blue-600 transition-colors"
        title="View Details"
      >
        <Eye className="w-5 h-5" />
      </Link>
      <Link
        href={`/admin/bookings/edit/${booking.id}`}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="Edit/Reschedule"
      >
        <Wrench className="w-5 h-5" />
      </Link>
      <button
        onClick={confirmDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        title="Delete Booking Permanently"
      >
        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      </button>
      <button
        onClick={confirmCancel}
        disabled={isCancelling || !canCancel}
        className="text-orange-500 hover:text-orange-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        title={canCancel ? "Cancel Booking" : `Cannot cancel a ${booking.status} booking`}
      >
        {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
