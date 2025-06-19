// /netlify/functions/send-email.js

// Gerekli kütüphaneleri ES Module (import) syntax'ı ile çağır
import sgMail from '@sendgrid/mail';
import OpenAI from 'openai';

// API Anahtarlarını Netlify ortam değişkenlerinden güvenli bir şekilde al
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});

const getSectionTitle = (sectionNum, allQuestions) => {
    const titles = { 1: 'Sosyal Medya Yönetimi', 2: 'Yerel SEO ve Google Benim İşletmem', 3: 'Reklam ve Kampanya Yönetimi', 4: 'İçerik Pazarlaması', 5: 'Pazarlama Araçları ve Otomasyon' };
    return titles[sectionNum] || `Bölüm ${sectionNum}`;
};

// Ana Netlify fonksiyonunu "export" ile dışa aktar
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { scores, quizAnswers, userInfo, allQuestions } = JSON.parse(event.body);
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
            const title = getSectionTitle(parseInt(sectionNum), allQuestions);
            if (sectionPercentage >= 70) strongSections.push(title);
            else if (sectionPercentage <= 40) weakSections.push(title);
        });

        const testResultsDetails = Object.keys(sectionScores).map(sectionNum => {
            const sectionTitle = getSectionTitle(parseInt(sectionNum), allQuestions);
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
