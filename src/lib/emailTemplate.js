export const getEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    📬 New Contact Form Submission
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                    You've received a new message from your website
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <!-- Contact Details -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          Contact Details
                        </h2>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 30px; vertical-align: top;">
                                    <span style="font-size: 20px;">👤</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">${data.name}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 30px; vertical-align: top;">
                                    <span style="font-size: 20px;">📧</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                                      <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 30px; vertical-align: top;">
                                    <span style="font-size: 20px;">📱</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                                      <a href="tel:${data.phoneNumber}" style="color: #667eea; text-decoration: none;">${data.phoneNumber}</a>
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0 0 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 30px; vertical-align: top;">
                                    <span style="font-size: 20px;">🕒</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Received</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 14px;">${data.createdAt}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Message -->
                    <tr>
                      <td>
                        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          💬 Message
                        </h2>
                        <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 6px;">
                          <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="padding-top: 30px; text-align: center;">
                        <a href="mailto:${data.email}?subject=Re: Your inquiry" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                          Reply to ${data.name}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    This email was sent from your website contact form.<br>
                    Please respond to the sender at <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
export const getCustomerBookingConfirmationEmail = (booking) => {
  const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${booking.bookingNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                  <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">✓</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                    Booking Confirmed!
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px;">
                    Thank you for choosing our service
                  </p>
                </td>
              </tr>
              
              <!-- Booking Number Banner -->
              <tr>
                <td style="background-color: #f0fdf4; padding: 20px 30px; text-align: center; border-bottom: 2px solid #10b981;">
                  <p style="margin: 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    Booking Number
                  </p>
                  <p style="margin: 8px 0 0 0; color: #047857; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                    ${booking.bookingNumber}
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    
                    <!-- Welcome Message -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Dear ${booking.user.name},
                        </p>
                        <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Your booking has been successfully confirmed! We're looking forward to serving you.
                        </p>
                      </td>
                    </tr>

                    <!-- Service Details -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          📋 Service Details
                        </h2>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                          <tr>
                            <td style="padding: 20px;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #6b7280; font-size: 14px;">Service:</span>
                                  </td>
                                  <td style="padding: 8px 0; text-align: right;">
                                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${booking.service.name}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #6b7280; font-size: 14px;">Category:</span>
                                  </td>
                                  <td style="padding: 8px 0; text-align: right;">
                                    <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${booking.service.category}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #6b7280; font-size: 14px;">Duration:</span>
                                  </td>
                                  <td style="padding: 8px 0; text-align: right;">
                                    <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${booking.service.duration}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;">
                                    <span style="color: #6b7280; font-size: 14px;">Total Amount:</span>
                                  </td>
                                  <td style="padding: 12px 0 0 0; text-align: right; border-top: 1px solid #e5e7eb;">
                                    <span style="color: #10b981; font-size: 20px; font-weight: 700;">KES ${booking.totalAmount.toLocaleString()}</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Appointment Details -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          📅 Appointment Details
                        </h2>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 40px; vertical-align: top;">
                                    <span style="font-size: 24px;">📆</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${bookingDate}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width: 40px; vertical-align: top;">
                                    <span style="font-size: 24px;">⏰</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time Slot</p>
                                    <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${booking.timeSlot}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Vehicle Information -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                          🚗 Vehicle Information
                        </h2>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #6b7280; font-size: 14px;">Vehicle:</span>
                              <span style="color: #1f2937; font-size: 14px; font-weight: 600; margin-left: 10px;">
                                ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #6b7280; font-size: 14px;">Registration:</span>
                              <span style="color: #1f2937; font-size: 14px; font-weight: 600; margin-left: 10px;">
                                ${booking.vehicle.registration}
                              </span>
                            </td>
                          </tr>
                          ${booking.vehicle.color ? `
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #6b7280; font-size: 14px;">Color:</span>
                              <span style="color: #1f2937; font-size: 14px; font-weight: 600; margin-left: 10px;">
                                ${booking.vehicle.color}
                              </span>
                            </td>
                          </tr>
                          ` : ''}
                          ${booking.vehicle.mileage ? `
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #6b7280; font-size: 14px;">Mileage:</span>
                              <span style="color: #1f2937; font-size: 14px; font-weight: 600; margin-left: 10px;">
                                ${booking.vehicle.mileage} km
                              </span>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                        
                        ${booking.issueDescription ? `
                        <div style="margin-top: 15px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                          <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Issue Description:</p>
                          <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px; line-height: 1.5;">${booking.issueDescription}</p>
                        </div>
                        ` : ''}
                      </td>
                    </tr>

                    <!-- Payment Status -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; padding: 20px;">
                          <tr>
                            <td>
                              <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">Payment Status</p>
                              <p style="margin: 8px 0 0 0; color: #1e3a8a; font-size: 18px; font-weight: 700; text-transform: uppercase;">
                                ${booking.paymentStatus === 'completed' ? '✓ Paid' : booking.paymentStatus === 'pending' ? '⏳ Pending' : booking.paymentStatus}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Important Information -->
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px;">
                          <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                            ℹ️ Important Information
                          </h3>
                          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                            <li>Please arrive 10 minutes before your scheduled time</li>
                            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                            <li>Keep your booking number handy for reference</li>
                          </ul>
                        </div>
                      </td>
                    </tr>

                    <!-- Contact Information -->
                    <tr>
                      <td>
                        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                          If you have any questions or need to make changes to your booking, please don't hesitate to contact us.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                    Need help?
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    Contact us at <a href="mailto:${process.env.ADMIN_EMAIL || 'support@example.com'}" style="color: #10b981; text-decoration: none; font-weight: 600;">${process.env.ADMIN_EMAIL || 'support@example.com'}</a>
                    <br>
                    Booking ID: ${booking.bookingNumber}
                  </p>
                  <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
                    This is an automated confirmation email. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};