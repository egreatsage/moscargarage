// src/app/(admin)/admin/services/[id]/page.js
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Users, Tag, Clock, DollarSign, AlignLeft } from 'lucide-react';

async function getService(id) {
  await connectDB();
  // We need to populate the staff details
  const service = await Service.findById(id).populate({
    path: 'assignedStaff.staffId',
    select: 'name workdesignation',
    options: { strictPopulate: false }, // In case of strict populate issues
  });
  if (!service) {
    return null;
  }
  // Convert to plain object to pass to client component
  return JSON.parse(JSON.stringify(service));
}

export default async function ServiceDetailsPage({ params }) {
  const service = await getService((await params).id);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {service.image && (
            <div className="relative h-64 w-full">
              <Image
                src={service.image}
                alt={service.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{service.name}</h1>  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm text-gray-600">
              <div className="flex items-start">
                <Tag className="w-5 h-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Category</p>
                  <p>{service.category}</p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Price</p>
                  <p>
                    KES {service.price.toLocaleString()}
                    {service.priceType === 'starting_from' && <span className="text-xs text-gray-400 ml-1">(starting from)</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Duration</p>
                  <p>{service.duration}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className={`w-5 h-5 mr-3 mt-1 flex-shrink-0 ${service.isActive ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <p className="font-semibold text-gray-800">Status</p>
                  <p>{service.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <AlignLeft className="w-5 h-5 mr-2" />
                    Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Assigned Staff
              </h2>
              {service.assignedStaff && service.assignedStaff.length > 0 ? (
                <ul className="space-y-4">
                  {service.assignedStaff.map((staff) => (
                    <li key={staff._id || staff.name} className="flex items-center bg-gray-100 p-4 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl mr-4">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{staff.name}</p>
                        {staff.staffId && staff.staffId.workdesignation ? (
                           <p className="text-sm text-gray-600">{staff.staffId.workdesignation}</p>
                        ) : staff.isManualEntry ? (
                            <p className="text-sm text-gray-500 italic">Manually added</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No staff assigned to this service.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
