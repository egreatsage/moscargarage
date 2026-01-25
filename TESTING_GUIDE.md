# Booking System Testing Guide

## Overview
This guide provides comprehensive testing procedures for the Moscar booking system. Follow these steps to ensure all features work correctly before going live.

---

## Prerequisites

### Environment Setup
- [ ] MongoDB running and connected
- [ ] NextAuth configured with credentials
- [ ] M-Pesa sandbox credentials configured
- [ ] Cloudinary configured (for service images)
- [ ] Application running on `http://localhost:3000`

### Test Data Required
- [ ] At least 3 active services created
- [ ] Test customer account created
- [ ] Test admin account created
- [ ] M-Pesa test phone number: 254708374149

---

## Phase 1: Database & Models Testing

### Booking Model
```bash
# Test in MongoDB shell or Compass
# Verify booking number generation
# Check indexes are created
# Verify virtuals work (id field)
```

**Expected Results:**
- ✅ Booking numbers format: BK-YYYYMMDD-XXXX
- ✅ Unique constraint on bookingNumber
- ✅ Indexes on user, service, bookingDate, status
- ✅ Virtual 'id' field returns _id as string

### Payment Model
```bash
# Verify payment records can be created
# Check indexes
# Verify relationships to bookings
```

**Expected Results:**
- ✅ Payment records link to bookings
- ✅ Indexes on booking, user, checkoutRequestID
- ✅ Virtual 'id' field works

---

## Phase 2: API Endpoints Testing

### Booking APIs

#### 1. Create Booking
```bash
POST /api/bookings
{
    "serviceId": "...",
    "bookingDate": "...",
    "timeSlot": "...",
    "vehicle": { ... },
    "issueDescription": "..."
}
```
**Expected Results:**
- ✅ Returns 201 Created
- ✅ Creates a booking with `pending_payment` status
- ✅ Creates a corresponding payment record

#### 2. Cancel Booking (Soft Delete)
```bash
DELETE /api/bookings/{id}
```
**Expected Results:**
- ✅ Returns 200 OK
- ✅ Booking status changed to `cancelled`
- ✅ `cancelledAt` and `cancelledBy` fields are set
- ✅ If payment was made, payment status is updated to `refunded`

#### 3. Delete Booking (Permanent)
```bash
DELETE /api/bookings/{id}/force
```
**Expected Results:**
- ✅ Requires **admin** authentication.
- ✅ Returns 200 OK.
- ✅ The booking document is permanently removed from the database.
- ✅ Any associated payment document is also removed.
- **UI Test:**
  - Log in as an admin.
  - Go to the `/admin/bookings` page.
  - Locate a test booking.
  - Click the `Trash2` icon (permanent delete).
  - Confirm the deletion.
  - ✅ The booking should disappear from the list.
  - ✅ Verify in the database that the booking and payment records are gone.

#### 4. Edit Booking
```bash
PUT /api/bookings/{id}
{
    "status": "confirmed",
    "bookingDate": "...",
    "timeSlot": "...",
    "adminNotes": "..."
}
```
**Expected Results:**
- ✅ Requires **admin** authentication.
- ✅ Returns 200 OK with the updated booking data.
- ✅ The specified fields are updated in the database.
- **UI Test:**
  - Log in as an admin.
  - Go to the `/admin/bookings` page.
  - Click the `Wrench` icon (edit) for a booking.
  - You should be redirected to `/admin/bookings/edit/{id}`.
  - The form should be pre-filled with the booking's current data.
  - Change the status, date, time slot, and add admin notes.
  - As you change the date, check if the available time slots are re-fetched.
  - Click "Save Changes".
  - ✅ You should be redirected back to the main bookings list.
  - ✅ A success toast should appear.
  - ✅ The booking in the list should show the updated details.
