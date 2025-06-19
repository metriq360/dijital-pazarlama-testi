/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown'; // react-markdown kütüphanesi eklendi

// Firebase and App ID global variables (provided by Canvas)
// For local development, these variables will be undefined, so default/dummy values are assigned.
// In a live environment (Netlify, Firebase Hosting, etc.), Canvas or the deployment platform will provide the actual values.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyC-dummy-local-api-key", // This is a placeholder, not your actual Firebase API key.
      authDomain: "your-project-id.firebaseapp.com", // Dummy value for local testing
      projectId: "your-project-id", // Dummy value for local testing
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890abcdef",
      measurementId: "G-XXXXXXXXXX" // Dummy value for local testing
    };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Test questions and section titles
// This data will also be used within the Netlify Function.
const allQuestions = [
  // Section 1: Social Media Management
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

  // Section 2: Local SEO and Google My Business
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

  // Section 3: Advertising and Campaign Management
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

// Metriq360 Package Information and URLs
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


function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '' });
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'quiz-select', 'quiz', 'results'
  const [selectedSections, setSelectedSections] = useState([]); // Array to hold multiple selected sections
  const [answers, setAnswers] = useState({});
  const [overallScore, setOverallScore] = useState(0); // Overall score
  const [overallMaxScore, setOverallMaxScore] = useState(0); // Overall maximum score
  const [shortAdvice, setShortAdvice] = useState('');
  const [sectionScores, setSectionScores] = useState({}); // Score for each section
  const [sectionMaxScores, setSectionMaxScores] = useState({}); // Maximum score for each section
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Firebase Initialization and Authentication
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

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    if (!user.name || !user.surname || !user.sector || !user.email) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setError('');
    setCurrentStep('quiz-select'); // Go to quiz selection after form
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
    // Reset answers for the newly selected sections
    const initialAnswers = {};
    allQuestions.filter(q => selectedSections.includes(q.section)).forEach(q => {
      initialAnswers[q.id] = 0; // Default to 0 or null
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

  // Function to calculate scores for both overall and per section
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

  const handleSubmitQuiz = async () => {
    const { totalScore, totalMaxScore, sectionScores, sectionMaxScores } = calculateScore();
    setOverallScore(totalScore); // Set overall score
    setOverallMaxScore(totalMaxScore); // Set overall maximum score
    setSectionScores(sectionScores); // Set section scores
    setSectionMaxScores(sectionMaxScores); // Set section maximum scores
    setCurrentStep('results');
    setReportLoading(true);
    setReportData('Detaylı rapor oluşturuluyor ve e-posta gönderiliyor...');


    try {
      // API call to Netlify Function
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores: { totalScore, totalMaxScore, sectionScores, sectionMaxScores },
          quizAnswers: answers,
          userInfo: user,
          selectedSections: selectedSections,
          allQuestions: allQuestions, // Sending questions as well
          metriq360Info: metriq360Info // Sending Metriq360 info as well
        }),
      });

      const result = await response.json();
      console.log("Netlify Function'dan dönen tüm sonuç:", result); // *** NEW LOG ***
      console.log("Dönen shortAdvice:", result.shortAdvice);      // *** NEW LOG ***
      console.log("Dönen detailedReport:", result.detailedReport); // *** NEW LOG ***


      if (response.ok) {
        setShortAdvice(result.shortAdvice);
        setReportData(result.detailedReport);
        console.log("Response successfully received from Netlify Function.");

        // Saving to Firestore (this part can remain in App.jsx)
        if (db && userId) {
            const userQuizzesCollection = collection(db, `artifacts/${appId}/users/${userId}/quizzes`);
            await addDoc(userQuizzesCollection, {
                userId: userId,
                timestamp: new Date(),
                userInfo: user,
                selectedSections: selectedSections,
                answers: answers,
                overallScore: totalScore,
                overallMaxScore: totalMaxScore,
                sectionScores: sectionScores,
                sectionMaxScores: sectionMaxScores,
                shortAdvice: result.shortAdvice,
                detailedReport: result.detailedReport,
            });

            const publicQuizzesCollection = collection(db, `artifacts/${appId}/public/data/quizzes`);
            await addDoc(publicQuizzesCollection, {
                userId: userId,
                timestamp: new Date(),
                userInfo: {
                    name: user.name,
                    sector: user.sector,
                },
                selectedSections: selectedSections,
                overallScore: totalScore,
                overallMaxScore: totalMaxScore,
                detailedReportSnippet: result.detailedReport.substring(0, 500) + '...'
            });
            console.log("User and report data successfully saved to Firestore.");
        } else {
            console.error("Firestore or user ID not available, data could not be saved.");
        }

      } else {
        setError(result.error || 'Rapor oluşturma veya e-posta göndermede hata oluştu.');
        setReportData('Rapor oluşturulamadı veya yüklenemedi. Lütfen tekrar deneyin.');
        console.error("Netlify Function Error:", result.error);
      }
    } catch (apiError) {
      setError('Bağlantı hatası: Rapor oluşturulurken bir sorun oluştu.');
      setReportData('Rapor oluşturulamadı veya yüklenemedi. Lütfen tekrar deneyin.');
      console.error("Netlify Function call error:", apiError);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center text-lg font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  // Calculate overall score out of 100 for display
  const displayOverallScoreOutOf100 = overallMaxScore > 0 ? ((overallScore / overallMaxScore) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-500">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">
          Dijital Pazarlama Sağlık Testi
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {userId && (
            <div className="text-sm text-center text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                Kullanıcı ID: <span className="font-mono text-xs break-all">{userId}</span>
            </div>
        )}

        {currentStep === 'form' && (
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
                placeholder="örnek@eposta.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Teste Başla
            </button>
          </form>
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
                  .filter(q => selectedSections.includes(q.section))
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
                  allQuestions.filter(q => selectedSections.includes(q.section)).some(q => !answers[q.id])
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

            {/* Overall Score - displayed out of 100 */}
            <p className="text-2xl text-gray-800">
              Genel Puanınız: <span className="font-extrabold text-blue-600">{displayOverallScoreOutOf100}</span> / 100
            </p>

            {/* Section-based Scoring */}
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
                  <p className="mt-4 text-gray-600">{reportData}</p>
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

            {/* Kullanıcıya gösterilecek yeni mesaj */}
            <p className="text-gray-600 mt-6">
              Harika bir iş çıkardınız! 🚀 Dijital pazarlama testinizi tamamladığınız için teşekkür ederiz. Şimdi, dijital potansiyelinizi en üst düzeye çıkarmak için size özel detaylı bir rapor hazırlıyoruz. Bu kapsamlı analiz, **en kısa sürede e-posta adresinize (${user.email}) gönderilecektir.** Dijital yolculuğunuzda size rehberlik etmek için sabırsızlanıyoruz! ✨
            </p>

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

            {/* WhatsApp Contact Button */}
            <p className="text-gray-600 mt-6">
              Herhangi bir soru veya aklınıza takılan bir şey olursa lütfen aşağıdaki butondan bize ulaşın.
            </p>
            <a
              href={`https://wa.me/${metriq360Info.contactNumber.replace(/\s/g, '')}?text=Merhaba,%20bilgi%20almak%20istiyorum.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 mt-2"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.611-3.924-1.611-6.223 0-6.814 5.254-12.385 11.758-12.385 3.327 0 6.402 1.501 8.654 3.684 2.254 2.183 3.491 5.006 3.491 8.016 0 6.814-5.254 12.385-11.758 12.385-1.927 0-3.805-.443-5.49-1.218l-6.22 1.621zm10.748-23.363c-5.918 0-10.748 4.743-10.748 10.598 0 2.052.573 3.993 1.543 5.736l-1.054 3.864 3.957-1.03c1.677.925 3.627 1.458 5.679 1.458 5.918 0 10.748-4.743 10.748-10.598s-4.83-10.598-10.748-10.598zm5.556 12.162c-.096 0-.665-.306-.925-.407-.26-.1-.6-.151-.861.101-.26.251-.762.909-.933 1.092-.17.184-.341.207-.636.082-.295-.126-1.25-.461-2.38-1.474-.88-.795-1.468-1.761-1.638-2.052-.17-.29-.017-.449.095-.664.1-.215.421-.55.563-.824.14-.275.191-.479.286-.683.095-.205.048-.387-.024-.543-.072-.158-.665-1.597-.912-2.18-.247-.585-.494-.495-.665-.495-.171 0-.363-.024-.555-.024-.19 0-.494.072-.754.346-.26.275-.989.96-.989 2.333 0 1.373 1.018 2.697 1.169 2.871.15.176 1.996 3.092 4.83 4.218 2.834 1.127 3.424.908 4.032.842.607-.066 1.996-.816 2.277-1.52.28-.703.28-1.291.19-1.475-.095-.183-.26-.29-.556-.437z"/>
              </svg>
              WhatsApp ile İletişime Geç
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
