// src/app/api/services/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import Staff from '@/models/Staff';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET all services
export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({})
      .populate({
        path: 'assignedStaff.staffId',
        select: 'name workdesignation',
        options: { strictPopulate: false },
      })
      .sort({ name: 1 });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST a new service
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const priceType = formData.get('priceType');
    const duration = formData.get('duration');
    const category = formData.get('category');
    const isActive = formData.get('isActive');
    const imageFile = formData.get('image');
    const assignedStaffJson = formData.get('assignedStaff');

    // Basic validation
    if (!name || !description || !price || !duration || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    let imageUrl = '';
    if (imageFile) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const result = await uploadToCloudinary(buffer, 'moscar/services');
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary upload failed:', uploadError);
            return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 });
        }
    }

    // Parse assigned staff
    let assignedStaff = [];
    if (assignedStaffJson) {
      try {
        const parsedStaff = JSON.parse(assignedStaffJson);
        assignedStaff = parsedStaff.map(staff => ({
          staffId: staff.staffId || null,
          name: staff.name,
          isManualEntry: staff.isManualEntry || false
        }));
      } catch (error) {
        console.error('Error parsing assigned staff:', error);
      }
    }

    const newService = new Service({
      name,
      description,
      price: Number(price),
      priceType,
      duration,
      category,
      isActive: isActive ? isActive === 'true' : true,
      image: imageUrl,
      assignedStaff,
    });

    await newService.save();

    // Populate staff details for registered staff only (where staffId is not null)
    const populatedService = await Service.findById(newService._id)
      .populate({
        path: 'assignedStaff.staffId',
        select: 'name workdesignation',
        options: { strictPopulate: false },
      });

    return NextResponse.json({ success: true, data: populatedService || newService }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while creating service' }, { status: 500 });
  }
}