export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY eksik.");

    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya Yönetimi', 'Yerel SEO ve GBP', 'Reklam ve Kampanya', 'İçerik Pazarlaması', 'Pazarlama Otomasyonu'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const prompt = `
      Sen METRIQ360 markasının "Kıdemli Dijital Büyüme Stratejisti" yapay zekasısın. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname}
      Sektör: ${userInfo.sector}
      Test Skoru: ${totalScore}/${totalMaxScore}

      STRATEJİK TALİMATLAR:
      1. Raporu "Büyüme Motoru" vizyonuyla, profesyonel, vizyoner ve heyecan verici yaz.
      2. Müşteri çok fazla soru cevapladığı için rapor DOYURUCU, detaylı ve uzun olmalı (yaklaşık 500 kelime).
      3. Gelişim Alanları kısmında, seçilen zayıf alanları ${userInfo.sector} sektörünün gerçeklerine göre açıkla.
      4. Güçlü Yönler kısmında eğer puan düşükse bile, müşterinin dijital potansiyelini sorgulama arzusunu ve vizyonunu bir "güçlü karakter" olarak öne çıkar. "Analiz Ediliyor" gibi geçici kelimeler kullanma.
      5. Eğer 5 bölümün tamamı seçildiyse, bu bölümleri birleştirerek bütünsel bir "Dijital Büyüme Ekosistemi" kurgusu yap.
      6. "Birebir Büyüme Analizi" randevusu alınmasının kritik olduğunu, telefon numaramızla (+90 537 948 48 68) mühürle. Bol emoji kullan.
      7. Markdown (#, ##, **) sadece başlıklar için profesyonelce kullan.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Dijital vizyon ve dönüşüm arzusu.'}
      ZAYIF: ${weakSections.join(', ') || 'Entegre büyüme stratejileri ve reklam optimizasyonu.'}
      
      İletişim: +90 537 948 48 68 | bilgi@metriq360.tr | www.metriq360.tr
    `;

    // Kesinleşen model ismi ve native fetch kullanımı
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
