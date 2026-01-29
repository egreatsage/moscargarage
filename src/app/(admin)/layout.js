// src/app/(admin)/layout.js
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  // Check if user has admin role
  if (session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="text-lg font-semibold">
              <Link href="/admin">Admin Panel</Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <Link href="/admin/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link href="/admin/bookings" className="hover:text-gray-300">
                Bookings
              </Link>
              <Link href="/admin/customers" className="hover:text-gray-300">
                Customers
              </Link>
              <Link href="/admin/services" className="hover:text-gray-300">
                Services
              </Link>
              <Link href="/admin/revenue" className="hover:text-gray-300">
                Revenue Analytics
              </Link>
              <Link href="/admin/staff" className="hover:text-gray-300">
                My Staff
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <details className="relative">
                <summary className="cursor-pointer list-none">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </summary>

                {/* Mobile Menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg">
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/bookings"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/admin/customers"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Customers
                  </Link>
                  <Link
                    href="/admin/services"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Services
                  </Link>
                  <Link
                    href="/admin/revenue"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Revenue A
                  </Link>
                  <Link
                    href="/admin/staff"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    My Staff
                  </Link>
                </div>
              </details>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl p-4">
        {children}
      </main>
    </div>
  );
}
