import nodemailer from 'nodemailer';

// Tüm Sorular (Sana cevapları listelemek için)
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

// Markdown temizleyici
const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        .replace(/###\s+(.*)/g, '<h3 style="color:#ea580c; font-size:18px; margin-top:25px; margin-bottom:15px; border-bottom:2px solid #fdba74; padding-bottom:8px; font-weight:800; letter-spacing:0.5px;">$1</h3>')
        .replace(/##\s+(.*)/g, '<h2 style="color:#c2410c; font-size:22px; margin-top:20px;">$1</h2>')
        .replace(/#\s+(.*)/g, '<h1 style="color:#9a3412; font-size:26px;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:800;">$1</strong>')
        .replace(/^[-*]\s+(.*)/gm, '<li style="margin-bottom:12px; color:#334155; line-height:1.6; padding-left:5px;"><span style="color:#ea580c; font-weight:bold;">•</span> $1</li>')
        .replace(/\*(.*?)\*/g, '<em style="color:#475569;">$1</em>')
        .replace(/\n/g, '<br>');
};

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
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const cleanReport = cleanMarkdownForEmail(report);

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

    // 1. SANA (ADMİNE) GELEN MAİL (UNUTTUĞUM KISMI GERİ EKLEDİM)
    const mailToAdmin = {
      from: `"Metriq360 Funnel" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 YENİ LEAD: ${userInfo.name} ${userInfo.surname} (${userInfo.sector})`,
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
                <p style="font-size: 18px;"><b>Genel Skor:</b> %${scores?.totalScore || 0}</p>
            </div>
            
            <!-- İŞTE EKSİK OLAN O LANET YER BURASIYDI, GERİ EKLEDİM -->
            <div style="margin-top: 30px;">
                ${detailsHTML}
            </div>

            <h2 style="margin-top: 30px; color: #d32f2f;">Yapay Zeka Ön Raporu:</h2>
            <div style="background: #fff7ed; padding: 20px; border-radius: 10px; border: 1px solid #ffedd5;">
                ${cleanReport}
            </div>
            <p style="color: #555; margin-top:20px;"><i>Not: Müşteri şu anda başarıyla teşekkür sayfasına yönlendirildi. Arayıp satışı kapatabilirsiniz.</i></p>
        </div>
      `,
    };

    // 2. MÜŞTERİYE GİDEN UX ODAKLI PREMIUM MAİL (BURASI ZATEN ÇALIŞIYOR)
    const mailToUser = {
        from: `"Metriq360 Strateji" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Metriq360: Dijital Sağlık Analizi Ön Raporunuz`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <!-- HEADER -->
                <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #0f172a;">METR<span style="color: #ea580c;">IQ</span>360</h1>
                    <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 700; letter-spacing: 3px; color: #64748b; text-transform: uppercase;">Stratejik Büyüme Laboratuvarı</p>
                </div>
                
                <!-- GİRİŞ BÖLÜMÜ -->
                <div style="padding: 30px 30px 10px 30px;">
                    <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Merhaba Sayın ${userInfo.name} ${userInfo.surname},</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #475569;">Dijital Pazarlama Sağlık Testi verileriniz yapay zeka altyapımız tarafından analiz edildi. Aşağıda mevcut dijital varlıklarınızın genel bir röntgenini bulabilirsiniz.</p>
                </div>
                
                <!-- AI RAPOR İÇERİĞİ (Temizlenmiş Markdown) -->
                <div style="background-color: #fff7ed; padding: 30px; margin: 0 30px; border-radius: 12px; border: 1px solid #ffedd5;">
                    <div style="font-size: 15px; line-height: 1.7; color: #334155;">
                        ${cleanReport}
                    </div>
                </div>
                
                <!-- DEVASA CTA (YÖNLENDİRME) BÖLÜMÜ -->
                <div style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
                    <h3 style="font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 10px;">Raporunuzun Detayları Hazırlanıyor ⚙️</h3>
                    <p style="font-size: 15px; color: #64748b; line-height: 1.5; margin-bottom: 25px;">Yukarıdaki analiz, sistemin tespit ettiği ilk bulgulardır. Büyüme uzmanımız <strong>Fikret Kara</strong>, verdiğiniz tüm cevapları tek tek inceleyerek size özel <strong>Nihai Büyüme Stratejinizi</strong> oluşturacaktır.</p>
                    
                    <a href="https://wa.me/905379484868?text=Merhaba, Dijital Sağlık Analizimi tamamladım. Fikret Bey ile strateji görüşmesi planlamak istiyorum." 
                       style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 18px 36px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.3);">
                       WHATSAPP'TAN UZMANA BAĞLAN
                    </a>
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #94a3b8;">Verdiğiniz numara üzerinden de sizinle iletişime geçilecektir.</p>
                </div>
                
                <!-- FOOTER / İLETİŞİM -->
                <div style="background-color: #0f172a; color: #94a3b8; padding: 30px; text-align: center; font-size: 13px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #f8fafc; font-size: 16px;">METRIQ360 BÜYÜME EKİBİ</p>
                    <p style="margin: 5px 0;">📞 +90 537 948 48 68</p>
                    <p style="margin: 5px 0;">✉️ bilgi@metriq360.tr</p>
                    <p style="margin: 5px 0;">🌐 <a href="https://www.metriq360.tr" style="color: #ea580c; text-decoration: none;">www.metriq360.tr</a></p>
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
