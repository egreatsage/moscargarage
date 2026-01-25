# Phase 1: Database Models & M-Pesa Setup - COMPLETED ✅

## Summary
Phase 1 of the booking system has been successfully implemented. This phase establishes the foundation for the booking functionality with database models, M-Pesa payment integration, and utility functions.

## Files Created

### 1. Database Models

#### `src/models/Booking.js`
- **Purpose**: Mongoose schema for booking management
- **Key Features**:
  - Auto-generated booking numbers (format: BK-YYYYMMDD-XXXX)
  - User and service references
  - Vehicle information storage
  - Booking date and time slot management
  - Status tracking (pending_payment, confirmed, in_progress, completed, cancelled)
  - Payment status tracking (pending, paid, failed, refunded)
  - Admin notes and cancellation tracking
  - Indexed fields for optimized queries

#### `src/models/Payment.js`
- **Purpose**: Mongoose schema for payment transaction management
- **Key Features**:
  - Links to booking and user
  - M-Pesa transaction details (receipt number, merchant request ID, checkout request ID)
  - Payment status tracking
  - Transaction date and metadata storage
  - Refund tracking
  - Indexed fields for fast lookups

### 2. M-Pesa Integration

#### `src/lib/mpesa.js`
- **Purpose**: Complete M-Pesa Daraja API integration
- **Functions**:
  - `getAccessToken()`: Obtains OAuth token from M-Pesa
  - `generatePassword()`: Creates encrypted password for API requests
  - `initiateSTKPush()`: Triggers payment prompt on customer's phone
  - `querySTKPushStatus()`: Checks payment transaction status
  - `processCallback()`: Handles M-Pesa payment callbacks
  - `validatePhoneNumber()`: Validates and formats phone numbers

### 3. Booking Utilities

#### `src/lib/bookingUtils.js`
- **Purpose**: Helper functions for booking management
- **Functions**:
  - `generateTimeSlots()`: Creates available time slots (8 AM - 6 PM, 2-hour intervals)
  - `validateBookingDate()`: Validates booking dates (not past, not weekends, within 90 days)
  - `formatBookingDate()`: Formats dates for display
  - `parseTimeSlot()`: Parses time slot strings
  - `isTimeSlotPassed()`: Checks if a time slot has passed
  - `calculateBookingStatus()`: Determines current booking status
  - `getStatusColor()`: Returns Tailwind CSS classes for status badges
  - `getPaymentStatusColor()`: Returns Tailwind CSS classes for payment status
  - `canCancelBooking()`: Validates if booking can be cancelled (24-hour rule)
  - `formatCurrency()`: Formats amounts in KES

### 4. Configuration

#### `.env.example`
- **Purpose**: Template for environment variables
- **Required Variables**:
  - Database: `MONGODB_URI`
  - NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - M-Pesa: `MPESA_ENV`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`
  - App URL: `NEXT_PUBLIC_APP_URL`

## Dependencies Installed
- ✅ `axios` - For M-Pesa API requests

## Business Logic Implemented

### Booking Number Generation
- Format: `BK-YYYYMMDD-XXXX`
- Auto-increments daily sequence
- Example: `BK-20240115-0001`

### Time Slot Management
- Operating hours: 8:00 AM - 6:00 PM
- Slot duration: 2 hours
- Available slots: 09:00-11:00, 11:00-13:00, 13:00-15:00, 15:00-17:00
- Prevents double bookings
- Excludes weekends (configurable)

### Booking Validation Rules
- Cannot book past dates
- Cannot book more than 90 days in advance
- Cannot book on weekends (configurable)
- Cannot cancel within 24 hours of booking time
- Cannot cancel past or completed bookings

### Payment Flow
1. Customer initiates booking
2. System creates booking with `pending_payment` status
3. STK push sent to customer's phone
4. Customer enters M-Pesa PIN
5. M-Pesa processes payment
6. Callback received and processed
7. Booking status updated to `confirmed`
8. Payment record created with transaction details

## Database Schema

### Booking Collection
```javascript
{
  bookingNumber: String (unique),
  user: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  bookingDate: Date,
  timeSlot: String,
  vehicle: {
    make, model, year, registration, photo
  },
  issueDescription: String,
  status: String (enum),
  paymentStatus: String (enum),
  paymentReference: String,
  totalAmount: Number,
  notes: String,
  adminNotes: String,
  timestamps: true
}
```

### Payment Collection
```javascript
{
  booking: ObjectId (ref: Booking),
  user: ObjectId (ref: User),
  amount: Number,
  phoneNumber: String,
  mpesaReceiptNumber: String,
  merchantRequestID: String,
  checkoutRequestID: String,
  status: String (enum),
  resultCode: String,
  resultDesc: String,
  transactionDate: Date,
  metadata: Mixed,
  timestamps: true
}
```

## Next Steps (Phase 2)

### API Routes to Create:
1. `src/app/api/bookings/route.js` - Create and list bookings
2. `src/app/api/bookings/[id]/route.js` - Get, update, delete booking
3. `src/app/api/bookings/availability/route.js` - Check available slots
4. `src/app/api/mpesa/stk-push/route.js` - Initiate payment
5. `src/app/api/mpesa/callback/route.js` - Handle payment callbacks

### Frontend Components to Create:
1. Service selection page
2. Multi-step booking form
3. Date and time picker
4. Vehicle information form
5. Payment interface
6. Booking confirmation page
7. My bookings page

## Configuration Required

Before proceeding to Phase 2, ensure you have:
1. ✅ MongoDB connection configured
2. ✅ M-Pesa API credentials (Consumer Key, Secret, Shortcode, Passkey)
3. ✅ Cloudinary credentials (for vehicle photos)
4. ✅ NextAuth configured
5. ✅ Environment variables set in `.env.local`

## Testing Checklist for Phase 1

- [ ] Verify Booking model creates documents correctly
- [ ] Verify Payment model creates documents correctly
- [ ] Test booking number generation
- [ ] Test M-Pesa access token retrieval
- [ ] Test phone number validation
- [ ] Test time slot generation
- [ ] Test booking date validation
- [ ] Test status color functions

## Notes

- M-Pesa integration supports both sandbox and production environments
- Time slots are configurable (currently 2-hour intervals)
- Weekend bookings are disabled by default (can be enabled)
- 24-hour cancellation policy is enforced
- All monetary amounts are in Kenyan Shillings (KES)

---

**Status**: ✅ Phase 1 Complete
**Next**: Phase 2 - API Routes Implementation
