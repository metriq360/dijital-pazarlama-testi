import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "" }; 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const allQuestions = [
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance); setDb(dbInstance);
        const doAuth = async () => {
          if (initialAuthToken) await signInWithCustomToken(authInstance, initialAuthToken);
          else await signInAnonymously(authInstance);
        };
        await doAuth();
        onAuthStateChanged(authInstance, (firebaseUser) => {
          if (firebaseUser) setUserId(firebaseUser.uid);
          setLoading(false);
        });
      } catch (e) { console.error(e); setLoading(false); }
    };
    initFirebase();
  }, []);

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    if (!user.name || !user.surname || !user.sector || !user.email) {
      setError('Lütfen tüm alanları doldurun.'); return;
    }
    setError(''); setCurrentStep('quiz-select');
  };

  const handleSectionToggle = (num) => {
    setSelectedSections(prev => prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num].sort());
  };

  const startQuiz = () => {
    if (selectedSections.length === 0) { setError('En az bir alan seçmelisiniz.'); return; }
    setError(''); setAnswers({}); setCurrentStep('quiz');
  };

  const handleAnswerChange = (qId, val) => { setAnswers(prev => ({ ...prev, [qId]: val })); };

  const calculateScore = () => {
    let totalScore = 0, totalMaxScore = 0;
    const sScores = {}, sMaxScores = {};
    selectedSections.forEach(sectionNum => {
      let current = 0;
      const questions = allQuestions.filter(q => q.section === sectionNum);
      questions.forEach(q => { current += (answers[q.id] || 0); });
      sScores[sectionNum] = current; sMaxScores[sectionNum] = questions.length * 5;
      totalScore += current; totalMaxScore += questions.length * 5;
    });
    return { totalScore, totalMaxScore, sectionScores: sScores, sectionMaxScores: sMaxScores };
  };

  const handleSubmitQuiz = async () => {
    const scores = calculateScore();
    setOverallScore(scores.totalScore); setOverallMaxScore(scores.totalMaxScore);
    setSectionScores(scores.sectionScores); setSectionMaxScores(scores.sectionMaxScores);
    setCurrentStep('results'); setReportLoading(true); setError('');

    try {
      const baseUrl = window.location.origin === 'null' ? '' : window.location.origin;
      
      const reportResponse = await fetch(`${baseUrl}/.netlify/functions/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo: user, ...scores, selectedSections }),
      });
      if (!reportResponse.ok) throw new Error("AI Rapor Hatası");
      const reportResData = await reportResponse.json();
      setReportData(reportResData.detailedReport); setShortAdvice(reportResData.shortAdvice);

      setEmailStatus('Raporunuz e-postanıza gönderiliyor...');
      const emailResponse = await fetch(`${baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userInfo: user, report: reportResData.detailedReport, 
            scores, answers, selectedSections 
        }),
      });
      if (emailResponse.ok) setEmailStatus('Rapor e-postanıza başarıyla gönderildi!');
      else setEmailStatus('Rapor hazırlandı ancak e-posta servisinde bir hata oluştu.');

      if (db && userId) {
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'quizzes'), {
          timestamp: new Date(), userInfo: user, ...scores, detailedReport: reportResData.detailedReport
        });
      }
    } catch (err) { setError("Hata oluştu, lütfen tekrar deneyin."); }
    finally { setReportLoading(false); }
  };

  const resetApp = () => { setCurrentStep('form'); setUser({ name: '', surname: '', sector: '', email: '' }); setSelectedSections([]); setAnswers({}); setError(''); setEmailStatus(''); setReportData(''); };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans bg-white text-orange-500 font-black tracking-widest animate-pulse">METRIQ360 YÜKLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl border-t-8 border-orange-500 text-center">
        {/* LOGO: METRIQ360 - BÜYÜK HARF VE IQ VURGUSU */}
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase">
          METR<span className="text-orange-500 relative inline-block text-4xl md:text-6xl mx-1 italic">IQ<span className="absolute -bottom-1 left-0 w-full h-1.5 bg-orange-400 rounded-full"></span></span>360
        </h1>
        <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-[10px] md:text-xs">Dijital Pazarlama Sağlık Testi</p>
        
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border-l-4 border-red-500 font-bold text-left">{error}</div>}

        {currentStep === 'form' && (
          <form onSubmit={handleUserFormSubmit} className="space-y-4 text-left">
            <input type="text" placeholder="Adınız" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" required />
            <input type="text" placeholder="Soyadınız" value={user.surname} onChange={(e)=>setUser({...user, surname: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" required />
            <input type="text" placeholder="Sektörünüz" value={user.sector} onChange={(e)=>setUser({...user, sector: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" required />
            <input type="email" placeholder="E-posta Adresiniz" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition" required />
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 uppercase tracking-widest">Teste Başla</button>
          </form>
        )}

        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Analiz Alanlarını Seçin</h2>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className="flex items-center p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-orange-300 cursor-pointer transition has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500">
                <input type="checkbox" checked={selectedSections.includes(num)} onChange={() => handleSectionToggle(num)} className="hidden" />
                <span className={`text-lg font-semibold ${selectedSections.includes(num) ? 'text-orange-600' : 'text-slate-700'}`}>{['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'][num]}</span>
              </label>
            ))}
            <button onClick={startQuiz} className="w-full bg-orange-500 text-white font-black py-4 rounded-xl mt-6 shadow-md hover:bg-orange-600 transition uppercase tracking-widest">Sorulara Geç</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-8 text-left">
            {selectedSections.map(sNum => (
              <div key={sNum} className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 border-b-2 border-orange-100 pb-2 uppercase tracking-tight">{['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'][sNum]}</h3>
                {allQuestions.filter(q => q.section === sNum).map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="font-bold text-slate-800 mb-4 text-sm">{idx + 1}. {q.text}</p>
                    <div className="flex justify-between gap-1 md:gap-2 text-center">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => handleAnswerChange(q.id, v)} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${answers[q.id] === v ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100 border'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={handleSubmitQuiz} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg transition uppercase tracking-widest">Analizi Tamamla</button>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="space-y-6 text-center">
            <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-inner">
              <h2 className="text-xs opacity-70 uppercase tracking-[0.3em] font-black mb-2">Dijital Sağlık Skoru</h2>
              <div className="text-6xl font-black">{overallScore} <span className="text-2xl opacity-40">/ {overallMaxScore}</span></div>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 italic font-bold text-orange-900 text-sm italic">
              "{shortAdvice || 'Analiz ediliyor...'}"
            </div>
            <div className="text-left bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2 underline decoration-orange-500 uppercase tracking-tighter italic">📍 Stratejik Ön Analiz</h3>
              {reportLoading ? (
                <div className="flex flex-col items-center py-10 opacity-50 text-sm font-bold animate-pulse italic text-orange-600 text-center w-full uppercase">Yapay Zeka firmanızı analiz ediyor...</div>
              ) : (
                <div className="prose prose-orange max-w-none text-slate-700 leading-relaxed text-sm md:text-base"><ReactMarkdown>{reportData || 'Rapor hazırlanamadı.'}</ReactMarkdown></div>
              )}
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-800 font-black text-[10px] border border-emerald-200 uppercase tracking-widest italic">{emailStatus}</div>
            <div className="bg-orange-500 p-8 rounded-3xl shadow-2xl border-4 border-white text-white">
              <h4 className="font-black text-2xl mb-2 uppercase italic">BİREBİR BÜYÜME ANALİZİ 📈</h4>
              <p className="text-orange-50 font-medium mb-6 text-sm">Gerçek büyüme motoru kurgusu için randevunuzu hemen oluşturun.</p>
              <a href="https://wa.me/905379484868?text=Merhaba, Dijital Pazarlama Sağlık Testimi tamamladım. Rapor verilerime göre birebir strateji analizi randevusu almak istiyorum." target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white text-orange-600 font-black py-4 px-6 rounded-2xl shadow-xl hover:bg-slate-100 transition transform hover:scale-105 uppercase tracking-widest text-sm">STRATEJİ RANDEVUSU AL</a>
            </div>
            <button onClick={resetApp} className="text-slate-400 font-bold hover:text-slate-600 transition underline text-xs decoration-orange-300">Yeni Test Başlat</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
