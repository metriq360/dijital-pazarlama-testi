import sgMail from '@sendgrid/mail';
import OpenAI from 'openai';

// API anahtarları ortam değişkenlerinden güvenli alınır
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // VITE_ olmamalı
});

// Basit HTML escape fonksiyonu (XSS koruması için)
const escapeHtml = (unsafe = "") => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

// Soru bankası (örnek)
const allQuestions = [
  // ... sorular buraya gelecek ...
];

// Bölüm başlıkları
const getSectionTitle = (sectionNum) => {
  const titles = {
    1: 'Sosyal Medya Yönetimi',
    2: 'Yerel SEO ve Google Benim İşletmem',
    3: 'Reklam ve Kampanya Yönetimi',
    4: 'İçerik Pazarlaması',
    5: 'Pazarlama Araçları ve Otomasyon',
  };
  return titles[sectionNum] || `Bölüm ${sectionNum}`;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { scores, quizAnswers, userInfo } = JSON.parse(event.body);
    const { totalScore, totalMaxScore, sectionScores, sectionMaxScores } = scores;

    const percentage = (totalScore / totalMaxScore) * 100;
    let performanceLevel = "orta";
    if (percentage < 40) performanceLevel = "geliştirilmesi gereken";
    else if (percentage >= 75) performanceLevel = "güçlü";

    // Kısa tavsiye (OpenAI GPT-3.5 Turbo)
    let shortAdvice = "Tavsiye oluşturulamadı.";
    try {
      const adviceResult = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Bir kullanıcı dijital pazarlama testinden 100 üzerinden ${Math.round(percentage)} puan aldı. Bu '${performanceLevel}' bir skordur. Tek cümlelik, motive edici ve aksiyona yönelik bir tavsiye ver. METRIQ360'ın IQ360 sistemiyle ilişkilendir ve iletişime yönlendir.`,
        }],
        max_tokens: 150,
        temperature: 0.8,
      });
      shortAdvice = adviceResult.choices?.[0]?.message?.content?.trim() || shortAdvice;
    } catch (gptError) {
      console.error("OpenAI Tavsiye Hatası:", gptError);
    }

    // Güçlü ve zayıf bölümleri belirle
    const strongSections = [], weakSections = [];
    Object.keys(sectionScores).forEach(sectionNum => {
      const score = sectionScores[sectionNum];
      const max = sectionMaxScores[sectionNum];
      const pct = (score / max) * 100;
      const title = getSectionTitle(parseInt(sectionNum));
      if (pct >= 70) strongSections.push(title);
      else if (pct <= 40) weakSections.push(title);
    });

    // Detaylı sonuçlar
    const testResultsDetails = Object.keys(sectionScores).map(sectionNum => {
      const title = getSectionTitle(parseInt(sectionNum));
      const questions = allQuestions.filter(q => q.section === parseInt(sectionNum));
      const answers = questions.map(q =>
        `- Soru: ${q.text} | Verilen Puan: ${quizAnswers[q.id] || 0}/5`
      ).join('\n');
      return `**${title}**\n${answers}`;
    }).join('\n\n');

    // GPT-4 ile detaylı rapor promptu
    const prompt = `Sen dijital pazarlama uzmanısın ve METRIQ360 için sektör odaklı raporlar yazıyorsun.

Kullanıcı:
Ad: ${userInfo.name} ${userInfo.surname}
Sektör: ${userInfo.sector}
Genel Puan: ${totalScore} / ${totalMaxScore}
Güçlü Yönler: ${strongSections.join(', ') || 'Belirgin güçlü yön yok.'}
Zayıf Yönler: ${weakSections.join(', ') || 'Belirgin zayıf yön yok.'}

Detaylı Sonuçlar:
${testResultsDetails}
`;

    let detailedReport = "Rapor oluşturulamadı.";
    try {
      const reportResult = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      });
      detailedReport = reportResult.choices?.[0]?.message?.content || detailedReport;
    } catch (gptError) {
      console.error("OpenAI Rapor Hatası:", gptError);
    }

    // Mail formatı
    const reportHtml = escapeHtml(detailedReport).replace(/\n/g, '<br>');
    const nameSafe = escapeHtml(userInfo.name);
    const surnameSafe = escapeHtml(userInfo.surname);
    const sectorSafe = escapeHtml(userInfo.sector);

    const msgToUser = {
      to: userInfo.email,
      from: 'iletisim@metriq360.com',
      subject: `🚀 Dijital Pazarlama Raporunuz, ${nameSafe}!`,
      html: `
        <h2>Merhaba ${nameSafe},</h2>
        <p>Testi tamamladığınız için teşekkürler!</p>
        <p><strong>Kısa Tavsiye:</strong> ${escapeHtml(shortAdvice)}</p>
        <hr>
        ${reportHtml}
      `
    };

    const msgToAdmin = {
      to: 'bilgi@metriq360.com',
      from: 'iletisim@metriq360.com',
      subject: `Yeni Test: ${nameSafe} ${surnameSafe}`,
      html: `
        <h2>Yeni test tamamlandı</h2>
        <p><strong>Ad:</strong> ${nameSafe} ${surnameSafe}</p>
        <p><strong>Sektör:</strong> ${sectorSafe}</p>
        <p><strong>Puan:</strong> ${totalScore} / ${totalMaxScore}</p>
        <hr>
        ${reportHtml}
      `
    };

    // Mail gönder
    try {
      await Promise.all([sgMail.send(msgToUser), sgMail.send(msgToAdmin)]);
    } catch (emailErr) {
      console.error("E-posta Gönderim Hatası:", emailErr);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ shortAdvice, detailedReport }),
    };

  } catch (err) {
    console.error("Genel Fonksiyon Hatası:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Sunucu hatası" }),
    };
  }
};
