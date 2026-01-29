// src/app/(admin)/admin/staff/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer } from 'lucide-react';
import StaffActions from './StaffActions';
import { useReactToPrint } from 'react-to-print';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/staff');
        const data = await res.json();
        if (data.success) {
          setStaff(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch staff.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
            <p className="text-sm text-gray-600 mt-1">Add, edit, or remove staff members.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/staff/new"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              New Staff Member
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading staff...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto" ref={componentRef}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                    <th scope="col" className="relative px-6 py-3 no-print"><span className="sr-only">Actions</span></th>
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
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              st.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {st.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
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
        )}

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .bg-green-100 {
              background-color: #dcfce7 !important;
            }
            .bg-red-100 {
              background-color: #fee2e2 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}