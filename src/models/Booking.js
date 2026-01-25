// src/models/Booking.js
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
    },
  
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff assignment is required'],
    },
   
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    vehicle: {
      make: { type: String, required: [true, 'Vehicle make is required'] },
      model: { type: String, required: [true, 'Vehicle model is required'] },
      year: { type: Number, required: [true, 'Vehicle year is required'] },
      registration: { type: String, required: [true, 'Vehicle registration is required'] },
      photo: { type: String, default: '' },
    },
    issueDescription: {
      type: String,
      required: [true, 'Please describe the issue or requirement'],
    },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending_payment',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: { type: String, default: '' },
    totalAmount: { type: Number, required: [true, 'Total amount is required'] },
    notes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, default: '' },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ bookingDate: 1, timeSlot: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);