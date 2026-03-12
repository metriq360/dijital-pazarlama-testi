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
        const titles = ['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const prompt = `
      Sen METRIQ360 markasının "Kıdemli Dijital Büyüme Stratejisti"sin. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname} (${userInfo.sector} sektörü)
      Skor: ${score}/100

      GÖREVİN:
      Büyüme uzmanımız Fikret Kara'nın müşteriye sunacağı "Birebir Büyüme Analizi" için profesyonel bir ön rapor hazırla.
      - Raporu "Büyüme Motoru" vizyonuyla yaz.
      - Müşteri WhatsApp numarasını verdiği için rapor DOYURUCU ve vizyoner olmalı.
      - Sektörel tavsiyeler ver.
      - Sonunda Fikret Kara ile randevu almanın kritik olduğunu belirt.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Potansiyel vizyon.'}
      ZAYIF: ${weakSections.join(', ') || 'Dijital süreç optimizasyonu.'}
    `;

    // SENİN LİSTENDEN SEÇİLEN GÜNCEL MODEL: gemini-2.5-flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Rapor ekibimiz tarafından hazırlanıyor.";

    return {
      statusCode: 200,
      body: JSON.stringify({ detailedReport }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
