    Moscar Garage Automation System - Development Plan
Based on your project document, I'll create a comprehensive development plan using your specified stack (Next.js, JavaScript, MongoDB, Tailwind CSS, Cloudinary, and M-Pesa Daraja integration).
Technology Stack Overview
Frontend:

Next.js 14+ (App Router)
JavaScript
Tailwind CSS
React Hook Form (form handling)
Lucide React (icons)

Backend:

Next.js API Routes
MongoDB with Mongoose
NextAuth.js (authentication)

Additional Services:

Cloudinary (image storage for service photos, customer vehicle photos)
M-Pesa Daraja API (payment integration)
Nodemailer (email notifications)

Phase 1: Project Setup & Foundation (Week 1)
1.1 Initialize Project
bashnpx create-next-app@latest moscar-garage --javascript
cd moscar-garage
npm install mongoose bcryptjs next-auth
npm install @tailwindcss/forms @tailwindcss/typography
npm install cloudinary multer
npm install axios date-fns
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
npm install nodemailer
```

### 1.2 Project Structure
```
moscar-garage/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (customer)/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── services/
│   │   └── profile/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── customers/
│   │   │   ├── services/
│   │   │   └── reports/
│   ├── api/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── services/
│   │   ├── customers/
│   │   ├── mpesa/
│   │   └── upload/
│   └── page.js (landing page)
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── mongodb.js
│   ├── cloudinary.js
│   ├── mpesa.js
│   └── utils.js
├── models/
│   ├── User.js
│   ├── Booking.js
│   ├── Service.js
│   └── Payment.js
├── middleware.js
└── .env.local
1.3 Environment Variables Setup
env# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=your_callback_url

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

Phase 2: Database Schema Design (Week 1)
2.1 User Model
javascript// models/User.js
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (enum: ['customer', 'admin']),
  vehicle: {
    make: String,
    model: String,
    year: Number,
    registration: String,
    photo: String (Cloudinary URL)
  },
  createdAt: Date,
  updatedAt: Date
}
2.2 Service Model
javascript// models/Service.js
{
  name: String,
  description: String,
  category: String (enum: ['body-repair', 'diagnosis', 'minor-service', 'major-service', 'maintenance']),
  price: Number,
  duration: Number (in minutes),
  image: String (Cloudinary URL),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
2.3 Booking Model
javascript// models/Booking.js
{
  bookingNumber: String (unique, auto-generated),
  customer: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  bookingDate: Date,
  timeSlot: String,
  vehicleDetails: {
    make: String,
    model: String,
    registration: String,
    issue: String
  },
  status: String (enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']),
  payment: ObjectId (ref: Payment),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
2.4 Payment Model
javascript// models/Payment.js
{
  booking: ObjectId (ref: Booking),
  customer: ObjectId (ref: User),
  amount: Number,
  mpesaReceiptNumber: String,
  mpesaTransactionId: String,
  phoneNumber: String,
  status: String (enum: ['pending', 'completed', 'failed']),
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date
}

Phase 3: Authentication System (Week 2)
3.1 NextAuth Configuration

Setup NextAuth with credentials provider
Implement JWT session strategy
Create protected routes middleware
Role-based access control (customer vs admin)

3.2 User Registration & Login

Customer registration form with vehicle details
Admin login (pre-created accounts)
Password hashing with bcryptjs
Email verification (optional)


Phase 4: Customer-Facing Features (Week 2-3)
4.1 Landing Page

Hero section with CTA
Services overview
Why choose us section
Contact information
Testimonials section
Footer with social links

4.2 Services Catalog

Display all available services
Service cards with images, description, price, duration
Category filtering
Search functionality
"Book Now" button for each service

4.3 Booking System
Step 1: Service Selection

Select service from catalog
View service details

Step 2: Date & Time Selection

Calendar component for date selection
Available time slots display
Real-time availability checking
Prevent double bookings

Step 3: Vehicle Information

Auto-fill from profile if exists
Option to upload vehicle photo (Cloudinary)
Describe issue/requirement

Step 4: Payment (M-Pesa STK Push)

Display booking summary
Enter M-Pesa phone number
Initiate STK push
Wait for payment confirmation
Create booking after successful payment

Step 5: Confirmation

Display booking details
Send confirmation email
Booking number generation

4.4 Customer Dashboard

View upcoming bookings
View booking history
Booking status tracking
Cancel booking option
Download/print booking details

4.5 Profile Management

Update personal information
Update vehicle details
Change password
View service history


Phase 5: M-Pesa Daraja Integration (Week 3)
5.1 M-Pesa Setup
javascript// lib/mpesa.js

// Generate access token
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  
  // Implementation
}

// STK Push
async function initiateSTKPush(phone, amount, bookingId) {
  // Generate password
  // Make STK push request
  // Return response
}

// Query transaction status
async function queryTransactionStatus(checkoutRequestId) {
  // Query M-Pesa API
}
5.2 Payment Flow

Customer clicks "Pay with M-Pesa"
Enter phone number (format: 254XXXXXXXXX)
Backend initiates STK push
Customer receives payment prompt on phone
Customer enters M-Pesa PIN
Callback endpoint receives payment status
Update payment record
Create booking if payment successful
Send confirmation email/SMS

5.3 API Routes
javascript// app/api/mpesa/stk-push/route.js
// app/api/mpesa/callback/route.js
// app/api/mpesa/query/route.js

Phase 6: Admin Panel (Week 4)
6.1 Admin Dashboard

Total bookings (today, week, month)
Revenue statistics
Pending bookings count
Recent bookings list
Service statistics
Charts and graphs (optional)

6.2 Booking Management

View all bookings (table format)
Filter by status, date, service
Search by customer name/phone/booking number
Update booking status
View booking details
Add admin notes
Edit booking details (date, time, status, notes)
Cancel bookings (soft delete)
Permanent Deletion of bookings

6.3 Customer Management

View all customers
Search customers
View customer details
View customer booking history
Customer service records

6.4 Service Management

Add new service
Edit existing services
Upload service images (Cloudinary)
Activate/deactivate services
Set pricing and duration
Manage service categories

6.5 Reports

Bookings report (date range)
Revenue report
Service popularity report
Customer report
Export to CSV/PDF (optional)


Phase 7: Additional Features (Week 5)
7.1 Notifications System

Email notifications for:

Booking confirmation
Booking status updates
Payment confirmation
Reminders (24 hours before appointment)



7.2 Calendar Integration

Admin calendar view of all bookings
Day/Week/Month views
Drag-and-drop rescheduling
Time slot management

7.3 Real-time Availability

Check available time slots
Block unavailable times
Working hours configuration
Holiday/closure management

7.4 Search & Filters

Global search functionality
Advanced filtering options
Sort by various parameters


Phase 8: Testing & Optimization (Week 6)
8.1 Testing Checklist

 User registration and login
 Service browsing and search
 Booking flow (all steps)
 M-Pesa payment integration
 Admin CRUD operations
 Responsive design (mobile, tablet, desktop)
 Email notifications
 Error handling
 Security testing
 Performance optimization

8.2 M-Pesa Sandbox Testing

Test STK push with sandbox credentials
Test callback handling
Test payment verification
Test failed payment scenarios
Test timeout scenarios

8.3 Browser Compatibility

Chrome
Firefox
Safari
Mobile browsers


Phase 9: Deployment (Week 6)
9.1 Deployment Checklist

 Setup production MongoDB cluster
 Configure Cloudinary production account
 M-Pesa production credentials
 Environment variables configuration
 Deploy to Vercel/Netlify
 Setup custom domain
 SSL certificate
 Performance monitoring
 Error tracking (Sentry optional)

9.2 Post-Deployment

Monitor application performance
Check M-Pesa callbacks
Verify email delivery
Test production booking flow
User training for admin panel


Key Features Summary
Customer Features:

✅ Browse available services
✅ Book services online
✅ Real-time availability checking
✅ M-Pesa payment integration
✅ View booking history
✅ Track booking status
✅ Manage profile and vehicle info
✅ Email notifications

Admin Features:

✅ Manage all bookings (view, edit details, cancel, and permanently delete)
✅ Manage customers
✅ Manage services
✅ View reports and statistics
✅ Update booking status
✅ Calendar view
✅ Search and filter

