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

function App() {
  // --- State Management ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '' });
  const [currentStep, setCurrentStep] = useState('form');
  const [selectedSections, setSelectedSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const [overallMaxScore, setOverallMaxScore] = useState(0);
  const [sectionScores, setSectionScores] = useState({});
  const [sectionMaxScores, setSectionMaxScores] = useState({});
  const [shortAdvice, setShortAdvice] = useState('');
  const [reportData, setReportData] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

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
            console.error("Firebase auth error:", e);
            setError("Kimlik doğrulama başarısız oldu.");
          }
        }
        setIsAuthReady(true);
        setLoading(false);
      });
    } catch (e) {
      console.error("Firebase init error:", e);
      setError("Uygulama başlatılamadı.");
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
    setSelectedSections(prev => prev.includes(sectionNum) ? prev.filter(s => s !== sectionNum) : [...prev, sectionNum].sort());
  };

  const startQuiz = () => {
    if (selectedSections.length === 0) {
      setError('Lütfen en az bir test bölümü seçin.');
      return;
    }
    setError('');
    const initialAnswers = {};
    allQuestions.filter(q => selectedSections.includes(q.section)).forEach(q => {
      initialAnswers[q.id] = undefined;
    });
    setAnswers(initialAnswers);
    setCurrentStep('quiz');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  // --- Logic Functions ---
  const calculateScore = () => {
    let totalScore = 0, totalMaxScore = 0;
    const sScores = {}, sMaxScores = {};
    selectedSections.forEach(sectionNum => {
      let sectionCurrentScore = 0;
      const questions = allQuestions.filter(q => q.section === sectionNum);
      const sectionMaximumScore = questions.length * 5;
      questions.forEach(q => { sectionCurrentScore += answers[q.id] || 0; });
      sScores[sectionNum] = sectionCurrentScore;
      sMaxScores[sectionNum] = sectionMaximumScore;
      totalScore += sectionCurrentScore;
      totalMaxScore += sectionMaximumScore;
    });
    return { totalScore, totalMaxScore, sectionScores: sScores, sectionMaxScores: sMaxScores };
  };

  const getSectionTitle = (sectionNum) => {
    const titles = ['','Sosyal Medya Yönetimi','Yerel SEO ve Google Benim İşletmem','Reklam ve Kampanya Yönetimi','İçerik Pazarlaması','Pazarlama Araçları ve Otomasyon'];
    return titles[sectionNum] || '';
  };

  // --- Main Logic on Quiz Submission ---
  const handleSubmitQuiz = async () => {
    const scores = calculateScore();
    setOverallScore(scores.totalScore);
    setOverallMaxScore(scores.totalMaxScore);
    setSectionScores(scores.sectionScores);
    setSectionMaxScores(scores.sectionMaxScores);
    setCurrentStep('results');
    setReportLoading(true);
    setEmailStatus('');
    setShortAdvice('');
    setReportData('');

    try {
      // Call the secure Netlify function to generate reports
      const response = await fetch('/.netlify/functions/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo: user,
          ...scores,
          selectedSections
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const { detailedReport, shortAdvice } = await response.json();
      
      setReportData(detailedReport);
      setShortAdvice(shortAdvice);

      // Now send the generated report AND the raw data via email
      setEmailStatus('Rapor oluşturuldu, e-posta gönderiliyor...');
      const emailResponse = await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              userInfo: user, 
              report: detailedReport,
              scores: scores,
              answers: answers,
              selectedSections: selectedSections
          }),
      });

      if (emailResponse.ok) {
        setEmailStatus('Raporunuz e-posta adresinize başarıyla gönderildi!');
      } else {
        setEmailStatus('Rapor oluşturuldu ancak e-posta gönderilemedi.');
      }
      
      // Save data to Firestore
      if (db && userId) {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/quizzes`), {
          userId,
          timestamp: new Date(),
          userInfo: user,
          ...scores,
          answers,
          selectedSections,
          detailedReport,
          shortAdvice,
        });
      }

    } catch (err) {
      console.error("Error during report generation or email sending:", err);
      setError("Üzgünüz, rapor oluşturulurken veya gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
      setReportData("Rapor oluşturulamadı.");
      setShortAdvice("Tavsiye oluşturulamadı.");
    } finally {
      setReportLoading(false);
    }
  };
  
  const resetApp = () => {
      setCurrentStep('form');
      setSelectedSections([]);
      setAnswers({});
      setError('');
      setEmailStatus('');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg font-semibold">Yükleniyor...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-500">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">Dijital Pazarlama Sağlık Testi</h1>
        {error && <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        
        {currentStep === 'form' && (
          <form onSubmit={handleUserFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
              <input type="text" id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Adınızı girin" required />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
              <input type="text" id="surname" value={user.surname} onChange={(e) => setUser({ ...user, surname: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Soyadınızı girin" required />
            </div>
            <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sektörünüz</label>
                <input type="text" id="sector" value={user.sector} onChange={(e) => setUser({ ...user, sector: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ör: E-ticaret, Hizmet" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresiniz</label>
                <input type="email" id="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="ornek@eposta.com" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105">Teste Başla</button>
          </form>
        )}
        
        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Lütfen çözmek istediğiniz test bölümlerini seçin:</h2>
            {[1, 2, 3, 4, 5].map(sectionNum => (
              <label key={sectionNum} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 border-2 border-transparent has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400 transition">
                <input type="checkbox" checked={selectedSections.includes(sectionNum)} onChange={() => handleSectionToggle(sectionNum)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-lg font-medium text-gray-800">Bölüm {sectionNum}: {getSectionTitle(sectionNum)}</span>
              </label>
            ))}
            <button onClick={startQuiz} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 mt-6">Seçilen Bölümlerle Teste Başla</button>
            <button onClick={() => { setCurrentStep('form'); setSelectedSections([]); setError(''); }} className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition mt-2">Geri Dön</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Seçilen Bölümlerdeki Sorular:</h2>
            {selectedSections.map(sectionNum => (
              <div key={`section-quiz-${sectionNum}`}>
                <h3 className="text-xl font-bold text-purple-700 mb-3 mt-6">Bölüm {sectionNum}: {getSectionTitle(sectionNum)}</h3>
                {allQuestions.filter(q => q.section === sectionNum).map((q, index) => (
                  <div key={q.id} className="bg-gray-50 p-5 rounded-lg shadow-sm border mb-4">
                    <p className="text-lg font-medium text-gray-800 mb-3">Soru {index + 1}. {q.text}</p>
                    <div className="flex justify-between items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <label key={value} className="flex flex-col items-center cursor-pointer text-gray-700 p-2 rounded-md hover:bg-gray-200">
                          <input type="radio" name={q.id} value={value} checked={answers[q.id] === value} onChange={() => handleAnswerChange(q.id, value)} className="form-radio h-5 w-5 text-blue-600" required />
                          <span className="mt-1 text-sm font-medium">{value}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1"><span>Hiç Yok/Kötü</span><span>Mükemmel</span></div>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
              <button onClick={() => setCurrentStep('quiz-select')} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition">Bölüm Seçimine Dön</button>
              <button onClick={handleSubmitQuiz} disabled={allQuestions.filter(q => selectedSections.includes(q.section)).some(q => answers[q.id] === undefined)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">Testi Bitir ve Sonuçları Gör</button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Test Sonuçlarınız</h2>
            <p className="text-2xl text-gray-800">Genel Puanınız: <span className="font-extrabold text-blue-600">{overallScore}</span> / {overallMaxScore}</p>
            {selectedSections.length > 1 && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Bölüm Bazlı Puanlar</h3>
                <ul className="space-y-2">{selectedSections.map(sectionNum => (<li key={`section-score-${sectionNum}`} className="text-gray-700 flex justify-between"><strong>{getSectionTitle(sectionNum)}:</strong><span className="font-bold">{sectionScores[sectionNum]} / {sectionMaxScores[sectionNum]}</span></li>))}</ul>
              </div>
            )}
            <div className="bg-blue-50 p-6 rounded-xl shadow-inner border">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Hızlı Tavsiye</h3>
              <p className="text-gray-700 italic">{shortAdvice}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow-inner border mt-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Detaylı Rapor ve Stratejiniz</h3>
              {reportLoading && (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <p className="mt-4 text-gray-600">Raporunuz oluşturuluyor, lütfen bekleyin...</p>
                </div>
              )}
              {!reportLoading && (
                <div className="text-left text-gray-700 max-w-none prose prose-p:my-2 prose-h3:text-lg"><ReactMarkdown>{reportData}</ReactMarkdown></div>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-inner border mt-6">
                <p className="text-green-800 font-semibold">{emailStatus}</p>
            </div>
            <button onClick={resetApp} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition mt-6">Yeni Bir Test Yap</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
