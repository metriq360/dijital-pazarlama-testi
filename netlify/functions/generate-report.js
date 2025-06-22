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

    // --- RE-ENGINEERED PROMPTS ---
    const detailedReportPrompt = `
      Sen, Metriq360 adına konuşan, samimi ve teşvik edici bir dijital pazarlama danışmanısın. Amacın, kullanıcıya değer sunmak, onu motive etmek ve harekete geçirmektir. Lütfen aşağıdaki bilgileri kullanarak, enerjik, bol emojili, kısa ve öz bir rapor hazırla. Raporun başlıkları ve içeriği kısa ve net olsun.

      **Kullanıcı Bilgileri:**
      - Ad: ${userInfo.name} ${userInfo.surname}
      - Sektör: ${userInfo.sector}
      - Genel Puan: ${overallScore}/${overallMaxScore}
      - Güçlü Alanları: ${strongPointsText}
      - Geliştirebileceği Alanlar: ${weakPointsText}

      **Rapor Formatı:**

      ### Merhaba ${userInfo.name}! 👋 Dijital Sağlık Raporun Hazır!

      Harika bir adım attın! İşte dijital pazarlama performansının anlık bir fotoğrafı:

      #### **Güçlü Yönlerin 💪**
      [Burada kullanıcının güçlü yönlerini (strongPointsText) özetle ve onu tebrik et. Eğer güçlü yönü yoksa, "Her yolculuk bir ilk adımla başlar!" gibi motive edici bir şey yaz.]

      #### **Gelişim Fırsatların 🚀**
      [Burada kullanıcının zayıf yönlerini (weakPointsText) "fırsat" olarak sun. Bu alanlarda hemen yapabileceği 1-2 pratik ve aksiyon odaklı tavsiye ver. Örneğin: "Yerel SEO'da daha görünür olmak için Google İşletme profiline bu hafta 3 yeni müşteri yorumu eklemeyi hedefleyebilirsin."]

      #### **Sana Özel Paket Önerimiz 🎯**
      [Gelişim alanlarına göre en uygun Metriq360 paketini (IQ Yerel Güç, IQ Sosyal Büyüme, IQ Reklam Master vb.) öner ve paketin ona nasıl yardımcı olacağını tek cümleyle açıkla.]

      #### **Harekete Geçme Zamanı! 📞**
      Potansiyelini tam olarak ortaya çıkarmak ve dijitalde zirveye oynamak için bizimle hemen iletişime geç! Ücretsiz bir strateji görüşmesiyle sana özel yol haritanı çizelim.

      **İletişim:**
      - ☎️ **Telefon:** +90 537 948 48 68
      - ✉️ **E-posta:** bilgi@metriq360.com
      - 🌐 **Web:** www.metriq360.com
    `;

    const shortAdvicePrompt = `Dijital pazarlama testinde ${overallMaxScore} üzerinden ${overallScore} puan alan bir kullanıcıya tek cümlelik, enerjik ve motive edici bir tavsiye ver. Metriq360 ve IQ360 sisteminin bu potansiyeli nasıl zirveye taşıyabileceğinden bahset. Emoji kullan.`;
    
    // --- Reusable function to call Gemini ---
    const callGemini = async (prompt, maxTokens = 800) => {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens }
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("Gemini API Error Response:", await response.text());
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
    const shortAdvice = await callGemini(shortAdvicePrompt, 100);

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
