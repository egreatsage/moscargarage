
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
      default: '', 
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
   
    priceType: {
      type: String,
      enum: ['fixed', 'starting_from'],
      default: 'starting_from',
    },
    duration: {
      type: String,
      required: [true, 'Please provide the approximate duration'], 
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
   
    assignedStaff: [{
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: false, 
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
    timestamps: true, 
    
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for service 'id'
ServiceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);