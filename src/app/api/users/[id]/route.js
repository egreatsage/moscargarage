import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Await params here
    await connectDB();
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  // 1. Await params immediately to fix the "params is a Promise" error
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    // Allow Admin OR the user themselves to edit
    if (!session || (session.user.role !== 'admin' && session.user.id !== id)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 2. Check Content-Type to handle both JSON (Admin Form) and FormData (Profile Uploads)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // --- JSON HANDLING (Admin Form) ---
      const body = await request.json();
      
      if (body.name) user.name = body.name;
      if (body.email) user.email = body.email;
      if (body.phone) user.phone = body.phone;
      
      // Admin only fields
      if (session.user.role === 'admin') {
        if (body.role) user.role = body.role;
        if (body.isActive !== undefined) user.isActive = body.isActive;
      }

      // Password
      if (body.password && body.password.trim() !== '') {
        user.password = body.password;
      }

      // Vehicle (Nested Object in JSON)
      if (body.vehicle) {
        if (!user.vehicle) user.vehicle = {};
        if (body.vehicle.make) user.vehicle.make = body.vehicle.make;
        if (body.vehicle.model) user.vehicle.model = body.vehicle.model;
        if (body.vehicle.year) user.vehicle.year = body.vehicle.year;
        if (body.vehicle.registration) user.vehicle.registration = body.vehicle.registration;
      }

    } else {
      // --- FORMDATA HANDLING (Profile Page with Images) ---
      const formData = await request.formData();
      
      // Extract textual fields
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const role = formData.get('role');
      const isActive = formData.get('isActive');
      
      // Vehicle fields (Flattened keys in FormData)
      const vehicleMake = formData.get('vehicle.make');
      const vehicleModel = formData.get('vehicle.model');
      const vehicleYear = formData.get('vehicle.year');
      const vehicleReg = formData.get('vehicle.registration');

      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;

      if (session.user.role === 'admin') {
          if (role) user.role = role;
          if (isActive !== null) user.isActive = isActive === 'true';
      }

      const password = formData.get('password');
      if (password && password.trim() !== '') {
          user.password = password;
      }

      // Handle File Uploads
      const profileFile = formData.get('profilePicture');
      if (profileFile && profileFile instanceof File) {
          const buffer = Buffer.from(await profileFile.arrayBuffer());
          const uploadResult = await uploadToCloudinary(buffer, 'moscargarage/users');
          user.profilePicture = uploadResult.secure_url;
      }

      const vehicleFile = formData.get('vehicle.photo');
      if (vehicleFile && vehicleFile instanceof File) {
          const buffer = Buffer.from(await vehicleFile.arrayBuffer());
          const uploadResult = await uploadToCloudinary(buffer, 'moscargarage/vehicles');
          
          if (!user.vehicle) user.vehicle = {};
          user.vehicle.photo = uploadResult.secure_url;
      }

      // Update Vehicle Details
      if (!user.vehicle) user.vehicle = {};
      if (vehicleMake) user.vehicle.make = vehicleMake;
      if (vehicleModel) user.vehicle.model = vehicleModel;
      if (vehicleYear) user.vehicle.year = parseInt(vehicleYear);
      if (vehicleReg) user.vehicle.registration = vehicleReg;
    }

    await user.save();

    return NextResponse.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    // 3. Use the unwrapped 'id' variable here
    console.error(`Error updating user ${id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params here
    await connectDB();
    
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}