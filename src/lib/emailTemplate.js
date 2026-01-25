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