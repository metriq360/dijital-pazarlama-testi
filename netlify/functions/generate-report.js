import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const userInfo = body.userInfo;
    const score = body.totalScore || 0;
    const maxScore = body.totalMaxScore || 100;
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
      Sen METRIQ360 markasının "Dijital Büyüme Stratejisti" yapay zekasısın. 
      Kullanıcı: ${userInfo.name} ${userInfo.surname} (${userInfo.sector} sektörü)
      Test Puanı: ${score}/${maxScore}

      STRATEJİK TALİMATLAR:
      1. Bu testi "Dijital Pazarlama Sağlık Testi" olarak adlandır.
      2. Raporu tamamen "Büyüme Motoru" (Growth Engine) kurgusu üzerine inşa et.
      3. Paket önerisi yapma. "Firma özelindeki ihtiyaçlarınıza göre bir Birebir Büyüme Analizi yapmamız gerekiyor" mesajını ver.
      4. Güçlü Yönler: ${strongSections.join(', ') || 'Analiz ediliyor.'}
      5. Gelişim Alanları: ${weakSections.join(', ') || 'Analiz ediliyor.'}
      
      TONLAMA:
      Profesyonel, vizyoner ve heyecan verici bir dil kullan. Turuncu logonun enerjisini yansıt. Bol emoji ekle.
      Raporun sonunda kullanıcının verilerine dayanarak "Birebir Strateji Randevusu" almasının kritik olduğunu vurgula.
      
      İletişim Bilgileri: 
      E-posta: bilgi@metriq360.tr | Web: www.metriq360.tr | Tel: +90 537 948 48 68
    `;

    // Senin belirttiğin, en uyumlu çalışan modele (2.5 Flash Preview) güncellendi.
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || "Gemini API Hatası");
    }

    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz firmanız için özel bir rapor hazırlıyor, lütfen randevu alın.";

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        detailedReport, 
        shortAdvice: "Analiz sonuçlarınız, firmanızın büyüme motoru için stratejik bir temel oluşturuyor! 🚀" 
      }),
    };

  } catch (error) {
    console.error("Generate Report Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
