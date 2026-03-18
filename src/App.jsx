import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { generateMarketingReport } from './services/geminiService';

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

export default function App() {
  const [db, setDb] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState({ name: '', surname: '', sector: '', email: '', whatsapp: '' });
  const [currentStep, setCurrentStep] = useState('form');
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [normalizedScore, setNormalizedScore] = useState(0);
  const [loading, setLoading] = useState(false); // Set to false since we don't have initial firebase config yet
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('ANALİZİ TAMAMLA VE RAPORU AL');
  const [skipWhatsapp, setSkipWhatsapp] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    document.title = "METRIQ360 | Dijital Sağlık Testi";
    const link: any = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.href = 'https://i.imgur.com/DMqrCwJ.png';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  useEffect(() => {
    let interval: any;
    if (submitLoading) {
      const steps = [
        "Yapay Zeka Verileri Analiz Ediyor... 🧠",
        "Kişiselleştirilmiş Stratejiniz Oluşturuluyor... ✨",
        "Raporunuz E-posta Adresinize Gönderiliyor... 📧",
        "WhatsApp Yedekleme Kanalı Hazırlanıyor... 📲",
        "İşleminiz Tamamlanıyor, Lütfen Bekleyin... ⚙️",
        "Şimdi Teşekkür Sayfasına Yönlendiriliyorsunuz... 🚀"
      ];
      let idx = 0; 
      setLoadingText(steps[0]);
      interval = setInterval(() => { 
        idx++; 
        if (idx < steps.length) setLoadingText(steps[idx]); 
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [submitLoading]);

  const calculateScore = () => {
    let total = 0; let max = 0; const sScores: any = {}; const sMax: any = {};
    selectedSections.forEach(num => {
      let current = 0; const qs = allQuestions.filter(q => q.section === num);
      qs.forEach(q => current += (answers[q.id] || 0));
      sScores[num] = current; sMax[num] = qs.length * 5;
      total += current; max += qs.length * 5;
    });
    return { norm: max > 0 ? Math.round((total / max) * 100) : 0, sScores, sMax };
  };

  const finalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!skipWhatsapp && (!user.whatsapp || user.whatsapp.length < 10)) { 
        setError("Lütfen geçerli bir WhatsApp numarası girin veya numara vermeden devam etme seçeneğini işaretleyin."); 
        setInputError(true);
        setTimeout(() => setInputError(false), 1000);
        return; 
    }
    setSubmitLoading(true);
    setShowLoadingModal(true);
    const result = calculateScore();

    try {
      let reportText = "Analiz uzmanımız tarafından hazırlanacaktır.";
      try {
        reportText = await generateMarketingReport(user, result.norm, answers, allQuestions, selectedSections);
      } catch(e) {
        console.error("Report generation failed:", e);
      }

      await fetch(`/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo: user, report: reportText, scores: { totalScore: result.norm, sectionScores: result.sScores, sectionMaxScores: result.sMax }, answers, selectedSections }),
      });

      // Firebase logic skipped if not configured
      if (db && userId) {
        try {
          await addDoc(collection(db, 'leads'), {
            timestamp: new Date(), ...user, score: result.norm, answers, report: reportText
          });
        } catch (fbErr) {}
      }

      window.location.href = THANK_YOU_PAGE_URL;
      
    } catch (err: any) {
      setError(`Hata: ${err.message}`);
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-black animate-pulse uppercase italic text-xl">Metriq360 Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-2 md:p-4 font-sans text-slate-900">
      <div className="bg-white p-4 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl border-t-[8px] md:border-t-[10px] border-orange-500 text-center relative overflow-hidden">
        
        {currentStep !== 'whatsapp-funnel' && (
            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 tracking-tight uppercase italic">METR<span className="text-orange-500">IQ</span>360</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">DİJİTAL PAZARLAMA SAĞLIK TESTİ</p>
            </div>
        )}

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold text-sm border-l-4 border-red-500 text-left shadow-sm">🚨 {error}</div>}

        {currentStep === 'form' && (
          <form onSubmit={(e)=>{e.preventDefault(); setCurrentStep('quiz-select')}} className="space-y-4 text-left">
            <input type="text" placeholder="Adınız" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Soyadınız" value={user.surname} onChange={(e)=>setUser({...user, surname: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="text" placeholder="Sektörünüz (Örn: Kuaför)" value={user.sector} onChange={(e)=>setUser({...user, sector: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <input type="email" placeholder="E-posta Adresiniz" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium" required />
            <button type="submit" className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest hover:-translate-y-1 transition-transform">TESTİ BAŞLAT</button>
          </form>
        )}

        {currentStep === 'quiz-select' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6 text-slate-800 italic">Analiz Alanlarını Seçin</h2>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition text-left ${selectedSections.includes(num) ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-transparent hover:border-orange-200'}`}>
                <input type="checkbox" checked={selectedSections.includes(num)} onChange={() => setSelectedSections(prev => prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num].sort())} className="hidden" />
                <span className={`text-lg font-bold ${selectedSections.includes(num) ? 'text-orange-600' : 'text-slate-500'}`}>{num === 1 ? 'Sosyal Medya' : num === 2 ? 'Yerel SEO' : num === 3 ? 'Reklam & Kampanya' : num === 4 ? 'İçerik Pazarlaması' : num === 5 ? 'Otomasyon' : ''}</span>
              </label>
            ))}
            <button onClick={() => selectedSections.length > 0 ? setCurrentStep('quiz') : setError('Lütfen alan seçin.')} className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl mt-6 uppercase tracking-widest shadow-md">Sorulara Geç</button>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-8 text-left">
            {selectedSections.map(sNum => (
              <div key={sNum} className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 border-b-2 border-orange-100 pb-2 uppercase italic">{sNum === 1 ? 'Sosyal Medya' : sNum === 2 ? 'Yerel SEO' : sNum === 3 ? 'Reklam & Kampanya' : sNum === 4 ? 'İçerik Pazarlaması' : sNum === 5 ? 'Otomasyon' : ''}</h3>
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
          <div className="space-y-3 md:space-y-6 text-center">
            {/* ANALİZ HAZIR HEADER - GUARANTEED VISIBILITY */}
            <div className="bg-[#0f172a] p-5 md:p-10 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border-2 md:border-4 border-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/5 pointer-events-none"></div>
                
                <h2 className="text-2xl md:text-5xl font-black mb-1 italic uppercase tracking-tighter leading-tight relative z-10">
                    <span style={{ color: '#f97316' }}>ANALİZİNİZ</span> <br className="md:hidden" /> <span style={{ color: '#FFFFFF' }}>HAZIR!</span>
                </h2>
                
                <div className="text-3xl md:text-5xl mb-3 animate-bounce relative z-10">🚀</div>

                <div className="inline-block bg-orange-600 px-5 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg border border-orange-400 relative z-10">
                    <p className="font-black text-xs md:text-xl italic tracking-wide" style={{ color: '#FFFFFF' }}>
                        Dijital Sağlık Puanınız: {normalizedScore} / 100
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border-2 border-orange-50 shadow-xl text-left">
                <h3 className="text-sm md:text-xl font-black text-slate-900 mb-3 md:mb-6 border-b-2 border-orange-50 pb-2 italic">Raporunuzu Nasıl Alacaksınız? 👇</h3>
                <ul className="space-y-4 md:space-y-6 text-[10px] md:text-sm font-medium">
                    <li className="flex gap-3 items-start">
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-100 border-2 border-orange-200 rounded-xl text-xl shrink-0 shadow-sm">
                            📧
                        </div>
                        <span className="leading-tight pt-1.5"><strong>1. E-posta:</strong> Raporunuz <strong>{user.email}</strong> adresine iletilmektedir.</span>
                    </li>
                    <li className="flex gap-3 items-start text-orange-600">
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-xl shadow-md text-xl shrink-0">
                            📲
                        </div>
                        <span className="leading-tight pt-1.5"><strong>2. WhatsApp:</strong> Mail gecikme riskine karşı, raporunuz <strong>WhatsApp</strong> üzerinden de ulaştırılacaktır.</span>
                    </li>
                </ul>
            </div>

            <div className="mt-3 md:mt-8 text-left space-y-3">
                <div className="bg-emerald-600 text-white p-3 md:p-5 rounded-xl md:rounded-3xl flex items-center gap-3 shadow-lg">
                    <div className="text-xl md:text-3xl animate-pulse shrink-0">🛡️</div>
                    <div className="flex-1">
                        <p className="text-[9px] md:text-[12px] font-black leading-tight uppercase italic tracking-wide">
                            %100 GÜVENLİK GARANTİSİ
                        </p>
                        <p className="text-[8px] md:text-[11px] font-medium opacity-90 leading-snug mt-0.5">
                            Numaranız asla reklam için kullanılmaz. Sadece rapor iletimi için kaydedilir.
                        </p>
                    </div>
                </div>

                <div className="px-0.5">
                    <label className={`block text-slate-800 font-black uppercase text-[9px] md:text-xs italic tracking-widest mb-1.5 transition-opacity ${skipWhatsapp ? 'opacity-30' : 'opacity-100'}`}>
                        WhatsApp Numaranız:
                    </label>
                    <div className={`relative transition-all duration-500 ${inputError && !skipWhatsapp ? 'animate-bounce' : ''} ${skipWhatsapp ? 'opacity-20 grayscale pointer-events-none scale-95' : 'opacity-100'}`}>
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-6 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 md:h-8 md:w-8 text-emerald-500" fill="currentColor" viewBox="0 0 448 512">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                             </svg>
                         </div>
                        <input 
                            type="tel" 
                            placeholder="05xx xxx xx xx" 
                            value={user.whatsapp} 
                            onChange={(e)=>setUser({...user, whatsapp: e.target.value})} 
                            onKeyDown={(e) => e.key === 'Enter' && finalSubmit()}
                            disabled={submitLoading || skipWhatsapp} 
                            className={`w-full pl-10 md:pl-16 pr-4 md:pr-8 py-4 md:py-7 rounded-xl md:rounded-2rem border-2 md:border-4 transition-all outline-none text-lg md:text-3xl font-black shadow-xl ${inputError && !skipWhatsapp ? 'border-red-500' : 'border-slate-100 focus:border-orange-500'}`} 
                            required={!skipWhatsapp}
                        />
                    </div>
                    
                    <div className="mt-2 flex justify-center">
                        <button 
                            type="button"
                            onClick={() => setSkipWhatsapp(!skipWhatsapp)}
                            className={`text-[8px] md:text-[11px] font-black px-4 md:px-6 py-1.5 md:py-3 rounded-full border-2 transition-all uppercase italic shadow-sm ${skipWhatsapp ? 'bg-orange-500 border-orange-500 text-white scale-105' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-400 hover:text-orange-600'}`}
                        >
                            {skipWhatsapp ? '✓ Numara Vermeden Devam Et' : 'Numara Vermeden Devam Et'}
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={finalSubmit} className="mt-3 md:mt-8">
                <button type="submit" disabled={submitLoading} className={`w-full flex items-center justify-center gap-3 text-white font-black py-4 md:py-7 rounded-xl md:rounded-[1.75rem] shadow-xl uppercase tracking-widest transition-all text-sm md:text-lg ${submitLoading ? 'bg-slate-700' : 'bg-orange-600 hover:bg-orange-700 transform hover:scale-[1.02] active:scale-95'}`}>
                    ANALİZİ TAMAMLA VE RAPORU AL
                </button>
            </form>
          </div>
        )}

        {/* FANCY LOADING MODAL */}
        {showLoadingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 text-center shadow-[0_0_50px_rgba(234,88,12,0.3)] border-4 border-orange-500 relative overflow-hidden">
                {/* ANIMATED BACKGROUND ELEMENTS */}
                <div className="absolute top-0 left-0 w-full h-2 bg-orange-100">
                    <div className="h-full bg-orange-500 animate-[loading_3s_ease-in-out_infinite]"></div>
                </div>

                <div className="mb-8">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <span className="text-5xl">🚀</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 italic uppercase tracking-tight">İşleminiz Yapılıyor...</h2>
                    <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 mb-6">
                        <p className="text-orange-600 font-black text-lg animate-pulse italic">{loadingText}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-red-50 border-2 border-red-100 p-5 rounded-2xl">
                        <p className="text-red-600 font-black text-sm uppercase italic tracking-wider mb-1">⚠️ KRİTİK UYARI</p>
                        <p className="text-slate-700 font-bold text-sm leading-relaxed">
                            Lütfen bu sayfadan ayrılmayın ve tarayıcınızı kapatmayın. Yönlendirme otomatik olarak gerçekleşecektir. Ayrılmanız durumunda verileriniz kaybolabilir.
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-6">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                        GÜVENLİ BAĞLANTI AKTİF
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
