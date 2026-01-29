
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function DateTimePicker({ onSelect, selectedDate, selectedTime, selectedServiceId }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dates = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDate = new Date(today);

    while (daysAdded < 90) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      
    
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
        daysAdded++;
      }
    }

    setAvailableDates(dates);
  }, []);

  const fetchTimeSlots = useCallback(async (date) => {
    setLoading(true);
    setError('');
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/bookings/availability?date=${dateStr}&serviceId=${selectedServiceId}`);
      const data = await response.json();

      if (data.success) {
        setTimeSlots(data.data.slots);
      } else {
        setError(data.error || 'Failed to fetch available slots');
      }
    } catch (err) {
      setError('Failed to check availability. Please try again.');
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId]);

  
  useEffect(() => {
    if (selectedDate && selectedServiceId) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, selectedServiceId, fetchTimeSlots]);

  const handleDateSelect = (date) => {
    onSelect({ date, time: null });
  };

  const handleTimeSelect = (time) => {
    onSelect({ date: selectedDate, time });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="space-y-6 text-gray-800">
  
      <div>
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          Select Date
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1">
          {availableDates.slice(0, 30).map((date, index) => {
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    
      {selectedDate && (
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Clock className="w-4 h-4 mr-2" />
            Select Time Slot
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Checking availability...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.slot;
                
                return (
                  <button
                    key={slot.slot}
                    type="button"
                    onClick={() => handleTimeSelect(slot.slot)}
                    disabled={!slot.available}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      !slot.available
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold">{slot.slot}</div>
                    <div className="text-xs mt-1">
                      {slot.available ? 'Available' : 'Booked'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && !error && timeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No time slots available for this date.
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-700">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">
              {formatDate(selectedDate)} at {selectedTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
