// src/lib/bookingUtils.js

/**
 * Generate available time slots for a given date
 * @param {Date} date - 
 * @param {Array} existingBookings - 
 * @param {number} slotDuration 
 * @returns {Array} 
 */
export function generateTimeSlots(date, existingBookings = [], slotDuration = 2) {
  const slots = [];
  const startHour = 8; 
  const endHour = 18; 
  
  // 
  for (let hour = startHour; hour < endHour; hour += slotDuration) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
    const slotString = `${startTime}-${endTime}`;
    
   
    const isBooked = existingBookings.some(
      booking => booking.timeSlot === slotString && 
      ['confirmed', 'in_progress'].includes(booking.status)
    );
    
    slots.push({
      slot: slotString,
      available: !isBooked,
      startTime,
      endTime,
    });
  }
  
  return slots;
}

/**
 * 
 * @param {Date} date 
 * @returns {Object} 
 */
export function validateBookingDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);
  
  
  if (bookingDate < today) {
    return {
      valid: false,
      error: 'Cannot book for past dates',
    };
  }
  
  // Check if date is too far in the future (e.g., 90 days)
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  
  if (bookingDate > maxDate) {
    return {
      valid: false,
      error: 'Cannot book more than 90 days in advance',
    };
  }
  
  // Check if it's a weekend (optional - remove if you work on weekends)
  const dayOfWeek = bookingDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      valid: false,
      error: 'Bookings are not available on weekends',
    };
  }
  
  return {
    valid: true,
    error: null,
  };
}

/**
 * Format booking date for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatBookingDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Parse time slot string to get start and end times
 * @param {string} timeSlot - Time slot string (e.g., "09:00-11:00")
 * @returns {Object} Start and end time objects
 */
export function parseTimeSlot(timeSlot) {
  const [start, end] = timeSlot.split('-');
  return {
    start,
    end,
  };
}

/**
 * Check if a time slot has passed
 * @param {Date} bookingDate - The booking date
 * @param {string} timeSlot - The time slot
 * @returns {boolean} True if the slot has passed
 */
export function isTimeSlotPassed(bookingDate, timeSlot) {
  const now = new Date();
  const { start } = parseTimeSlot(timeSlot);
  const [hours, minutes] = start.split(':').map(Number);
  
  const slotDateTime = new Date(bookingDate);
  slotDateTime.setHours(hours, minutes, 0, 0);
  
  return slotDateTime < now;
}

/**
 * Calculate booking status based on dates and current status
 * @param {Object} booking - The booking object
 * @returns {string} Calculated status
 */
export function calculateBookingStatus(booking) {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return booking.status;
  }
  
  const now = new Date();
  const bookingDateTime = new Date(booking.bookingDate);
  const { start } = parseTimeSlot(booking.timeSlot);
  const [hours, minutes] = start.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  // If booking time has passed and status is still confirmed, it might be in progress or missed
  if (bookingDateTime < now && booking.status === 'confirmed') {
    return 'in_progress';
  }
  
  return booking.status;
}

/**
 * Get status color for UI display
 * @param {string} status - The booking status
 * @returns {string} Tailwind CSS color classes
 */
export function getStatusColor(status) {
  const colors = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get payment status color for UI display
 * @param {string} status - The payment status
 * @returns {string} Tailwind CSS color classes
 */
export function getPaymentStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if booking can be cancelled
 * @param {Object} booking - The booking object
 * @returns {Object} Result with canCancel boolean and reason
 */
export function canCancelBooking(booking) {
  // Cannot cancel if already cancelled or completed
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return {
      canCancel: false,
      reason: `Booking is already ${booking.status}`,
    };
  }
  
  // Check if booking is in the past
  const now = new Date();
  const bookingDateTime = new Date(booking.bookingDate);
  const { start } = parseTimeSlot(booking.timeSlot);
  const [hours, minutes] = start.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  if (bookingDateTime < now) {
    return {
      canCancel: false,
      reason: 'Cannot cancel past bookings',
    };
  }
  
  // Check if booking is too close (e.g., less than 24 hours)
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  if (hoursUntilBooking < 24) {
    return {
      canCancel: false,
      reason: 'Cannot cancel bookings less than 24 hours in advance',
    };
  }
  
  return {
    canCancel: true,
    reason: null,
  };
}

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}
