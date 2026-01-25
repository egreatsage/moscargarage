// src/app/(admin)/admin/customers/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET a single customer by ID
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT update a customer by ID
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const { name, email, phone, role, isActive } = body;

    // Fields to update
    const updateFields = {
      name,
      email,
      phone,
      role,
      isActive,
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true, context: 'query' }
      ).select('-password');


    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: 'Customer updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Server error while updating customer' },
      { status: 500 }
    );
  }
}
