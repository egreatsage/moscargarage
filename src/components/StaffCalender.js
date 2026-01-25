'use client';
import { useState } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO, 
  isSameWeek, 
  addWeeks, 
  subWeeks 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock } from 'lucide-react';

export default function StaffCalendar({ bookings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Monday start

  // Generate the 7 days of the week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(startDate, i));
  }

  // Time slots matching your backend
  const timeSlots = [
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00"
  ];

  const nextWeek = () => setCurrentMonth(addWeeks(currentMonth, 1));
  const prevWeek = () => setCurrentMonth(subWeeks(currentMonth, 1));

  const getBookingForSlot = (day, slot) => {
    return bookings.find(b => {
      const bookingDate = new Date(b.bookingDate);
      return isSameDay(bookingDate, day) && b.timeSlot === slot;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <CalIcon className="w-5 h-5 text-blue-600" />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50/50">
            <div className="p-4 text-xs font-semibold text-gray-500 text-center border-r border-gray-100">
              TIME
            </div>
            {weekDays.map((day, i) => (
              <div 
                key={i} 
                className={`p-3 text-center border-r border-gray-100 last:border-0 ${
                  isSameDay(day, new Date()) ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">{format(day, 'EEE')}</div>
                <div className={`text-sm font-bold ${
                   isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          {timeSlots.map((slot) => (
            <div key={slot} className="grid grid-cols-8 border-b border-gray-100 last:border-0 h-32">
              {/* Time Column */}
              <div className="p-3 border-r border-gray-100 flex items-center justify-center bg-gray-50/30 text-xs font-medium text-gray-500">
                {slot}
              </div>

              {/* Days Columns */}
              {weekDays.map((day, i) => {
                const booking = getBookingForSlot(day, slot);
                
                return (
                  <div key={i} className="border-r border-gray-100 last:border-0 p-1 relative group hover:bg-gray-50 transition-colors">
                    {booking && (
                      <div className={`w-full h-full rounded-lg p-2 text-xs border ${getStatusColor(booking.status)} overflow-hidden flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className="font-bold truncate">{booking.service?.name}</div>
                        <div className="truncate opacity-75">{booking.vehicle?.registration}</div>
                        <div className="mt-auto flex items-center gap-1 opacity-60">
                          <Clock className="w-3 h-3" />
                          <span>{booking.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    )}
                    {!booking && (
                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-xs text-gray-300 font-medium">Free</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}