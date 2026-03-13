import nodemailer from 'nodemailer';

// Admin maili için soru listesi
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

const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        .replace(/^\s*###\s+(.*)/gm, '<h3 style="color:#ea580c; font-size:17px; margin:20px 0 10px 0; border-bottom:1px solid #fdba74; padding-bottom:5px; font-weight:bold;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e293b;">$1</strong>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<div style="margin-bottom:8px; color:#334155;"><span style="color:#ea580c;">•</span> $1</div>')
        .replace(/\n/g, '<br>');
};

const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
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

    // 1. SANA (ADMİNE) GELEN MAİL
    const mailToAdmin = {
      from: `"Lead Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 YENİ KAYIT: ${userInfo.name}`,
      html: `<p><b>WhatsApp: ${userInfo.whatsapp}</b></p><p>Skor: %${scores?.totalScore}</p><hr>${cleanReport}`
    };

    // 2. MÜŞTERİYE GİDEN PREMİUM VE UYARI NOTLU MAİL
    const mailToUser = {
        from: `"Metriq360" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Dijital Sağlık Analizi Raporunuz Hazır!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">METR<span style="color: #ea580c;">IQ</span>360</h1>
                    <p style="margin: 5px 0 0 0; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Büyüme Laboratuvarı</p>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="font-size: 18px; color: #0f172a;">Merhaba ${userInfo.name},</h2>
                    <p style="font-size: 14px; line-height: 1.5; color: #475569;">Dijital Pazarlama Sağlık Testi sonuçlarınız aşağıdadır:</p>

                    <!-- SKOR TABLOSU -->
                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                        <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Genel Skor</span>
                        <div style="font-size: 36px; font-weight: 900; color: #ea580c;">${scores?.totalScore || 0} / 100</div>
                        <div style="text-align: left; margin-top: 15px; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                            ${(selectedSections || []).map(sNum => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>${getSectionTitle(sNum)}:</span>
                                    <b>${scores?.sectionScores?.[sNum] || 0} / ${scores?.sectionMaxScores?.[sNum] || 0}</b>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- ANALİZ -->
                    <div style="font-size: 14px; line-height: 1.6;">
                        ${cleanReport}
                    </div>

                    <!-- CTA VE KRİTİK UYARI NOTU -->
                    <div style="margin-top: 30px; padding: 25px; background-color: #fff; border: 2px solid #ea580c; border-radius: 12px; text-align: center;">
                        <h3 style="margin-top: 0; color: #0f172a;">Stratejiniz Hazırlanıyor ⚙️</h3>
                        <p style="font-size: 13px; color: #475569;">Büyüme uzmanımız <strong>Fikret Kara</strong>, bu verileri inceleyip size özel yol haritasıyla birlikte <strong>WhatsApp</strong> üzerinden ulaşacaktır.</p>
                        
                        <a href="https://wa.me/905379484868?text=Merhaba, Dijital Sağlık Analizimi tamamladım. Randevu almak istiyorum." 
                           style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-top: 10px; margin-bottom: 15px;">
                           WhatsApp'tan Uzmana Bağlan
                        </a>

                        <!-- İSTEDİĞİN O KRİTİK UYARI CÜMLESİ -->
                        <div style="padding-top: 15px; border-top: 1px dashed #fdba74; margin-top: 10px;">
                            <p style="font-size: 12px; color: #ea580c; font-weight: bold; font-style: italic; margin: 0;">
                                ⚠️ Detaylı raporunuz Metriq360 ekibi tarafından hazırlanıyor ve en kısa sürede size gönderilecektir.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;">
                    <strong style="color: #fff; display: block; margin-bottom: 10px;">METRIQ360 BÜYÜME EKİBİ</strong>
                    📞 +90 537 948 48 68 | ✉️ bilgi@metriq360.tr
                </div>
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
