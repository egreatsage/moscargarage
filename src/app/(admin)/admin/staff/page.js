// src/app/(admin)/admin/services/page.js
import Link from 'next/link';
import { PlusCircle, Wrench, Trash2 } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import StaffActions from './StaffActions';
import Staff from '@/models/Staff';


async function getStaff() {
  await connectDB();
  const staff = await Staff.find({}).sort({ createdAt: -1 });
  // Convert to plain objects and include virtuals
  return JSON.parse(JSON.stringify(staff));
}

export default async function StaffPage() {
  const staff = await getStaff();
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
            <p className="text-sm text-gray-600 mt-1">Add, edit, or remove staff members.</p>
          </div>
          <Link
            href="/admin/staff/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            New Staff Member
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.length > 0 ? (
                  staff.map((st) => (
                    <tr key={st._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{st.name}</div>
                        <div className="text-xs text-gray-500">{st.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{st.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{st.workdesignation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            st.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <StaffActions staffId={st._id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
