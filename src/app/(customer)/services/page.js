// src/app/(customer)/services/page.js
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

async function getServices() {
  await connectDB();
  const services = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
  return JSON.parse(JSON.stringify(services));
}

export default async function ServicesPage() {
  const services = await getServices();

 
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Services
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Professional automotive services tailored to your needs. Book your appointment today!
          </p>
        </div>

       
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <div key={category} className="mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 capitalize">
              {category}
            </h2>
            
           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {categoryServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
                >
                  {/* Service Image */}
                  <div className="relative w-full h-48 sm:h-52 lg:h-56 bg-gray-200 flex-shrink-0">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-500 to-orange-600">
                        <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Service Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{service.duration}</span>
                      </div>
                      
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{service.category}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 mt-auto">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                        {service.priceType === 'starting_from' && (
                          <span className="text-sm font-normal text-gray-500">From </span>
                        )}
                        KES {service.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Link
                      href={`/bookings/new?serviceId=${service._id}`}
                      className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>Book Now</span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        
        {services.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Services Available
            </h3>
            <p className="text-gray-600">
              Please check back later for available services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}