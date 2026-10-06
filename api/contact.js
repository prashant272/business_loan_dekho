const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Parse form data
  const { name, email, mobile, message, ...otherFields } = req.body;

  // Transporter setup for Google Workspace / Gmail
  // Note: We use the provided credentials. On Vercel, it's best to put these in Environment Variables, 
  // but they are hardcoded as fallbacks here for immediate functionality.
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Dynamically extract any other fields (like GST info, Business Year) submitted in different forms
  let extraFieldsStr = '';
  for (const [key, value] of Object.entries(otherFields)) {
    if (!['access_key', 'redirect', '_cc', '_next', '_captcha'].includes(key)) {
       extraFieldsStr += `${key}: ${value}\n`;
    }
  }

  const mailOptions = {
    from: `"Business Loan Dekho" <${process.env.EMAIL_USER}>`,
    to: 'aadsfinanceit@gmail.com, info@aadsfinancial.com',
    subject: `New Lead: ${name || 'Someone'} from businessloandekho.com`,
    text: `You have a new contact form submission from businessloandekho.com:

Name: ${name || 'N/A'}
Email: ${email || 'N/A'}
Mobile: ${mobile || 'N/A'}
${message ? `Message: ${message}\n` : ''}${extraFieldsStr}
End of message`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Success: Redirect visitor to thank you page
    res.writeHead(302, { Location: '/thankyou.html' });
    res.end();
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ error: 'Failed to send email. Check your Vercel logs for more details.' });
  }
}
