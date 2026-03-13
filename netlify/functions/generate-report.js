import fetch from 'node-fetch';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body);
    const { userInfo, totalScore, answers, allQuestions, selectedSections } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY eksik.");

    // 1. ADIM: MÜŞTERİNİN ZAYIF NOKTALARINI (1 VE 2 PUANLARI) TESPİT ET
    const failedMetrics = allQuestions
        .filter(q => answers[q.id] !== undefined && answers[q.id] <= 2)
        .map(q => `- ${q.text} (Puanı: ${answers[q.id]}/5)`);

    // 2. ADIM: GÜÇLÜ NOKTALARI TESPİT ET
    const successfulMetrics = allQuestions
        .filter(q => answers[q.id] !== undefined && answers[q.id] >= 4)
        .map(q => `- ${q.text}`);

    // DİNAMİK KELİME HESABI: 
    const sectionCount = selectedSections.length;
    const minWords = 130 + (sectionCount * 25); 
    const maxWords = 350;

    const prompt = `
      Sen METRIQ360 markasının Baş Büyüme Stratejisti'sin. Karşında bir dijital sağlık testi doldurmuş bir işletme sahibi var.
      Müşteri Bilgileri: ${userInfo.name} | Sektör: ${userInfo.sector} | Genel Skor: ${totalScore}/100

      KRİTİK GÖREV: Sadece ve sadece aşağıdaki gerçek verilere dayanarak, sektörel derinliği olan (Örn: Mobilya Showroom, Kuaför randevu trafiği vb.) bir rapor yaz. 
      KAFANDAN ALAKASIZ TAVSİYE VERME!

      MÜŞTERİNİN KRİTİK EKSİKLERİ (Bunlar üzerinden vur):
      ${failedMetrics.join('\n') || 'Genel dijital süreçler.'}

      MÜŞTERİNİN İYİ OLDUĞU ALANLAR:
      ${successfulMetrics.join('\n') || 'Belirgin bir güçlü yön henüz yok.'}

      YAPI (Markdown kullan):
      ### 🎯 ${userInfo.sector} Sektöründe Mevcut Dijital Röntgeniniz
      (Skorun bu sektördeki karşılığını anlatan ferah paragraflar. Skor düşükse tokat gibi gerçekçi, yüksekse vizyoner ol.)

      ### ⚠️ Kritik Ciro Kayıpları ve Sızıntılar
      (Yukarıdaki "KRİTİK EKSİKLER" listesindeki maddelere tek tek değin. Neden para kaybettiğini sektörel jargonla anlat.)

      ### 🚀 Stratejik Yol Haritası (İlk 3 Adım)
      (En düşük puan alan sorunları çözecek 3 net sektörel tavsiye.)

      KATI KURAL: 
      - Metin uzunluğu ${minWords}-${maxWords} kelime arası olsun.
      - Asla imza, selamlama (Merhaba vb.) ekleme. 
      - Sadece analizi ve başlıkları üret.
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz raporu oluşturulurken bir hata oluştu.";

    return { statusCode: 200, body: JSON.stringify({ detailedReport }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
