// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Vehicle data
    const vehicleMake = formData.get('vehicleMake');
    const vehicleModel = formData.get('vehicleModel');
    const vehicleYear = formData.get('vehicleYear');
    const vehicleRegistration = formData.get('vehicleRegistration');

    // Files
    const profilePictureFile = formData.get('profilePicture');
    const vehiclePhotoFile = formData.get('vehiclePhoto');

    // --- Basic Validation ---
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }
     if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Please provide a valid phone number (254XXXXXXXXX)' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    let profilePictureUrl = '';
    if (profilePictureFile) {
      const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
      const result = await uploadToCloudinary(buffer, 'moscar/avatars');
      profilePictureUrl = result.secure_url;
    }

    let vehiclePhotoUrl = '';
    if (vehiclePhotoFile) {
      const buffer = Buffer.from(await vehiclePhotoFile.arrayBuffer());
      const result = await uploadToCloudinary(buffer, 'moscar/vehicles');
      vehiclePhotoUrl = result.secure_url;
    }

    // --- Create New User ---
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      profilePicture: profilePictureUrl,
      vehicle: {
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        registration: vehicleRegistration,
        photo: vehiclePhotoUrl,
      },
      role: 'customer',
    });

    return NextResponse.json(
      {
        success: true,
        
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}