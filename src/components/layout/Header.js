// src/components/layout/Header.js
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, LogIn, UserPlus, User2Icon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderAuthSection = () => {
    if (!mounted || status === 'loading') {
      return (
        <div className="flex items-center space-x-4 animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
        </div>
      );
    }

    if (user) {
      return (
        <>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
  Welcome, {user.name?.split(' ')[0]}
  {user.role === 'admin' && (
    <Link href="/admin/dashboard" className="ml-2 text-xs text-white bg-red-500 px-2 py-1 rounded-full hover:bg-red-600 transition-colors">
      Dashbaord
    </Link>
  )}
</span>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600 p-2 rounded-full transition-colors"
            title="Profile"
          >
            <User2Icon className="w-5 h-5 text-white border border-orange-400 rounded-full bg-amber-400" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 p-2 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>Login</span>
        </Link>
        <Link
          href="/register"
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register</span>
        </Link>
      </>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600">
            <img src="/logo.png" alt="Moscar Logo" className="inline-block w-16 h-16 mr-2 rounded-md object-cover" />
              Moscar
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {renderAuthSection()}
          </div>
        </div>
      </nav>
    </header>
  );
}
