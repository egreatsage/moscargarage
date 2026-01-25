// src/app/(admin)/admin/services/edit/[id]/page.js
import connectDB from "@/lib/mongodb";
import Service from "@/models/Service";
import ServiceForm from "../../ServiceForm";

async function getServiceById(id) {
    await connectDB();
    const service = await Service.findById(id);
    if (!service) {
        return null;
    }
    // Convert to plain object and include virtuals
    return JSON.parse(JSON.stringify(service));
}

export default async function EditServicePage({ params }) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    return (
      <div className="p-8 text-center text-red-500">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p>The requested service does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-sm text-gray-600 mt-1">Update the details for "{service.name}".</p>
        </div>
        
        <ServiceForm service={service} />
      </div>
    </div>
  );
}