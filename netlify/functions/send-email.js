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
  { id: 'q5_10', section: 5, text: 'Dijital pazarlama süreçlerinin tümünü bir sistem dahilinde takip ediyor musunuz?' }
];

const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
    return titles[num] || '';
};

const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
        .replace(/### (.*)/g, '<h3 style="color:#f97316; margin-top:20px; border-bottom:1px solid #ffedd5; padding-bottom:5px;">$1</h3>')
        .replace(/## (.*)/g, '<h2 style="color:#f97316; margin-top:20px;">$1</h2>')
        .replace(/# (.*)/g, '<h1 style="color:#f97316;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#111;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color:#444;">$1</em>')
        .replace(/^\* (.*)/gm, '<li style="margin-bottom:8px; color:#334155; margin-left:15px;">$1</li>')
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
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const cleanReport = cleanMarkdown(report);

    // ADMİNE GİDEN CEVAP LİSTESİ HAZIRLIĞI
    let detailsHTML = `<h2 style="color:#d32f2f;">Müşterinin Test Cevapları:</h2>`;
    if (selectedSections && answers) {
        selectedSections.forEach(sNum => {
            const sScore = scores?.sectionScores?.[sNum] || 0;
            const sMax = scores?.sectionMaxScores?.[sNum] || 0;
            detailsHTML += `<div style="margin-top:20px; border-bottom:2px solid #f97316; padding-bottom:5px;">
                <b style="color:#f97316; font-size:18px;">${getSectionTitle(sNum)}</b> (${sScore} / ${sMax})
            </div><ul style="list-style:none; padding-left:0;">`;
            
            allQuestions.filter(q => q.section === sNum).forEach(q => {
                const val = answers[q.id] || 'Boş';
                detailsHTML += `<li style="margin-bottom:10px; border-left:4px solid #eee; padding-left:10px;">
                    <span style="color:#555; font-size:14px;">${q.text}</span><br>
                    <b style="color:#111;">Cevap: ${val} / 5</b>
                </li>`;
            });
            detailsHTML += `</ul>`;
        });
    }

    // 1. SANA (ADMİNE) GELEN MAİL
    const mailToAdmin = {
      from: `"Metriq360 Funnel" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 YENİ TEST LEAD'İ: ${userInfo.name} ${userInfo.surname} (${userInfo.sector})`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h1 style="color: #d32f2f;">WhatsApp Hunisinden Yeni Kayıt!</h1>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 15px; border: 1px solid #eee;">
                <p><b>Ad Soyad:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <p style="font-size: 24px; color: #0277bd; margin: 0;"><b>📞 WhatsApp: ${userInfo.whatsapp}</b></p>
                </div>
                <hr style="margin: 20px 0;">
                <p style="font-size: 18px;"><b>Genel Skor:</b> <span style="color: #d32f2f;">%${scores?.totalScore || 0}</span></p>
            </div>
            <div style="margin-top: 30px;">${detailsHTML}</div>
            <h2 style="margin-top: 30px;">Yapay Zeka Ön Raporu:</h2>
            <div style="background: #fff7ed; padding: 20px; border-radius: 10px; border: 1px solid #ffedd5;">${cleanReport}</div>
        </div>
      `,
    };

    // 2. MÜŞTERİYE GİDEN ŞIK MAİL
    const mailToUser = {
        from: `"Metriq360 Uzman Ekibi" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Metriq360: Dijital Sağlık Analiziniz Alındı`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                <div style="text-align:center; padding: 10px 0; border-bottom: 2px solid #f97316; margin-bottom: 20px;">
                    <h1 style="color: #f97316; margin:0; font-size: 28px;">METRIQ360</h1>
                    <p style="text-transform:uppercase; letter-spacing:2px; color:#999; font-size:11px;">Dijital Büyüme Motoru</p>
                </div>
                
                <h2 style="color: #111;">Merhaba Sayın ${userInfo.name},</h2>
                <p>Dijital Pazarlama Sağlık Testi'ni başarıyla tamamladınız. Verileriniz laboratuvarımıza ulaştı.</p>
                <p>Aşağıda yapay zeka tarafından hazırlanan ilk ön analizi bulabilirsiniz. Büyüme uzmanımız <strong>Fikret Kara</strong> bu verileri detaylıca inceleyip <b>WhatsApp</b> üzerinden size özel raporla birlikte ulaşacaktır.</p>
                
                <div style="background: #fff7ed; padding: 25px; border-radius: 12px; border: 1px solid #ffedd5; margin-top: 25px; margin-bottom: 25px;">
                    ${cleanReport}
                </div>
                
                <div style="text-align:center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Saygılarımızla,</p>
                    <p style="font-weight: bold; color: #f97316; margin:0; font-size: 18px;">METRIQ360 Ekibi</p>
                    <a href="https://www.metriq360.tr" style="color: #999; text-decoration: none; font-size: 12px;">www.metriq360.tr</a>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error("Mail Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
