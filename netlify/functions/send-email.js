import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, scores } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailToAdmin = {
      from: `"Metriq360 Funnel" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 YENİ LEAD: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h1 style="color: #f97316;">Yeni Bir Lead Yakalandı!</h1>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 15px; border: 1px solid #eee;">
                <p><b>Ad Soyad:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <p style="font-size: 20px; color: #f97316; background: #fff; padding: 10px; border-radius: 10px;"><b>WhatsApp: ${userInfo.whatsapp}</b></p>
                <hr>
                <p><b>Arka Plan Skoru:</b> %${scores.totalScore}</p>
            </div>
            <p>Müşteri teşekkür sayfasına yönlendirildi. Fikret Kara'nın manuel incelemesi için veriler hazır.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailToAdmin);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
