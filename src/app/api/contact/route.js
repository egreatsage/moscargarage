import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
// import { getEmailTemplate } from '@/lib/emailTemplate';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, message } = body;

    // Validate input
    if (!name || !email || !phoneNumber || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      phoneNumber,
      message,
    });

    /*
    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'false', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Format date
    const createdAt = new Date(contact.createdAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Email content
    const emailHtml = getEmailTemplate({
      name: contact.name,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      message: contact.message,
      createdAt,
    });

    // Send email to admin
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Contact Form'}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: emailHtml,
      replyTo: email,
    });
    */

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been saved successfully!',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process your request',
        details: error.message,
      },
      { status: 500 }
    );
  }
}