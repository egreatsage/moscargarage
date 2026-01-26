'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, Calendar, Wrench, Play, CheckSquare } from 'lucide-react';
import StaffCalendar from '@/components/StaffCalender';

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
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'staff') {
      router.push('/unauthorized');
    } else if (session?.user?.id) {
      fetchStaffBookings();
    }
  }, [session, status, router]);

  const fetchStaffBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?status=confirmed,in_progress,completed`); 
      const data = await res.json();
      
      if (data.success) {
        const myBookings = data.data.filter(b => 
          b.staff?._id === session.user.id || b.staff === session.user.id
        );
        setBookings(myBookings);
        calculateStats(myBookings);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast.error("Could not load bookings");
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

  const updateStatus = async (bookingId, newStatus) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
        fetchStaffBookings();
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'in_progress'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back, {session?.user?.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Today's Tasks" value={stats.today} icon={Wrench} color="red" />
          <StatCard title="Upcoming Jobs" value={stats.upcoming} icon={Calendar} color="blue" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        </div>

        {/* Active Jobs Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Active Jobs</h2>
          
          {activeJobs.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">No active jobs right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status === 'in_progress' ? 'In Progress' : 'Confirmed'}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.timeSlot}
                        </span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {booking.service?.name || 'Unknown Service'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                        {booking.vehicle?.registration && ` • ${booking.vehicle.registration}`}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(booking._id, 'in_progress')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Job</span>
                        </button>
                      )}
                      
                      {booking.status === 'in_progress' && (
                        <button 
                          onClick={() => updateStatus(booking._id, 'completed')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Full Schedule</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Confirmed
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                In Progress
              </span>
            </div>
          </div>
          <StaffCalendar bookings={bookings} />
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}