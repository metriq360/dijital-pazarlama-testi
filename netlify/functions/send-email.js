import nodemailer from 'nodemailer';

// Markdown karakterlerini e-posta için temizleyen yardımcı fonksiyon
const cleanMarkdownForEmail = (text) => {
    return text
        .replace(/### (.*)/g, '<h3 style="color:#f97316; margin-top:20px;">$1</h3>')
        .replace(/## (.*)/g, '<h2 style="color:#f97316; margin-top:20px;">$1</h2>')
        .replace(/# (.*)/g, '<h1 style="color:#f97316; margin-top:20px;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userInfo, report, scores, answers, selectedSections } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Raporu mail için şık bir HTML'e çeviriyoruz
    const formattedReport = cleanMarkdownForEmail(report);

    const mailToAdmin = {
      from: `"METRIQ360 Sistem" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Yeni Sağlık Testi: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <h1 style="color: #f97316;">Yeni Analiz Tamamlandı</h1>
            <p><strong>Müşteri:</strong> ${userInfo.name} ${userInfo.surname}</p>
            <p><strong>Sektör:</strong> ${userInfo.sector}</p>
            <p><strong>E-posta:</strong> ${userInfo.email}</p>
            <hr style="border: 1px solid #eee;">
            <div style="background: #fafafa; padding: 20px; border-radius: 10px;">
                ${formattedReport}
            </div>
            <hr style="border: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #888;">Bu rapor METRIQ360 AI tarafından otomatik olarak oluşturulmuştur.</p>
        </div>
      `,
    };
    
    const mailToUser = {
        from: `"METRIQ360 Strateji Ekibi" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `METRIQ360: Dijital Pazarlama Analiz Raporunuz`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #333;">
                <h2 style="color: #f97316;">Merhaba ${userInfo.name},</h2>
                <p>Sağlık testi ön analizinizi tamamladık. Sizin için hazırladığımız stratejik özeti aşağıda bulabilirsiniz:</p>
                <div style="background: #fff7ed; padding: 25px; border-radius: 15px; border: 1px solid #ffedd5; margin: 20px 0;">
                    ${formattedReport}
                </div>
                <p>Büyüme motorunuzu hemen çalıştırmak ve detaylı strateji kurgusunu konuşmak için randevunuzu oluşturun:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://wa.me/905379484868" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">STRATEJİ RANDEVUSU AL</a>
                    <p style="margin-top: 15px; font-weight: bold; color: #f97316;">📞 İletişim: +90 537 948 48 68</p>
                </div>
                <p>Saygılarımızla,<br><strong>METRIQ360 Ekibi</strong></p>
            </div>
        `,
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
