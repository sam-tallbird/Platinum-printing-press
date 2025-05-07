import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define recipient and sender email addresses
const toEmail = 'platinumprintingiq@gmail.com'; // Changed recipient to the registered Resend email
const fromEmail = process.env.EMAIL_SENDER_ADDRESS;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Basic validation for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable not set.');
    return res.status(500).json({ message: 'Server configuration error (API Key missing).' });
  }
  if (!fromEmail) {
     console.error('EMAIL_SENDER_ADDRESS environment variable not set.');
     return res.status(500).json({ message: 'Server configuration error (Sender missing).' });
  }
  if (!toEmail) {
    // This should ideally not happen if hardcoded or set via a reliable env var
    console.error('Recipient email (toEmail) is not set.');
    return res.status(500).json({ message: 'Server configuration error (Recipient missing).' });
 }

  const { fullName, companyName, phoneNumber, email, message } = req.body;

  // Validate incoming data
  if (!fullName || !email || !message) {
    return res.status(400).json({ message: 'Full Name, Email, and Message are required.' });
  }

  // --- Format Email Content ---
  const subject = `New Contact Inquiry from ${fullName}`;
  
  // Create a more professional-looking HTML email body
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #dddddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .email-header {
          background-color: #0f172a; /* Example: Dark blue header */
          color: #ffffff;
          padding: 20px;
          text-align: center;
          font-size: 1.4em;
        }
        .email-content {
          padding: 30px;
        }
        .email-content table {
          width: 100%;
          border-collapse: collapse;
        }
        .email-content th,
        .email-content td {
          padding: 10px 0;
          text-align: left;
          vertical-align: top;
        }
        .email-content th {
          font-weight: bold;
          color: #555555;
          width: 130px; /* Fixed width for labels */
        }
        .email-content td {
          color: #333333;
        }
        .message-label {
           font-weight: bold;
           color: #555555;
           margin-top: 15px;
           display: block;
        }
        .message-content {
          margin-top: 5px;
          padding: 10px;
          background-color: #f3f4f6; /* Light background for message */
          border-radius: 4px;
          white-space: pre-wrap; /* Preserve whitespace and line breaks */
        }
        .email-footer {
          text-align: center;
          padding: 20px;
          font-size: 0.9em;
          color: #888888;
          border-top: 1px solid #dddddd;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          New Contact Form Submission
        </div>
        <div class="email-content">
          <table>
            <tr>
              <th>Full Name:</th>
              <td>${fullName}</td>
            </tr>
            <tr>
              <th>Reply-To Email:</th>
              <td><a href="mailto:${email}">${email}</a></td>
            </tr>
            ${companyName ? `<tr><th>Company Name:</th><td>${companyName}</td></tr>` : ''}
            ${phoneNumber ? `<tr><th>Phone Number:</th><td>${phoneNumber}</td></tr>` : ''}
          </table>
          
          <div class="message-label">Message:</div>
          <div class="message-content">${message}</div>
        </div>
        <div class="email-footer">
          This email was sent from the contact form on your website.
        </div>
      </div>
    </body>
    </html>
  `;

  // --- Send Email using Resend --- 
  try {
    console.log(`Attempting to send contact email from ${fromEmail} to ${toEmail} (Reply-To: ${email})`);

    const { data, error: emailError } = await resend.emails.send({
      from: fromEmail, 
      to: [toEmail],   
      reply_to: email, // Set the sender's email as the reply-to address
      subject: subject,
      html: emailHtml, 
    });

    if (emailError) {
      console.error('Resend API Error:', JSON.stringify(emailError, null, 2));
      return res.status(500).json({ message: 'Error sending email.', details: emailError.message });
    }

    console.log('Contact email sent successfully via Resend:', data);
    return res.status(200).json({ message: 'Contact inquiry sent successfully!', emailId: data?.id });

  } catch (error) {
    console.error('Error in /api/send-contact-email handler:', error);
    return res.status(500).json({ message: 'Internal Server Error processing request.', details: error.message });
  }
} 