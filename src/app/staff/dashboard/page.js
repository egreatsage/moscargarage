'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StaffCalendar from '@/components/staff/StaffCalendar';
import { CheckCircle, Clock, Calendar as CalIcon, Wrench } from 'lucide-react';
import { BookingCardSkeleton } from '@/components/ui/SkeletonLoader';

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    // 1. Auth Check
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'staff') {
      router.push('/unauthorized');
      return;
    }

    // 2. Fetch Data
    if (session?.user?.id) {
      fetchStaffBookings();
    }
  }, [session, status, router]);

  const fetchStaffBookings = async () => {
    try {
      // Note: We're reusing the main bookings API but filtering by the current staff ID
      // You might need to update the API to accept 'staffId' query param specifically
      // or filter client side if the API returns everything (NOT RECOMMENDED for production)
      
      // Ideally, the GET /api/bookings should support ?staffId=X
      const res = await fetch(`/api/bookings?status=confirmed,in_progress,completed`); 
      const data = await res.json();
      
      if (data.success) {
        // Filter strictly for this staff member
        const myBookings = data.data.filter(b => 
          b.staff?._id === session.user.id || b.staff === session.user.id
        );
        
        setBookings(myBookings);
        calculateStats(myBookings);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = new Date().setHours(0,0,0,0);
    
    const todayCount = data.filter(b => {
      const bDate = new Date(b.bookingDate).setHours(0,0,0,0);
      return bDate === today && b.status !== 'cancelled';
    }).length;

    const upcomingCount = data.filter(b => {
      return new Date(b.bookingDate) > now && b.status === 'confirmed';
    }).length;

    const completedCount = data.filter(b => b.status === 'completed').length;

    setStats({ today: todayCount, upcoming: upcomingCount, completed: completedCount });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
           <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
           <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session?.user?.name}. Here is your schedule.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Today's Tasks" 
            value={stats.today} 
            icon={Wrench} 
            color="blue" 
          />
          <StatCard 
            title="Upcoming Jobs" 
            value={stats.upcoming} 
            icon={CalIcon} 
            color="purple" 
          />
          <StatCard 
            title="Completed Jobs" 
            value={stats.completed} 
            icon={CheckCircle} 
            color="green" 
          />
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Work Schedule</h2>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Confirmed
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress
                </span>
            </div>
          </div>
          <StaffCalendar bookings={bookings} />
        </div>

      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}