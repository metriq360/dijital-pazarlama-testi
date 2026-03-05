export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY eksik.");

    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya Yönetimi', 'Yerel SEO ve GBP', 'Reklam ve Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
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
      1. Raporu "Büyüme Motoru" vizyonuyla, çok profesyonel ve vizyoner bir dille yaz.
      2. Müşteri çok soru cevapladığı için rapor DOYURUCU, detaylı ve uzun olmalı (yaklaşık 500 kelime).
      3. Gelişim Alanları kısmında, seçilen zayıf alanları ${userInfo.sector} sektörünün gerçeklerine ve zorluklarına göre açıkla.
      4. Güçlü Yönler kısmında eğer belirgin bir puan yoksa, müşterinin dijital potansiyelini sorgulama arzusunu ve vizyonunu bir güç olarak öne çıkar. "Analiz Ediliyor" gibi geçici başlıklar kullanma, doğrudan motive edici bir anlatım yap.
      5. "Birebir Büyüme Analizi" randevusu alınmasının kritik olduğunu, telefon numaramızla (+90 537 948 48 68) profesyonelce vurgula.
      6. Markdown sembollerini (#, ##, **) sadece başlıklar için minimum seviyede kullan.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Potansiyeli keşfetme arzusu ve stratejik vizyon.'}
      ZAYIF: ${weakSections.join(', ') || 'Dijital süreçlerin entegrasyonu ve büyüme optimizasyonu.'}
      
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

    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Rapor hazırlanırken bir sorun oluştu.";

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
