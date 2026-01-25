// src/app/api/staff/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';

// GET a single staff member by ID
export async function GET(request, context) {
  const { id } = context.params;
  try {
    await connectDB();
    const staff = await Staff.findById(id).select('-password');
    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error(`Error fetching staff ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT (update) a staff member by ID
export async function PUT(request, context) {
  const { id } = context.params;
  try {
    await connectDB();
    const staff = await Staff.findById(id);

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, email, password, workdesignation, isActive } = body;

    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (email) staff.email = email;
    if (workdesignation) staff.workdesignation = workdesignation;
    if (isActive !== undefined) staff.isActive = isActive;
    if (password) staff.password = password; // The pre-save hook will hash it

    const updatedStaff = await staff.save();
    
    const staffResponse = updatedStaff.toJSON();

    return NextResponse.json({ 
        success: true, 
        data: staffResponse,
        message: 'Staff member updated successfully.' 
    });
  } catch (error) {
    console.error(`Error updating staff ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while updating staff' }, { status: 500 });
  }
}

// DELETE a staff member by ID
export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {}, message: 'Staff member deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting staff ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
