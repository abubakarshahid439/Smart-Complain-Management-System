const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if credentials are still placeholder
    if (process.env.SMTP_USER === 'your-email@gmail.com' || process.env.SMTP_PASS === 'your-app-password') {
        throw new Error('Email credentials are not configured in .env file (placeholders detected)');
    }

    const transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };

    // Optimization for Gmail
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
        transporterConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    console.log(`Sending email to: ${options.email} with subject: ${options.subject}`);
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
