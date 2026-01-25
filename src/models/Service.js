// src/models/Service.js
import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a service description'],
    },
    image: {
      type: String,
      default: '', // URL from Cloudinary
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
    // To distinguish between "From KES 15,000" and a fixed price
    priceType: {
      type: String,
      enum: ['fixed', 'starting_from'],
      default: 'starting_from',
    },
    duration: {
      type: String,
      required: [true, 'Please provide the approximate duration'], // e.g., "2-3 hours", "1 day"
    },
    category: {
      type: String,
      required: [true, 'Please provide a service category'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Staff assignments
    assignedStaff: [{
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: false, // Not required for manual entries
        default: null,
      },
      name: {
        type: String,
        required: true,
      },
      isManualEntry: {
        type: Boolean,
        default: false,
      }
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    // Add virtuals to include 'id'
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for service 'id'
ServiceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);