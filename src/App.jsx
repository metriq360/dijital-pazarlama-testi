import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Global değişkenler
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
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
  const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '', whatsapp: '' });
  const [currentStep, setCurrentStep] = useState('form');
  const [selectedSections, setSelectedSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const branding = () => {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/png'; link.rel = 'icon'; link.href = 'https://i.imgur.com/DMqrCwJ.png';
      document.getElementsByTagName('head')[0].appendChild(link);
      document.title = "METRIQ360 | Dijital Sağlık Analizi";
    };
    branding();

    const initFirebase = async () => {
      if (!firebaseConfigStr) { setLoading(false); return; }
      try {
        const config = JSON.parse(firebaseConfigStr);
        const app = initializeApp(config);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance); setDb(dbInstance);
        const doAuth = async () => {
          if (initialAuthToken) await signInWithCustomToken(authInstance, initialAuthToken);
          else await signInAnonymously(authInstance);
        };
        await doAuth();
        onAuthStateChanged(authInstance, (fbUser) => { if (fbUser) setUserId(fbUser.uid); setLoading(false); });
      } catch (e) { setLoading(false); }
    };
    initFirebase();
  }, []);

  const calculateScores = () => {
    let rawTotal = 0; let rawMax = 0;
    const sScores = {}; const sMaxScores = {};
    selectedSections.forEach(num => {
      let sectionCurrent = 0;
      const sectionQs = allQuestions.filter(q => q.section === num);
      sectionQs.forEach(q => { sectionCurrent += (answers[q.id] || 0); });
      sScores[num] = sectionCurrent;
      sMaxScores[num] = sectionQs.length * 5;
      rawTotal += sectionCurrent;
      rawMax += sectionQs.length * 5;
    });
    const norm = rawMax > 0 ? Math.round((rawTotal / rawMax) * 100) : 0;
    return { rawTotal, rawMax, norm, sScores, sMaxScores };
  };

  const finalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // WhatsApp zorunlu tutuldu (Funnel'ın ana amacı)
    if (!user.whatsapp || user.whatsapp.length < 10) { 
        setError("Lütfen geçerli bir WhatsApp numarası girin."); 
        return; 
    }
    
    setSubmitLoading(true);
    const result = calculateScores();

    try {
      const baseUrl = window.location.origin === 'null' ? '' : window.location.origin;
      
      // 1. Önce AI Raporunu Arka Planda Oluştur (Fikret Kara'nın incelemesi için veri hazır olsun)
      const reportRes = await fetch(`${baseUrl}/.netlify/functions/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userInfo: user, 
          totalScore: result.norm, 
          totalMaxScore: 100, 
          sectionScores: result.sScores, 
          sectionMaxScores: result.sMaxScores, 
          selectedSections 
        }),
      });
      
      const reportData = await reportRes.json();

      // 2. Mail Gönder (WhatsApp ve AI Raporu dahil)
      const emailResponse = await fetch(`${baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userInfo: user, 
            report: reportData.detailedReport,
            scores: { totalScore: result.norm, sScores: result.sScores },
            answers, 
            selectedSections 
        }),
      });

      if (!emailResponse.ok) throw new Error("Gönderim başarısız.");

      // 3. Firestore Kayıt
      if (db && userId) {
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'leads'), {
          timestamp: new Date(), ...user, score: result.norm, report: reportData.detailedReport
        });
      }

      // 4. Başarılı ise Yönlendir
      window.location.href = "https://www.metriq360.tr/tesekkurler-test";

    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası: Lütfen internetinizi kontrol edip tekrar deneyin. (Not: Bu hata sadece yerel önizlemede görülür)");
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse italic text-xl uppercase">Metriq360 Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border-t-[10px] border-orange-500 text-center relative overflow-hidden">
        
        {/* SOL ÜST SAĞLIK İKONU */}
        <div className="absolute top-6 left-6 text-orange-400 opacity-60">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        </div>

        <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 tracking-tight uppercase">METR<span className="text-orange-500">IQ</span>360</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px] md:text-[11px]">DİJİTAL PAZARLAMA SAĞLIK TESTİ</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl mb-8 text-sm border-l-8 border-red-500 font-bold text-left">
            ⚠️ {error}
          </div>
        )}

        {currentStep === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setCurrentStep('quiz-select'); }} className="space-y-5 text-left">
            <input type="text" placeholder="Adınız" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-lg font-medium" required />
            <input type="text" placeholder="Soyadınız" value={user.surname} onChange={(e)=>setUser({...user, surname: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-lg font-medium" required />
            <input type="text" placeholder="Sektörünüz (Örn: Mobilya, Ajans)" value={user.sector} onChange={(e)=>setUser({...user, sector: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-lg font-medium" required />
            <input type="email" placeholder="E-posta Adresiniz" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-lg font-medium" required />
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-widest transition-all transform hover:-translate-y-1 text-sm md:text-base">DİJİTAL SAĞLIK TESTİNİ BAŞLAT</button>
          </form>
        )}

        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Analiz Edilecek Alanları Seçin</h2>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className="flex items-center p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-orange-200 cursor-pointer transition has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500 text-left">
                <input type="checkbox" checked={selectedSections.includes(num)} onChange={() => setSelectedSections(prev => prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num].sort())} className="hidden" />
                <span className={`text-lg font-bold ${selectedSections.includes(num) ? 'text-orange-600' : 'text-slate-500'}`}>{['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'][num]}</span>
              </label>
            ))}
            <button onClick={() => selectedSections.length > 0 ? setCurrentStep('quiz') : setError('Lütfen alan seçin.')} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl mt-6 uppercase tracking-widest shadow-md">Sorulara Geç</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-8 text-left">
            {selectedSections.map(sNum => (
              <div key={sNum} className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 border-b-2 border-orange-100 pb-2 uppercase italic">{['', 'Sosyal Medya', 'Yerel SEO & GBP', 'Reklam & Kampanya', 'İçerik Pazarlaması', 'Otomasyon'][sNum]}</h3>
                {allQuestions.filter(q => q.section === sNum).map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="font-bold text-slate-800 mb-4 text-sm">{idx + 1}. {q.text}</p>
                    <div className="flex justify-between gap-1 md:gap-2 text-center">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setAnswers(prev => ({...prev, [q.id]: v}))} className={`flex-1 py-4 rounded-xl font-black text-sm transition ${answers[q.id] === v ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-200'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => setCurrentStep('whatsapp')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest">Analizi Bitir</button>
          </div>
        )}

        {currentStep === 'whatsapp' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-inner">
                <h2 className="text-2xl font-black text-slate-900 mb-3">Testiniz Tamamlandı! 🎉</h2>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    Büyüme uzmanımız <strong>Fikret Kara</strong> verilerinizi bizzat inceleyip size özel strateji raporunuzu oluşturacak. Raporunuz tamamlandığında size nereden ulaşalım?
                </p>
            </div>

            <form onSubmit={finalSubmit} className="space-y-5 text-left">
                <div className="ml-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp Numaranız</label>
                    <p className="text-[10px] text-slate-400 mb-2 italic">Analiz raporunuzu bu numaraya ileteceğiz.</p>
                </div>
                <input 
                    type="tel" 
                    placeholder="Örn: 0532 123 45 67" 
                    value={user.whatsapp} 
                    onChange={(e)=>setUser({...user, whatsapp: e.target.value})} 
                    className="w-full px-8 py-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none transition text-xl font-black" 
                    required 
                />
                <button 
                    type="submit" 
                    disabled={submitLoading} 
                    className={`w-full ${submitLoading ? 'bg-slate-300' : 'bg-orange-500 hover:bg-orange-600'} text-white font-black py-6 rounded-[1.75rem] shadow-2xl uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95`}
                >
                    {submitLoading ? 'RAPOR HAZIRLANIYOR...' : 'RAPORUMU LABORATUVARA GÖNDER'}
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
