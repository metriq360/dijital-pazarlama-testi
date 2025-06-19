import sgMail from '@sendgrid/mail';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Gemini kütüphanesini ekledik

// SendGrid API anahtarını ortam değişkenlerinden güvenli bir şekilde alın
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Gemini API anahtarını ortam değişkeninden alın
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Gemini API anahtarı


// Soru bankası (App.jsx'ten kopyalandı)
const allQuestions = [
  // Section 1: Sosyal Medya Yönetimi
  { id: 'q1_1', section: 1, text: 'Sosyal medya hesaplarınızda ne sıklıkta paylaşım yapıyorsunuz?' },
  { id: 'q1_2', section: 1, text: 'Her platform için ayrı bir strateji uyguluyor musunuz?' },
  { id: 'q1_3', section: 1, text: 'Takipçi sayınız son 6 ayda istikrarlı bir şekilde arttı mı?' },
  { id: 'q1_4', section: 1, text: 'Paylaşımlarınız etkileşim alıyor mu (beğeni, yorum, paylaşım)?' },
  { id: 'q1_5', section: 1, text: 'Hedef kitlenizi tanıyarak içerik üretiyor musunuz?' },
  { id: 'q1_6', section: 1, text: 'Story, reels ve canlı yayın gibi farklı içerik formatlarını kullanıyor musunuz?' },
  { id: 'q1_7', section: 1, text: 'Sosyal medyada gelen yorumlara ve mesajlara ne kadar hızlı yanıt veriyorsunuz?' },
  { id: 'q1_8', section: 1, text: 'İçerik takvimi oluşturup gönderileri önceden planlıyor musunuz?' },
  { id: 'q1_9', section: 1, text: 'Rakiplerinizin sosyal medya stratejilerini analiz ediyor musunuz?' },
  { id: 'q1_10', section: 1, text: 'Sosyal medya için dış kaynak ya da ajans desteği alıyor musunuz?' },

  // Section 2: Yerel SEO ve Google Benim İşletmem
  { id: 'q2_1', section: 2, text: 'Google Benim İşletmem (GBP) profiliniz var mı?' },
  { id: 'q2_2', section: 2, text: 'GBP profilinizde adres, telefon ve açık saatler eksiksiz mi?' },
  { id: 'q2_3', section: 2, text: 'GBP üzerinde sık sık içerik (fotoğraf, gönderi) paylaşıyor musunuz?' },
  { id: 'q2_4', section: 2, text: 'Harita konumunuz doğru mı?' },
  { id: 'q2_5', section: 2, text: 'Müşterilerden düzenli olarak Google yorumu alıyor musunuz?' },
  { id: 'q2_6', section: 2, text: 'Gelen yorumlara yanıt veriyor musunuz?' },
  { id: 'q2_7', section: 2, text: 'İşletmeniz yerel dizinlerde ve haritalarda listelenmiş mi?' },
  { id: 'q2_8', section: 2, text: '“Yakınımdaki [ürün/hizmet]” gibi aramalarda çıkıyor musunuz?' },
  { id: 'q2_9', section: 2, text: 'GBP verilerini (gösterim, tıklama vs.) analiz ediyor musunuz?' },
  { id: 'q2_10', section: 2, text: 'Yerel anahtar kelimelere yönelik stratejiniz var mı?' },

  // Section 3: Reklam ve Kampanya Yönetimi
  { id: 'q3_1', section: 3, text: 'Meta (Facebook/Instagram) reklamları yürütüyor musunuz?' },
  { id: 'q3_2', section: 3, text: 'Google Ads kampanyaları aktif mi?' },
  { id: 'q3_3', section: 3, text: 'Hedef kitle tanımlarınız net mi?' },
  { id: 'q3_4', section: 3, text: 'Reklam kampanyalarınıza segmentlere ayırıyor musunuz?' },
  { id: 'q3_5', section: 3, text: 'A/B testleri yapıyor musunuz?' },
  { id: 'q3_6', section: 3, text: 'Reklamlarda dönüşüm hedefi belirliyor musunuz?' },
  { id: 'q3_7', section: 3, text: 'Reklam bütçenizi veriye göre optimize ediyor musunuz?' },
  { id: 'q3_8', section: 3, text: 'Farklı reklam formatları (video, carousel, lead form) kullanıyor musunuz?' },
  { id: 'q3_9', section: 3, text: 'Dönüşüm takibi yapabiliyor musunuz (pixel, GA)?' },
  { id: 'q3_10', section: 3, text: 'Reklam performans raporlarını haftalık/aylık inceliyor musunuz?' },

  // Section 4: Content Marketing
  { id: 'q4_1', section: 4, text: 'Web sitenizde blog içerikleri yayınlıyor musunuz?' },
  { id: 'q4_2', section: 4, text: 'İçerikleriniz belirli bir stratejiye göre mı hazırlanıyor?' },
  { id: 'q4_3', section: 4, text: 'İçeriklerinizin hedef kitlenizin sorunlarına çözüm sunduğunu düşünüyor musunuz?' },
  { id: 'q4_4', section: 4, text: 'Videolu içerikler üretiyor musunuz?' },
  { id: 'q4_5', section: 4, text: 'İçeriklerinizde anahtar kelime optimizasyonu yapıyor musunuz?' },
  { id: 'q4_6', section: 4, text: 'İçerikleriniz ne sıklıkta güncelleniyor?' },
  { id: 'q4_7', section: 4, text: 'İçeriğiniz sosyal medya ve e-posta ile destekleniyor mı?' },
  { id: 'q4_8', section: 4, text: 'İçeriklerinizin performansını ölçüyor musunuz (okunma süresi, hemen çıkma vs.)?' },
  { id: 'q4_9', section: 4, text: 'Blog yazılarında görsel, infografik gibi unsurlar kullanıyor musunuz?' },
  { id: 'q4_10', section: 4, text: 'İçerik üretimi için profesyonel destek alıyor musunuz?' },

  // Section 5: Marketing Tools and Automation
  { id: 'q5_1', section: 5, text: 'Hangi pazarlama otomasyon araçlarını kullanıyorsunuz?' },
  { id: 'q5_2', section: 5, text: 'E-posta pazarlaması yapıyor musunuz?' },
  { id: 'q5_3', section: 5, text: 'E-posta listenizi segmentlere ayırıyor musunuz?' },
  { id: 'q5_4', section: 5, text: 'Google Analytics veya benzeri araçlarla sitenizi analiz ediyor musunuz?' },
  { id: 'q5_5', section: 5, text: 'Ziyaretçi davranışlarını analiz etmek için bir sisteminiz var mı?' },
  { id: 'q5_6', section: 5, text: 'Sosyal medya zamanlayıcı araçlar (Buffer, Meta Planner vb.) kullanıyor musunuz?' },
  { id: 'q5_7', section: 5, text: 'CRM veya müşteri yönetim sistemi kullanıyor musunuz?' },
  { id: 'q5_8', section: 5, text: 'Pazarlama performansınızı raporlayan otomatik sistemler var mı?' },
  { id: 'q5_9', section: 5, text: 'Online formlarınızdan gelen verileri merkezi bir yerde topluyor musunuz?' },
  { id: 'q5_10', section: 5, text: 'Dijital pazarlama süreçlerinin tümünü bir sistem dahilinde takip ediyor musunuz?' },
];

// Metriq360 Paket Bilgileri ve URL'ler (App.jsx'ten kopyalandı)
const metriq360Info = {
  websiteUrl: 'https://www.metriq360.com',
  contactEmail: 'bilgi@metriq360.com', 
  contactNumber: '+90 537 948 48 68',
  services: [
    "SEO Danışmanlığı", "İçerik Pazarlaması", "Sosyal Medya Yönetimi", "Meta & Google Reklam Yönetimi",
    "Yerel SEO ve Google My Business Optimizasyonu", "E-posta Pazarlaması", "Pazarlama Otomasyonu",
    "Veri Analizi ve Raporlama", "Stratejik Planlama ve Yönetim"
  ],
  packages: [
    { name: "IQ Yerel Güç", slogan: "Mahallenize Ulaşın, Hedef Kitlenizi Büyüyün!", focus: "Yerel SEO & Google My Business Odaklı" },
    { name: "IQ Sosyal Büyüme", slogan: "Markanızı Sosyalde Konuşturun, Bağ Kurun!", focus: "Meta (Facebook/Instagram) & LinkedIn Odaklı" },
    { name: "IQ Reklam Master", slogan: "Doğru Reklam, Doğru Hedef, En Hızlı Dönüşüm!", focus: "Meta & Google Reklam Yönetimi" },
    { name: "IQ Süper İkili", slogan: "İki Gücü Bir Araya Getirin, Stratejik Büyümeyi Başlatın!", focus: "İki Paket Bir Arada - Esnek Seçimli" },
    { name: "IQ Zirve Paketi", slogan: "Tam Dijital Hâkimiyet, Marka Zirvesine Giden Yol!", focus: "Tüm Hizmetler Bir Arada - Full Digital Strateji" }
  ],
  callToAction: "Dijital dünyada fark yaratmak ve başarınızı garantilemek için hemen bizimle iletişime geçin. IQ360 sistemiyle geleceğinizi birlikte inşa edelim!"
};

// Basit HTML escape fonksiyonu (XSS koruması için)
const escapeHtml = (unsafe = "") => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

// Bölüm başlıkları (App.jsx'ten kopyalandı)
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
  console.log("Netlify Function Başladı."); // *** NEW LOG ***
  if (event.httpMethod !== 'POST') {
    console.log("Desteklenmeyen HTTP Metodu:", event.httpMethod); // *** NEW LOG ***
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { scores, quizAnswers, userInfo, selectedSections } = JSON.parse(event.body);
    const { totalScore, totalMaxScore, sectionScores, sectionMaxScores } = scores;

    console.log("Gelen Kullanıcı Bilgileri:", userInfo.email, userInfo.name); // *** NEW LOG ***
    console.log("Gelen Seçilen Bölümler:", selectedSections); // *** NEW LOG ***
    console.log("Gelen Test Sonuçları (Toplam Puan):", totalScore, totalMaxScore); // *** NEW LOG ***


    if (!GEMINI_API_KEY) {
      console.error("Gemini API Key ortam değişkenlerinde bulunamadı!"); // *** NEW LOG ***
      throw new Error("Gemini API Key not found in environment variables.");
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Gemini modelini burada başlatın

    const percentage = (totalScore / totalMaxScore) * 100;
    let performanceLevel = "orta";
    if (percentage < 40) performanceLevel = "geliştirilmesi gereken";
    else if (percentage >= 75) performanceLevel = "güçlü";

    // Kısa tavsiye (Gemini API)
    let shortAdvice = "Tavsiye oluşturulamadı.";
    try {
      const advicePrompt = `Bir kullanıcı dijital pazarlama testinden 100 üzerinden ${Math.round(percentage)} puan aldı. Bu '${performanceLevel}' bir skordur. Tek cümlelik, motive edici ve aksiyona yönelik bir tavsiye ver. METRIQ360'ın IQ360 sistemiyle ilişkilendir ve iletişime yönlendir.`;
      
      console.log("Gemini API'ye kısa tavsiye için gönderilecek prompt (ilk 200 karakter):", advicePrompt.substring(0, 200)); // *** NEW LOG ***

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const adviceResult = await model.generateContent(advicePrompt);
      const adviceResponse = await adviceResult.response;
      const adviceText = adviceResponse.text();

      console.log("Gemini API'den kısa tavsiye yanıtı (ilk 200 karakter):", adviceText.substring(0, 200)); // *** NEW LOG ***


      if (adviceText) { // Gemini metin döndürdüyse
        shortAdvice = adviceText;
      } else {
        console.error("Gemini API'den kısa tavsiye alınırken boş veya beklenmeyen yanıt:", adviceResult);
      }
    } catch (geminiError) {
      console.error("Gemini Kısa Tavsiye API Çağrısı Hatası:", geminiError); // *** NEW LOG ***
      if (geminiError.response) {
        console.error("Gemini Kısa Tavsiye Hata Detayı:", JSON.stringify(geminiError.response.data)); // *** NEW LOG ***
      }
      shortAdvice = "Kısa tavsiye oluşturulurken bir sorun oluştu.";
    }

    // Bölüm bazlı puanları ve güçlü/zayıf soruları rapora eklemek için formatlama
    const sectionDetails = selectedSections.map(sectionNum => {
      const title = getSectionTitle(sectionNum);
      const current = sectionScores[sectionNum];
      const max = sectionMaxScores[sectionNum];
      const questionsForSection = allQuestions.filter(q => q.section === sectionNum);
      
      const strongPoints = questionsForSection
        .filter(q => quizAnswers[q.id] >= 4) // Puanı 4 veya 5 olanlar güçlü yön
        .map(q => q.text + ` (${quizAnswers[q.id]}/5)`);
      
      const weakPoints = questionsForSection
        .filter(q => quizAnswers[q.id] <= 2) // Puanı 1 veya 2 olanlar zayıf yön
        .map(q => q.text + ` (${quizAnswers[q.id]}/5)`);

      return `### Bölüm ${sectionNum}: ${title} (${current}/${max})\n` +
             (strongPoints.length > 0 ? `**Güçlü Yönler:** ${strongPoints.join(', ')}.\n` : '') +
             (weakPoints.length > 0 ? `**Zayıf Yönler:** ${weakPoints.join(', ')}.\n` : '');
    }).join('\n');

    const totalNumberOfTests = selectedSections.length;
    const overallPercentageScore = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;

    // Detaylı rapor promptu (Gemini API için) - Görsel iyileştirmeler eklendi
    const detailedReportPrompt = `Sen METRIQ360 Dijital Pazarlama Ajansı’nın strateji uzmanısın. Aşağıda bir işletmenin çözdüğü dijital pazarlama testlerinin sonuçları verilmiştir. Raporu 300 kelimeyi geçmeyecek şekilde, **Markdown formatında (başlıklar, kalın metinler, listeler, emojiler ve yatay çizgiler kullanarak)** ve Türkçe olarak oluştur. Amacın kullanıcıya net bir genel değerlendirme, ana tavsiyeler ve uygun METRIQ360 paket önerileri sunmaktır. Gereksiz detaylardan kaçın. Motive edici ve dostça bir ton kullan. **Raporun görsel olarak şık ve modern görünmesini sağla.**

📌 Raporun yapısı şu şekilde olmalı:
---
1.  **🚀 Giriş Bölümü**
    - Kullanıcının adıyla hitap et.
    - METRIQ360’ın bu raporu neden sunduğunu açıkla.
    - Kaç testin çözüldüğünü ve bu testlerin dijital varlıkları nasıl ölçtüğünü kısaca belirt.
    - Raporun sonunda kullanıcıya kazandıracağı değeri anlat.
    - Ton: Profesyonel, motive edici, dostça.
---
2.  **📊 Genel Değerlendirme (${totalNumberOfTests} Test Çözüldü)**
    - ${totalNumberOfTests} test çözüldüyse, testler arası ilişkilere dikkat çek.
    - Her testin öne çıkan güçlü ve zayıf yönlerini açıklayıcı ama özet bir şekilde yaz.
    - Gereksiz detay verme, stratejik bakış açısı sun.
    - Test sonuçları detayları:
    ${sectionDetails}
---
3.  **💡 Ana Tavsiyeler**
    - Her test için 2-3 maddelik uygulanabilir öneriler ver.
    - Dili sade, doğrudan ve cesaretlendirici olsun.
    - Gerekiyorsa teknik bilgi ver ama yalın anlat.
---
4.  **📦 Size Özel METRIQ360 Paket Önerisi**
    - Test sonuçlarına göre en uygun 1 veya 2 hizmet paketini öner.
    - Neden bu paketi önerdiğini kısa ama net açıklamalarla yaz.
---
5.  **✨ Kapanış ve İletişim**
    - Kullanıcıyı dijital potansiyelini gerçekleştirmesi için cesaretlendir.
    - METRIQ360’ın “IQ360 Sistemi” ve “Turuncu Güç” yaklaşımına kısaca değin.
    - İletişime geçmeye davet et.
---
6.  **📞 İletişim Bilgileri** (aynen yaz, lütfen bu bilgiyi değiştirme):
    - Web: www.metriq360.com
    - E-posta: bilgi@metriq360.com
    - Telefon: +90 537 948 48 68

---
**Kullanıcı Bilgileri:**
Ad: ${userInfo.name}
Sektör: ${userInfo.sector}

**Test Sonuçları Özeti (100 üzerinden):**
Genel Puan: ${overallPercentageScore} / 100
`; // Prompt sonu


    let detailedReport = "Rapor oluşturulamadı.";
    try {
      console.log("Gemini API'ye detaylı rapor için gönderilecek prompt (ilk 200 karakter):", detailedReportPrompt.substring(0, 200)); // *** NEW LOG ***
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const reportResult = await model.generateContent(detailedReportPrompt);
      const reportResponse = await reportResult.response;
      const reportText = reportResponse.text();

      console.log("Gemini API'den detaylı rapor yanıtı (ilk 200 karakter):", reportText.substring(0, 200)); // *** NEW LOG ***

      if (reportText) { // Gemini metin döndürdüyse
        detailedReport = reportText;
      } else {
        console.error("Gemini API'den detaylı rapor alınırken boş veya beklenmeyen yanıt:", reportResult);
      }
    } catch (geminiError) {
      console.error("Gemini Detaylı Rapor API Çağrısı Hatası:", geminiError); // *** NEW LOG ***
      if (geminiError.response) {
        console.error("Gemini Detaylı Rapor Hata Detayı:", JSON.stringify(geminiError.response.data)); // *** NEW LOG ***
      }
      detailedReport = "Detaylı rapor oluşturulurken bir hata oluştu.";
    }

    // Mail formatı
    const reportHtml = escapeHtml(detailedReport).replace(/\n/g, '<br>');
    const nameSafe = escapeHtml(userInfo.name);
    const surnameSafe = escapeHtml(userInfo.surname);
    const sectorSafe = escapeHtml(userInfo.sector);

    // Kullanıcıya gönderilen e-posta çıkarıldı
    // const msgToUser = {
    //   to: userInfo.email,
    //   from: metriq360Info.contactEmail,
    //   subject: `🚀 Dijital Pazarlama Raporunuz, ${nameSafe}!`,
    //   html: `
    //     <h2>Merhaba ${nameSafe},</h2>
    //     <p>Testi tamamladığınız için teşekkürler!</p>
    //     <p><strong>Kısa Tavsiye:</strong> ${escapeHtml(shortAdvice)}</p>
    //     <hr>
    //     ${reportHtml}
    //   `
    // };

    const msgToAdmin = {
      to: metriq360Info.contactEmail, // Site sahibinin e-posta adresi
      from: metriq360Info.contactEmail, // Gönderen e-posta adresi güncellendi
      subject: `Yeni Test: ${nameSafe} ${surnameSafe}`,
      html: `
        <h2>Yeni test tamamlandı</h2>
        <p><strong>Ad:</strong> ${nameSafe} ${surnameSafe}</p>
        <p><strong>Sektör:</strong> ${sectorSafe}</p>
        <p><strong>E-posta:</strong> ${userInfo.email}</p>
        <p><strong>Puan:</strong> ${totalScore} / ${totalMaxScore}</p>
        <hr>
        ${reportHtml}
        <h3>Kullanıcının Verdiği Yanıtlar:</h3>
        <ul>
          ${Object.keys(quizAnswers).map(qId => {
            const question = allQuestions.find(q => q.id === qId);
            return `<li><strong>Bölüm ${question.section} - ${getSectionTitle(question.section)} - ${question.text}</strong>: ${quizAnswers[qId]}/5</li>`;
          }).join('')}
        </ul>
      `
    };

    // Mail gönder - Sadece yöneticiye gönderiliyor
    try {
      console.log("E-posta gönderiliyor... Sadece Yöneticiye:", metriq360Info.contactEmail); // *** NEW LOG ***
      await sgMail.send(msgToAdmin); // Sadece admin maili gönderiliyor
      console.log("E-postalar başarıyla gönderildi."); // *** NEW LOG ***
    } catch (emailErr) {
      console.error("E-posta Gönderim Hatası:", emailErr); // *** EXISTING LOG MORE DETAILED ***
      if (emailErr.response) {
        console.error("E-posta hatası kodu:", emailErr.response.statusCode); // *** NEW LOG ***
        console.error("E-posta hatası yanıtı (body):", JSON.stringify(emailErr.response.body)); // *** NEW LOG ***
      }
      // E-posta gönderimi hatası uygulamanın çalışmasını engellememeli,
      // sadece loglanmalı veya kullanıcıya bilgi verilmelidir.
    }

    console.log("Fonksiyon başarılı yanıt döndürüyor."); // *** NEW LOG ***
    return {
      statusCode: 200,
      body: JSON.stringify({ shortAdvice, detailedReport }),
    };

  } catch (err) {
    console.error("Genel Fonksiyon Hatası (Catch bloğu):", err); // *** NEW LOG ***
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Sunucu hatası" }),
    };
  }
};
