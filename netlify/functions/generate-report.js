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
        const titles = ['', 'Sosyal Medya', 'Yerel SEO', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const prompt = `
      Sen METRIQ360 Kıdemli Büyüme Stratejisti'sin. 
      Müşteri: ${userInfo.name} | Sektör: ${userInfo.sector} | Skor: ${score}/100
      
      GÖREV: Gmail'de kesilmemesi için ÇOK KISA, MADDELİ ve VURUCU bir rapor yaz. 
      KRİTİK: Maksimum 150-200 kelime. Uzun paragraf ASLA yapma.

      YAPI:
      ### 🎯 Mevcut Durum
      - ${userInfo.sector} sektöründe ${score}/100 skoru ne anlama geliyor? (Tek cümlelik tokat gibi gerçek).
      - Rakipler karşısındaki konumun (Kısa vurgu).

      ### ⚠️ Kritik Ciro Kayıpları
      - [${weakSections.join(', ') || 'Dijital süreçler'}] alanındaki eksikler neden cebinden para çalıyor? (Kısa maddelerle).

      ### 🚀 Acil 3 Hamle
      - Sektöre özel, bugün yapılabilecek 3 kısa madde.

      YASAK: İmza, selamlama, "Merhaba" gibi girişleri yazma. Sadece maddelere odaklan.
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz hazırlanıyor...";

    return { statusCode: 200, body: JSON.stringify({ detailedReport }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
