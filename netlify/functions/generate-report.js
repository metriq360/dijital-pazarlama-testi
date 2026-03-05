import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY eksik.");

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
      Skor: ${totalScore}/${totalMaxScore}

      STRATEJİK TALİMATLAR:
      1. Raporu "Büyüme Motoru" vizyonuyla yaz.
      2. Müşteri çok soru cevapladığı için rapor DOYURUCU, detaylı ve profesyonel olmalı (yaklaşık 400 kelime).
      3. Gelişim Alanları kısmında, seçilen zayıf alanları ${userInfo.sector} sektörüne özel stratejilerle açıkla.
      4. "Birebir Büyüme Analizi" randevusu alınmasının kritik olduğunu, telefon numaramızla (+90 537 948 48 68) vurgula.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Analiz aşamasında.'}
      ZAYIF: ${weakSections.join(', ') || 'Analiz aşamasında.'}
      
      İletişim: +90 537 948 48 68 | bilgi@metriq360.tr | www.metriq360.tr
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);

    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz verilerinizi inceliyor.";

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        detailedReport, 
        shortAdvice: "Bu analiz, ${userInfo.sector} sektöründeki büyüme motorunuzu ateşlemek için ilk kıvılcım! 🚀" 
      }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
