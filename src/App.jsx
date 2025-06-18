/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

// Firebase ve Uygulama ID'si için global değişkenler (Canvas tarafından sağlanır)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyC-dummy-local-api-key",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890abcdef",
      measurementId: "G-XXXXXXXXXX"
    };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Test soruları ve bölüm başlıkları
const allQuestions = [
    // Bölüm 1: Sosyal Medya Yönetimi
    { id: 'q1_1', section: 1, text: 'Sosyal medya hesaplarınızda ne sıklıkla paylaşım yapıyorsunuz?' },
    { id: 'q1_2', section: 1, text: 'Her platform için ayrı bir strateji uyguluyor musunuz?' },
    { id: 'q1_3', section: 1, text: 'Takipçi sayınız son 6 ayda istikrarlı bir şekilde arttı mı?' },
    { id: 'q1_4', section: 1, text: 'Paylaşımlarınız etkileşim alıyor mu (beğeni, yorum, paylaşım)?' },
    { id: 'q1_5', section: 1, text: 'Hedef kitlenizi tanıyarak içerik üretiyor musunuz?' },
    { id: 'q1_6', section: 1, text: 'Story, reels ve canlı yayın gibi farklı içerik formatlarını kullanıyor musunuz?' },
    { id: 'q1_7', section: 1, text: 'Sosyal medyada gelen yorumlara ve mesajlara ne kadar hızlı yanıt veriyorsunuz?' },
    { id: 'q1_8', section: 1, text: 'İçerik takvimi oluşturup gönderileri önceden planlıyor musunuz?' },
    { id: 'q1_9', section: 1, text: 'Rakiplerinizin sosyal medya stratejilerini analiz ediyor musunuz?' },
    { id: 'q1_10', section: 1, text: 'Sosyal medya için dış kaynak ya da ajans desteği alıyor musunuz?' },

    // Bölüm 2: Yerel SEO ve Google Benim İşletmem
    { id: 'q2_1', section: 2, text: 'Google Benim İşletmem (GBP) profiliniz var mı?' },
    { id: 'q2_2', section: 2, text: 'GBP profilinizde adres, telefon ve açık saatler eksiksiz mi?' },
    { id: 'q2_3', section: 2, text: 'GBP üzerinde sık sık içerik (fotoğraf, gönderi) paylaşıyor musunuz?' },
    { id: 'q2_4', section: 2, text: 'Harita konumunuz doğru mu?' },
    { id: 'q2_5', section: 2, text: 'Müşterilerden düzenli olarak Google yorumu alıyor musunuz?' },
    { id: 'q2_6', section: 2, text: 'Gelen yorumlara yanıt veriyor musunuz?' },
    { id: 'q2_7', section: 2, text: 'İşletmeniz yerel dizinlerde ve haritalarda listelenmiş mi?' },
    { id: 'q2_8', section: 2, text: '“Yakınımdaki [ürün/hizmet]” gibi aramalarda çıkıyor musunuz?' },
    { id: 'q2_9', section: 2, text: 'GBP verilerini (gösterim, tıklama vs.) analiz ediyor musunuz?' },
    { id: 'q2_10', section: 2, text: 'Yerel anahtar kelimelere yönelik stratejiniz var mı?' },

    // Bölüm 3: Reklam ve Kampanya Yönetimi
    { id: 'q3_1', section: 3, text: 'Meta (Facebook/Instagram) reklamları yürütüyor musunuz?' },
    { id: 'q3_2', section: 3, text: 'Google Ads kampanyaları aktif mi?' },
    { id: 'q3_3', section: 3, text: 'Hedef kitle tanımlarınız net mi?' },
    { id: 'q3_4', section: 3, text: 'Reklam kampanyalarınızı segmentlere ayırıyor musunuz?' },
    { id: 'q3_5', section: 3, text: 'A/B testleri yapıyor musunuz?' },
    { id: 'q3_6', section: 3, text: 'Reklamlarda dönüşüm hedefi belirliyor musunuz?' },
    { id: 'q3_7', section: 3, text: 'Reklam bütçenizi veriye göre optimize ediyor musunuz?' },
    { id: 'q3_8', section: 3, text: 'Farklı reklam formatları (video, carousel, lead form) kullanıyor musunuz?' },
    { id: 'q3_9', section: 3, text: 'Dönüşüm takibi yapabiliyor musunuz (pixel, GA)?' },
    { id: 'q3_10', section: 3, text: 'Reklam performans raporlarını haftalık/aylık inceliyor musunuz?' },

    // Bölüm 4: İçerik Pazarlaması
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

    // Bölüm 5: Pazarlama Araçları ve Otomasyon
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

// Metriq360 Paket Bilgileri ve URL'ler
const metriq360Info = {
    websiteUrl: 'https://www.metriq360.com',
    contactEmail: 'bilgi@metriq360.com', // Admin e-postası
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

// GÜNCELLENMİŞ İLETİŞİM FORMU BİLEŞENİ
function FeedbackForm({ userInfo, overallScore, overallMaxScore }) {
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('message', feedback);
        // Geri bildirime bağlam eklemek için gizli alanlar
        formData.append('name', `${userInfo.name} ${userInfo.surname}` || 'Bilinmiyor');
        formData.append('email', userInfo.email || 'Bilinmiyor');
        formData.append('sector', userInfo.sector || 'Bilinmiyor');
        formData.append('score', `${overallScore}/${overallMaxScore}`);


        try {
            // ÖNEMLİ: 'YOUR_FORM_ID' kısmını kendi Formspree form ID'niz ile değiştirin!
            // Formspree.io adresinden ücretsiz bir hesap oluşturup yeni bir form yaratabilirsiniz.
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                throw new Error('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center text-green-700 font-semibold p-4 bg-green-100 border border-green-200 rounded-lg">
                <p>Mesajınız için teşekkürler! Bize ulaştı. 🚀</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Bizimle İletişime Geçin</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    name="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Test sonuçlarınız, dijital pazarlama ihtiyaçlarınız veya herhangi bir konuda bize mesaj gönderin..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out min-h-[100px]"
                    required
                />
                <button
                    type="submit"
                    disabled={feedback.trim() === '' || isSubmitting}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
                {error && <p className="text-red-500 text-center mt-3">{error}</p>}
            </form>
        </div>
    );
}


function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '' });
    const [currentStep, setCurrentStep] = useState('form'); // 'form', 'quiz-select', 'quiz', 'results'
    const [selectedSections, setSelectedSections] = useState([]);
    const [answers, setAnswers] = useState({});
    const [overallScore, setOverallScore] = useState(0);
    const [overallMaxScore, setOverallMaxScore] = useState(0);
    const [sectionScores, setSectionScores] = useState({});
    const [sectionMaxScores, setSectionMaxScores] = useState({});
    const [shortAdvice, setShortAdvice] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportData, setReportData] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Firebase Başlatma ve Kimlik Doğrulama
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            onAuthStateChanged(authInstance, async (firebaseUser) => {
                if (firebaseUser) {
                    setUserId(firebaseUser.uid);
                } else {
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(authInstance, initialAuthToken);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (e) {
                        console.error("Firebase authentication error:", e);
                        setError("Kimlik doğrulama başarısız oldu. Lütfen tekrar deneyin.");
                    }
                }
                setLoading(false);
            });
        } catch (e) {
            console.error("Firebase initialization error:", e);
            setError("Uygulama başlatılırken bir sorun oluştu.");
            setLoading(false);
        }
    }, []);

    const handleUserFormSubmit = (e) => {
        e.preventDefault();
        if (!user.name || !user.surname || !user.sector || !user.email) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }
        setError('');
        setCurrentStep('quiz-select');
    };

    const handleSectionToggle = (sectionNum) => {
        setSelectedSections(prevSelectedSections => {
            if (prevSelectedSections.includes(sectionNum)) {
                return prevSelectedSections.filter(section => section !== sectionNum);
            } else {
                return [...prevSelectedSections, sectionNum].sort((a, b) => a - b);
            }
        });
    };

    const startQuiz = () => {
        if (selectedSections.length === 0) {
            setError('Lütfen en az bir test bölümü seçin.');
            return;
        }
        setError('');
        const initialAnswers = {};
        allQuestions.filter(q => selectedSections.includes(q.section)).forEach(q => {
            initialAnswers[q.id] = 0;
        });
        setAnswers(initialAnswers);
        setCurrentStep('quiz');
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: parseInt(value)
        }));
    };
    
    // Puanları hem genel hem de bölüm bazında hesaplayan fonksiyon
    const calculateScore = () => {
        let totalScore = 0;
        let totalMaxScore = 0;
        const currentSectionScores = {};
        const currentSectionMaxScores = {};

        selectedSections.forEach(sectionNum => {
            let sectionCurrentScore = 0;
            const questionsForSection = allQuestions.filter(q => q.section === sectionNum);
            const sectionMaximumScore = questionsForSection.length * 5;

            questionsForSection.forEach(q => {
                sectionCurrentScore += answers[q.id] || 0;
            });

            currentSectionScores[sectionNum] = sectionCurrentScore;
            currentSectionMaxScores[sectionNum] = sectionMaximumScore;
            totalScore += sectionCurrentScore;
            totalMaxScore += sectionMaximumScore;
        });

        return { totalScore, totalMaxScore, sectionScores: currentSectionScores, sectionMaxScores: currentSectionMaxScores };
    };

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

    // OpenAI API ile kısa tavsiye üreten fonksiyon
    const generateShortAdvice = async (currentScore, maxPossibleScore) => {
        setShortAdvice('Tavsiye oluşturuluyor...');
        const prompt = `Dijital pazarlama testinde ${maxPossibleScore} üzerinden ${currentScore} puan alan bir kullanıcıya kısa ve faydalı bir tavsiye ver. Puanı göz önüne alarak, Metriq360'ın dijital pazarlama hizmetlerinden faydalanmanın önemini vurgula ve onlarla iletişime geçmeye teşvik et. Tavsiye tek cümlelik olsun. Özellikle Metriq360'ın IQ360 Sistemi ve Turuncu Güç konseptlerine veya ilgili paketlerine (IQ Sosyal Büyüme, IQ Reklam Master, IQ Yerel Güç) atıfta bulun.`;

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Netlify ortam değişkeninden al
            const apiUrl = 'https://api.openai.com/v1/chat/completions';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 100
                })
            });

            const result = await response.json();
            if (result.choices && result.choices.length > 0 && result.choices[0].message) {
                const text = result.choices[0].message.content;
                setShortAdvice(text);
            } else {
                setShortAdvice('Tavsiye alınamadı. Lütfen API anahtarınızı ve yapılandırmanızı kontrol edin.');
                console.error("OpenAI API'den beklenmeyen yanıt:", result);
            }
        } catch (apiError) {
            console.error("OpenAI API hatası:", apiError);
            setShortAdvice('Tavsiye oluşturulurken bir hata oluştu.');
        }
    };

    // OpenAI API ile rapor üreten ve e-posta gönderen fonksiyon
    const generateDetailedReportAndSendEmails = async (overallScore, overallMaxScore, sectionScores, sectionMaxScores, quizAnswers, userInfo) => {
        setReportLoading(true);
        setReportData('Detaylı rapor oluşturuluyor...');

        const strongSections = [], weakSections = [];
        selectedSections.forEach(sectionNum => {
            const percentage = (sectionScores[sectionNum] / sectionMaxScores[sectionNum]) * 100;
            if (percentage >= 70) strongSections.push(getSectionTitle(sectionNum));
            else if (percentage <= 40) weakSections.push(getSectionTitle(sectionNum));
        });
        const strongPointsText = strongSections.length > 0 ? strongSections.join(', ') : 'Belirgin bir güçlü yön tespit edilemedi.';
        const weakPointsText = weakSections.length > 0 ? weakSections.join(', ') : 'Belirgin bir zayıf yön tespit edilemedi.';

        const prompt = `Sen bir dijital pazarlama uzmanısın, METRIQ360 için özelleşmiş raporlar hazırlıyorsun...\n\nKullanıcı:\nAd: ${userInfo.name} ${userInfo.surname}\nSektör: ${userInfo.sector}\nGenel Puan: ${overallScore} / ${overallMaxScore}\nGüçlü Yönler: ${strongPointsText}\nZayıf Yönler: ${weakPointsText}\n\n--- \nİletişim:\n🌐 ${metriq360Info.websiteUrl}\n✉️ ${metriq360Info.contactEmail}\n📞 +90 537 948 48 68\n---`;

        let generatedReport = 'Rapor oluşturulamadı. Lütfen API anahtarınızı ve yapılandırmanızı kontrol edin.';

        try {
            // OpenAI ile raporu oluştur
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const apiUrl = 'https://api.openai.com/v1/chat/completions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1000
                })
            });
            const result = await response.json();
            if (result.choices && result.choices.length > 0) {
                generatedReport = result.choices[0].message.content;
            } else {
                console.error("OpenAI API'den beklenmeyen yanıt:", result);
            }
        } catch (apiError) {
            console.error("OpenAI API rapor hatası:", apiError);
        }
        
        setReportData(generatedReport);
        setReportLoading(false); // Rapor göründükten sonra loading'i kapat

        // Firestore'a kaydet
        if (db && userId) {
            const dataToSave = {
                userId, timestamp: new Date(), userInfo: user, selectedSections, answers,
                overallScore, overallMaxScore, sectionScores, sectionMaxScores,
                shortAdvice: shortAdvice, detailedReport: generatedReport
            };
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/quizzes`), dataToSave);
            // Public data
            const publicData = {
                userId, timestamp: new Date(), userInfo: { name: userInfo.name, sector: userInfo.sector },
                selectedSections, overallScore, overallMaxScore,
                detailedReportSnippet: generatedReport.substring(0, 500) + '...'
            };
            await addDoc(collection(db, `artifacts/${appId}/public/data/quizzes`), publicData);
            console.log("Veriler Firestore'a kaydedildi.");
        }

        // SendGrid ile e-posta gönder (Netlify Function üzerinden)
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: userInfo.email,
                    userName: `${userInfo.name} ${userInfo.surname}`,
                    adminEmail: metriq360Info.contactEmail,
                    reportContent: generatedReport,
                    userInfoForAdmin: { ...userInfo, overallScore, overallMaxScore }
                })
            });
            console.log("E-posta gönderme isteği başarıyla yapıldı.");
        } catch (emailError) {
            console.error("E-posta gönderme fonksiyonu hatası:", emailError);
        }
    };

    const handleSubmitQuiz = async () => {
        const { totalScore, totalMaxScore, sectionScores, sectionMaxScores } = calculateScore();
        setOverallScore(totalScore);
        setOverallMaxScore(totalMaxScore);
        setSectionScores(sectionScores);
        setSectionMaxScores(sectionMaxScores);
        setCurrentStep('results');
        await generateShortAdvice(totalScore, totalMaxScore);
        await generateDetailedReportAndSendEmails(totalScore, totalMaxScore, sectionScores, sectionMaxScores, answers, user);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-center text-lg font-semibold text-gray-700">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-500">
                {currentStep !== 'form' && (
                     <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">
                        Dijital Pazarlama Sağlık Testi
                    </h1>
                )}
               
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {userId && currentStep !== 'form' && (
                    <div className="text-sm text-center text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                        Kullanıcı ID: <span className="font-mono text-xs break-all">{userId}</span>
                    </div>
                )}

                {currentStep === 'form' && (
                    <>
                        <div className="text-center mb-6">
                             <h1 className="text-4xl font-extrabold text-blue-800 mb-3 tracking-tight">
                                🚀 Dijital Pazarlama Sağlık Testi’ne Hoş Geldiniz!
                            </h1>
                            <p className="text-lg text-gray-600">
                                İşletmenizin dijital gücünü test etmek için birkaç bilgi yeterli. Sonra başlayalım!
                            </p>
                        </div>
                        <form onSubmit={handleUserFormSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder="Adınızı girin"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={user.surname}
                                    onChange={(e) => setUser({ ...user, surname: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder="Soyadınızı girin"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sektörünüz</label>
                                <input
                                    type="text"
                                    id="sector"
                                    value={user.sector}
                                    onChange={(e) => setUser({ ...user, sector: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder="Ör: E-ticaret, Hizmet, Üretim"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresiniz</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder="ornek@eposta.com"
                                    required
                                />
                            </div>
                             <p className="text-xs text-center text-gray-500 mt-4">
                                🛡️ Bilgileriniz gizli tutulur. Sadece test sonucu ve özel öneriler için kullanılır.
                            </p>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Teste Başla
                            </button>
                        </form>
                    </>
                )}

                {currentStep === 'quiz-select' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Lütfen çözmek istediğiniz test bölümlerini seçin:</h2>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        {[1, 2, 3, 4, 5].map(sectionNum => (
                            <label key={sectionNum} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out">
                                <input
                                    type="checkbox"
                                    checked={selectedSections.includes(sectionNum)}
                                    onChange={() => handleSectionToggle(sectionNum)}
                                    className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-lg font-medium text-gray-800">
                                    Bölüm {sectionNum}: {getSectionTitle(sectionNum)}
                                </span>
                            </label>
                        ))}
                        <button
                            onClick={startQuiz}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
                        >
                            Seçilen Bölümlerle Teste Başla
                        </button>
                        <button
                                onClick={() => { setCurrentStep('form'); setSelectedSections([]); setError(''); }}
                                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 mt-2"
                        >
                                Geri Dön
                        </button>
                    </div>
                )}

                {currentStep === 'quiz' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                            Seçilen Bölümlerdeki Sorular:
                        </h2>
                        {selectedSections.map(sectionNum => (
                            <div key={`section-quiz-${sectionNum}`}>
                                <h3 className="text-xl font-bold text-purple-700 mb-3 mt-6">
                                    Bölüm {sectionNum}: {getSectionTitle(sectionNum)}
                                </h3>
                                {allQuestions
                                    .filter(q => q.section === sectionNum)
                                    .map((q, index) => (
                                        <div key={q.id} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200 mb-4">
                                            <p className="text-lg font-medium text-gray-800 mb-3">Soru {index + 1}. {q.text}</p>
                                            <div className="flex justify-between items-center space-x-2">
                                                {[1, 2, 3, 4, 5].map(value => (
                                                    <label key={value} className="flex flex-col items-center cursor-pointer text-gray-700">
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={value}
                                                            checked={answers[q.id] === value}
                                                            onChange={() => handleAnswerChange(q.id, value)}
                                                            className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                            required
                                                        />
                                                        <span className="mt-1 text-sm">{value}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                                <span>Hiç Yok/Çok Kötü</span>
                                                <span>Mükemmel/Çok İyi</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={() => setCurrentStep('quiz-select')}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                            >
                                Bölüm Seçimine Dön
                            </button>
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={
                                    allQuestions.filter(q => selectedSections.includes(q.section)).some(q => answers[q.id] === 0 || !answers[q.id])
                                }
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Testi Bitir ve Sonuçları Gör
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'results' && (
                    <div className="space-y-6 text-center">
                        <h2 className="text-3xl font-bold text-blue-700 mb-4">Test Sonuçlarınız</h2>
                        
                        <p className="text-2xl text-gray-800">
                            Genel Puanınız: <span className="font-extrabold text-blue-600">{overallScore}</span> / {overallMaxScore}
                        </p>
                        
                        {selectedSections.length > 1 && (
                          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 mt-6 text-left">
                              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Bölüm Bazlı Puanlar</h3>
                              <ul className="list-disc list-inside space-y-2">
                                  {selectedSections.map(sectionNum => (
                                      <li key={`section-score-${sectionNum}`} className="text-gray-700">
                                          <strong>{getSectionTitle(sectionNum)}:</strong> {sectionScores[sectionNum]} / {sectionMaxScores[sectionNum]}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
                            <h3 className="text-xl font-semibold text-blue-800 mb-3">Kısa Tavsiye</h3>
                            <p className="text-gray-700">{shortAdvice}</p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl shadow-inner border border-purple-200 mt-6">
                            <h3 className="text-xl font-semibold text-purple-800 mb-3">Detaylı Rapor ve Strateji</h3>
                            {reportLoading ? (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                    <p className="mt-4 text-gray-600">{reportData || 'Rapor oluşturuluyor...'}</p>
                                </div>
                            ) : (
                                <div className="text-left text-gray-700 prose max-w-none">
                                    <ReactMarkdown children={reportData} />
                                </div>
                            )}
                            {!reportLoading && !reportData && (
                               <p className="text-red-500">Rapor oluşturulamadı veya yüklenemedi. Lütfen tekrar deneyin.</p>
                            )}
                        </div>

                        <div className="text-gray-600 mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="font-bold text-lg">📩 Detaylı raporun yolda!</p>
                            <p>Kısa süre içinde test sonuçlarını ve özel tavsiyelerini içeren dijital raporun, e-posta adresine ({user.email}) gönderilecek. Gelen kutunu kontrol etmeyi unutma!</p>
                        </div>
                        
                        {/* GÜNCELLENMİŞ İLETİŞİM FORMU BURADA ÇAĞRILIYOR */}
                        <FeedbackForm userInfo={user} overallScore={overallScore} overallMaxScore={overallMaxScore} />

                        <button
                            onClick={() => {
                                setCurrentStep('form');
                                setSelectedSections([]);
                                setAnswers({});
                                setOverallScore(0);
                                setOverallMaxScore(0);
                                setSectionScores({});
                                setSectionMaxScores({});
                                setShortAdvice('');
                                setReportData('');
                                setUser({ name: '', surname: '', sector: '', email: '' });
                                setError('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
                        >
                            Yeni Bir Test Yap
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
