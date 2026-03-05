import nodemailer from 'nodemailer';

// Markdown karakterlerini e-posta için temizleyen yardımcı fonksiyon
const cleanMarkdownForEmail = (text) => {
    return text
        .replace(/### (.*)/g, '<h3 style="color:#f97316; margin-top:20px; font-family:sans-serif;">$1</h3>')
        .replace(/## (.*)/g, '<h2 style="color:#f97316; margin-top:20px; font-family:sans-serif;">$1</h2>')
        .replace(/# (.*)/g, '<h1 style="color:#f97316; margin-top:20px; font-family:sans-serif;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\* (.*)/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>');
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

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

    const formattedReport = cleanMarkdownForEmail(report);

    const mailToAdmin = {
      from: `"METRIQ360 Sistem" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Yeni Sağlık Testi: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <div style="font-family:sans-serif; color:#333; line-height:1.6;">
            <h1 style="color:#f97316;">Yeni Analiz Tamamlandı</h1>
            <p><b>Müşteri:</b> ${userInfo.name} ${userInfo.surname} (${userInfo.sector})</p>
            <p><b>E-posta:</b> ${userInfo.email}</p>
            <hr style="border:1px solid #eee;">
            <div style="background:#fafafa; padding:20px; border-radius:10px;">
                ${formattedReport}
            </div>
        </div>
      `,
    };
    
    const mailToUser = {
        from: `"METRIQ360 Strateji" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `METRIQ360: Dijital Pazarlama Analiz Raporunuz`,
        html: `
            <div style="font-family:sans-serif; max-width:600px; margin:auto; color:#333;">
                <h2 style="color:#f97316;">Merhaba Sayın ${userInfo.name},</h2>
                <p>Dijital pazarlama sağlık testini tamamladığınız için teşekkürler. Sektörünüze özel stratejik ön analiz raporunuz aşağıdadır:</p>
                <div style="background:#fff7ed; padding:25px; border-radius:15px; border:1px solid #ffedd5; margin:20px 0;">
                    ${formattedReport}
                </div>
                <div style="text-align:center; background:#f97316; padding:30px; border-radius:20px; color:white;">
                    <h3 style="margin-top:0;">BİREBİR BÜYÜME ANALİZİ 📈</h3>
                    <p>Potansiyelinizi gerçeğe dönüştürmek için randevunuzu hemen oluşturun.</p>
                    <a href="https://wa.me/905379484868" style="background:white; color:#f97316; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; margin-top:10px;">RANDEVU OLUŞTUR</a>
                    <p style="margin-top:15px; font-weight:bold;">📞 +90 537 948 48 68</p>
                </div>
                <p style="text-align:center; font-size:12px; color:#999; margin-top:30px;">Saygılarımızla, <br> <b>METRIQ360 Ekibi</b></p>
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
