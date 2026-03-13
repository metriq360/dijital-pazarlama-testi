import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const userInfo = body.userInfo;
    const score = body.totalScore || 0;
    const sectionScores = body.sectionScores || {};
    const sectionMaxScores = body.sectionMaxScores || {};
    const selectedSections = body.selectedSections || [];

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY eksik.");

    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya Yönetimi', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);
    const selectedSectionNames = selectedSections.map(getSectionTitle).join(', ');

    // YENİ, DETAYLI VE UX ODAKLI PROMPT
    const prompt = `
      Sen METRIQ360 markasının "Kıdemli Dijital Büyüme Stratejisti"sin. Müşteriye tokat gibi gerçekleri çarpan ama aynı zamanda vizyon sunan profesyonel bir dilin var.
      
      Kullanıcı Bilgileri: 
      - İsim: ${userInfo.name} ${userInfo.surname}
      - Sektör: ${userInfo.sector}
      - Analiz Edilen Alanlar: ${selectedSectionNames}
      - Başarı Skoru: ${score}/100

      GÖREVİN:
      Kullanıcıya mevcut durumunu özetleyen, kolay okunabilir, alt başlıkları ve maddeleri olan ÇARPICI bir ön analiz raporu yazmak. Müşteri ne kadar çok alan seçtiyse rapor o kadar doyurucu olmalı.

      KATI KURALLAR:
      1. ASLA genel selamlama (Merhaba Ahmet Bey vb.) veya imza (Saygılarımla, Ekip vb.) kullanma! Bunları mail şablonu otomatik atıyor. Sadece rapor içeriğini üret.
      2. Bol bol alt başlık (###), kalın yazı (**) ve liste (-) kullan.
      3. Emojileri profesyonelce kullan.

      RAPOR YAPISI ŞU ŞEKİLDE OLMALIDIR:
      
      ### 🎯 ${userInfo.sector} Sektöründe Mevcut Dijital Konumunuz
      (Kullanıcının sektörü ve genel skoru üzerinden 1-2 paragraflık genel bir değerlendirme yap.)

      ### 💡 Potansiyel Barındıran Güçlü Yönleriniz
      (Şu alanlarda iyiler: ${strongSections.join(', ') || 'Henüz tam potansiyelini kullanmayan bir dijital varlık.'}. Bu alanların işletmeye nasıl para kazandıracağını listeler halinde anlat.)

      ### ⚠️ Ciro Kaybı Yaşadığınız Kritik Sızıntılar
      (Şu alanlarda zayıflar: ${weakSections.join(', ') || 'Stratejik kurgu eksikliği ve süreç optimizasyonu.'}. Bu eksikliklerin rakiplere nasıl müşteri kaptırdığını çarpıcı bir dille, liste halinde açıkla.)

      ### 🚀 Hızlı Aksiyon Planı (İlk 3 Adım)
      (${userInfo.sector} sektörü için hemen uygulanabilecek 3 hap bilgi/tavsiye ver.)
      
      (Not: Sadece bu yapıyı Markdown formatında üret, başka hiçbir şey ekleme.)
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz verilerinizi inceliyor...";

    return { statusCode: 200, body: JSON.stringify({ detailedReport }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
