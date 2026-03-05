import nodemailer from 'nodemailer';

const allQuestions = [
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

const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
    return titles[num] || '';
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

    let detailsHTML = `<h3>Detaylı Test Sonuçları (Ham Veri)</h3>`;
    detailsHTML += `<p><b>Genel Skor:</b> ${scores.totalScore} / ${scores.totalMaxScore}</p>`;
    
    selectedSections.forEach(sNum => {
        detailsHTML += `<div style="margin-top: 20px; border-bottom: 2px solid #f97316; padding-bottom: 5px;">
            <b style="color: #f97316;">Bölüm: ${getSectionTitle(sNum)}</b> (Puan: ${scores.sectionScores[sNum]} / ${scores.sectionMaxScores[sNum]})
        </div><ul style="list-style: none; padding-left: 0;">`;
        
        allQuestions.filter(q => q.section === sNum).forEach(q => {
            const val = answers[q.id] || 'Yanıt Yok';
            detailsHTML += `<li style="margin-bottom: 8px;">• ${q.text} <br> <b style="color: #444;">Yanıt: ${val} / 5</b></li>`;
        });
        detailsHTML += `</ul>`;
    });

    const mailToAdmin = {
      from: `"METRIQ360 Analiz Sistemi" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Yeni Sağlık Testi Sonucu: ${userInfo.name} ${userInfo.surname} (${userInfo.sector})`,
      html: `
        <div style="font-family: sans-serif;">
            <h1>Yeni Analiz Tamamlandı</h1>
            <p><b>Müşteri:</b> ${userInfo.name} ${userInfo.surname}</p>
            <p><b>E-posta:</b> ${userInfo.email}</p>
            <p><b>Sektör:</b> ${userInfo.sector}</p>
            <hr>
            ${detailsHTML}
            <hr>
            <h2>Yapay Zeka Raporu:</h2>
            <div style="background: #fdf2f2; padding: 15px; border-radius: 8px;">${report.replace(/\n/g, '<br>')}</div>
        </div>
      `,
    };
    
    const mailToUser = {
        from: `"METRIQ360 Strateji Ekibi" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `METRIQ360: Dijital Pazarlama Sağlık Testi Raporunuz`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #f97316;">Merhaba ${userInfo.name},</h2>
                <p>Dijital pazarlama sağlık testini tamamladığın için tebrikler!</p>
                <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #ffedd5;">
                    ${report.replace(/\n/g, '<br>')}
                </div>
                <hr>
                <p>Stratejinizi bir Büyüme Motoruna dönüştürmek için <a href="https://www.metriq360.tr">web sitemizden</a> randevu alabilirsin.</p>
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
