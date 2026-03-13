import nodemailer from 'nodemailer';

const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        .replace(/^\s*###\s+(.*)/gm, '<h3 style="color:#ea580c; font-size:16px; margin:15px 0 8px 0; border-bottom:1px solid #fdba74; padding-bottom:4px; font-weight:bold;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e293b;">$1</strong>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<div style="margin-bottom:6px; color:#334155; font-size:13px;"><span style="color:#ea580c;">•</span> $1</div>')
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

    // MÜŞTERİYE GİDEN KESİLME KARŞITI HAFİF MAİL
    const mailToUser = {
        from: `"Metriq360" <${process.env.EMAIL_USER}>`,
        to: userInfo.email,
        subject: `Dijital Sağlık Analizi Raporunuz`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a;">METR<span style="color: #ea580c;">IQ</span>360</h1>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="font-size: 16px; color: #0f172a; margin:0 0 10px 0;">Sayın ${userInfo.name},</h2>
                    <p style="font-size: 13px; color: #475569; margin-bottom: 15px;">Sağlık testi ön analiz sonuçlarınız aşağıdadır:</p>

                    <!-- SKOR -->
                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 900; color: #ea580c;">${scores?.totalScore || 0} / 100</div>
                        <div style="text-align: left; margin-top: 10px; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                            ${(selectedSections || []).map(sNum => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                    <span>${getSectionTitle(sNum)}:</span>
                                    <b>${scores?.sectionScores?.[sNum] || 0}/${scores?.sectionMaxScores?.[sNum] || 0}</b>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- ANALİZ -->
                    <div style="font-size: 13px; line-height: 1.5;">
                        ${cleanReport}
                    </div>

                    <!-- CTA VE UYARI -->
                    <div style="margin-top: 25px; padding: 20px; background-color: #fff; border: 2px solid #ea580c; border-radius: 10px; text-align: center;">
                        <p style="font-size: 13px; color: #475569; margin: 0 0 15px 0;">Uzmanımız <strong>Fikret Kara</strong> size özel yol haritası için <strong>WhatsApp</strong> üzerinden ulaşacaktır.</p>
                        
                        <a href="https://wa.me/905379484868?text=Merhaba, Dijital Sağlık Analizimi tamamladım." 
                           style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase;">
                           WhatsApp'tan Bağlan
                        </a>

                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #fdba74;">
                            <p style="font-size: 11px; color: #ea580c; font-weight: bold; font-style: italic; margin: 0;">
                                ⚠️ Detaylı raporunuz Metriq360 ekibi tarafından hazırlanıyor ve en kısa sürede size gönderilecektir.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #0f172a; color: #94a3b8; padding: 15px; text-align: center; font-size: 11px;">
                    <strong style="color: #fff; display: block; margin-bottom: 5px;">METRIQ360 BÜYÜME EKİBİ</strong>
                    📞 +90 537 948 48 68 | ✉️ bilgi@metriq360.tr
                </div>
            </div>
        `,
    };

    // Admin mailini çok daha hafif yapıyoruz (Kırpılmasın diye)
    const mailToAdmin = {
      from: `"Lead Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 YENİ LEAD: ${userInfo.name} (${userInfo.whatsapp})`,
      html: `<h3>Müşteri: ${userInfo.name}</h3><p><b>WhatsApp: ${userInfo.whatsapp}</b></p><p>Skor: %${scores?.totalScore}</p>`
    };

    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
