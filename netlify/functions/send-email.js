// Dosya Yolu: netlify/functions/send-email.js
import nodemailer from 'nodemailer';

// --- Test Questions and Section Titles (Copied from App.js) ---
const allQuestions = [
  // Bölüm 1: Sosyal Medya Yönetimi
  { id: 'q1_1', section: 1, text: 'Sosyal medya hesaplarınızda ne sıklıkla paylaşım yapıyorsunuz?' },
  { id: 'q1_2', section: 1, text: 'Her platform için ayrı bir strateji uyguluyor musunuz?' },
  { id: 'q1_3', section: 1, text: 'Takipçi sayınız son 6 ayda istikrarlı bir şekilde arttı mı?' },
  { id: 'q1_4', section: 1, text: 'Paylaşımlarınız etkileşim alıyor mu (beğeni, yorum, paylaşım)?' },
  { id: 'q1_5', section: 1, text: 'Hedef kitlenizi tanıyarak içerik üretiyor musunuz?' },
  { id: 'q1_6', section: 1, text: 'Story, reels ve canlı yayın gibi farklı içerik formatlarını kullanıyor musunuz?' },
  { id: 'q1_7', section: 1, text: 'Sosyal medyada gelen yorumlara ve mesajlara ne kadar hızlı yanıt veriyorsunuz?' },
  { id: 'q1_8', section: 1, text: 'İçerik takvimi oluşturup gönderileri önceden planlıyor musunuz?' },
  { id: 'q1_9', section: 1, text: 'Rakiplerinizin sosyal medya stratejilerini analiz ediyor musunuz?' },
  { id: 'q1_10', section: 1, text: 'Sosyal medya için dış kaynak ya da ajans desteği alıyor musunuz?' },

  // Bölüm 2: Yerel SEO ve Google Benim İşletmem
  { id: 'q2_1', section: 2, text: 'Google Benim İşletmem (GBP) profiliniz var mı?' },
  { id: 'q2_2', section: 2, text: 'GBP profilinizde adres, telefon ve açık saatler eksiksiz mi?' },
  { id: 'q2_3', section: 2, text: 'GBP üzerinde sık sık içerik (fotoğraf, gönderi) paylaşıyor musunuz?' },
  { id: 'q2_4', section: 2, text: 'Harita konumunuz doğru mu?' },
  { id: 'q2_5', section: 2, text: 'Müşterilerden düzenli olarak Google yorumu alıyor musunuz?' },
  { id: 'q2_6', section: 2, text: 'Gelen yorumlara yanıt veriyor musunuz?' },
  { id: 'q2_7', section: 2, text: 'İşletmeniz yerel dizinlerde ve haritalarda listelenmiş mi?' },
  { id: 'q2_8', section: 2, text: '“Yakınımdaki [ürün/hizmet]” gibi aramalarda çıkıyor musunuz?' },
  { id: 'q2_9', section: 2, text: 'GBP verilerini (gösterim, tıklama vs.) analiz ediyor musunuz?' },
  { id: 'q2_10', section: 2, text: 'Yerel anahtar kelimelere yönelik stratejiniz var mı?' },

  // Bölüm 3: Reklam ve Kampanya Yönetimi
  { id: 'q3_1', section: 3, text: 'Meta (Facebook/Instagram) reklamları yürütüyor musunuz?' },
  { id: 'q3_2', section: 3, text: 'Google Ads kampanyaları aktif mi?' },
  { id: 'q3_3', section: 3, text: 'Hedef kitle tanımlarınız net mi?' },
  { id: 'q3_4', section: 3, text: 'Reklam kampanyalarınıza segmentlere ayırıyor musunuz?' },
  { id: 'q3_5', section: 3, text: 'A/B testleri yapıyor musunuz?' },
  { id: 'q3_6', section: 3, text: 'Reklamlarda dönüşüm hedefi belirliyor musunuz?' },
  { id: 'q3_7', section: 3, text: 'Reklam bütçenizi veriye göre optimize ediyor musunuz?' },
  { id: 'q3_8', section: 3, text: 'Farklı reklam formatları (video, carousel, lead form) kullanıyor musunuz?' },
  { id: 'q3_9', section: 3, text: 'Dönüşüm takibi yapabiliyor musunuz (pixel, GA)?' },
  { id: 'q3_10', section: 3, text: 'Reklam performans raporlarını haftalık/aylık inceliyor musunuz?' },

  // Bölüm 4: İçerik Pazarlaması
  { id: 'q4_1', section: 4, text: 'Web sitenizde blog içerikleri yayınlıyor musunuz?' },
  { id: 'q4_2', section: 4, text: 'İçerikleriniz belirli bir stratejiye göre mı hazırlanıyor?' },
  { id: 'q4_3', section: 4, text: 'İçeriklerinizin hedef kitlenizin sorunlarına çözüm sunduğunu düşünüyor musunuz?' },
  { id: 'q4_4', section: 4, text: 'Videolu içerikler üretiyor musunuz?' },
  { id: 'q4_5', section: 4, text: 'İçeriklerinizde anahtar kelime optimizasyonu yapıyor musunuz?' },
  { id: 'q4_6', section: 4, text: 'İçerikleriniz ne sıklıkta güncelleniyor?' },
  { id: 'q4_7', section: 4, text: 'İçeriğiniz sosyal medya ve e-posta ile destekleniyor mu?' },
  { id: 'q4_8', section: 4, text: 'İçeriklerinizin performansını ölçüyor musunuz (okunma süresi, hemen çıkma vs.)?' },
  { id: 'q4_9', section: 4, text: 'Blog yazılarında görsel, infografik gibi unsurlar kullanıyor musunuz?' },
  { id: 'q4_10', section: 4, text: 'İçerik üretimi için profesyonel destek alıyor musunuz?' },

  // Bölüm 5: Pazarlama Araçları ve Otomasyon
  { id: 'q5_1', section: 5, text: 'Hangi pazarlama otomasyon araçlarını kullanıyorsunuz?' },
  { id: 'q5_2', section: 5, text: 'E-posta pazarlaması yapıyor musunuz?' },
  { id: 'q5_3', section: 5, text: 'E-posta listenizi segmentlere ayırıyor musunuz?' },
  { id: 'q5_4', section: 5, text: 'Google Analytics veya benzeri araçlarla sitenizi analiz ediyor musunuz?' },
  { id: 'q5_5', section: 5, text: 'Ziyaretçi davranışlarını analiz etmek için bir sisteminiz var mı?' },
  { id: 'q5_6', section: 5, text: 'Sosyal medya zamanlayıcı araçlar (Buffer, Meta Planner vb.) kullanıyor musunuz?' },
  { id: 'q5_7', section: 5, text: 'CRM veya müşteri yönetim sistemi kullanıyor musunuz?' },
  { id: 'q5_8', section: 5, text: 'Pazarlama performansınızı raporlayan otomatik sistemler var mı?' },
  { id: 'q5_9', section: 5, text: 'Online formlarınızdan gelen verileri merkezi bir yerde topluyor musunuz?' },
  { id: 'q5_10', section: 5, text: 'Dijital pazarlama süreçlerinin tümünü bir sistem dahilinde takip ediyor musunuz?' },
];

const getSectionTitle = (sectionNum) => {
    const titles = ['','Sosyal Medya Yönetimi','Yerel SEO ve Google Benim İşletmem','Reklam ve Kampanya Yönetimi','İçerik Pazarlaması','Pazarlama Araçları ve Otomasyon'];
    return titles[sectionNum] || '';
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

    // --- Create Detailed Results HTML for Admin ---
    let detailsHTML = '<h2>Test Sonuç Detayları:</h2>';
    detailsHTML += `<p><strong>Genel Puan:</strong> ${scores.totalScore} / ${scores.totalMaxScore}</p>`;
    detailsHTML += '<h3>Bölüm Puanları:</h3><ul>';
    selectedSections.forEach(sectionNum => {
        detailsHTML += `<li><strong>${getSectionTitle(sectionNum)}:</strong> ${scores.sectionScores[sectionNum]} / ${scores.sectionMaxScores[sectionNum]}</li>`;
    });
    detailsHTML += '</ul>';

    detailsHTML += '<h3>Verilen Cevaplar:</h3>';
    selectedSections.forEach(sectionNum => {
        detailsHTML += `<h4 style="margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Bölüm ${sectionNum}: ${getSectionTitle(sectionNum)}</h4><ul style="list-style-type: none; padding-left: 0;">`;
        allQuestions
            .filter(q => q.section === sectionNum)
            .forEach(q => {
                const answerValue = answers[q.id] || 'Cevaplanmadı';
                detailsHTML += `<li style="margin-bottom: 10px;"><strong>Soru:</strong> ${q.text}<br><strong>Verilen Cevap:</strong> <span style="font-weight: bold; color: #0056b3;">${answerValue}</span> / 5</li>`;
            });
        detailsHTML += '</ul>';
    });


    // --- E-posta İçeriği (Site Sahibine) ---
    const mailToAdmin = {
      from: `"Metriq360 Test Sistemi" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Yeni Test Sonucu: ${userInfo.name} ${userInfo.surname}`,
      html: `
        <h1>Yeni Bir Dijital Pazarlama Testi Tamamlandı!</h1>
        <p><strong>Ad Soyad:</strong> ${userInfo.name} ${userInfo.surname}</p>
        <p><strong>E-posta:</strong> ${userInfo.email}</p>
        <p><strong>Sektör:</strong> ${userInfo.sector}</p>
        <hr>
        ${detailsHTML}
        <hr>
        <h2 style="margin-top: 30px;">Yapay Zeka Tarafından Oluşturulan Rapor:</h2>
        <div>${report.replace(/\n/g, '<br>')}</div>
      `,
    };
    
    // --- E-posta İçeriği (Kullanıcıya) ---
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


    // E-postaları gönder
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
