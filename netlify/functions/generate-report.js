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
    const selectedSectionNames = selectedSections.map(getSectionTitle).join(', ');

    // YENİ PROMPT: Tasarımı bozmaması için Markdown kuralları çok sıkılaştırıldı.
    const prompt = `
      Sen METRIQ360 markasının "Kıdemli Dijital Büyüme Stratejisti"sin. Müşteriye tokat gibi gerçekleri çarpan ama aynı zamanda vizyon sunan profesyonel bir dilin var.
      
      Kullanıcı Bilgileri: 
      - İsim: ${userInfo.name} ${userInfo.surname}
      - Sektör: ${userInfo.sector}
      - Analiz Edilen Alanlar: ${selectedSectionNames}
      - Başarı Skoru: ${score}/100

      GÖREVİN:
      Kullanıcıya mevcut durumunu özetleyen, kolay okunabilir, alt başlıkları ve maddeleri olan ÇARPICI bir ön analiz raporu yazmak.

      KATI FORMAT KURALLARI (BUNLARA UYMAZSAN SİSTEM ÇÖKER):
      1. ASLA genel selamlama veya imza kullanma. Sadece rapor içeriğini üret.
      2. Ana başlıkların başına KESİNLİKLE "### " koy. (Boşluk bırakmadan direkt satır başından başla).
      3. Liste maddelerinin başına KESİNLİKLE tire "-" koy. Asla yıldız (*) kullanma.
      4. Paragrafların ve listelerin başına asla boşluk (space) veya tab (girinti) koyma. Her satır en soldan başlamalı.
      5. Emojileri profesyonelce kullan.

      RAPOR YAPISI ŞU ŞEKİLDE OLMALIDIR:
      
      ### 🎯 ${userInfo.sector} Sektöründe Mevcut Dijital Konumunuz
      (Kullanıcının sektörü ve genel skoru üzerinden 1-2 paragraflık genel bir değerlendirme yap.)

      ### 💡 Potansiyel Barındıran Güçlü Yönleriniz
      (Şu alanlarda iyiler: ${strongSections.join(', ') || 'Henüz tam potansiyelini kullanmayan bir dijital varlık.'}. Bu alanların işletmeye nasıl para kazandıracağını "-" ile listeler halinde anlat.)

      ### ⚠️ Ciro Kaybı Yaşadığınız Kritik Sızıntılar
      (Şu alanlarda zayıflar: ${weakSections.join(', ') || 'Stratejik kurgu eksikliği ve süreç optimizasyonu.'}. Bu eksikliklerin rakiplere nasıl müşteri kaptırdığını çarpıcı bir dille, "-" ile liste halinde açıkla.)

      ### 🚀 Hızlı Aksiyon Planı (İlk 3 Adım)
      (${userInfo.sector} sektörü için hemen uygulanabilecek 3 hap bilgi/tavsiye ver.)
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await response.json();
    const detailedReport = result.candidates?.[0]?.content?.parts?.[0]?.text || "Strateji ekibimiz verilerinizi inceliyor...";

    return { statusCode: 200, body: JSON.stringify({ detailedReport }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
