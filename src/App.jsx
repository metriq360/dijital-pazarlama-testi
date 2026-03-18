import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
const safeAppId = appId.replace(/\//g, '_'); // Firebase yolunda soruna yol açan eğik çizgileri engellemek için

const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- MÜHÜRLÜ TEŞEKKÜRLER SAYFASI LİNKİ ---
const THANK_YOU_PAGE_URL = "https://www.metriq360.tr/saglik-testi-tesekkur"; 

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
  { id: 'q5_5', section: 5, text: 'Ziyaretçi davranışlarını analiz etmek için bir systeminiz var mı?' },
  { id: 'q5_6', section: 5, text: 'Sosyal medya zamanlayıcı araçlar (Buffer, Meta Planner vb.) kullanıyor musunuz?' },
  { id: 'q5_7', section: 5, text: 'CRM veya müşteri yönetim sistemi kullanıyor musunuz?' },
  { id: 'q5_8', section: 5, text: 'Pazarlama performansınızı raporlayan otomatik sistemler var mı?' },
  { id: 'q5_9', section: 5, text: 'Online formlarınızdan gelen verileri merkezi bir yerde topluyor musunuz?' },
  { id: 'q5_10', section: 5, text: 'Dijital pazarlama süreçlerinin tümünü bir sistem dahilinde takip ediyor musunuz?' },
];

function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '', whatsapp: '' });
  const [currentStep, setCurrentStep] = useState('form');
  const [selectedSections, setSelectedSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [normalizedScore, setNormalizedScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('ANALİZİ TAMAMLA VE RAPORU AL');
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const branding = () => {
      document.title = "METRIQ360 | Dijital Sağlık Testi";
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.href = 'https://i.imgur.com/DMqrCwJ.png';
      document.getElementsByTagName('head')[0].appendChild(link);
    };
    branding();

    const initFirebase = async () => {
      if (!firebaseConfigStr) { setLoading(false); return; }
      try {
        const config = JSON.parse(firebaseConfigStr);
        const app = initializeApp(config);
        const auth = getAuth(app);
        const dbInstance = getFirestore(app);
        setDb(dbInstance);

        const initAuth = async () => {
          if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
          else await signInAnonymously(auth);
        };
        await initAuth();
        
        onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) setUserId(fbUser.uid);
          setLoading(false);
        });
      } catch (e) { 
        console.error("Firebase Init Error:", e);
        setLoading(false); 
      }
    };
    initFirebase();
  }, []);

  useEffect(() => {
    let interval;
    if (submitLoading) {
      const steps = [
        "Yapay Zeka Raporunuz Hazırlanıyor 🧠", 
        "Verileriniz Şifreleniyor 🔒", 
        "E-postanıza Gönderiliyor 📧", 
        "Şimdi Teşekkür Sayfasına Yönlendiriliyorsunuz... 🚀"
      ];
      let idx = 0; setLoadingText(steps[0]);
      interval = setInterval(() => { idx++; if (idx < steps.length) setLoadingText(steps[idx]); }, 1500);
    } else { setLoadingText('ANALİZİ TAMAMLA VE RAPORU AL'); }
    return () => clearInterval(interval);
  }, [submitLoading]);

  const getSectionTitle = (num) => {
    const titles = ['', 'Sosyal Medya', 'Yerel SEO', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'];
    return titles[num] || '';
  };

  const calculateScore = () => {
    let total = 0; let max = 0; const sScores = {}; const sMax = {};
    selectedSections.forEach(num => {
      let current = 0; const qs = allQuestions.filter(q => q.section === num);
      qs.forEach(q => { current += (answers[q.id] || 0); });
      sScores[num] = current; sMax[num] = qs.length * 5;
      total += current; max += qs.length * 5;
    });
    return { norm: max > 0 ? Math.round((total / max) * 100) : 0, sScores, sMax };
  };

  const submitData = async (skipWhatsapp = false) => {
    setError(''); 
    
    if (!skipWhatsapp) {
        const cleanNumber = user.whatsapp ? user.whatsapp.replace(/\D/g, '') : '';
        if (cleanNumber.length < 10) {
            setError("Lütfen geçerli bir WhatsApp numarası girin."); 
            setInputError(true);
            setTimeout(() => setInputError(false), 1000); 
            return; 
        }
    }
    
    setSubmitLoading(true);
    setShowPopup(true); 
    
    const result = calculateScore();
    const finalWhatsapp = skipWhatsapp ? "Paylaşılmadı" : user.whatsapp;

    try {
      const baseUrl = window.location.origin === 'null' ? '' : window.location.origin;
      let reportText = "Analiz uzmanımız tarafından hazırlanacaktır.";
      
      try {
        const res = await fetch(`${baseUrl}/.netlify/functions/generate-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInfo: user, totalScore: result.norm, answers, allQuestions, selectedSections }),
        });
        if (res.ok) { 
          const data = await res.json(); 
          reportText = data.detailedReport; 
        }
      } catch(e) {
        console.error("Report Generation Error:", e);
      }

      await fetch(`${baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userInfo: { ...user, whatsapp: finalWhatsapp }, 
            report: reportText, 
            scores: { totalScore: result.norm, sectionScores: result.sScores, sectionMaxScores: result.sMax }, 
            answers, 
            selectedSections 
        }),
      });

      if (db && userId) {
        try {
          await addDoc(collection(db, 'artifacts', safeAppId, 'users', userId, 'leads'), {
            timestamp: new Date(), 
            ...user, 
            whatsapp: finalWhatsapp, 
            score: result.norm, 
            answers, 
            report: reportText
          });
        } catch (fbErr) { 
          console.error("Database Save Error:", fbErr); 
        }
      }

      window.location.href = THANK_YOU_PAGE_URL;
      
    } catch (err) {
      setError(`Sistem Hatası: ${err.message}`);
      setSubmitLoading(false);
      setShowPopup(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-orange-500 font-black animate-pulse uppercase italic text-xl text-center p-10">
      Metriq360 Yükleniyor...
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border-t-[10px] border-orange-500 text-center relative overflow-hidden">
        
        {currentStep !== 'whatsapp-funnel' && (
            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 tracking-tight uppercase italic">METR<span className="text-orange-500">IQ</span>360</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">DİJİTAL PAZARLAMA SAĞLIK TESTİ</p>
            </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold text-sm border-l-4 border-red-500 text-left shadow-sm">
            🚨 {error}
          </div>
        )}

        {currentStep === 'form' && (
          <form onSubmit={(e)=>{e.preventDefault(); setCurrentStep('quiz-select')}} className="space-y-4 text-left">
            <input type="text" placeholder="Adınız" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Soyadınız" value={user.surname} onChange={(e)=>setUser({...user, surname: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Sektörünüz (Örn: Mobilya)" value={user.sector} onChange={(e)=>setUser({...user, sector: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="email" placeholder="E-posta Adresiniz" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <button type="submit" className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest hover:-translate-y-1 transition-transform">TESTİ BAŞLAT</button>
          </form>
        )}

        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-slate-800 italic">Analiz Alanlarını Seçin</h2>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition text-left ${selectedSections.includes(num) ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-transparent hover:border-orange-200'}`}>
                <input type="checkbox" checked={selectedSections.includes(num)} onChange={() => setSelectedSections(prev => prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num].sort())} className="hidden" />
                <span className={`text-lg font-bold ${selectedSections.includes(num) ? 'text-orange-600' : 'text-slate-500'}`}>
                  {getSectionTitle(num)}
                </span>
              </label>
            ))}
            <button onClick={() => selectedSections.length > 0 ? setCurrentStep('quiz') : setError('Lütfen en az bir alan seçin.')} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl mt-6 uppercase tracking-widest shadow-md">Sorulara Geç</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-8 text-left">
            {selectedSections.map(sNum => (
              <div key={sNum} className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 border-b-2 border-orange-100 pb-2 uppercase italic">
                  {getSectionTitle(sNum)}
                </h3>
                {allQuestions.filter(q => q.section === sNum).map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="font-bold text-slate-800 mb-4 text-sm">{idx + 1}. {q.text}</p>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setAnswers(prev => ({...prev, [q.id]: v}))} className={`flex-1 py-4 rounded-xl font-black text-sm transition ${answers[q.id] === v ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => { setNormalizedScore(calculateScore().norm); setCurrentStep('whatsapp-funnel'); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest">Testi Tamamla</button>
          </div>
        )}

        {currentStep === 'whatsapp-funnel' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500 text-center">
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl border-4 border-orange-500">
                <h2 className="text-2xl md:text-3xl font-black mb-2 italic uppercase">Analiziniz Hazır! 🚀</h2>
                <p className="text-orange-100 font-bold text-lg italic">Dijital Sağlık Puanınız: {normalizedScore} / 100</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-orange-200 shadow-xl text-left">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b-2 border-orange-100 pb-3 italic">Raporunuzu Nasıl Alacaksınız? 👇</h3>
                <ul className="space-y-6 text-sm font-medium">
                    <li className="flex gap-3">📧 <span><strong>1. E-posta Gönderiliyor:</strong> Hazırlanan dijital röntgen raporunuz an itibariyle <strong>{user.email}</strong> adresine iletilmektedir.</span></li>
                    <li className="flex gap-3 text-orange-600">📲 <span><strong>2. WhatsApp İletişim Garantisi:</strong> Mail servislerindeki gecikme riskine karşı, raporunuzun bir kopyası <strong>WhatsApp</strong> üzerinden yedek kanal olarak ulaştırılacaktır.</span></li>
                </ul>
            </div>

            <div className="bg-emerald-600 text-white rounded-[1.5rem] p-5 flex items-center gap-4 mt-8 shadow-md text-left">
                <div className="flex-shrink-0 bg-emerald-500/50 p-3 rounded-full">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 512 512">
                        <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
                    </svg>
                </div>
                <div>
                    <h4 className="font-black italic text-[17px] uppercase tracking-wide leading-tight">%100 GÜVENLİK GARANTİSİ</h4>
                    <p className="text-emerald-50 text-[12px] font-medium mt-1 leading-snug">Numaranız asla reklam için kullanılmaz. Sadece rapor iletimi için kaydedilir.</p>
                </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitData(false); }} className="mt-8 text-left">
                <label className="block text-slate-700 font-black uppercase text-xs mb-2 ml-4 italic tracking-widest">
                    WhatsApp Numaranızı Buraya Yazın:
                </label>
                
                <div className={`relative transition-all duration-300 ${inputError ? 'animate-bounce' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg className="h-6 w-6 text-emerald-500" fill="currentColor" viewBox="0 0 448 512">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                    </div>
                    <input 
                        type="tel" 
                        placeholder="05xx xxx xx xx"
                        value={user.whatsapp} 
                        onChange={(e)=>setUser({...user, whatsapp: e.target.value})} 
                        disabled={submitLoading} 
                        className={`w-full pl-14 pr-8 py-6 rounded-[1.5rem] border-4 transition-all outline-none text-2xl font-black shadow-lg ${inputError ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`} 
                    />
                </div>
                <p className="text-[10px] text-slate-400 text-center italic mt-3 font-bold">
                    * Numaranız sadece raporu güvenli bir şekilde ulaştırmak için kullanılacaktır.
                </p>

                <button type="submit" disabled={submitLoading} className={`mt-8 w-full flex items-center justify-center gap-3 text-white font-black py-7 rounded-[1.75rem] shadow-2xl uppercase tracking-widest transition-all text-lg ${submitLoading ? 'bg-slate-700' : 'bg-orange-600 hover:bg-orange-700 transform hover:scale-[1.02] active:scale-95'}`}>
                    ANALİZİ TAMAMLA VE RAPORU AL
                </button>
                
                <button 
                    type="button" 
                    disabled={submitLoading} 
                    onClick={(e) => { e.preventDefault(); submitData(true); }}
                    className="mt-6 w-full text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest transition-colors underline decoration-dotted underline-offset-4"
                >
                    Numara Vermeden Devam Et
                </button>
            </form>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border-4 border-orange-500 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
            
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-inner">
              <span className="text-4xl">🚀</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 italic uppercase tracking-tight">İşleminiz Yapılıyor...</h2>

            <div className="bg-orange-50 text-orange-600 font-black p-5 rounded-2xl mb-6 shadow-sm transition-all duration-500 text-base border border-orange-100">
              {loadingText}
            </div>

            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl mb-6">
              <div className="flex items-center justify-center gap-2 text-red-600 font-black mb-2 text-sm uppercase tracking-widest">
                <span>⚠️</span> KRİTİK UYARI
              </div>
              <p className="text-red-900/80 text-xs font-bold leading-relaxed text-center">
                Lütfen bu sayfadan ayrılmayın ve tarayıcınızı kapatmayın. Yönlendirme otomatik olarak gerçekleşecektir. Ayrılmanız durumunda verileriniz kaybolabilir.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              GÜVENLİ BAĞLANTI AKTİF
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
