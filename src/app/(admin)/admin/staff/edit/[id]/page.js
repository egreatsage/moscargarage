// src/app/(admin)/admin/services/edit/[id]/page.js
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";
import StaffForm from "../../StaffForm";


async function getStaffById(id) {
    await connectDB();
    const staff = await Staff.findById(id);
    if (!staff) {
        return null;
    }
    // Convert to plain object and include virtuals
    return JSON.parse(JSON.stringify(staff));
}

export default async function EditStaffPage({ params }) {
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff) {
    return (
      <div className="p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold">Staff not found</h1>
        <p>The requested staff member does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Staff Member</h1>
          <p className="text-sm text-gray-600 mt-1">Update the details for "{staff.name}".</p>
        </div>

        <StaffForm staff={staff} />
      </div>
    </div>
  );
}