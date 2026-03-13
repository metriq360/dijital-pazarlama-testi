import nodemailer from 'nodemailer';

// Markdown Temizleyici (Ferah Başlıklar)
const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        .replace(/^\s*###\s+(.*)/gm, '<h3 style="color:#ea580c; font-size:20px; margin:30px 0 15px 0; border-bottom:2px solid #fdba74; padding-bottom:8px; font-weight:800;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:800;">$1</strong>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<div style="margin-bottom:12px; color:#334155; line-height:1.7; font-size:15px; padding-left:10px;"><span style="color:#ea580c; font-weight:bold;">•</span> $1</div>')
        .replace(/\n/g, '<br>');
};

const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
    return titles[num] || '';
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { userInfo, report, scores, selectedSections } = JSON.parse(event.body);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const cleanReport = cleanMarkdownForEmail(report);

    // MÜŞTERİYE GİDEN FERAH VE PREMİUM MAİL (650px Genişlik)
    const mailToUser = {
        from: `"Metriq360 Strateji" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Dijital Sağlık Analizi Raporunuz Hazır!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                
                <!-- HEADER -->
                <div style="background-color: #f8fafc; padding: 35px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -1px;">METR<span style="color: #ea580c;">IQ</span>360</h1>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">Stratejik Büyüme Laboratuvarı</p>
                </div>
                
                <div style="padding: 40px 40px 20px 40px;">
                    <h2 style="font-size: 22px; color: #0f172a; margin:0 0 15px 0;">Sayın ${userInfo.name} ${userInfo.surname},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569;">Dijital Pazarlama Sağlık Testi ön analiz sonuçlarınız ve yapay zeka strateji raporunuz aşağıdadır:</p>

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

                    <!-- ANALİZ İÇERİĞİ -->
                    <div style="font-size: 16px; line-height: 1.8; color: #334155;">
                        ${cleanReport}
                    </div>

                    <!-- CTA ALANI -->
                    <div style="margin-top: 50px; padding: 35px; background-color: #ffffff; border: 3px solid #ea580c; border-radius: 20px; text-align: center;">
                        <h2 style="font-size: 24px; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Nihai Stratejiniz Hazırlanıyor ⚙️</h2>
                        <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 30px;">Yukarıdaki bulgular ilk tespitlerdir. Büyüme uzmanımız <strong>Fikret Kara</strong>, verdiğiniz tüm cevapları inceleyip size özel <strong>Nihai Büyüme Yol Haritasını</strong> hazırlayacak ve <strong>WhatsApp</strong> üzerinden iletişime geçecektir.</p>
                        
                        <a href="https://wa.me/905379484868?text=Merhaba, Dijital Sağlık Analizimi tamamladım." 
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

                <!-- FOOTER (LACİVERT) -->
                <div style="background-color: #0f172a; color: #94a3b8; padding: 45px 20px; text-align: center; font-size: 14px;">
                    <strong style="color: #fff; display: block; margin-bottom: 12px; font-size: 18px; letter-spacing: 1px;">METRIQ360 BÜYÜME EKİBİ</strong>
                    <p style="margin: 5px 0;">📞 +90 537 948 48 68 | ✉️ bilgi@metriq360.tr</p>
                    <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.6;">© 2026 Metriq360. Tüm Hakları Saklıdır.</p>
                </div>
            </div>
        `,
    };

    // Admin maili (Mümkün olduğunca hafif)
    const mailToAdmin = {
      from: `"Lead Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 YENİ KAYIT: ${userInfo.name} (${userInfo.whatsapp})`,
      html: `<h3>${userInfo.name} - ${userInfo.sector}</h3><p>WA: ${userInfo.whatsapp}</p><p>Skor: %${scores?.totalScore}</p>`
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
