import nodemailer from 'nodemailer';

// Tüm Sorular (Admin mailinde cevapları listeleyebilmek için)
const allQuestions = [
  { id: 'q1_1', section: 1, text: 'Sosyal medya paylaşım sıklığı' },
  { id: 'q1_2', section: 1, text: 'Platform bazlı strateji' },
  { id: 'q1_3', section: 1, text: 'Takipçi artış hızı' },
  { id: 'q1_4', section: 1, text: 'Etkileşim oranı' },
  { id: 'q1_5', section: 1, text: 'Hedef kitle tanımı' },
  { id: 'q1_6', section: 1, text: 'İçerik format çeşitliliği' },
  { id: 'q1_7', section: 1, text: 'Yanıt hızı' },
  { id: 'q1_8', section: 1, text: 'İçerik takvimi kullanımı' },
  { id: 'q1_9', section: 1, text: 'Rakip analizi' },
  { id: 'q1_10', section: 1, text: 'Dış kaynak desteği' },
  { id: 'q2_1', section: 2, text: 'GBP profil varlığı' },
  { id: 'q2_2', section: 2, text: 'GBP bilgi tamlığı' },
  { id: 'q2_3', section: 2, text: 'GBP içerik sıklığı' },
  { id: 'q2_4', section: 2, text: 'Harita konumu doğruluğu' },
  { id: 'q2_5', section: 2, text: 'Google yorum düzeni' },
  { id: 'q2_6', section: 2, text: 'Yorum yanıtlama' },
  { id: 'q2_7', section: 2, text: 'Yerel dizin kaydı' },
  { id: 'q2_8', section: 2, text: 'Yerel arama görünürlüğü' },
  { id: 'q2_9', section: 2, text: 'GBP veri analizi' },
  { id: 'q2_10', section: 2, text: 'Yerel SEO stratejisi' },
  { id: 'q3_1', section: 3, text: 'Meta reklamları' },
  { id: 'q3_2', section: 3, text: 'Google Ads aktifliği' },
  { id: 'q3_3', section: 3, text: 'Hedef kitle netliği' },
  { id: 'q3_4', section: 3, text: 'Reklam segmentasyonu' },
  { id: 'q3_5', section: 3, text: 'A/B testleri' },
  { id: 'q3_6', section: 3, text: 'Dönüşüm hedefi' },
  { id: 'q3_7', section: 3, text: 'Bütçe optimizasyonu' },
  { id: 'q3_8', section: 3, text: 'Reklam format çeşitliliği' },
  { id: 'q3_9', section: 3, text: 'Dönüşüm takibi (Pixel/GA)' },
  { id: 'q3_10', section: 3, text: 'Haftalık raporlama' },
  { id: 'q4_1', section: 4, text: 'Blog içerik yayını' },
  { id: 'q4_2', section: 4, text: 'İçerik stratejisi' },
  { id: 'q4_3', section: 4, text: 'Sorun çözme odaklılık' },
  { id: 'q4_4', section: 4, text: 'Video içerik üretimi' },
  { id: 'q4_5', section: 4, text: 'SEO uyumlu içerik' },
  { id: 'q4_6', section: 4, text: 'İçerik güncelliği' },
  { id: 'q4_7', section: 4, text: 'Çok kanallı destek' },
  { id: 'q4_8', section: 4, text: 'İçerik performans ölçümü' },
  { id: 'q4_9', section: 4, text: 'Görsel/İnfografik kullanımı' },
  { id: 'q4_10', section: 4, text: 'Profesyonel destek' },
  { id: 'q5_1', section: 5, text: 'Pazarlama araçları' },
  { id: 'q5_2', section: 5, text: 'E-posta pazarlaması' },
  { id: 'q5_3', section: 5, text: 'E-posta segmentasyonu' },
  { id: 'q5_4', section: 5, text: 'GA4 analizi' },
  { id: 'q5_5', section: 5, text: 'Ziyaretçi analizi' },
  { id: 'q5_6', section: 5, text: 'Sosyal medya otomasyonu' },
  { id: 'q5_7', section: 5, text: 'CRM kullanımı' },
  { id: 'q5_8', section: 5, text: 'Otomatik raporlama' },
  { id: 'q5_9', section: 5, text: 'Merkezi veri toplama' },
  { id: 'q5_10', section: 5, text: 'Bütünleşik sistem takibi' }
];

const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
    return titles[num] || '';
};

// Markdown Temizleyici (Premium HTML Tasarımı İçin)
const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        .replace(/^\s*###\s+(.*)/gm, '<h3 style="color:#ea580c; font-size:18px; margin:25px 0 10px 0; border-bottom:2px solid #fdba74; padding-bottom:6px; font-weight:800;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:800;">$1</strong>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<div style="margin-bottom:10px; color:#334155; line-height:1.6; font-size:15px; padding-left:10px;"><span style="color:#ea580c; font-weight:bold;">•</span> $1</div>')
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

    const cleanReport = cleanMarkdownForEmail(report);

    // --- ADMİNE (SANA) GİDEN DETAYLI VERİ LİSTESİ ---
    let detailsHTML = `<h2 style="color:#d32f2f; border-bottom: 2px solid #eee; padding-bottom: 10px;">📊 Müşterinin Test Cevapları:</h2>`;
    if (selectedSections && answers) {
        selectedSections.forEach(sNum => {
            detailsHTML += `<div style="margin-top:20px; background:#f8fafc; padding:10px; border-radius:8px;">
                <b style="color:#f97316; font-size:16px;">${getSectionTitle(sNum)}</b>
            </div><ul style="list-style:none; padding-left:0;">`;
            
            allQuestions.filter(q => q.section === sNum).forEach(q => {
                const val = answers[q.id] || 'Yanıtlanmadı';
                detailsHTML += `<li style="margin-bottom:8px; border-left:4px solid #f1f5f9; padding-left:10px; font-size:13px;">
                    <span style="color:#64748b;">${q.text}</span><br>
                    <b style="color:#1e293b;">Puan: ${val} / 5</b>
                </li>`;
            });
            detailsHTML += `</ul>`;
        });
    }

    // 1. SANA (ADMİNE) GELEN MAİL (HER ŞEY DAHİL!)
    const mailToAdmin = {
      from: `"Lead Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 YENİ LEAD: ${userInfo.name} (${userInfo.whatsapp})`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 650px;">
            <h1 style="color:#d32f2f;">Yeni Lead Yakalandı!</h1>
            <div style="background:#f1f5f9; padding:20px; border-radius:15px; border:1px solid #e2e8f0;">
                <p><b>İsim Soyisim:</b> ${userInfo.name} ${userInfo.surname}</p>
                <p><b>Sektör:</b> ${userInfo.sector}</p>
                <p style="font-size: 20px; color: #0284c7;"><b>📞 WhatsApp: ${userInfo.whatsapp}</b></p>
                <p><b>E-posta:</b> ${userInfo.email}</p>
                <hr>
                <p style="font-size: 18px;"><b>Genel Skor:</b> %${scores?.totalScore || 0}</p>
            </div>
            
            <div style="margin-top: 30px;">
                ${detailsHTML}
            </div>

            <h2 style="margin-top: 30px; color:#d32f2f;">Yapay Zeka Ön Raporu:</h2>
            <div style="background:#fff7ed; padding:20px; border-radius:12px; border:1px solid #ffedd5; line-height:1.6;">
                ${cleanReport}
            </div>
        </div>
      `
    };

    // 2. MÜŞTERİYE GİDEN PREMIUM, FERAH VE CTA'LI MAİL
    const mailToUser = {
        from: `"Metriq360 Strateji" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Metriq360: Dijital Sağlık Analizi Raporunuz Hazır!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                
                <!-- HEADER -->
                <div style="background-color: #f8fafc; padding: 35px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a;">METR<span style="color: #ea580c;">IQ</span>360</h1>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">Stratejik Büyüme Laboratuvarı</p>
                </div>
                
                <div style="padding: 40px;">
                    <h2 style="font-size: 22px; color: #0f172a; margin:0 0 15px 0;">Sayın ${userInfo.name} ${userInfo.surname},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569;">Dijital Pazarlama Sağlık Testi ön analiz sonuçlarınız aşağıdadır:</p>

                    <!-- SKOR KARNESİ -->
                    <div style="background-color: #f8fafc; border: 2px solid #f1f5f9; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
                        <span style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">GENEL SAĞLIK PUANINIZ</span>
                        <div style="font-size: 56px; font-weight: 900; color: #ea580c; margin: 5px 0;">${scores?.totalScore || 0} / 100</div>
                        
                        <div style="text-align: left; margin-top: 20px; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            ${(selectedSections || []).map(sNum => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 5px;">
                                    <span style="color: #475569;">${getSectionTitle(sNum)}:</span>
                                    <b style="color: #ea580c;">${scores?.sectionScores?.[sNum] || 0} / ${scores?.sectionMaxScores?.[sNum] || 0}</b>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- AI RAPOR İÇERİĞİ -->
                    <div style="font-size: 16px; line-height: 1.8; color: #334155;">
                        ${cleanReport}
                    </div>

                    <!-- CTA ALANI (BEĞENDİĞİN O TASARIM) -->
                    <div style="margin-top: 50px; padding: 35px; background-color: #ffffff; border: 3px solid #ea580c; border-radius: 20px; text-align: center;">
                        <h2 style="font-size: 24px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Raporunuzun Detayları Hazırlanıyor ⚙️</h2>
                        <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 30px;">Yukarıdaki bulgular ilk tespitlerdir. Büyüme uzmanımız <strong>Fikret Kara</strong>, verdiğiniz tüm cevapları inceleyip size özel <strong>Nihai Büyüme Stratejinizi</strong> hazırlayacak ve <strong>WhatsApp</strong> üzerinden iletişime geçecektir.</p>
                        
                        <a href="https://wa.me/905379484868?text=Merhaba, Dijital Sağlık Analizimi tamamladım. Fikret Bey ile randevu planlamak istiyorum." 
                           style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 20px 45px; border-radius: 60px; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(234, 88, 12, 0.3);">
                           WhatsApp'tan Uzmana Bağlan
                        </a>

                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed #fdba74;">
                            <p style="font-size: 13px; color: #ea580c; font-weight: bold; font-style: italic; margin: 0;">
                                ⚠️ Detaylı raporunuz Metriq360 ekibi tarafından hazırlanıyor ve en kısa sürede size gönderilecektir.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- FOOTER (GÖRSELDEKİ LACİVERT ALAN) -->
                <div style="background-color: #0f172a; color: #94a3b8; padding: 45px 20px; text-align: center; font-size: 14px;">
                    <strong style="color: #fff; display: block; margin-bottom: 15px; font-size: 18px; letter-spacing: 1px;">METRIQ360 BÜYÜME EKİBİ</strong>
                    <p style="margin: 5px 0;">📞 +90 537 948 48 68</p>
                    <p style="margin: 5px 0;">✉️ <a href="mailto:bilgi@metriq360.tr" style="color:#94a3b8; text-decoration:none;">bilgi@metriq360.tr</a></p>
                    <p style="margin: 5px 0;">🌐 <a href="https://www.metriq360.tr" style="color:#ea580c; text-decoration:none;">www.metriq360.tr</a></p>
                    <p style="margin: 20px 0 0 0; opacity: 0.5;">© 2026 Metriq360. Tüm Hakları Saklıdır.</p>
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
