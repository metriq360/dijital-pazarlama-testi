// Dosya Yolu: netlify/functions/generate-report.js
import fetch from 'node-fetch';

// Bu fonksiyon, Gemini API'sini güvenli bir şekilde sunucu üzerinden çağırır.
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userInfo, overallScore, overallMaxScore, sectionScores, sectionMaxScores, selectedSections } = JSON.parse(event.body);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not defined in Netlify environment variables.");
    }

    // --- Helper function to get section titles ---
    const getSectionTitle = (sectionNum) => {
        switch (sectionNum) {
            case 1: return 'Sosyal Medya Yönetimi';
            case 2: return 'Yerel SEO ve Google Benim İşletmem';
            case 3: return 'Reklam ve Kampanya Yönetimi';
            case 4: return 'İçerik Pazarlaması';
            case 5: return 'Pazarlama Araçları ve Otomasyon';
            default: return '';
        }
    };

    // --- Determine Strengths and Weaknesses ---
    const strongSections = [];
    const weakSections = [];
    selectedSections.forEach(sectionNum => {
      const percentage = (sectionScores[sectionNum] / sectionMaxScores[sectionNum]) * 100;
      if (percentage >= 70) strongSections.push(getSectionTitle(sectionNum));
      else if (percentage <= 40) weakSections.push(getSectionTitle(sectionNum));
    });

    const strongPointsText = strongSections.length > 0 ? strongSections.join(', ') : 'Belirgin bir güçlü yön tespit edilemedi.';
    const weakPointsText = weakSections.length > 0 ? weakSections.join(', ') : 'Belirgin bir zayıf yön tespit edilemedi.';

    // --- Prompts for Gemini ---
    const detailedReportPrompt = `Sen bir dijital pazarlama uzmanısın ve METRIQ360 için kişiselleştirilmiş raporlar hazırlıyorsun...\n\nKullanıcı: ${userInfo.name} ${userInfo.surname}, Sektör: ${userInfo.sector}, Genel Puan: ${overallScore}/${overallMaxScore}, Güçlü Yönler: ${strongPointsText}, Zayıf Yönler: ${weakPointsText}\n\nLütfen bu bilgilere göre samimi, profesyonel, aksiyon odaklı bir rapor oluştur. METRIQ360 paketlerini öner ve iletişim bilgilerini ekle.`;
    const shortAdvicePrompt = `Dijital pazarlama testinde ${overallMaxScore} üzerinden ${overallScore} puan alan bir kullanıcıya tek cümlelik, kısa ve faydalı bir tavsiye ver. Metriq360'ın hizmetlerini ve IQ360 sistemini vurgula.`;
    
    // --- Reusable function to call Gemini ---
    const callGemini = async (prompt) => {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000 }
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text || text.trim().length === 0) {
            throw new Error("Gemini API returned an empty response.");
        }
        
        return text;
    };

    // --- Generate both reports ---
    const detailedReport = await callGemini(detailedReportPrompt);
    const shortAdvice = await callGemini(shortAdvicePrompt);

    return {
      statusCode: 200,
      body: JSON.stringify({ detailedReport, shortAdvice }),
    };

  } catch (error) {
    console.error('Error in generate-report function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
