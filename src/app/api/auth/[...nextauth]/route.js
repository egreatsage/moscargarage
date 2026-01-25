// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Staff from '@/models/Staff'; // Import Staff model
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();

        // 1. Try to find user in USER collection (Customers/Admins)
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (user) {
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (isMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role, // 'customer' or 'admin'
              image: user.vehicle?.photo || '', // Optional
            };
          }
        }

        // 2. If not found, try to find in STAFF collection
        const staff = await Staff.findOne({ email: credentials.email }).select('+password');
        
        if (staff) {
          // Staff model has comparePassword method, or use bcrypt directly
          const isMatch = await bcrypt.compare(credentials.password, staff.password);
          
          if (isMatch) {
            return {
              id: staff._id.toString(),
              name: staff.name,
              email: staff.email,
              role: 'staff', // Force role to 'staff'
              designation: staff.workdesignation, // Extra data for staff
            };
          }
        }

        // 3. If neither found
        throw new Error('Invalid email or password');
      },
    }),
  ],
  callbacks: {
    // Add role and ID to the token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        // If it's staff, we can save extra info
        if (user.role === 'staff') {
           token.designation = user.designation;
        }
      }
      return token;
    },
    // Add role and ID to the session (so frontend can see it)
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        if (token.role === 'staff') {
            session.user.designation = token.designation;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Keep using the same login page
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };