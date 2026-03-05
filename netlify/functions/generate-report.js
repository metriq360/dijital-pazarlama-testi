// Dosya Yolu: netlify/functions/generate-report.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, totalMaxScore, sectionScores, sectionMaxScores, selectedSections } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY eksik.");
    }

    // Yardımcı fonksiyon: Bölüm başlıklarını getir
    const getSectionTitle = (num) => {
        const titles = ['', 'Sosyal Medya Yönetimi', 'Yerel SEO ve GBP', 'Reklam ve Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);

    const prompt = `
      Sen METRIQ360 markasının "Dijital Büyüme Stratejisti" yapay zekasısın. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname} (${userInfo.sector} sektörü)
      Puan: ${totalScore}/${totalMaxScore}

      STRATEJİK TALİMATLAR:
      1. Raporu "Büyüme Motoru" kurgusuyla, vizyoner ve heyecan verici yaz.
      2. "Birebir Büyüme Analizi" randevusu alınmasının kritik olduğunu vurgula.
      3. Güçlü Yönler: ${strongSections.join(', ') || 'Analiz ediliyor.'}
      4. Gelişim Alanları: ${weakSections.join(', ') || 'Analiz ediliyor.'}
      
      TONLAMA: Profesyonel, bol emojili ve turuncu logonun enerjisini yansıtan bir dil kullan.
      İletişim: bilgi@metriq360.tr | www.metriq360.tr
    `;

    // SENİN LİSTENDEN GELEN VE ÇALIŞAN KESİN MODEL İSMİ:
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || "Gemini API Hatası");
    }

    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Rapor şu an hazırlanamadı, lütfen strateji ekibimizle iletişime geçin.";

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        detailedReport, 
        shortAdvice: "Bu analiz sonuçları, firmanızın büyüme motoru için stratejik bir temel oluşturuyor! 🚀" 
      }),
    };

  } catch (error) {
    console.error("AI Rapor Hatası:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
