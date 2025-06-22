// This file should be at: your-project-root/netlify/functions/send-email.js
import nodemailer from 'nodemailer';

// Use `export const handler` for ES Module syntax, which resolves the warning.
export const handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userInfo, report } = JSON.parse(event.body);

    // --- Nodemailer Setup ---
    // It will get your email credentials from Netlify's environment variables.
    // This keeps your credentials secure.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email or app password
      },
    });

    // --- Email to Admin ---
    const mailToAdmin = {
      from: `"Metriq360 Test Sistemi" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Your email address to receive notifications
      subject: `Yeni Test Sonucu: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <h1>Yeni Bir Dijital Pazarlama Testi Tamamlandı!</h1>
        <p><strong>Ad Soyad:</strong> ${userInfo.name} ${userInfo.surname}</p>
        <p><strong>E-posta:</strong> ${userInfo.email}</p>
        <p><strong>Sektör:</strong> ${userInfo.sector}</p>
        <hr>
        <h2>Oluşturulan Rapor:</h2>
        <div>${report.replace(/\n/g, '<br>')}</div>
      `,
    };
    
    // --- Email to User ---
    const mailToUser = {
        from: `"Metriq360" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Dijital Pazarlama Sağlık Testi Raporunuz`,
        html: `
            <h1>Merhaba ${userInfo.name},</h1>
            <p>Dijital Pazarlama Sağlık Testi'ne katıldığınız için teşekkür ederiz.</p>
            <p>Aşağıda sizin için özel olarak oluşturulan raporu bulabilirsiniz:</p>
            <hr>
            <div>${report.replace(/\n/g, '<br>')}</div>
            <hr>
            <p>Saygılarımızla,<br>Metriq360 Ekibi</p>
        `,
    };


    // Send the emails
    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully!' }),
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email.' }),
    };
  }
};
