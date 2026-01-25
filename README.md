# Moscar - Garage Booking System

This is a comprehensive vehicle service and garage booking system built with [Next.js](https://nextjs.org), designed to streamline the process of scheduling and managing automotive services.

## Features

- **User Authentication:** Secure login and registration for both customers and administrators, with distinct roles and permissions.
- **Service Management (Admin):** Admins can create, update, and manage the list of available services, including details like name, description, price, and duration.
- **Service Viewing (Customer):** Customers can browse through the list of available services to choose what they need.
- **Online Booking:** Customers can select a service, pick an available date and time slot, and book an appointment for their vehicle.
- **Booking Management (Admin):**
  - **View all bookings:** A comprehensive dashboard for admins to see all upcoming, in-progress, and completed bookings.
  - **Update Status:** Change the status of a booking (e.g., from 'Confirmed' to 'In Progress').
  - **Edit Bookings:** Modify booking details such as the date, time slot, and internal admin notes.
  - **Cancel Bookings (Soft Delete):** Mark a booking as 'Cancelled' without permanently removing it from the records.
  - **Permanent Deletion:** Admins have the ability to permanently delete booking records from the database.
- **Payment Integration:** Supports M-Pesa STK push for seamless and secure online payments.
- **Responsive UI:** A clean and modern user interface that works across devices.

---

## Getting Started

First, you'll need to set up your environment variables. Create a `.env.local` file in the root of the project and add the necessary keys for your database, authentication provider, and payment gateway.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
