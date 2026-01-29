
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^254[0-9]{9}$/, 'Please provide a valid phone number (254XXXXXXXXX)'],
    },
    mpesaReceiptNumber: {
      type: String,
      default: '',
    },
    merchantRequestID: {
      type: String,
      default: '',
    },
    checkoutRequestID: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    resultCode: {
      type: String,
      default: '',
    },
    resultDesc: {
      type: String,
      default: '',
    },
    transactionDate: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


PaymentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ mpesaReceiptNumber: 1 });
PaymentSchema.index({ checkoutRequestID: 1 });
PaymentSchema.index({ status: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
