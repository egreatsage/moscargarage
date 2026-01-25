// src/app/api/test-env/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    hasUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    urlType: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ? 'https' : 
             process.env.NEXT_PUBLIC_APP_URL?.startsWith('http') ? 'http' : 'none'
  });
}