// src/app/(admin)/admin/services/edit/[id]/page.js
import connectDB from "@/lib/mongodb";
import Service from "@/models/Service";
import User from "@/models/User";
import CustomerForm from "../../CustomerForm";

async function getCustomerById(id) {
    await connectDB();
    const customer = await User.findById(id);
    if (!customer) {
        return null;
    }
    
    return JSON.parse(JSON.stringify(customer));
}

export default async function EditCustomerPage({ params }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return (
      <div className="p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold">Customer not found</h1>
        <p>The requested customer does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-sm text-gray-600 mt-1">Update the details for "{customer.name}".</p>
        </div>

        <CustomerForm customer={customer} />
      </div>
    </div>
  );
}