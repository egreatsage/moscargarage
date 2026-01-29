// src/app/(admin)/admin/services/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer } from 'lucide-react';
import ServiceActions from './ServiceActions';
import { useReactToPrint } from 'react-to-print';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch services.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
            <p className="text-sm text-gray-600 mt-1">Add, edit, or remove services offered by the garage.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/services/new"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              New Service
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading services...</p>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3 no-print"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <tr key={service._id || service.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{service.name}</div>
                          <div className="text-xs text-gray-500">{service.duration}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          KES {service.price.toLocaleString()}
                          {service.priceType === 'starting_from' && <span className="text-xs text-gray-400 ml-1">(from)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              service.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                          <ServiceActions serviceId={service._id || service.id} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No services found.</td>
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