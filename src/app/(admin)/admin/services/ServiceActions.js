// src/app/(admin)/admin/services/ServiceActions.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Wrench, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ServiceActions({ serviceId }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete service.');
      }
      
      toast.success('Service deleted successfully.');
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
        <p className="text-center font-semibold">Are you sure you want to delete this service?</p>
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
        href={`/admin/services/${serviceId}`}
        className="text-gray-600 hover:text-gray-800 transition-colors"
        title="View"
      >
        <Eye className="w-5 h-5" />
      </Link>
      <Link
        href={`/admin/services/edit/${serviceId}`}
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
