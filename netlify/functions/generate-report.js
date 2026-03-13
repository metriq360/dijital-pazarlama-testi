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
        const titles = ['', 'Sosyal Medya Yönetimi', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
        return titles[num] || '';
    };

    const strongSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) >= 0.7).map(getSectionTitle);
    const weakSections = selectedSections.filter(n => (sectionScores[n]/sectionMaxScores[n]) < 0.4).map(getSectionTitle);
    
    // DİNAMİK KELİME HESABI: 
    // 1 Bölüm seçildiyse: ~100-150 kelime
    // 3 Bölüm seçildiyse: ~180-230 kelime
    // 5 Bölüm seçildiyse: ~250-300 kelime
    const sectionCount = selectedSections.length;
    const minWords = 100 + (sectionCount - 1) * 35; 
    const maxWords = Math.min(300, 150 + (sectionCount - 1) * 35);

    const prompt = `
      Sen METRIQ360 markasının Baş Stratejisti'sin. 
      Müşteri Bilgileri: ${userInfo.name} | Sektör: ${userInfo.sector} | Skor: ${score}/100 | Analiz Edilen Alan Sayısı: ${sectionCount}

      GÖREV: Sektörel derinliği olan, doyurucu ve müşterinin harcadığı emeğe (çözdüğü soru sayısına) paralel uzunlukta profesyonel bir analiz yaz.

      ÖNEMLİ UZUNLUK KURALI: 
      - Toplam metin uzunluğu KESİNLİKLE en az ${minWords} kelime, en fazla ${maxWords} kelime olmalıdır.
      - Seçilen alan sayısı (${sectionCount}) arttıkça, analizdeki detay ve madde sayısı da artmalıdır.

      YAPI:
      ### 🎯 ${userInfo.sector} Sektöründe Mevcut Dijital Röntgeniniz
      (Skorun bu sektördeki karşılığını anlatan ferah paragraflar. Skor düşükse tokat gibi gerçekçi, yüksekse vizyoner ol.)

      ### ⚠️ Kritik Ciro Kayıpları ve Sızıntılar
      (Şu zayıf alanlar üzerinden detaylı analiz yap: [${weakSections.join(', ') || 'Dijital süreçler'}]. Neden para kaybedildiğini maddelerle anlat.)

      ### 💡 Gizli Büyüme Potansiyelleri
      (Şu güçlü yanlar: [${strongSections.join(', ') || 'Veri odaklı büyüme'}]. Bu alanlar ciroya nasıl kaldıraç olur?)

      ### 🚀 İlk 3 Stratejik Hamle
      (Bugün uygulanacak 3 net ve sektörel tavsiye.)

      KURAL: Asla imza ve selamlama yazma. Sadece rapor içeriğini başlıklarla üret. Markdown kullan. Gereksiz laf kalabalığından kaçın, her cümle bir değer sunsun.
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz raporu şu an oluşturulamadı.";

    return { statusCode: 200, body: JSON.stringify({ detailedReport }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
