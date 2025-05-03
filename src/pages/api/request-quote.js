import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Get recipient and sender email addresses from environment variables
const toEmail = process.env.QUOTE_REQUEST_EMAIL;
const fromEmail = process.env.EMAIL_SENDER_ADDRESS;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    // Set Allow header for 405 response
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Basic validation for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable not set.');
    return res.status(500).json({ message: 'Server configuration error (API Key missing).' });
  }
  if (!toEmail) {
     console.error('QUOTE_REQUEST_EMAIL environment variable not set.');
     return res.status(500).json({ message: 'Server configuration error (Recipient missing).' });
  }
  if (!fromEmail) {
     console.error('EMAIL_SENDER_ADDRESS environment variable not set.');
     return res.status(500).json({ message: 'Server configuration error (Sender missing).' });
  }

  const { cartItems, userInfo } = req.body; // Get cart items and potentially user info from request body

  // Validate incoming data
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart items are required and cannot be empty.' });
  }
  // Optional: Add validation for userInfo if you implement it later

  // --- Format Email Content (HTML Table) ---
  const subject = 'New Quotation Request';
  const requestDate = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  // Build HTML string using a table for items
  let emailHtml = `
    <div style=\"font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;\">
      <h1 style=\"color: #1a1a1a;\">Platinum Printing Press - New Quotation Request</h1>
      <p><strong>Received:</strong> ${requestDate}</p>
  `;

  // Add User Info if provided
  if (userInfo && userInfo.name && userInfo.email) {
      emailHtml += `<p><strong>From:</strong> ${userInfo.name} (${userInfo.email})</p>`;
  } else if (userInfo && userInfo.email) {
      emailHtml += `<p><strong>From:</strong> ${userInfo.email}</p>`;
  }
  emailHtml += `<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">
`;

  // Add Cart Items Table
  emailHtml += `<h2>Requested Items:</h2>
    <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">
      <thead>
        <tr style=\"background-color: #f2f2f2; text-align: left;\">
          <th style=\"border: 1px solid #ddd; padding: 10px;\">Product Name</th>
          <th style=\"border: 1px solid #ddd; padding: 10px;\">Quantity</th>
          <th style=\"border: 1px solid #ddd; padding: 10px;\">Options</th>
        </tr>
      </thead>
      <tbody>
  `;

  cartItems.forEach((item, index) => {
    const itemName = item.product_name_en || `Item #${index + 1}`;
    let optionsHtml = 'N/A'; // Default if no options

    if (item.selected_options_details && item.selected_options_details.length > 0) {
      optionsHtml = '<ul style="margin: 0; padding-left: 18px;">';
      item.selected_options_details.forEach(detail => {
        optionsHtml += `<li style="margin-bottom: 4px;">${detail.groupNameEN || 'Option'}: ${detail.choiceNameEN || 'Selected'}</li>`;
      });
      optionsHtml += '</ul>';
    }

    emailHtml += `
        <tr>
          <td style=\"border: 1px solid #ddd; padding: 10px; vertical-align: top;\">${itemName}</td>
          <td style=\"border: 1px solid #ddd; padding: 10px; vertical-align: top;\">${item.quantity}</td>
          <td style=\"border: 1px solid #ddd; padding: 10px; vertical-align: top;\">${optionsHtml}</td>
        </tr>
    `;
  });

  emailHtml += `
      </tbody>
    </table>
  `;

  emailHtml += `<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">`;
  emailHtml += `<p style=\"font-size: 0.9em; color: #777;\">End of request.</p>`;
  emailHtml += `</div>`; // Close main div

  // --- Send Email using Resend --- 
  try {
    console.log(`Attempting to send HTML email from ${fromEmail} to ${toEmail}`);

    // --- RE-ENABLING EMAIL SENDING --- 
    // Remove comment markers /* and */
    const { data, error } = await resend.emails.send({
      from: fromEmail, 
      to: [toEmail],   
      subject: subject,
      html: emailHtml, 
    });

    // Handle potential errors from Resend API
    if (error) {
      console.error('Resend API Error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ message: 'Error sending email via Resend.', details: error.message });
    }

    // Success!
    console.log('Email sent successfully via Resend:', data);
    // Ensure original success response is active
    return res.status(200).json({ message: 'Quotation request sent successfully!', emailId: data?.id });

    // --- REMOVED Simulated Success --- 
    // console.log('Email sending is temporarily disabled. Simulating success.');
    // return res.status(200).json({ message: 'Quotation request processed (Email Disabled).', emailId: 'disabled' });

  } catch (error) {
    // Handle unexpected errors in the API route logic 
    console.error('Error in /api/request-quote handler:', error);
    return res.status(500).json({ message: 'Internal Server Error processing request.', details: error.message });
  }
} 