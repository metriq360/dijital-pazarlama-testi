// /netlify/functions/send-email.js

// SendGrid Mail kütüphanesini import ediyoruz.
// Bu paketi projenize eklemeniz gerekir: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');

// SendGrid API anahtarınızı Netlify ortam değişkenlerinden alıyoruz.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Netlify fonksiyonunun ana işleyici (handler) fonksiyonu
exports.handler = async (event, context) => {
  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // İstek gövdesindeki verileri ayrıştırıyoruz
    const { 
      userEmail, 
      userName, 
      adminEmail, 
      reportContent, 
      userInfoForAdmin 
    } = JSON.parse(event.body);

    // HTML'e dönüştürülmüş rapor içeriği (satır sonlarını <br> ile değiştirerek)
    const reportHtml = reportContent.replace(/\n/g, '<br>');

    // 1. E-posta: Kullanıcıya gönderilecek olan
    const msgToUser = {
      to: userEmail,
      from: 'bilgi@metriq360.com', // Gönderen olarak doğrulanmış SendGrid e-postanız
      subject: `🚀 Dijital Pazarlama Sağlık Testi Raporunuz, ${userName}!`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Merhaba ${userName},</h2>
          <p>Dijital Pazarlama Sağlık Testi'ni tamamladığınız için teşekkürler!</p>
          <p>Aşağıda sizin için özel olarak hazırlanan raporu bulabilirsiniz:</p>
          <hr>
          ${reportHtml}
          <hr>
          <p>Dijital pazarlamada bir sonraki adımı atmak için bizimle iletişime geçmekten çekinmeyin.</p>
          <p>Saygılarımızla,<br>Metriq360 Ekibi</p>
        </div>
      `,
    };

    // 2. E-posta: Site sahibine (admin) gönderilecek olan
    const msgToAdmin = {
      to: adminEmail,
      from: 'bilgi@metriq360.com', // Gönderen olarak doğrulanmış SendGrid e-postanız
      subject: `Yeni Test Tamamlandı: ${userName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Yeni bir test sonucu aldınız!</h2>
          <p><strong>Kullanıcı:</strong> ${userName}</p>
          <p><strong>E-posta:</strong> ${userEmail}</p>
          <p><strong>Sektör:</strong> ${userInfoForAdmin.sector}</p>
          <p><strong>Puan:</strong> ${userInfoForAdmin.overallScore} / ${userInfoForAdmin.overallMaxScore}</p>
          <hr>
          <h3>Oluşturulan Rapor:</h3>
          ${reportHtml}
        </div>
      `,
    };

    // Her iki e-postayı da gönder
    await sgMail.send(msgToUser);
    await sgMail.send(msgToAdmin);

    // Başarılı olursa 200 durum kodu ile geri dönüş yap
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'E-postalar başarıyla gönderildi.' }),
    };

  } catch (error) {
    // Hata durumunda konsola yaz ve 500 durum kodu ile geri dönüş yap
    console.error('E-posta gönderme hatası:', error);
    if (error.response) {
      console.error(error.response.body)
    }
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: 'E-posta gönderilemedi.' }),
    };
  }
};
