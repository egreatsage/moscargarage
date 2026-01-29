// src/app/(admin)/admin/customers/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer } from 'lucide-react';
import CustomerActions from './CustomerActions/page';
import { useReactToPrint } from 'react-to-print';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/customers');
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch customers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <div className="flex items-center gap-4">
          <Link href="/register" >
            <div className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Customer
            </div>
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

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div ref={componentRef}>
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Phone</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-left">{customer.email}</td>
                    <td className="py-4 px-6 text-left">{customer.phone}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${
                          customer.isActive
                            ? 'bg-green-200 text-green-700'
                            : 'bg-red-200 text-red-700'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                      <CustomerActions customerId={customer._id} />
                    </td>
                  </tr>
                ))}
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
          .bg-green-200 {
            background-color: #bbf7d0 !important;
          }
          .bg-red-200 {
            background-color: #fecaca !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomersPage;