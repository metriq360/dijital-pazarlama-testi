import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, scores, answers } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // SADECE SANA GELEN MAİL (Müşteriye artık sonuç/rapor gitmiyor, numarayı aldık randevuya yönlendirdik)
    const mailToAdmin = {
      from: `"Metriq360 Funnel" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 YENİ SAĞLIK TESTİ LEAD'İ: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h1 style="color: #d32f2f;">Yeni Lead Yakalandı!</h1>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 15px; border: 1px solid #eee;">
                <p><b>Ad Soyad:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <p style="font-size: 24px; color: #0277bd; margin: 0;"><b>📞 WhatsApp: ${userInfo.whatsapp}</b></p>
                </div>
                <hr style="margin: 20px 0;">
                <p style="font-size: 18px;"><b>Hesaplanan Skor:</b> <span style="color: #d32f2f;">%${scores.totalScore}</span></p>
            </div>
            <p style="color: #555;"><i>Not: Müşteri şu anda başarıyla teşekkür sayfasına (tesekkurler-test) yönlendirildi. Arayıp satışı kapatabilirsiniz.</i></p>
        </div>
      `,
    };

    await transporter.sendMail(mailToAdmin);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error("Email Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
