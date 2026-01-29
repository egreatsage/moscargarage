
'use client';

import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Service', description: 'Select service' },
  { id: 2, name: 'Date & Time', description: 'Choose slot' },
  { id: 3, name: 'Vehicle', description: 'Vehicle info' },
  { id: 4, name: 'Payment', description: 'Complete payment' },
  { id: 5, name: 'Confirmation', description: 'Booking confirmed' },
];

export default function BookingSteps({ currentStep }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={`relative ${
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
            }`}
          >
            
            {stepIdx !== steps.length - 1 && (
              <div
                className="absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full"
                aria-hidden="true"
              >
                <div
                  className={`h-full ${
                    step.id < currentStep ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}

            
            <div className="relative flex items-start group">
              <span className="flex items-center">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                    step.id < currentStep
                      ? 'bg-orange-600'
                      : step.id === currentStep
                      ? 'border-2 border-orange-600 bg-white'
                      : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        step.id === currentStep ? 'bg-orange-600' : 'bg-transparent'
                      }`}
                    />
                  )}
                </span>
              </span>
              
              
              <span className="ml-3 flex min-w-0 flex-col">
                <span
                  className={`text-sm font-semibold ${
                    step.id <= currentStep ? 'text-orange-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {step.description}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
