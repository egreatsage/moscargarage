import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET(request, { params }) {
  try {
    const { id } = await params;
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
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    
    
    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email;
    if (body.phone) user.phone = body.phone;
    if (body.role) user.role = body.role;
    if (body.isActive !== undefined) user.isActive = body.isActive;
    
    
    if (body.password && body.password.trim() !== '') {
        user.password = body.password;
    }

    
    if (body.vehicle) {
        if (!user.vehicle) user.vehicle = {};
        if (body.vehicle.make) user.vehicle.make = body.vehicle.make;
        if (body.vehicle.model) user.vehicle.model = body.vehicle.model;
        if (body.vehicle.year) user.vehicle.year = body.vehicle.year;
        if (body.vehicle.registration) user.vehicle.registration = body.vehicle.registration;
    }

    await user.save();

    return NextResponse.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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