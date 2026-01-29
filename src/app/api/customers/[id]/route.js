import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    await connectDB();
    const customer = await User.findById(id).select('-password');
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}


export async function PUT(request, { params }) {
  const { id } = params;
  try {
    await connectDB();
    const customer = await User.findById(id);

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phone, role, isActive, vehicle, password } = body;

   
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (role) customer.role = role;
    if (isActive !== undefined) customer.isActive = isActive;
    if (password) customer.password = password; // The pre-save hook will hash it

    
    if (vehicle) {
        if (vehicle.make) customer.vehicle.make = vehicle.make;
        if (vehicle.model) customer.vehicle.model = vehicle.model;
        if (vehicle.year) customer.vehicle.year = vehicle.year;
        if (vehicle.registration) customer.vehicle.registration = vehicle.registration;
    }
    
    const updatedCustomer = await customer.save();

    const customerResponse = updatedCustomer.toJSON();

    return NextResponse.json({ 
        success: true, 
        data: customerResponse,
        message: 'Customer updated successfully.' 
    });
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while updating customer' }, { status: 500 });
  }
}