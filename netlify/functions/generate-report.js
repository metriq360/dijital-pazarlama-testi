import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = JSON.parse(event.body);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY eksik.");
    }

    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const detailedReportPrompt = `
      Sen METRIQ360 markasının Dijital Büyüme Stratejistisin. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname} (${userInfo.sector} sektörü)
      Puan: ${totalScore}/${totalMaxScore}

      TALİMATLAR (KRİTİK):
      1. Raporu "Büyüme Motoru" vizyonuyla yaz. 
      2. Çok kısa ve öz ol. Seçilen bölüm sayısı çok olsa bile her bölümü 1-2 vurucu cümleyle özetle. Toplam rapor 250 kelimeyi geçmesin.
      3. Markdown karakterlerini (#, ##, **) sadece başlıklar için minimum seviyede kullan.
      4. "Birebir Büyüme Analizi" randevusunu telefon numaramızla (+90 537 948 48 68) birlikte mutlaka öner.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Analiz aşamasında.'}
      ZAYIF: ${weakSections.join(', ') || 'Analiz aşamasında.'}
      
      İletişim: +90 537 948 48 68 | bilgi@metriq360.tr | www.metriq360.tr
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: detailedReportPrompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz firmanız için özel bir rapor hazırlıyor.";

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        detailedReport, 
        shortAdvice: "Bu analiz sonuçları, firmanızın büyüme motoru için stratejik bir temel oluşturuyor! 🚀" 
      }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
