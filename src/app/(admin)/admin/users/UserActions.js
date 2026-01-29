'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserActions({ userId }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user.');
      }

      toast.success('User deleted successfully.');
      // Force a refresh of the page data
      window.location.reload(); 

    } catch (error) {
      toast.error(error.message);
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    toast((t) => (
      <div className="flex flex-col items-center gap-2">
        <p className="font-medium text-gray-900">Delete this user?</p>
        <p className="text-sm text-gray-500 mb-2">This cannot be undone.</p>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete();
            }}
            className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  return (
    <div className="flex items-center justify-end space-x-3">
      <Link
        href={`/admin/users/edit/${userId}`}
        className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
        title="Edit User"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={confirmDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors p-1 hover:bg-red-50 rounded"
        title="Delete User"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}