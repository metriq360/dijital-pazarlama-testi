import nodemailer from 'nodemailer';

// AI'dan gelen Markdown'ı çok şık HTML'e çeviren gelişmiş fonksiyon
const cleanMarkdownForEmail = (text) => {
    if (!text) return "Rapor hazırlanıyor...";
    return text
        // Alt başlıklar (###) için turuncu, kalın ve altı çizgili şık bir tasarım
        .replace(/### (.*)/g, '<h3 style="color:#ea580c; font-size:18px; margin-top:25px; margin-bottom:15px; border-bottom:2px solid #fdba74; padding-bottom:8px; font-weight:800; letter-spacing:0.5px;">$1</h3>')
        // İkincil başlıklar (##)
        .replace(/## (.*)/g, '<h2 style="color:#c2410c; font-size:22px; margin-top:20px;">$1</h2>')
        // Ana başlıklar (#)
        .replace(/# (.*)/g, '<h1 style="color:#9a3412; font-size:26px;">$1</h1>')
        // Kalın yazılar (**) için koyu gri vurgu
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a; font-weight:800;">$1</strong>')
        // İtalik yazılar (*)
        .replace(/\*(.*?)\*/g, '<em style="color:#475569;">$1</em>')
        // Listeler (-) için özel madde imi tasarımı
        .replace(/^- (.*)/gm, '<li style="margin-bottom:12px; color:#334155; line-height:1.6; padding-left:5px;"><span style="color:#ea580c; font-weight:bold;">•</span> $1</li>')
        // Liste yapısını düzeltmek için <ul> etiketlerini sarma işlemini basitleştirilmiş şekilde newline'lara br atıyoruz
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

    // --- 1. SANA (ADMİNE) GELEN MAİL (Tüm Veriler) ---
    // (Burası aynı kalıyor, sana bilgi döküyor)
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
        </div>
      `,
    };

    // --- 2. MÜŞTERİYE GİDEN UX ODAKLI PREMIUM MAİL ---
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
