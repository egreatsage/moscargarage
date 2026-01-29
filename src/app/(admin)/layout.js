// src/app/(admin)/layout.js
'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
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
              <Link href="/admin/services" className="hover:text-gray-300">
                Services
              </Link>
              <Link href="/admin/revenue" className="hover:text-gray-300">
                Revenue Analytics
              </Link>
              <Link href="/admin/staff" className="hover:text-gray-300">
                My Staff
              </Link>
              <Link href="/admin/users" className="hover:text-gray-300">
                Users
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="cursor-pointer"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute right-4 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50">
            <Link
              href="/admin/dashboard"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/bookings"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Bookings
            </Link>
            <Link
              href="/admin/services"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Services
            </Link>
            <Link
              href="/admin/revenue"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Revenue Analytics
            </Link>
            <Link
              href="/admin/staff"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              My Staff
            </Link>
            <Link
              href="/admin/users"
              onClick={handleMobileLinkClick}
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Users
            </Link>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl p-4">
        {children}
      </main>
    </div>
  );
}