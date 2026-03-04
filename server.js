const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (e.g., your HTML form)
app.use(express.static(__dirname));

// Configure nodemailer with iCloud SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587, // use 465 for SSL
  secure: false, // true for port 465
  auth: {
    user: 'mbongeniyika@icloud.com', // Your iCloud email
    pass: 'utik-jphp-oxxo-akyb' // Your app-specific password
  }
});

// ------------------------------
// **ADDED/UPDATED**: Define multer fields for multiple files
const uploadFields = upload.fields([
  { name: 'bankStatement', maxCount: 1 },
  { name: 'identityDoc', maxCount: 1 },
  { name: 'payslip', maxCount: 1 }
]);
// ------------------------------

// Handle form submission
// **REPLACE** your current route with this one
app.post('/submit', uploadFields, async (req, res) => {
  try {
    const { name, email, phone, amount, purpose } = req.body;
    const files = req.files; // now an object with keys: bankStatement, identityDoc, payslip

    // **ADDED**: Validate files are PDFs (optional but recommended)
    // Uncomment if you want to validate
    /*
    for (const key in files) {
      if (files[key]) {
        if (path.extname(files[key][0].originalname).toLowerCase() !== '.pdf') {
          return res.status(400).json({ message: 'Only PDF files are allowed.' });
        }
      }
    }
    */

    // **MODIFIED**: Create attachments array with selected files
    const emailAttachments = [];

    if (files['bankStatement']) {
      emailAttachments.push({
        filename: files['bankStatement'][0].originalname,
        path: path.join(__dirname, files['bankStatement'][0].path)
      });
    }

    if (files['identityDoc']) {
      emailAttachments.push({
        filename: files['identityDoc'][0].originalname,
        path: path.join(__dirname, files['identityDoc'][0].path)
      });
    }

    if (files['payslip']) {
      emailAttachments.push({
        filename: files['payslip'][0].originalname,
        path: path.join(__dirname, files['payslip'][0].path)
      });
    }

    // Compose email body
    const emailBody = `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Amount: ${amount}
      Purpose: ${purpose}
    `;

    // Send email with attachments
    await transporter.sendMail({
      from: '"Loan Application" <mbongeniyika@icloud.com>',
      to: 'mbongzabless@gmail.com', // Change to your email if needed
      subject: 'New Loan Application Submission',
      text: emailBody,
      attachments: emailAttachments
    });

    res.json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to submit application.' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
