import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, report } = JSON.parse(event.body);

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
      from: `"METRIQ360 Sistem" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Yeni Sağlık Testi Sonucu: ${userInfo.name} ${userInfo.surname}`,
      html: `<h1>Yeni Analiz Tamamlandı</h1><p><b>İsim:</b> ${userInfo.name} ${userInfo.surname}</p><p><b>Sektör:</b> ${userInfo.sector}</p><p><b>E-posta:</b> ${userInfo.email}</p><hr><h2>Rapor Detayı:</h2><div>${report.replace(/\n/g, '<br>')}</div>`,
    };
    
    const mailToUser = {
        from: `"METRIQ360 Strateji Ekibi" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `METRIQ360: Dijital Pazarlama Sağlık Testi Raporunuz`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #f97316;">Merhaba ${userInfo.name},</h2>
                <p>Sağlık testi ön analizini tamamladığın için tebrikler!</p>
                <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #ffedd5;">
                    ${report.replace(/\n/g, '<br>')}
                </div>
                <p>Detaylı büyüme stratejisi kurgusu ve Büyüme Motoru tasarımı için <a href="https://www.metriq360.tr">web sitemizden</a> randevu alabilirsin.</p>
                <hr>
                <p>Saygılarımızla,<br><b>METRIQ360 Ekibi</b></p>
            </div>
        `,
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Sent' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
