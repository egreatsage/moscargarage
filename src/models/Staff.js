// src/models/Staff.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const StaffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [false, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      match: [/^254[0-9]{9}$/, 'Please provide a valid phone number (254XXXXXXXXX)'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    workdesignation: {
      type: String,
      required: [true, 'Please provide a work designation'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


StaffSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

StaffSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};


StaffSchema.methods.toJSON = function() {
  const staff = this.toObject();
  delete staff.password;
  delete staff.__v; 
  staff.id = staff._id; 
  return staff;
};

export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);