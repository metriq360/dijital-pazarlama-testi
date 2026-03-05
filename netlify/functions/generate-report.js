export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY bulunamadı.");

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
      Skor: ${totalScore}/${totalMaxScore}

      STRATEJİK TALİMATLAR:
      1. Raporu "Büyüme Motoru" vizyonuyla, profesyonel, vizyoner ve heyecan verici bir dille yaz.
      2. Müşteri çok soru cevapladığı için rapor DOYURUCU, detaylı ve uzun olmalı (yaklaşık 450-500 kelime).
      3. Gelişim Alanları kısmında, seçilen zayıf alanları ${userInfo.sector} sektörünün gerçeklerine ve zorluklarına göre derinlemesine açıkla.
      4. Güçlü Yönler kısmında eğer puan düşükse bile, müşterinin dijital potansiyelini sorgulama arzusunu ve vizyonunu bir "güçlü temel" olarak öne çıkar.
      5. ÖNEMLİ: Raporun sonuna sakın "Saygılarımla", "İletişim Bilgileri" veya "Telefon" ekleme! Bunlar mail şablonunda zaten var. Sadece analiz metnini bitir.
      
      GÜÇLÜ: ${strongSections.join(', ') || 'Dijital dönüşüm vizyonu ve öğrenme isteği.'}
      ZAYIF: ${weakSections.join(', ') || 'Süreç optimizasyonu ve entegre büyüme kurgusu.'}
    `;

    // Kesin çalışan model ismi ve native fetch
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
        shortAdvice: `Bu analiz, ${userInfo.sector} sektöründeki dijital hâkimiyetiniz için ilk adımdır! 🚀` 
      }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
