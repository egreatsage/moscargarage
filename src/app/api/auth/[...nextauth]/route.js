
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Staff from '@/models/Staff'; 
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

       
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (user) {
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (isMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role, 
              image: user.vehicle?.photo || '',
              vehicle: user.vehicle,
            };
          }
        }

        
        const staff = await Staff.findOne({ email: credentials.email }).select('+password');
        
        if (staff) {
          
          const isMatch = await bcrypt.compare(credentials.password, staff.password);
          
          if (isMatch) {
            return {
              id: staff._id.toString(),
              name: staff.name,
              email: staff.email,
              role: 'staff', 
              designation: staff.workdesignation, 
            };
          }
        }

        throw new Error('Invalid email or password');
      },
    }),
  ],
  callbacks: {
   
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        
        if (user.role === 'staff') {
           token.designation = user.designation;
        }
        token.vehicle = user.vehicle;
      }
      if (trigger === "update" && session?.vehicle) {
        token.vehicle = session.vehicle;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.vehicle = token.vehicle;
        if (token.role === 'staff') {
            session.user.designation = token.designation;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', 
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };