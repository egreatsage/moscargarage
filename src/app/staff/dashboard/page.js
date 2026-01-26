'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Wrench,
  Calendar,
  Clock,
  User,
  Car,
  Info
} from 'lucide-react';
import {
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';

// --- Main Dashboard Component ---
export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'staff') {
      router.push('/unauthorized');
      return;
    }
    if (session?.user?.id) {
      fetchStaffBookings();
    }
  }, [session, status, router]);

  const fetchStaffBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?status=confirmed,in_progress`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        calculateStats(data.data);
      } else {
        console.error("API error:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateStatus = async (bookingId, newStatus) => {
  const loadingToast = toast.loading('Updating status...');
  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (res.ok) {
      toast.dismiss(loadingToast);
      toast.success(`Job marked as ${newStatus}`);
      fetchStaffBookings(); // Refresh list
    }
  } catch (error) {
    toast.error('Failed to update');
  }
};

  const calculateStats = (data) => {
    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);

    const todayCount = data.filter(b => 
        isSameDay(parseISO(b.bookingDate), today) && 
        b.status !== 'cancelled'
    ).length;

    const upcomingCount = data.filter(b => 
        parseISO(b.bookingDate) > now && 
        b.status === 'confirmed'
    ).length;
    
    setStats({
      today: todayCount,
      upcoming: upcomingCount,
      completed: 0
    });
  };

  if (loading && bookings.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back, {session?.user?.name}. Here is your schedule for the week.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Today's Tasks"
            value={stats.today}
            icon={Wrench}
            color="red"
          />
          <StatCard
            title="Upcoming This Week"
            value={stats.upcoming}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Completed Jobs"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Weekly Schedule */}
        <WeeklyJobBoard bookings={bookings} />
      </div>
    </div>
  );
}

// --- Weekly Job Board Components ---

const WeeklyJobBoard = ({ bookings }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyBookings = bookings.filter(b => {
    const bookingDate = parseISO(b.bookingDate);
    return bookingDate >= weekStart && bookingDate <= weekEnd;
  });

  const bookingsByDay = weekDays.map(day => ({
    date: day,
    bookings: weeklyBookings
      .filter(b => isSameDay(parseISO(b.bookingDate), day))
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          This Week's Schedule
        </h2>
      </div>
      
      <div className="p-4 sm:p-6">
        {/* Mobile: Stacked view */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {bookingsByDay.map(({ date, bookings }) => (
            <DayColumn key={date.toString()} date={date} bookings={bookings} />
          ))}
        </div>
        
        {/* Tablet: 2 columns */}
        <div className="hidden sm:grid md:hidden grid-cols-2 gap-4">
          {bookingsByDay.map(({ date, bookings }) => (
            <DayColumn key={date.toString()} date={date} bookings={bookings} />
          ))}
        </div>
        
        {/* Desktop: 3-4 columns */}
        <div className="hidden md:grid lg:grid-cols-4 md:grid-cols-3 gap-4">
          {bookingsByDay.map(({ date, bookings }) => (
            <DayColumn key={date.toString()} date={date} bookings={bookings} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DayColumn = ({ date, bookings }) => {
  const isToday = isSameDay(date, new Date());
  
  return (
    <div className={`rounded-lg border-2 transition-all ${
      isToday 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="p-3 border-b border-gray-200">
        <h3 className={`font-semibold text-sm sm:text-base ${
          isToday ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {format(date, 'EEEE')}
        </h3>
        <span className={`text-xs sm:text-sm ${
          isToday ? 'text-blue-700' : 'text-gray-600'
        }`}>
          {format(date, 'MMM d')}
        </span>
      </div>
      
      <div className="p-3 space-y-3 min-h-[100px]">
        {bookings.length > 0 ? (
          bookings.map(booking => <JobCard key={booking._id} booking={booking} />)
        ) : (
          <p className="text-xs sm:text-sm text-gray-400 text-center py-6">
            No jobs scheduled
          </p>
        )}
      </div>
    </div>
  );
};

const JobCard = ({ booking }) => {
  const statusConfig = {
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Confirmed'
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'In Progress'
    },
  };
  
  const config = statusConfig[booking.status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: booking.status
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
          {booking.service.name}
        </h4>
        <span className={`${config.bg} ${config.text} ${config.border} border px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap`}>
          {config.label}
        </span>
      </div>
      {bookings.map((booking) => (
  <div key={booking._id} className="border p-4 rounded bg-white shadow mb-4">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-bold">{booking.service.name}</h3>
        <p>Car: {booking.vehicle.make} {booking.vehicle.model}</p>
        <p>Time: {booking.timeSlot}</p>
      </div>
      
      <div className="flex gap-2">
        {booking.status === 'confirmed' && (
          <button 
            onClick={() => updateStatus(booking._id, 'in_progress')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Job
          </button>
        )}
        
        {booking.status === 'in_progress' && (
          <button 
            onClick={() => updateStatus(booking._id, 'completed')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  </div>
))}
      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{booking.timeSlot}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{booking.user.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})
          </span>
        </div>
        
        {booking.issueDescription && (
          <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-500 italic text-xs line-clamp-2">
              {booking.issueDescription}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper & Skeleton Components ---

function StatCard({ title, value, icon: Icon, color }) {
  const colorConfig = {
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-100'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-100'
    },
  };
  
  const config = colorConfig[color];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        <div className={`${config.bg} ${config.border} border-2 p-3 sm:p-4 rounded-xl flex-shrink-0`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${config.icon}`} />
        </div>
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="animate-pulse space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-64 max-w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-96 max-w-full"></div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        
        {/* Schedule skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);