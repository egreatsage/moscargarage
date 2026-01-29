'use client';


import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
      
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-6">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
          </div>

        
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>

          
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Go to Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Error Code: <span className="font-mono font-semibold">403</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
