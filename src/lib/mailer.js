import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingNotification = async (booking) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL, // Send to an admin email
    subject: 'New Booking Created',
    html: `
      <h1>New Booking Received</h1>
      <p>A new booking has been created.</p>
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>User:</strong> ${booking.user.name}</li>
        <li><strong>Email:</strong> ${booking.user.email}</li>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</li>
        <li><strong>Vehicle:</strong> ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})</li>
        <li><strong>License Plate:</strong> ${booking.vehicle.licensePlate}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking notification email sent');
  } catch (error) {
    console.error('Error sending booking notification email:', error);
  }
};
