import nodemailer from 'nodemailer';

// Markdown sembollerini temizleyen ve profesyonel HTML'e çeviren fonksiyon
const formatForEmail = (text) => {
    return text
        .replace(/### (.*)/g, '<h3 style="color:#f97316; margin-top:20px; font-family:sans-serif;">$1</h3>')
        .replace(/## (.*)/g, '<h2 style="color:#f97316; margin-top:25px; font-family:sans-serif;">$1</h2>')
        .replace(/# (.*)/g, '<h1 style="color:#f97316; margin-top:30px; text-align:center;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#111;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color:#444;">$1</em>')
        .replace(/^\* (.*)/gm, '<li style="margin-bottom:8px; color:#334155;">$1</li>')
        .replace(/\n/g, '<br>');
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, report } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const cleanReport = formatForEmail(report);

    const mailToAdmin = {
      from: `"METRIQ360 Analiz" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `YENİ MÜŞTERİ: ${userInfo.name} ${userInfo.surname} (${userInfo.sector})`,
      html: `<div style="font-family:sans-serif; color:#333; max-width:700px; line-height:1.6;">
                <h1 style="color:#f97316;">Yeni Analiz Tamamlandı</h1>
                <p><b>Müşteri:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <hr style="border:1px solid #eee; margin:20px 0;">
                <div style="background:#f9f9f9; padding:25px; border-radius:15px; border: 1px solid #eee;">${cleanReport}</div>
             </div>`,
    };
    
    const mailToUser = {
        from: `"METRIQ360 Strateji" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `METRIQ360: Stratejik Büyüme Analiz Raporunuz Hazır`,
        html: `
            <div style="font-family: sans-serif; max-width: 650px; margin:auto; color:#333; line-height: 1.6;">
                <div style="text-align:center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin:0; font-size: 32px;">METRIQ360</h1>
                    <p style="text-transform:uppercase; letter-spacing:3px; color:#999; font-size:11px;">Dijital Büyüme Motoru</p>
                </div>
                
                <h2 style="color:#111;">Merhaba Sayın ${userInfo.name},</h2>
                <p>Dijital pazarlama performansınızı büyük bir titizlikle analiz ettik. Firmanızın büyüme motorunu ateşleyecek stratejik ön değerlendirme aşağıdadır:</p>
                
                <div style="background:#fff7ed; padding:30px; border-radius:20px; border:1px solid #ffedd5; margin:30px 0;">
                    ${cleanReport}
                </div>

                <div style="text-align:center; background:#f97316; padding:35px; border-radius:25px; color:white; box-shadow: 0 10px 30px rgba(249,115,22,0.2);">
                    <h3 style="margin-top:0; font-size: 22px;">SIRADAKİ ADIM: BİREBİR ANALİZ 📈</h3>
                    <p style="opacity: 0.9;">Bu verileri gerçek bir satış motoruna dönüştürmek için ücretsiz strateji randevunuzu hemen oluşturun.</p>
                    <a href="https://wa.me/905379484868" style="background:white; color:#f97316; padding:15px 35px; text-decoration:none; border-radius:12px; font-weight:bold; display:inline-block; margin-top:20px; font-size:16px;">RANDEVU AL</a>
                    <p style="margin-top:20px; font-weight:bold; font-size: 18px;">📞 +90 537 948 48 68</p>
                </div>

                <p style="text-align:center; font-size:12px; color:#aaa; margin-top:40px;">
                    Saygılarımızla, <br> <b>METRIQ360 Ekibi</b> <br>
                    <a href="https://www.metriq360.tr" style="color:#f97316; text-decoration:none;">www.metriq360.tr</a>
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error("Mail Hatası:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
