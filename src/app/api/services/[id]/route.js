
// src/app/api/services/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import Staff from '@/models/Staff';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET a single service by ID
export async function GET(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const service = await Service.findById(id)
      .populate({
        path: 'assignedStaff.staffId',
        select: 'name workdesignation',
        options: { strictPopulate: false },
      });
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT (update) a service by ID
export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

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

    // Update fields
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = Number(price);
    if (priceType) service.priceType = priceType;
    if (duration) service.duration = duration;
    if (category) service.category = category;
    if (isActive) service.isActive = isActive === 'true';

    // Handle image upload
    if (imageFile) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const result = await uploadToCloudinary(buffer, 'moscar/services');
            // In a real app, you might want to delete the old image from Cloudinary here
            service.image = result.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary upload failed:', uploadError);
            return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 });
        }
    }

    // Update assigned staff
    if (assignedStaffJson) {
      try {
        const parsedStaff = JSON.parse(assignedStaffJson);
        service.assignedStaff = parsedStaff.map(staff => ({
          staffId: staff.staffId || null,
          name: staff.name,
          isManualEntry: staff.isManualEntry || false
        }));
      } catch (error) {
        console.error('Error parsing assigned staff:', error);
      }
    }

    await service.save();

    // Populate staff details for registered staff only
    const populatedService = await Service.findById(service._id)
      .populate({
        path: 'assignedStaff.staffId',
        select: 'name workdesignation',
        options: { strictPopulate: false },
      });

    return NextResponse.json({ success: true, data: populatedService || service });
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while updating service' }, { status: 500 });
  }
}

// DELETE a service by ID
export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    await connectDB();
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }
    
    // In a real app, you should delete the associated image from Cloudinary here

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
