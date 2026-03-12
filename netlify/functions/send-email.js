import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, report, scores } = JSON.parse(event.body);

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
      subject: `🔥 SICAK LEAD: ${userInfo.name} ${userInfo.surname} (${userInfo.sector})`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #f97316;">WhatsApp Hunisinden Yeni Kayıt!</h1>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 15px; border: 1px solid #eee;">
                <p><b>Ad Soyad:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <p style="font-size: 24px; color: #f97316;"><b>WhatsApp: ${userInfo.whatsapp}</b></p>
                <hr>
                <p><b>Normalleştirilmiş Skor:</b> %${scores.totalScore}</p>
            </div>
            <h2>AI Strateji Ön Raporu:</h2>
            <div style="background: #fff7ed; padding: 20px; border-radius: 10px; border: 1px solid #ffedd5;">
                ${report ? report.replace(/\n/g, '<br>') : 'Rapor hazırlanırken hata oluştu.'}
            </div>
            <p>Müşteri şu an teşekkür sayfasına yönlendirildi. Hemen iletişime geçebilirsiniz.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailToAdmin);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error("Email error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
