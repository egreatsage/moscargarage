// src/app/(admin)/admin/services/ServiceActions.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StaffActions({ staffId }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete staff member.');
      }

      toast.success('Staff member deleted successfully.');
      router.refresh();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    toast((t) => (
      <div className="flex flex-col items-center">
        <p className="text-center font-semibold">Are you sure you want to delete this staff member?</p>
        <p className="text-center text-sm text-gray-600 mb-4">This action cannot be undone.</p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };

  return (
    <div className="flex items-center justify-end space-x-3">
      <Link
        href={`/admin/staff/edit/${staffId}`}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="Edit"
      >
        <Wrench className="w-5 h-5" />
      </Link>
      <button
        onClick={confirmDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        title="Delete"
      >
        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
