// src/app/(customer)/bookings/new/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import BookingSteps from '@/components/booking/BookingSteps';
import DateTimePicker from '@/components/booking/DateTimePicker';
import VehicleForm from '@/components/booking/VehicleForm';
import PaymentForm from '@/components/booking/PaymentForm';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Booking data
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    registration: '',
    mileage: '',
    color: '',
  });
  const [issueDescription, setIssueDescription] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/bookings/new');
    }
  }, [status, router]);

  // Fetch service details
  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      fetchService(serviceId);
    } else {
      router.push('/services');
    }
  }, [searchParams, router]);

  const fetchService = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      const data = await response.json();

      if (data.success) {
        setService(data.data);
      } else {
        setError('Service not found');
        setTimeout(() => router.push('/services'), 2000);
      }
    } catch (err) {
      setError('Failed to load service');
      console.error('Error fetching service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeSelect = ({ date, time }) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleVehicleChange = ({ vehicle: newVehicle, issueDescription: newDescription }) => {
    setVehicle(newVehicle);
    setIssueDescription(newDescription);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return service !== null;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        return (
          vehicle.make &&
          vehicle.model &&
          vehicle.year &&
          vehicle.registration &&
          issueDescription
        );
      case 4:
        return createdBooking !== null;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      // Create booking before moving to payment
      await createBooking();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createBooking = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          bookingDate: selectedDate.toISOString().split('T')[0],
          timeSlot: selectedTime,
          vehicle,
          issueDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCreatedBooking(data.data);
        setCurrentStep(4);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (booking) => {
    setCreatedBooking(booking);
    setCurrentStep(5);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Service</h1>
          <p className="text-gray-600">Complete the steps below to book your service</p>
        </div>

        {/* Progress Steps */}
        <BookingSteps currentStep={currentStep} />

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
          {/* Step 1: Service Confirmation */}
          {currentStep === 1 && service && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Service</h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {service.priceType === 'starting_from' && 'From '}
                    KES {service.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
              <DateTimePicker
                onSelect={handleDateTimeSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {/* Step 3: Vehicle Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Information</h2>
              <VehicleForm
                vehicle={vehicle}
                issueDescription={issueDescription}
                onChange={handleVehicleChange}
              />
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && createdBooking && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h2>
              <PaymentForm
                bookingId={createdBooking.id}
                amount={createdBooking.totalAmount}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && createdBooking && (
            <BookingConfirmation booking={createdBooking} />
          )}

          {/* Error Message */}
          {error && currentStep !== 5 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {currentStep < 4 && (
              <button
                onClick={handleNext}
                disabled={!canProceedToNextStep() || submitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === 3 ? 'Proceed to Payment' : 'Next'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <NewBookingContent />
    </Suspense>
  );
}
