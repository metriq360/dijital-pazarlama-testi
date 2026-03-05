export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY bulunamadı.");

    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const prompt = `
      Sen METRIQ360 markasının "Kıdemli Dijital Büyüme Stratejisti"sin. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname}
      Sektör: ${userInfo.sector}
      Test Puanı: ${totalScore}/${totalMaxScore}

      STRATEJİK TALİMATLAR:
      1. Raporu "Büyüme Motoru" vizyonuyla, profesyonel ve heyecan verici bir dille yaz.
      2. Müşteri çok soru cevapladığı için rapor DOYURUCU, detaylı ve uzun olmalı (yaklaşık 450 kelime).
      3. Gelişim Alanları kısmında, seçilen zayıf alanları ${userInfo.sector} sektörüne özel stratejilerle açıkla.
      4. "Birebir Büyüme Analizi" randevusu alınmasının kritik olduğunu, telefon numaramızla (+90 537 948 48 68) profesyonelce vurgula.
      5. Markdown sembollerini (#, ##, **) sadece başlıklar için profesyonelce kullan.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Analiz ediliyor.'}
      ZAYIF: ${weakSections.join(', ') || 'Analiz ediliyor.'}
      
      İletişim Bilgileri: +90 537 948 48 68 | bilgi@metriq360.tr | www.metriq360.tr
    `;

    // Kesin çalışan model ismi ve native fetch kullanımı
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "AI servisi hata verdi.");

    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz verilerinizi inceliyor.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        detailedReport, 
        shortAdvice: `Bu analiz, ${userInfo.sector} sektöründeki büyüme motorunuz için ilk kıvılcımdır! 🚀` 
      }),
    };

  } catch (error) {
    console.error("AI Error:", error);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
