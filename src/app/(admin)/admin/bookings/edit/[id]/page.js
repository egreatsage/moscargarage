// src/app/(admin)/admin/bookings/edit/[id]/page.js
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import BookingEditForm from "./BookingEditForm";

async function getBookingById(id) {
    await connectDB();
    const booking = await Booking.findById(id).populate('user', 'name email').populate('service', 'name');
    if (!booking) {
        return null;
    }
    // Convert to plain object to pass to client component
    return JSON.parse(JSON.stringify(booking));
}

export default async function EditBookingPage({ params }) {
  const { id } = params;
  const booking = await getBookingById(id);

  if (!booking) {
    return (
      <div className="p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold">Booking not found</h1>
        <p>The requested booking does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-sm text-gray-600 mt-1">
            Editing booking <span className="font-semibold text-blue-600">#{booking.bookingNumber}</span> for <span className="font-semibold">{booking.user.name}</span>
          </p>
        </div>
        
        <BookingEditForm booking={booking} />
      </div>
    </div>
  );
}
