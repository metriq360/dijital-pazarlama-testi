import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

// Firebase and App ID are provided by the Canvas environment.
// Default values are provided for local development.
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

// --- Test Questions and Section Titles ---
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
  { id: 'q3_4', section: 3, text: 'Reklam kampanyalarınıza segmentlere ayırıyor musunuz?' },
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
  { id: 'q4_7', section: 4, text: 'İçeriğiniz sosyal medya ve e-posta ile destekleniyor mu?' },
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

// --- Metriq360 Brand Information ---
const metriq360Info = {
  websiteUrl: 'https://www.metriq360.com',
  contactEmail: 'bilgi@metriq360.com',
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


function App() {
  // --- State Management ---
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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState(''); // E-posta durumu için yeni state

  // --- Firebase Initialization and Authentication ---
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
        setIsAuthReady(true);
        setLoading(false);
      });
    } catch (e) {
      console.error("Firebase initialization error:", e);
      setError("Uygulama başlatılırken bir sorun oluştu.");
      setLoading(false);
    }
  }, []);

  // --- UI Handlers ---
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
      initialAnswers[q.id] = undefined; // Use undefined for unanswered state
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

  // --- Logic Functions ---
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

  // --- Gemini API Integration for Short Advice ---
  const generateShortAdvice = async (currentScore, maxPossibleScore) => {
    setShortAdvice('Tavsiye oluşturuluyor...');
    const prompt = `Dijital pazarlama testinde ${maxPossibleScore} üzerinden ${currentScore} puan alan bir kullanıcıya tek cümlelik, kısa ve faydalı bir tavsiye ver. Metriq360'ın dijital pazarlama hizmetlerinin önemini vurgula ve onlarla iletişime geçmeye teşvik et. Metriq360'ın IQ360 Sistemi veya ilgili paketlerine (IQ Sosyal Büyüme, IQ Reklam Master, IQ Yerel Güç) atıfta bulunabilirsin.`;

    try {
      const apiKey = ""; // API key is handled by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 100,
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
        const text = result.candidates[0].content.parts[0].text;
        setShortAdvice(text);
        return text;
      } else {
        const errorText = 'Tavsiye alınamadı. Lütfen daha sonra tekrar deneyin.';
        setShortAdvice(errorText);
        console.error("Unexpected response from Gemini API for short advice:", result);
        return errorText;
      }
    } catch (apiError) {
      console.error("Gemini API error (short advice):", apiError);
      const errorText = 'Tavsiye oluşturulurken bir hata oluştu.';
      setShortAdvice(errorText);
      return errorText;
    }
  };

  // --- Gemini API Integration for Detailed Report ---
  const generateDetailedReport = async (overallScore, overallMaxScore, sectionScores, sectionMaxScores, userInfo) => {
    setReportLoading(true);
    setReportData(''); 

    const strongSections = [];
    const weakSections = [];
    selectedSections.forEach(sectionNum => {
      const percentage = (sectionScores[sectionNum] / sectionMaxScores[sectionNum]) * 100;
      if (percentage >= 70) strongSections.push(getSectionTitle(sectionNum));
      else if (percentage <= 40) weakSections.push(getSectionTitle(sectionNum));
    });

    const strongPointsText = strongSections.length > 0 ? strongSections.join(', ') : 'Belirgin bir güçlü yön tespit edilemedi.';
    const weakPointsText = weakSections.length > 0 ? weakSections.join(', ') : 'Belirgin bir zayıf yön tespit edilemedi.';

    const prompt = `Sen bir dijital pazarlama uzmanısın ve METRIQ360 için kişiselleştirilmiş raporlar hazırlıyorsun.
Aşağıdaki kullanıcı bilgileri ve Dijital Pazarlama Sağlık Testi sonuçlarına göre;
1. Kısa, öz, samimi ama profesyonel bir rapor yaz.
2. Güçlü ve zayıf yönleri net şekilde vurgula.
3. Gelişim için pratik, aksiyon odaklı öneriler ver.
4. En uygun METRIQ360 paketlerini öner (IQ Yerel Güç, IQ Sosyal Büyüme, IQ Reklam Master, IQ Süper İkili, IQ Zirve Paketi).
5. METRIQ360'ın IQ360 Sistemi ve “Turuncu Güç (Orange Boost)” yaklaşımına kısaca atıfta bulun.
6. Raporu emojilerle canlandır, ama aşırıya kaçma.
7. Teknik detay, tablo, ham skor veya karmaşık ifadeler kullanma.
8. Son olarak METRIQ360'ın iletişim bilgilerini ekle.

---
Kullanıcı Bilgileri:
Ad: ${userInfo.name} ${userInfo.surname}
Sektör: ${userInfo.sector}
Genel Puan: ${overallScore} / ${overallMaxScore}
Güçlü Yönler: ${strongPointsText}
Zayıf Yönler: ${weakPointsText}
---
İletişim Bilgileri:
🌐 ${metriq360Info.websiteUrl}
✉️ ${metriq360Info.contactEmail}
📞 +90 537 948 48 68
---`;

    try {
      const apiKey = ""; // API key is handled by the environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      let generatedReport = 'Rapor oluşturulamadı. Lütfen daha sonra tekrar deneyin.'; // Default error message
      
      // FIX: Add a robust check for valid, non-empty text from the API
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0].text) {
        const text = result.candidates[0].content.parts[0].text;
        if (text && text.trim().length > 0) {
            generatedReport = text;
        } else {
            console.error("Gemini API returned an empty string for the detailed report.");
            generatedReport = "Üzgünüz, yapay zeka bir rapor oluşturamadı. Bu durum genellikle anlık bir sorundan kaynaklanır. Lütfen daha sonra tekrar deneyin.";
        }
      } else {
        console.error("Unexpected response structure from Gemini API for detailed report:", result);
      }

      setReportData(generatedReport);
      return generatedReport;
    } catch (apiError) {
      console.error("Gemini API error (detailed report):", apiError);
      const errorText = 'Detaylı rapor oluşturulurken bir hata oluştu. Lütfen ağ bağlantınızı kontrol edin.';
      setReportData(errorText);
      return errorText;
    } finally {
      setReportLoading(false);
    }
  };

  // --- Quiz Submission and Data Handling ---
  const handleSubmitQuiz = async () => {
    const { totalScore, totalMaxScore, sectionScores: sScores, sectionMaxScores: sMaxScores } = calculateScore();
    setOverallScore(totalScore);
    setOverallMaxScore(totalMaxScore);
    setSectionScores(sScores);
    setSectionMaxScores(sMaxScores);
    setCurrentStep('results');
    setEmailStatus('Raporlar oluşturuluyor...');

    const finalShortAdvice = await generateShortAdvice(totalScore, totalMaxScore);
    const detailedReport = await generateDetailedReport(totalScore, totalMaxScore, sScores, sMaxScores, user);
    
    if (db && userId && detailedReport) {
      try {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/quizzes`), {
          userId: userId,
          timestamp: new Date(),
          userInfo: user,
          selectedSections,
          answers,
          overallScore: totalScore,
          overallMaxScore: totalMaxScore,
          sectionScores: sScores,
          sectionMaxScores: sMaxScores,
          shortAdvice: finalShortAdvice,
          detailedReport,
        });
        console.log("User data successfully saved to Firestore.");
      } catch (dbError) {
        console.error("Error saving data to Firestore:", dbError);
        setError("Sonuçlarınız kaydedilirken bir veritabanı hatası oluştu.");
      }
    }
    
    // The check 'if (detailedReport)' now correctly handles cases where the report might be an error string.
    if (detailedReport) {
        setEmailStatus('E-posta gönderiliyor...');
        try {
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userInfo: user,
                    report: detailedReport,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Email sent successfully:', result.message);
                setEmailStatus('Raporunuz e-posta adresinize başarıyla gönderildi!');
            } else {
                console.error('Failed to send email:', result.error);
                setEmailStatus(`E-posta gönderilemedi: ${result.error}`);
            }
        } catch (emailError) {
            console.error('Error calling send-email function:', emailError);
            setEmailStatus('E-posta gönderim servisine ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin.');
        }
    } else {
        setEmailStatus('Rapor oluşturulamadığı için e-posta gönderilemedi.');
    }
  };
  
  const resetApp = () => {
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
      setEmailStatus('');
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center text-lg font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-500">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">
          Dijital Pazarlama Sağlık Testi
        </h1>
        {error && <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        {userId && (
            <div className="text-sm text-center text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                Kullanıcı ID: <span className="font-mono text-xs break-all">{userId}</span>
            </div>
        )}

        {/* --- Step 1: User Info Form --- */}
        {currentStep === 'form' && (
          <form onSubmit={handleUserFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
              <input type="text" id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Adınızı girin" required />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
              <input type="text" id="surname" value={user.surname} onChange={(e) => setUser({ ...user, surname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Soyadınızı girin" required />
            </div>
            <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sektörünüz</label>
                <input type="text" id="sector" value={user.sector} onChange={(e) => setUser({ ...user, sector: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Ör: E-ticaret, Hizmet, Üretim" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresiniz</label>
                <input type="email" id="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="ornek@eposta.com" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Teste Başla
            </button>
          </form>
        )}

        {/* --- Step 2: Quiz Section Selection --- */}
        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Lütfen çözmek istediğiniz test bölümlerini seçin:</h2>
            {[1, 2, 3, 4, 5].map(sectionNum => (
              <label key={sectionNum} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 border-2 border-transparent has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400 transition">
                <input type="checkbox" checked={selectedSections.includes(sectionNum)} onChange={() => handleSectionToggle(sectionNum)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-lg font-medium text-gray-800">
                  Bölüm {sectionNum}: {getSectionTitle(sectionNum)}
                </span>
              </label>
            ))}
            <button onClick={startQuiz} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6">
              Seçilen Bölümlerle Teste Başla
            </button>
            <button onClick={() => { setCurrentStep('form'); setSelectedSections([]); setError(''); }} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 mt-2">
              Geri Dön
            </button>
          </div>
        )}

        {/* --- Step 3: The Quiz --- */}
        {currentStep === 'quiz' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Seçilen Bölümlerdeki Sorular:</h2>
            {selectedSections.map(sectionNum => (
              <div key={`section-quiz-${sectionNum}`}>
                <h3 className="text-xl font-bold text-purple-700 mb-3 mt-6">Bölüm {sectionNum}: {getSectionTitle(sectionNum)}</h3>
                {allQuestions.filter(q => q.section === sectionNum).map((q, index) => (
                  <div key={q.id} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200 mb-4">
                    <p className="text-lg font-medium text-gray-800 mb-3">Soru {index + 1}. {q.text}</p>
                    <div className="flex justify-between items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <label key={value} className="flex flex-col items-center cursor-pointer text-gray-700 p-2 rounded-md hover:bg-gray-200">
                          <input type="radio" name={q.id} value={value} checked={answers[q.id] === value} onChange={() => handleAnswerChange(q.id, value)} className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <span className="mt-1 text-sm font-medium">{value}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      <span>Hiç Yok/Kötü</span>
                      <span>Mükemmel</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
              <button onClick={() => setCurrentStep('quiz-select')} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105">
                Bölüm Seçimine Dön
              </button>
              <button onClick={handleSubmitQuiz} disabled={allQuestions.filter(q => selectedSections.includes(q.section)).some(q => answers[q.id] === undefined)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                Testi Bitir ve Sonuçları Gör
              </button>
            </div>
          </div>
        )}

        {/* --- Step 4: Results Display --- */}
        {currentStep === 'results' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Test Sonuçlarınız</h2>
            <p className="text-2xl text-gray-800">
              Genel Puanınız: <span className="font-extrabold text-blue-600">{overallScore}</span> / {overallMaxScore}
            </p>
            {selectedSections.length > 1 && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 mt-6 text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Bölüm Bazlı Puanlar</h3>
                <ul className="space-y-2">
                  {selectedSections.map(sectionNum => (
                    <li key={`section-score-${sectionNum}`} className="text-gray-700 flex justify-between">
                      <strong>{getSectionTitle(sectionNum)}:</strong> 
                      <span className="font-bold">{sectionScores[sectionNum]} / {sectionMaxScores[sectionNum]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Hızlı Tavsiye</h3>
              <p className="text-gray-700 italic">{shortAdvice}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow-inner border border-purple-200 mt-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Detaylı Rapor ve Stratejiniz</h3>
              {reportLoading && (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <p className="mt-4 text-gray-600">Detaylı raporunuz oluşturuluyor...</p>
                </div>
              )}
              {!reportLoading && reportData && (
                <div className="text-left text-gray-700 max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                      p: ({node, ...props}) => <p className="my-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    }}
                  >
                    {reportData}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-inner border border-green-200 mt-6">
                <p className="text-green-800 font-semibold">{emailStatus}</p>
            </div>
            <button onClick={resetApp} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6">
              Yeni Bir Test Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
