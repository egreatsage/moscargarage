// src/app/(customer)/layout.js
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function CustomerLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session) {
    redirect('/login?callbackUrl=/services');
  }

  return <>{children}</>;
}
