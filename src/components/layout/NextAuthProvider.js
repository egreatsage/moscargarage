// src/components/layout/NextAuthProvider.js
'use client';

import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
