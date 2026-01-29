import nodemailer from 'nodemailer';
import { getCustomerBookingConfirmationEmail } from './emailTemplate';


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send booking notification to admin
export const sendBookingNotification = async (booking) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL, 
    subject: `New Booking: ${booking.bookingNumber}`,
    html: `
      <h1>New Booking Received</h1>
      <p>A new booking has been created.</p>
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>User:</strong> ${booking.user.name}</li>
        <li><strong>Email:</strong> ${booking.user.email}</li>
        <li><strong>Phone:</strong> ${booking.user.phone || 'N/A'}</li>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</li>
        <li><strong>Time Slot:</strong> ${booking.timeSlot}</li>
        <li><strong>Vehicle:</strong> ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})</li>
        <li><strong>Registration:</strong> ${booking.vehicle.registration}</li>
        <li><strong>Total Amount:</strong> KES ${booking.totalAmount.toLocaleString()}</li>
        <li><strong>Payment Status:</strong> ${booking.paymentStatus}</li>
      </ul>
      ${booking.issueDescription ? `
        <h3>Issue Description:</h3>
        <p>${booking.issueDescription}</p>
      ` : ''}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
};

// Send booking confirmation to customer
export const sendCustomerBookingConfirmation = async (booking) => {
  const htmlContent = getCustomerBookingConfirmationEmail(booking);
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Car Service'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: booking.user.email,
    subject: `Booking Confirmed - ${booking.bookingNumber}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Customer confirmation email sent successfully to:', booking.user.email);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    throw error;
  }
};


export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, 
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};