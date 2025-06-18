// /netlify/functions/send-email.js

// Gerekli kütüphaneleri import et
const sgMail = require('@sendgrid/mail');
const { OpenAI } = require('openai');

// API Anahtarlarını Netlify ortam değişkenlerinden güvenli bir şekilde al
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Test sorularını ve başlıklarını tanımla (rapor için gerekli)
const allQuestions = [
    { id: 'q1_1', section: 1, text: 'Sosyal medya hesaplarınızda ne sıklıkla paylaşım yapıyorsunuz?' }, { id: 'q1_2', section: 1, text: 'Her platform için ayrı bir strateji uyguluyor musunuz?' }, { id: 'q1_3', section: 1, text: 'Takipçi sayınız son 6 ayda istikrarlı bir şekilde arttı mı?' }, { id: 'q1_4', section: 1, text: 'Paylaşımlarınız etkileşim alıyor mu (beğeni, yorum, paylaşım)?' }, { id: 'q1_5', section: 1, text: 'Hedef kitlenizi tanıyarak içerik üretiyor musunuz?' }, { id: 'q1_6', section: 1, text: 'Story, reels ve canlı yayın gibi farklı içerik formatlarını kullanıyor musunuz?' }, { id: 'q1_7', section: 1, text: 'Sosyal medyada gelen yorumlara ve mesajlara ne kadar hızlı yanıt veriyorsunuz?' }, { id: 'q1_8', section: 1, text: 'İçerik takvimi oluşturup gönderileri önceden planlıyor musunuz?' }, { id: 'q1_9', section: 1, text: 'Rakiplerinizin sosyal medya stratejilerini analiz ediyor musunuz?' }, { id: 'q1_10', section: 1, text: 'Sosyal medya için dış kaynak ya da ajans desteği alıyor musunuz?' },
    { id: 'q2_1', section: 2, text: 'Google Benim İşletmem (GBP) profiliniz var mı?' }, { id: 'q2_2', section: 2, text: 'GBP profilinizde adres, telefon ve açık saatler eksiksiz mi?' }, { id: 'q2_3', section: 2, text: 'GBP üzerinde sık sık içerik (fotoğraf, gönderi) paylaşıyor musunuz?' }, { id: 'q2_4', section: 2, text: 'Harita konumunuz doğru mu?' }, { id: 'q2_5', section: 2, text: 'Müşterilerden düzenli olarak Google yorumu alıyor musunuz?' }, { id: 'q2_6', section: 2, text: 'Gelen yorumlara yanıt veriyor musunuz?' }, { id: 'q2_7', section: 2, text: 'İşletmeniz yerel dizinlerde ve haritalarda listelenmiş mi?' }, { id: 'q2_8', section: 2, text: '“Yakınımdaki [ürün/hizmet]” gibi aramalarda çıkıyor musunuz?' }, { id: 'q2_9', section: 2, text: 'GBP verilerini (gösterim, tıklama vs.) analiz ediyor musunuz?' }, { id: 'q2_10', section: 2, text: 'Yerel anahtar kelimelere yönelik stratejiniz var mı?' },
    { id: 'q3_1', section: 3, text: 'Meta (Facebook/Instagram) reklamları yürütüyor musunuz?' }, { id: 'q3_2', section: 3, text: 'Google Ads kampanyaları aktif mi?' }, { id: 'q3_3', section: 3, text: 'Hedef kitle tanımlarınız net mi?' }, { id: 'q3_4', section: 3, text: 'Reklam kampanyalarınızı segmentlere ayırıyor musunuz?' }, { id: 'q3_5', section: 3, text: 'A/B testleri yapıyor musunuz?' }, { id: 'q3_6', section: 3, text: 'Reklamlarda dönüşüm hedefi belirliyor musunuz?' }, { id: 'q3_7', section: 3, text: 'Reklam bütçenizi veriye göre optimize ediyor musunuz?' }, { id: 'q3_8', section: 3, text: 'Farklı reklam formatları (video, carousel, lead form) kullanıyor musunuz?' }, { id: 'q3_9', section: 3, text: 'Dönüşüm takibi yapabiliyor musunuz (pixel, GA)?' }, { id: 'q3_10', section: 3, text: 'Reklam performans raporlarını haftalık/aylık inceliyor musunuz?' },
    { id: 'q4_1', section: 4, text: 'Web sitenizde blog içerikleri yayınlıyor musunuz?' }, { id: 'q4_2', section: 4, text: 'İçerikleriniz belirli bir stratejiye göre mı hazırlanıyor?' }, { id: 'q4_3', section: 4, text: 'İçeriklerinizin hedef kitlenizin sorunlarına çözüm sunduğunu düşünüyor musunuz?' }, { id: 'q4_4', section: 4, text: 'Videolu içerikler üretiyor musunuz?' }, { id: 'q4_5', section: 4, text: 'İçeriklerinizde anahtar kelime optimizasyonu yapıyor musunuz?' }, { id: 'q4_6', section: 4, text: 'İçerikleriniz ne sıklıkta güncelleniyor?' }, { id: 'q4_7', section: 4, text: 'İçeriğiniz sosyal medya ve e-posta ile destekleniyor mı?' }, { id: 'q4_8', section: 4, text: 'İçeriklerinizin performansını ölçüyor musunuz (okunma süresi, hemen çıkma vs.)?' }, { id: 'q4_9', section: 4, text: 'Blog yazılarında görsel, infografik gibi unsurlar kullanıyor musunuz?' }, { id: 'q4_10', section: 4, text: 'İçerik üretimi için profesyonel destek alıyor musunuz?' },
    { id: 'q5_1', section: 5, text: 'Hangi pazarlama otomasyon araçlarını kullanıyorsunuz?' }, { id: 'q5_2', section: 5, text: 'E-posta pazarlaması yapıyor musunuz?' }, { id: 'q5_3', section: 5, text: 'E-posta listenizi segmentlere ayırıyor musunuz?' }, { id: 'q5_4', section: 5, text: 'Google Analytics veya benzeri araçlarla sitenizi analiz ediyor musunuz?' }, { id: 'q5_5', section: 5, text: 'Ziyaretçi davranışlarını analiz etmek için bir sisteminiz var mı?' }, { id: 'q5_6', section: 5, text: 'Sosyal medya zamanlayıcı araçlar (Buffer, Meta Planner vb.) kullanıyor musunuz?' }, { id: 'q5_7', section: 5, text: 'CRM veya müşteri yönetim sistemi kullanıyor musunuz?' }, { id: 'q5_8', section: 5, text: 'Pazarlama performansınızı raporlayan otomatik sistemler var mı?' }, { id: 'q5_9', section: 5, text: 'Online formlarınızdan gelen verileri merkezi bir yerde topluyor musunuz?' }, { id: 'q5_10', section: 5, text: 'Dijital pazarlama süreçlerinin tümünü bir sistem dahilinde takip ediyor musunuz?' },
];
const getSectionTitle = (sectionNum) => {
    const titles = { 1: 'Sosyal Medya Yönetimi', 2: 'Yerel SEO ve Google Benim İşletmem', 3: 'Reklam ve Kampanya Yönetimi', 4: 'İçerik Pazarlaması', 5: 'Pazarlama Araçları ve Otomasyon' };
    return titles[sectionNum] || '';
};

// Ana Netlify fonksiyonu
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { scores, quizAnswers, userInfo } = JSON.parse(event.body);
        const { totalScore, totalMaxScore, sectionScores, sectionMaxScores } = scores;

        // 1. OpenAI ile Kısa Tavsiye Oluşturma
        const percentage = (totalScore / totalMaxScore) * 100;
        let performanceLevel = "orta";
        if (percentage < 40) performanceLevel = "geliştirilmesi gereken";
        else if (percentage >= 75) performanceLevel = "güçlü";

        const advicePrompt = `Bir kullanıcı, dijital pazarlama testinden 100 üzerinden ${Math.round(percentage)} puan aldı. Bu, '${performanceLevel}' bir skordur. Bu kullanıcıya, skorunu dikkate alarak, tek cümlelik, motive edici ve aksiyona yönelik bir tavsiye ver. Tavsiyende, METRIQ360'ın sunduğu bir hizmete veya IQ360 yaklaşımına atıfta bulunarak onlarla iletişime geçmeye teşvik et. Her seferinde farklı ve yaratıcı bir tavsiye oluştur.`;
        
        const adviceCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: advicePrompt }],
            max_tokens: 150,
            temperature: 0.8,
        });
        const shortAdvice = adviceCompletion.choices[0].message.content.trim();

        // 2. OpenAI ile Detaylı Rapor Oluşturma
        const strongSections = [], weakSections = [];
        Object.keys(sectionScores).forEach(sectionNum => {
            const sectionPercentage = (sectionScores[sectionNum] / sectionMaxScores[sectionNum]) * 100;
            if (sectionPercentage >= 70) strongSections.push(getSectionTitle(parseInt(sectionNum)));
            else if (sectionPercentage <= 40) weakSections.push(getSectionTitle(parseInt(sectionNum)));
        });

        const testResultsDetails = Object.keys(sectionScores).map(sectionNum => {
            const sectionTitle = getSectionTitle(parseInt(sectionNum));
            const questionsForSection = allQuestions.filter(q => q.section === parseInt(sectionNum));
            const questionDetails = questionsForSection.map(q => `- Soru: ${q.text} | Verilen Puan: ${quizAnswers[q.id] || 0}/5`).join('\n');
            return `**${sectionTitle}**\n${questionDetails}`;
        }).join('\n\n');

        const reportPrompt = `Sen bir dijital pazarlama uzmanısın, METRIQ360 için sektör bazlı, veri odaklı ve sonuç getiren raporlar hazırlıyorsun...\n\nKullanıcı:\nAd: ${userInfo.name} ${userInfo.surname}\nSektör: ${userInfo.sector}\nGenel Puan: ${totalScore} / ${totalMaxScore}\nGüçlü Yönler: ${strongSections.join(', ') || 'Belirgin bir güçlü yön tespit edilemedi.'}\nZayıf Yönler: ${weakSections.join(', ') || 'Belirgin bir zayıf yön tespit edilemedi.'}\n\nTest Sonuçları Detayları:\n${testResultsDetails}\n\n---`;
        
        const reportCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: reportPrompt }],
            max_tokens: 1500,
        });
        const detailedReport = reportCompletion.choices[0].message.content;

        // 3. SendGrid ile E-postaları Gönderme
        const reportHtml = detailedReport.replace(/\n/g, '<br>');
        const msgToUser = {
            to: userInfo.email,
            from: 'iletisim@metriq360.com', // SendGrid'de doğruladığınız adres
            subject: `🚀 Dijital Pazarlama Sağlık Testi Raporunuz, ${userInfo.name}!`,
            html: `<h2>Merhaba ${userInfo.name},</h2><p>Testi tamamladığınız için teşekkürler! Aşağıda sizin için özel olarak hazırlanan raporu bulabilirsiniz:</p><hr>${reportHtml}`,
        };
        const msgToAdmin = {
            to: 'bilgi@metriq360.com',
            from: 'iletisim@metriq360.com', // SendGrid'de doğruladığınız adres
            subject: `Yeni Test Tamamlandı: ${userInfo.name} ${userInfo.surname}`,
            html: `<h2>Yeni test sonucu:</h2><p><strong>Kullanıcı:</strong> ${userInfo.name} ${userInfo.surname}</p><p><strong>E-posta:</strong> ${userInfo.email}</p><p><strong>Sektör:</strong> ${userInfo.sector}</p><p><strong>Puan:</strong> ${totalScore} / ${totalMaxScore}</p><hr><h3>Oluşturulan Rapor:</h3>${reportHtml}`,
        };
        
        await sgMail.send(msgToUser);
        await sgMail.send(msgToAdmin);

        // 4. Başarılı yanıtı ön yüze gönder
        return {
            statusCode: 200,
            body: JSON.stringify({ shortAdvice, detailedReport }),
        };

    } catch (error) {
        console.error("Netlify Fonksiyonu Hatası:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Sunucuda bilinmeyen bir hata oluştu.' }),
        };
    }
};
