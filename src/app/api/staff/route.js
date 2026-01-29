// src/app/api/services/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Staff from '@/models/Staff';
import Service from '@/models/Service';


export async function GET() {
  try {
    await connectDB();
    const staff = await Staff.find({ isActive: true })
      .select('name email phone workdesignation profilePicture')
      .sort({ name: 1 });
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const workdesignation = formData.get('workdesignation');
    const isActive = formData.get('isActive');
    const imageFile = formData.get('image');

  
    if (!name || !email || !phone || !password || !workdesignation) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    let imageUrl = '';
    if (imageFile) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const result = await uploadToCloudinary(buffer, 'moscar/staff');
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary upload failed:', uploadError);
            return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 });
        }
    }

    const newStaff = new Staff({
        name,
        email,
        phone,
        password,
        workdesignation,
        isActive: isActive ? isActive === 'true' : true,
        image: imageUrl,
    });

    await newStaff.save();

    return NextResponse.json({ success: true, data: newStaff }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error while creating staff' }, { status: 500 });
  }
}
