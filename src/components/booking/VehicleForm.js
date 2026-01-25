// src/components/booking/VehicleForm.js
'use client';

import { Car, Calendar, FileText } from 'lucide-react';

export default function VehicleForm({ vehicle, issueDescription, onChange }) {
  const handleVehicleChange = (field, value) => {
    onChange({
      vehicle: { ...vehicle, [field]: value },
      issueDescription,
    });
  };

  const handleIssueChange = (value) => {
    onChange({
      vehicle,
      issueDescription: value,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <div>
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <Car className="w-5 h-5 mr-2" />
          Vehicle Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Make */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="make"
              value={vehicle.make || ''}
              onChange={(e) => handleVehicleChange('make', e.target.value)}
              placeholder="e.g., Toyota, Honda, BMW"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              value={vehicle.model || ''}
              onChange={(e) => handleVehicleChange('model', e.target.value)}
              placeholder="e.g., Corolla, Civic, X5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              id="year"
              value={vehicle.year || ''}
              onChange={(e) => handleVehicleChange('year', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Number */}
          <div>
            <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="registration"
              value={vehicle.registration || ''}
              onChange={(e) => handleVehicleChange('registration', e.target.value.toUpperCase())}
              placeholder="e.g., KAA 123A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              required
            />
          </div>

          {/* Mileage (Optional) */}
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
              Mileage (km) <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="number"
              id="mileage"
              value={vehicle.mileage || ''}
              onChange={(e) => handleVehicleChange('mileage', e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Color (Optional) */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Color <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              id="color"
              value={vehicle.color || ''}
              onChange={(e) => handleVehicleChange('color', e.target.value)}
              placeholder="e.g., White, Black, Silver"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Issue Description */}
      <div>
        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
          <FileText className="w-5 h-5 mr-2" />
          Issue Description
        </h3>

        <div>
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Describe the issue or service needed <span className="text-red-500">*</span>
          </label>
          <textarea
            id="issueDescription"
            value={issueDescription || ''}
            onChange={(e) => handleIssueChange(e.target.value)}
            placeholder="Please provide details about the service you need or any issues you're experiencing with your vehicle..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Be as specific as possible to help us prepare for your service.
          </p>
        </div>
      </div>

      {/* Summary Card */}
      {vehicle.make && vehicle.model && vehicle.year && vehicle.registration && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Vehicle Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Vehicle:</span> {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <p>
              <span className="font-medium">Registration:</span> {vehicle.registration}
            </p>
            {vehicle.color && (
              <p>
                <span className="font-medium">Color:</span> {vehicle.color}
              </p>
            )}
            {vehicle.mileage && (
              <p>
                <span className="font-medium">Mileage:</span> {parseInt(vehicle.mileage).toLocaleString()} km
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
