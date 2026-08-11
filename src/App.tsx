import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Building, Phone, Mail, Globe, 
  CheckCircle2, X, ChevronRight, UserCheck, ShieldCheck, 
  Menu, User, ArrowRight, ExternalLink, Megaphone, Store, Users,
  Award, TrendingUp, Key
} from 'lucide-react';

// Türkiye İl ve Örnek İlçe Verisi
const TURKEY_CITIES: Record<string, string[]> = {
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Etimesgut", "Gölbaşı"],
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Ataşehir"],
  "İzmir": ["Karşıyaka", "Alsancak", "Konak", "Bornova", "Çeşme"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Alanya"],
};

// ÇOK DAHA CANLI, AYDINLIK VE PRESTİJLİ EMLAK GÖRSELLERİ
const SLIDER_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1920", // Lüks Villa
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920", // Modern Müstakil Ev
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1920", // Rezidans
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920"  // Aydınlık Konut
];

export default function RealtyCenterApp() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<'franchise' | 'agent'>('franchise');
  
  // Arama Tab Durumu
  const [activeTab, setActiveTab] = useState<'search' | 'franchise' | 'agent'>('search');

  // Form Durumları
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    occupation: '',
    kvkkConsent: false
  });

  // Otomatik Slider Geçişi (5 Saniyede Bir)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const openDrawer = (type: 'franchise' | 'agent') => {
    setFormType(type);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCity('');
    setSelectedDistrict('');
    setFormData({ fullName: '', phone: '', email: '', occupation: '', kvkkConsent: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kvkkConsent) {
      alert("Lütfen KVKK onay kutusunu işaretleyiniz.");
      return;
    }
    
    const payload = {
      type: formType,
      ...formData,
      city: selectedCity,
      district: selectedDistrict,
      submittedAt: new Date().toISOString()
    };

    console.log("Başvuru Verisi:", payload);
    alert("Başvurunuz başarıyla alındı! Ekibimiz en kısa sürede sizinle iletişime geçecektir.");
    closeDrawer();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* 1. ÜST HEADER (GÜNCELLENMİŞ LOGO & FONT DÜZENİ) */}
      <header className="sticky top-0 z-40 w-full px-6 lg:px-12 py-3.5 flex items-center justify-between border-b-2 border-red-600 bg-white shadow-md">
        
        {/* LOGO: TEK RENK KALIN KIRMIZI & ORTALANMIŞ SİYAH SLOGAN */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-red-600 rounded-lg flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-red-600/40">
            R
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            {/* REALTY CENTER: TEK RENK TEK PARÇA KALIN KIRMIZI */}
            <span className="text-2xl font-black tracking-widest text-red-600 leading-none uppercase">
              REALTY CENTER
            </span>
            {/* ÖNCE GÜVEN: SİYAH, İTALİK VE MERKEZLENMİŞ */}
            <span className="text-xs text-slate-900 font-extrabold tracking-wider italic font-serif mt-1 w-full text-center">
              Önce Güven...
            </span>
          </div>
        </div>

        {/* Menü Linkleri */}
        <nav className="hidden xl:flex items-center space-x-7 text-sm font-extrabold text-slate-800">
          <a href="#kurumsal" className="hover:text-red-600 transition">Kurumsal</a>
          <a href="#akademi" className="hover:text-red-600 transition">Akademi</a>
          <a href="#ofislerimiz" className="hover:text-red-600 transition">Ofislerimiz</a>
          <a href="#danismanlarimiz" className="hover:text-red-600 transition">Danışmanlarımız</a>
          <a href="#ilanlarimiz" className="hover:text-red-600 transition">İlanlarımız</a>
          <a href="#projelerimiz" className="hover:text-red-600 transition">Projelerimiz</a>
          <a href="#iletisim" className="hover:text-red-600 transition">İletişim</a>
          <button onClick={() => openDrawer('agent')} className="text-red-600 hover:text-slate-900 transition font-black">Danışman Ol</button>
          <button onClick={() => openDrawer('franchise')} className="text-red-600 hover:text-slate-900 transition font-black">Franchise Ol</button>
        </nav>

        {/* Panel Butonu */}
        <div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-black text-sm flex items-center space-x-2 shadow-lg shadow-red-600/30 transition transform hover:scale-105">
            <span>Panel</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HERO BÖLGESİ (MOCKUP LOGO DOKUNUŞLU & CANLI RESİMLER) */}
      <div className="relative h-[82vh] min-h-[640px] w-full overflow-hidden border-b-4 border-red-600 shadow-2xl">
        
        {/* Arka Plan Slider */}
        <div className="absolute inset-0 z-0">
          {SLIDER_IMAGES.map((imgUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
          {/* Sol Form Arkası Gölgesi */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        </div>

        {/* MOCKUP TABELA ROZETİ (Resmin Üzerinde Binalara Entegre Görünüm) */}
        <div className="absolute top-8 right-12 z-20 hidden lg:flex items-center space-x-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-2xl transform rotate-1 hover:rotate-0 transition duration-300">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md shadow-red-600/40">
            R
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-red-600 block leading-none">REALTY CENTER</span>
            <span className="text-[10px] text-slate-900 font-extrabold italic tracking-widest block text-center">Önce Güven...</span>
          </div>
        </div>

        {/* Hero İçerik & Arama Motoru */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 h-full flex flex-col justify-between pb-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ARAMA MOTORU VE SEKMELERİ */}
            <div className="lg:col-span-7 xl:col-span-6">
              
              {/* Üçlü Kutucuk Sekmeler */}
              <div className="grid grid-cols-3 gap-2 mb-0">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`p-3.5 rounded-t-xl font-black flex flex-col items-center justify-center space-y-1 transition ${
                    activeTab === 'search' 
                      ? 'bg-red-600 text-white shadow-lg border-t-2 border-red-300' 
                      : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                  <span className="text-xs">İlanlar</span>
                </button>

                <button
                  onClick={() => openDrawer('franchise')}
                  className="p-3.5 rounded-t-xl bg-white text-slate-900 hover:bg-red-50 hover:text-red-600 font-bold flex flex-col items-center justify-center space-y-1 transition border-t-2 border-transparent hover:border-red-600"
                >
                  <Store className="w-5 h-5 text-red-600" />
                  <span className="text-xs">Franchise Ol!</span>
                </button>

                <button
                  onClick={() => openDrawer('agent')}
                  className="p-3.5 rounded-t-xl bg-white text-slate-900 hover:bg-red-50 hover:text-red-600 font-bold flex flex-col items-center justify-center space-y-1 transition border-t-2 border-transparent hover:border-red-600"
                >
                  <Users className="w-5 h-5 text-red-600" />
                  <span className="text-xs">Danışman Ol!</span>
                </button>
              </div>

              {/* Arama Formu */}
              <div className="bg-white text-slate-900 p-5 rounded-b-xl rounded-tr-xl shadow-2xl space-y-3.5 border-2 border-red-600/30">
                
                {/* Satır 1 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">Satılık / Kiralık</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600">
                      <option>Konut</option>
                      <option>İşyeri</option>
                      <option>Arsa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">İşlem Tipi</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600">
                      <option>Satılık</option>
                      <option>Kiralık</option>
                      <option>Devren</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">Şehir</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600">
                      <option value="">İl Seçiniz</option>
                      {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">İlçe</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600">
                      <option value="">İlçe Seçiniz</option>
                    </select>
                  </div>
                </div>

                {/* Satır 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">İlan No</label>
                    <input type="text" placeholder="" className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600" />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">Minimum Fiyat</label>
                    <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600" />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">Maksimum Fiyat</label>
                    <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600" />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 mb-1 block">Para Birimi :</label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600">
                      <option>Türk Lirası</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Ara Butonu */}
                <div>
                  <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-10 py-3 rounded-md text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/40">
                    <Search className="w-4 h-4" />
                    <span>Ara</span>
                  </button>
                </div>

                {/* Hızlı Kategori Linkleri */}
                <div className="pt-2 border-t border-slate-100 flex items-center space-x-4 text-xs font-bold text-slate-700">
                  <a href="#" className="hover:text-red-600 text-red-600 font-extrabold">● Konut</a>
                  <a href="#" className="hover:text-red-600">İşyeri</a>
                  <a href="#" className="hover:text-red-600">Arsa</a>
                </div>

              </div>

            </div>

          </div>

          {/* SAĞ ALT SLOGAN METNİ */}
          <div className="self-end text-right space-y-1 bg-slate-950/70 backdrop-blur-md p-5 rounded-2xl border-2 border-red-600/60 max-w-lg shadow-2xl">
            <p className="text-lg font-bold text-white tracking-wide">Realty Center Türkiye;</p>
            <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Mülkün <span className="text-red-600 underline decoration-red-500">Rafta Durmadığı</span> Yer
            </p>
            <p className="text-xs font-extrabold text-red-500 tracking-wider uppercase">
              #realtycenterdaolun
            </p>
          </div>

        </div>

      </div>

      {/* 3. AŞAĞIDA GÖRÜNEN BEYAZ TEMALI İÇERİK BÖLÜMÜ */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200">
            Neden Realty Center?
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Gayrimenkulde <span className="text-red-600">Güven ve Kazancın</span> Adresi
          </h2>
          <p className="text-slate-600 font-medium mt-2">
            Türkiye genelindeki geniş franchise ağı ve uzman danışman kadromuzla hayalinizdeki portföylere ulaşın.
          </p>
        </div>

        {/* 3 Özellik Kartı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition duration-300">
            <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Kurumsal Güven</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              "Önce Güven..." ilkesiyle tüm alım-satım ve kiralama süreçlerinde hukuki ve şeffaf altyapı.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition duration-300">
            <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Yüksek Kazanç Paylaşımı</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Franchise ofislerimiz ve gayrimenkul danışmanlarımız için sektörün en yüksek prim oranları.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition duration-300">
            <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Geniş Portföy Ağı</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Konut, ticari ve arsa kategorilerinde Türkiye'nin dört bir yanından güncel gayrimenkul seçenekleri.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-red-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black text-white">R</div>
              <span className="text-xl font-black text-white">REALTY CENTER</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Türkiye geneli franchise ağı ve uzman emlak danışmanları ile gayrimenkulde önce güven sağlayan çatı kuruluş.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black mb-4 border-b-2 border-red-600 pb-1 inline-block">İletişim Bilgileri</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Konutkent Mah. 3028. Cad. West Gate Residence No:2 A Blok Kat:26 No:244 Çankaya / ANKARA</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-red-500" />
                <span className="font-bold text-white">0532 567 48 45</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-500" />
                <span>info@realtycenter.com.tr</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-red-500" />
                <span>www.realtycenter.com.tr</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-4 border-b-2 border-red-600 pb-1 inline-block">Hızlı Erişim</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><button onClick={() => openDrawer('franchise')} className="hover:text-red-500 font-bold">Franchise Başvurusu</button></li>
              <li><button onClick={() => openDrawer('agent')} className="hover:text-red-500 font-bold">Danışman Başvurusu</button></li>
              <li><a href="#kvkk" className="hover:text-red-500">KVKK Aydınlatma Metni</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* 5. SAĞ SLİDE-OVER FORM DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity" 
            onClick={closeDrawer} 
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between h-full border-l-4 border-red-600">
              
              {/* Header */}
              <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">
                    {formType === 'franchise' ? 'Franchise Başvuru Formu' : 'Danışman Başvuru Formu'}
                  </h2>
                  <p className="text-xs text-red-500 font-black uppercase tracking-wider">REALTY CENTER Ailesine Katılın</p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form İçeriği */}
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto flex-1 text-sm bg-slate-50">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ad Soyad *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Adınız ve Soyadınız"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {formType === 'agent' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">E-posta Adresi *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="ornek@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mevcut Mesleğiniz *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Örn: Emlak Danışmanı, Satış Temsilcisi..."
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-black text-red-600 uppercase tracking-wider mb-2">
                    Hangi Bölgede Bizimle Çalışmak İstersiniz?
                  </h4>

                  <div className="mb-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">İl Seçimi *</label>
                    <select 
                      required
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedDistrict('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">-- İl Seçiniz --</option>
                      {Object.keys(TURKEY_CITIES).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İlçe Seçimi *</label>
                    <select 
                      required
                      disabled={!selectedCity}
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        !selectedCity ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                      }`}
                    >
                      <option value="">
                        {selectedCity ? '-- İlçe Seçiniz --' : 'Önce İl Seçiniz'}
                      </option>
                      {selectedCity && TURKEY_CITIES[selectedCity]?.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="kvkk"
                    checked={formData.kvkkConsent}
                    onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="kvkk" className="text-[11px] text-slate-600 font-medium leading-tight">
                    KVKK kapsamında tarafıma bilgilendirme, arama ve SMS gönderilmesini kabul ediyorum.
                  </label>
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <span>Başvuruyu Tamamla</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>

              </form>

              <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-semibold">
                Realty Center Gayrimenkul Franchise & Danışman Ağı
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}