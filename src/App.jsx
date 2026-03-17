import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- BURASI MÜHÜRLENDİ: YENİ TEŞEKKÜRLER SAYFASI LİNKİNİZ ---
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
  const [loadingText, setLoadingText] = useState('SONUÇLARI VE RAPORU GÖNDER');
  const [error, setError] = useState('');

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

        const doAuth = async () => {
          if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
          else await signInAnonymously(auth);
        };
        await doAuth();
        onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) setUserId(fbUser.uid);
          setLoading(false);
        });
      } catch (e) { setLoading(false); }
    };
    initFirebase();
  }, []);

  useEffect(() => {
    let interval;
    if (submitLoading) {
      const steps = ["Veriler Şifreleniyor 🔒", "Analiz Yapılıyor 🧠", "Rapor Hazırlanıyor 📝", "Yönlendiriliyorsunuz 🚀"];
      let idx = 0; setLoadingText(steps[0]);
      interval = setInterval(() => { idx++; if (idx < steps.length) setLoadingText(steps[idx]); }, 1000);
    } else { setLoadingText('SONUÇLARI VE RAPORU GÖNDER'); }
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
      qs.forEach(q => current += (answers[q.id] || 0));
      sScores[num] = current; sMax[num] = qs.length * 5;
      total += current; max += qs.length * 5;
    });
    return { norm: max > 0 ? Math.round((total / max) * 100) : 0, sScores, sMax };
  };

  const finalSubmit = async (e) => {
    e.preventDefault();
    if (!user.whatsapp) { setError("WhatsApp numaranızı girin."); return; }
    setSubmitLoading(true);
    const result = calculateScore();

    try {
      const baseUrl = window.location.origin === 'null' ? '' : window.location.origin;
      
      // 1. VERİ ODAKLI AI ANALİZİ
      let reportText = "Analiz uzmanımız tarafından hazırlanacaktır.";
      try {
        const res = await fetch(`${baseUrl}/.netlify/functions/generate-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInfo: user, totalScore: result.norm, answers, allQuestions, selectedSections }),
        });
        if (res.ok) { const data = await res.json(); reportText = data.detailedReport; }
      } catch(e) {}

      // 2. MAİL GÖNDERİMİ
      await fetch(`${baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo: user, report: reportText, scores: { totalScore: result.norm, sectionScores: result.sScores, sectionMaxScores: result.sMax }, answers, selectedSections }),
      });

      // 3. FIRESTORE YEDEKLEME (MÜHÜRLENDİ!)
      if (db && userId) {
        try {
          await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'leads'), {
            timestamp: new Date(),
            ...user,
            score: result.norm,
            answers,
            report: reportText
          });
        } catch (fbErr) { console.error("DB Hatası:", fbErr); }
      }

      // 4. KESİN YÖNLENDİRME (MÜHÜRLENDİ!)
      window.location.href = THANK_YOU_PAGE_URL;
      
    } catch (err) {
      setError(`Sistem Hatası: ${err.message}`);
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-black animate-pulse uppercase italic text-xl">Metriq360 Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border-t-[10px] border-orange-500 text-center relative overflow-hidden">
        
        {currentStep !== 'whatsapp-funnel' && (
            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 tracking-tight uppercase italic">METR<span className="text-orange-500">IQ</span>360</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">DİJİTAL PAZARLAMA SAĞLIK TESTİ</p>
            </div>
        )}

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold text-sm border-l-4 border-red-500 text-left shadow-sm">🚨 {error}</div>}

        {currentStep === 'form' && (
          <form onSubmit={(e)=>{e.preventDefault(); setCurrentStep('quiz-select')}} className="space-y-4 text-left">
            <input type="text" placeholder="Adınız" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Soyadınız" value={user.surname} onChange={(e)=>setUser({...user, surname: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Sektörünüz (Örn: Kuaför, Mobilya)" value={user.sector} onChange={(e)=>setUser({...user, sector: e.target.value})} className="w-full px-6 py-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
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
                <span className={`text-lg font-bold ${selectedSections.includes(num) ? 'text-orange-600' : 'text-slate-500'}`}>{getSectionTitle(num)}</span>
              </label>
            ))}
            <button onClick={() => selectedSections.length > 0 ? setCurrentStep('quiz') : setError('Lütfen alan seçin.')} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl mt-6 uppercase tracking-widest shadow-md">Sorulara Geç</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-8 text-left">
            {selectedSections.map(sNum => (
              <div key={sNum} className="space-y-4">
                {/* DÜZELTİLEN YER: sNum mühürlendi */}
                <h3 className="text-lg font-black text-slate-800 border-b-2 border-orange-100 pb-2 uppercase italic">{getSectionTitle(sNum)}</h3>
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
            <div className="bg-red-600 text-white p-8 rounded-[2rem] shadow-2xl border-4 border-red-700">
                <h2 className="text-2xl md:text-3xl font-black mb-4 italic uppercase">🚨 DİJİTAL SAĞLIK PUANINIZ: {normalizedScore} / 100</h2>
                <div className="bg-red-800/60 p-4 rounded-xl border border-red-500/50">
                    <p className="text-red-50 font-bold text-sm italic leading-snug">⚠️ Durum: İşletmenizin dijital varlıklarında acil müdahale gerektiren sızıntılar tespit edildi!</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-orange-200 shadow-xl text-left">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b-2 border-orange-100 pb-3 italic">Sırada Ne Var? 👇</h3>
                <ul className="space-y-6 text-sm font-medium">
                    <li className="flex gap-3">📧 <span><strong>1. Ön Analiz Raporunuz:</strong> Yapay zeka dökümünüz <strong>{user.email}</strong> adresine iletilecektir.</span></li>
                    <li className="flex gap-3">📲 <span><strong>2. Uzman Randevusu:</strong> Büyüme uzmanımız size özel yol haritasıyla <strong>WhatsApp</strong> üzerinden ulaşacaktır.</span></li>
                </ul>
            </div>

            <form onSubmit={finalSubmit} className="space-y-4 text-left mt-6">
                <input type="tel" placeholder="WhatsApp Numaranız (Örn: 0532...)" value={user.whatsapp} onChange={(e)=>setUser({...user, whatsapp: e.target.value})} disabled={submitLoading} className="w-full px-8 py-6 rounded-[1.5rem] border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-xl font-black shadow-inner disabled:opacity-50" required />
                <button type="submit" disabled={submitLoading} className={`w-full flex items-center justify-center gap-3 text-white font-black py-6 rounded-2xl shadow-2xl uppercase tracking-widest transition-all ${submitLoading ? 'bg-slate-700' : 'bg-orange-600 hover:bg-orange-700 transform hover:scale-[1.02] active:scale-95'}`}>
                    {loadingText}
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
