import React, { useState, useEffect } from 'react';
import './index.css';
import { 
  BrowserRouter as Router, Routes, Route, Link 
} from 'react-router-dom';

import { 
  Search, MapPin, Phone, Mail, Globe, 
  CheckCircle2, X, ShieldCheck, 
  ExternalLink, Building2, Briefcase, Megaphone,
  TrendingUp, Key, Home, GraduationCap, ArrowRight, ArrowUp,
  ChevronDown, Users, Award
} from 'lucide-react';

// Türkiye İl ve Örnek İlçe Verisi
const TURKEY_CITIES: Record<string, string[]> = {
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Etimesgut", "Gölbaşı"],
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Ataşehir"],
  "İzmir": ["Karşıyaka", "Alsancak", "Konak", "Bornova", "Çeşme"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Alanya"],
};

// EMLAK SLIDER GÖRSELLERİ
const SLIDER_IMAGES = [
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920"
];

// Değişen Emlak Kelimeleri
const PROPERTY_TYPES = ["EV", "ARSA", "OFİS", "VİLLA", "PORTFÖY"];

// ==========================================
// 1. HEADER BİLEŞENİ
// ==========================================
function Header({ openDrawer, scrolled }: { openDrawer: (type: 'franchise' | 'agent') => void, scrolled: boolean }) {
  return (
    <header className={`sticky top-0 z-40 w-full px-6 lg:px-12 py-2.5 flex items-center justify-between border-b-2 border-red-600 transition-all duration-500 ${
      scrolled ? 'bg-white/85 backdrop-blur-md shadow-xl py-2' : 'bg-white shadow-md'
    }`}>
      <Link to="/" className="flex items-center">
        <img 
          src="/logo.png" 
          alt="Realty Center" 
          className="h-14 lg:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.currentTarget.alt = "REALTY CENTER"; }}
        />
      </Link>

      <nav className="hidden xl:flex items-center space-x-7 text-sm font-extrabold text-slate-800 tracking-wide">
        
        {/* HOVER DROPDOWN: KURUMSAL */}
        <div className="relative group py-2">
          <Link to="/kurumsal/hakkimizda" className="hover:text-red-600 transition duration-200 flex items-center space-x-1 py-1">
            <span>Kurumsal</span>
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-transform duration-300 group-hover:rotate-180" />
          </Link>

          <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border-t-4 border-t-red-600 z-50">
            <Link to="/kurumsal/hakkimizda" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition group/item">
              <div className="p-2 bg-slate-100 group-hover/item:bg-red-600 group-hover/item:text-white rounded-md text-slate-700 transition">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 group-hover/item:text-red-600">Hakkımızda</div>
                <div className="text-[10px] text-slate-500 font-medium">Vizyon ve misyonumuz</div>
              </div>
            </Link>

            <Link to="/kurumsal/once-guven" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition group/item">
              <div className="p-2 bg-slate-100 group-hover/item:bg-red-600 group-hover/item:text-white rounded-md text-slate-700 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 group-hover/item:text-red-600">Önce Güven İlkesi</div>
                <div className="text-[10px] text-slate-500 font-medium">Şeffaf ve etik anlayışımız</div>
              </div>
            </Link>

            <Link to="/kurumsal/ekibimiz" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition group/item">
              <div className="p-2 bg-slate-100 group-hover/item:bg-red-600 group-hover/item:text-white rounded-md text-slate-700 transition">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 group-hover/item:text-red-600">Yönetim Kadrosu & Ekibimiz</div>
                <div className="text-[10px] text-slate-500 font-medium">Profesyonel kadromuz</div>
              </div>
            </Link>
          </div>
        </div>

        <Link to="/akademi" className="hover:text-red-600 transition duration-200">Akademi</Link>
        <Link to="/ofislerimiz" className="hover:text-red-600 transition duration-200">Ofislerimiz</Link>
        <Link to="/danismanlarimiz" className="hover:text-red-600 transition duration-200">Danışmanlarımız</Link>
        <Link to="/ilanlarimiz" className="hover:text-red-600 transition duration-200">İlanlarımız</Link>
        <Link to="/projelerimiz" className="hover:text-red-600 transition duration-200">Projelerimiz</Link>
        <Link to="/iletisim" className="hover:text-red-600 transition duration-200">İletişim</Link>
        <button onClick={() => openDrawer('agent')} className="text-red-600 hover:text-slate-900 transition font-black">Danışman Ol</button>
        <button onClick={() => openDrawer('franchise')} className="text-red-600 hover:text-slate-900 transition font-black">Franchise Ol</button>
      </nav>

      <div>
        <button className="relative overflow-hidden group bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-black text-sm flex items-center space-x-2 shadow-lg shadow-red-600/30 transition duration-300 transform hover:scale-105 tracking-wider">
          <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10">Panel</span>
          <ExternalLink className="w-4 h-4 relative z-10" />
        </button>
      </div>
    </header>
  );
}

// ==========================================
// 2. FOOTER BİLEŞENİ
// ==========================================
function Footer({ openDrawer }: { openDrawer: (type: 'franchise' | 'agent') => void }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Realty Center" 
              className="h-12 w-auto object-contain brightness-0 invert"
            />
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
            <li><button onClick={() => openDrawer('franchise')} className="hover:text-red-500 font-bold transition">Franchise Başvurusu</button></li>
            <li><button onClick={() => openDrawer('agent')} className="hover:text-red-500 font-bold transition">Danışman Başvurusu</button></li>
            <li><a href="#kvkk" className="hover:text-red-500 transition">KVKK Aydınlatma Metni</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// 3. EKSİKSİZ ANA SAYFA BİLEŞENİ
// ==========================================
function HomePage({ counts, currentSlide, selectedCity, setSelectedCity, openDrawer }: any) {
  const [activeTab, setActiveTab] = useState<'search' | 'franchise' | 'agent'>('search');

  return (
    <>
      {/* HERO BÖLGESİ (SLIDER) */}
      <div className="relative h-[68vh] min-h-[520px] w-full overflow-hidden border-b-4 border-red-600 shadow-xl flex items-center bg-slate-900">
        <div className="absolute inset-0 z-0">
          {SLIDER_IMAGES && SLIDER_IMAGES.map((imgUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center transform ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`relative overflow-hidden group h-20 rounded-t-lg font-black flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md ${
                  activeTab === 'search' 
                    ? 'bg-red-600 text-white shadow-xl border-b-2 border-red-800 transform -translate-y-1' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Megaphone className="w-6 h-6 relative z-10" />
                <span className="text-xs font-extrabold tracking-wide relative z-10">İlanlar</span>
              </button>

              <button
                onClick={() => openDrawer('franchise')}
                className="relative overflow-hidden group h-20 rounded-t-lg bg-white text-slate-900 hover:bg-red-50 hover:text-red-600 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-600 hover:-translate-y-1"
              >
                <Building2 className="w-6 h-6 text-red-600 relative z-10" />
                <span className="text-xs font-extrabold tracking-wide relative z-10">Franchise Ol!</span>
              </button>

              <button
                onClick={() => openDrawer('agent')}
                className="relative overflow-hidden group h-20 rounded-t-lg bg-white text-slate-900 hover:bg-red-50 hover:text-red-600 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-600 hover:-translate-y-1"
              >
                <Briefcase className="w-6 h-6 text-red-600 relative z-10" />
                <span className="text-xs font-extrabold tracking-wide relative z-10">Danışman Ol!</span>
              </button>
            </div>

            {/* Arama Formu */}
            <div className="bg-white text-slate-900 p-4 rounded-b-lg rounded-tr-lg shadow-2xl space-y-3 border-2 border-red-600/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">Satılık / Kiralık</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition">
                    <option>Konut</option>
                    <option>İşyeri</option>
                    <option>Arsa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">İşlem Tipi</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition">
                    <option>Satılık</option>
                    <option>Kiralık</option>
                    <option>Devren</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">Şehir</label>
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  >
                    <option value="">İl Seçiniz</option>
                    {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">İlçe</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition">
                    <option value="">İlçe Seçiniz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">İlan No</label>
                  <input type="text" placeholder="" className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">Min Fiyat</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">Maks Fiyat</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">Para Birimi</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition">
                    <option>Türk Lirası</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <button className="relative overflow-hidden group w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-10 py-2.5 rounded-md text-xs flex items-center justify-center space-x-2 transition duration-300 shadow-lg shadow-red-600/40 uppercase tracking-widest transform hover:scale-105">
                  <Search className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">ARA</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 text-right drop-shadow-md">
          <span className="text-2xl sm:text-3xl font-light tracking-[0.2em] text-white block uppercase">REALTY CENTER</span>
          <span className="text-sm font-light italic tracking-[0.15em] text-slate-200 block mt-0.5">Önce Güven...</span>
        </div>
      </div>

      {/* SAYAÇLAR BÖLÜMÜ */}
      <section className="bg-white text-slate-900 py-12 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-600 mb-1 tracking-tight">{counts.offices}+</div>
            <div className="text-xs text-slate-700 font-extrabold uppercase tracking-widest">Franchise Ofis</div>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-600 mb-1 tracking-tight">{counts.agents.toLocaleString('tr-TR')}+</div>
            <div className="text-xs text-slate-700 font-extrabold uppercase tracking-widest">Uzman Danışman</div>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-600 mb-1 tracking-tight">{counts.portfolios.toLocaleString('tr-TR')}+</div>
            <div className="text-xs text-slate-700 font-extrabold uppercase tracking-widest">Aktif Portföy</div>
          </div>

          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-black text-red-600 mb-1 tracking-tight">%{counts.satisfaction}</div>
            <div className="text-xs text-slate-700 font-extrabold uppercase tracking-widest">Müşteri Memnuniyeti</div>
          </div>
        </div>
      </section>

      {/* NEDEN REALTY CENTER? İÇERİK BÖLÜMÜ */}
      <section id="kurumsal" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-b border-slate-200">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30 group-hover:scale-110 transition duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition">Kurumsal Güven</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              "Önce Güven..." ilkesiyle tüm alım-satım ve kiralama süreçlerinde hukuki ve şeffaf altyapı.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30 group-hover:scale-110 transition duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition">Yüksek Kazanç Paylaşımı</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Franchise ofislerimiz ve gayrimenkul danışmanlarımız için sektörün en yüksek prim oranları.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-red-600 shadow-xl shadow-slate-100 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold mb-5 shadow-lg shadow-red-600/30 group-hover:scale-110 transition duration-300">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition">Geniş Portföy Ağı</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Konut, ticari ve arsa kategorilerinde Türkiye'nin dört bir yanından güncel gayrimenkul seçenekleri.
            </p>
          </div>
        </div>
      </section>

      {/* EMLAK DANIŞMANLIĞI EĞİTİMİMİZE KATIL BÖLÜMÜ */}
      <section id="akademi" className="py-20 px-6 lg:px-12 bg-white text-slate-900 border-b-4 border-red-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-75 transition duration-500" />
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-red-100 bg-white aspect-video lg:aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" 
                alt="Realty Center Emlak Danışmanlığı Eğitimi" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-md shadow-red-600/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">REALTY CENTER AKADEMİ</h4>
                    <p className="text-xs text-slate-600 font-medium">Sertifikalı Profesyonel Eğitim</p>
                  </div>
                </div>
                <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-200">
                  Sınırlı Kontenjan
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="inline-flex items-center space-x-2 text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-4 py-1.5 rounded-full border border-red-200">
              <GraduationCap className="w-4 h-4" />
              <span>Geleceğinizi İnşa Edin</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              EMLAK DANIŞMANLIĞI <br className="hidden sm:inline" />
              <span className="text-red-600">
                EĞİTİMİMİZE KATIL
              </span>
            </h2>

            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Realty Center Akademi bünyesinde düzenlenen interaktif <strong className="text-slate-900 font-bold">ofis içi ve online eğitimlerimizle</strong>, gayrimenkul sektörünün zirvesine adım atın. Satış tekniklerinden hukuki mevzuatlara, portföy yönetiminden dijital pazarlamaya kadar tüm süreçleri alanında uzman eğitmenlerimizden öğrenin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Kapsamlı Ofis ve Online Eğitim</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Birebir Mentörlük Desteği</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">MEB ve Kurumsal Sertifika</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Anında Danışmanlık İmkânı</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => openDrawer('agent')} 
                className="relative overflow-hidden group bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-xl text-sm flex items-center justify-center space-x-3 shadow-xl shadow-red-600/30 transition duration-300 transform hover:scale-105 uppercase tracking-wider"
              >
                <span className="relative z-10">Eğitime Hemen Başvur</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ==========================================
// 4. ALT SAYFA DÜZENLERİ (TEMEL YAPILAR)
// ==========================================
function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Hakkımızda</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Realty Center kurumsal vizyonu, misyonu ve değerleri bu sayfada yer alacaktır.</p>
    </div>
  );
}

function TrustPrinciplePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Önce Güven İlkesi</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Şeffaf ticaret, güvenilir altyapı ve hukuki süreç yönetimimiz bu sayfada açıklanacaktır.</p>
    </div>
  );
}

function TeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Yönetim Kadrosu & Ekibimiz</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Realty Center yönetim kurulu üyeleri ve merkez ekibimiz bu alanda gösterilecektir.</p>
    </div>
  );
}

function AcademyPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Realty Center Akademi</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Emlak danışmanlığı eğitim programlarımız, sertifika süreçleri ve başvuru detayları burada bulunacaktır.</p>
    </div>
  );
}

function OfficesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Ofislerimiz</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Türkiye genelindeki Franchise Ofislerimizin haritası ve iletişim bilgileri burada yer alacaktır.</p>
    </div>
  );
}

function AgentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Danışmanlarımız</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Tüm profesyonel emlak danışmanlarımızın detaylı kartları ve ilanları burada listelenecektir.</p>
    </div>
  );
}

function ListingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Tüm İlanlarımız</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Detaylı arama ve filtreleme özelliğine sahip aktif gayrimenkul portföyümüz bu sayfadadır.</p>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">Projelerimiz</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Konut ve ticari proje lansmanları ile kat planları bu sayfada sergilenecektir.</p>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-600 pb-2 inline-block">İletişim</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">İletişim formu, Genel Merkez açık adresi ve Google Haritalar entegrasyonu bu alandadır.</p>
    </div>
  );
}

// ==========================================
// 5. ANA BİLEŞEN VE UYGULAMA MİMARİSİ
// ==========================================
export default function RealtyCenterApp() {
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState<'approaching' | 'unlocking' | 'unlocked'>('approaching');
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<'franchise' | 'agent'>('franchise');
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const [counts, setCounts] = useState({
    offices: 0,
    agents: 0,
    portfolios: 0,
    satisfaction: 0
  });

  // KELİME DEĞİŞTİRME ANİMASYONU
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setWordIndex((prev) => (prev + 1) % PROPERTY_TYPES.length);
          setFade(true);
        }, 250);
      }, 700);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // AÇILIŞ ZAMANLAYICISI
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage('unlocking'), 600);
    const timer2 = setTimeout(() => setAnimationStage('unlocked'), 1200);
    const timer3 = setTimeout(() => setLoading(false), 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Sayaç Sayma Animasyonu
  useEffect(() => {
    if (!loading) {
      const duration = 2000;
      const steps = 50;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setCounts({
          offices: Math.floor(50 * progress),
          agents: Math.floor(1000 * progress),
          portfolios: Math.floor(15000 * progress),
          satisfaction: Math.floor(100 * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts({ offices: 50, agents: 1000, portfolios: 15000, satisfaction: 100 });
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [loading]);

  // Scroll Takibi
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Otomatik Slider
  useEffect(() => {
    if (!SLIDER_IMAGES || SLIDER_IMAGES.length === 0) return;
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kvkkConsent) {
      alert("Lütfen KVKK onay kutusunu işaretleyiniz.");
      return;
    }
    
    alert("Başvurunuz başarıyla alındı! Ekibimiz en kısa sürede sizinle iletişime geçecektir.");
    closeDrawer();
  };

  // AÇILIŞ EKRANI
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-slate-900 px-4 select-none overflow-hidden font-sans">
        <div className="relative mb-10 transform animate-pulse">
          <img 
            src="/logo.png" 
            alt="Realty Center" 
            className="h-24 sm:h-28 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className={`p-4 rounded-2xl transition-all duration-500 transform ${
            animationStage === 'unlocked' 
              ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 scale-105' 
              : 'bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-md'
          }`}>
            <Home className="w-11 h-11 stroke-[1.75]" />
          </div>

          {animationStage !== 'unlocked' ? (
            <div className={`absolute transition-all duration-700 ease-out flex items-center justify-center ${
              animationStage === 'approaching' 
                ? '-translate-x-16 opacity-90 scale-90' 
                : 'translate-x-0 opacity-100 rotate-90 scale-100'
            }`}>
              <div className="bg-red-600 text-white p-2.5 rounded-full shadow-lg shadow-red-600/30 border-2 border-white">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-75">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

        <div className="text-lg sm:text-xl font-light text-slate-800 tracking-[0.2em] uppercase text-center flex items-center justify-center flex-wrap gap-x-2">
          <span>HAYALİNİZDEKİ</span>
          <span className={`font-extrabold text-red-600 inline-block min-w-[90px] text-center transition-all duration-300 ease-in-out transform ${
            fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
          }`}>
            {PROPERTY_TYPES[wordIndex]}
          </span>
          <span>YÜKLENİYOR...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-red-600 selection:text-white relative flex flex-col justify-between">
        
        <Header openDrawer={openDrawer} scrolled={scrolled} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <HomePage 
                counts={counts} 
                currentSlide={currentSlide} 
                selectedCity={selectedCity} 
                setSelectedCity={setSelectedCity} 
                openDrawer={openDrawer} 
              />
            } />
            
            {/* Kurumsal Alt Sayfaları */}
            <Route path="/kurumsal/hakkimizda" element={<AboutPage />} />
            <Route path="/kurumsal/once-guven" element={<TrustPrinciplePage />} />
            <Route path="/kurumsal/ekibimiz" element={<TeamPage />} />

            {/* Diğer Ana Sayfalar */}
            <Route path="/akademi" element={<AcademyPage />} />
            <Route path="/ofislerimiz" element={<OfficesPage />} />
            <Route path="/danismanlarimiz" element={<AgentsPage />} />
            <Route path="/ilanlarimiz" element={<ListingsPage />} />
            <Route path="/projelerimiz" element={<ProjectsPage />} />
            <Route path="/iletisim" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer openDrawer={openDrawer} />

        {/* SAĞ SLİDE-OVER FORM DRAWER */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity duration-300" onClick={closeDrawer} />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between h-full border-l-4 border-red-600 transform transition duration-300">
                <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {formType === 'franchise' ? 'Franchise Başvuru Formu' : 'Danışman Başvuru Formu'}
                    </h2>
                    <p className="text-xs text-red-500 font-black uppercase tracking-wider">REALTY CENTER Ailesine Katılın</p>
                  </div>
                  <button onClick={closeDrawer} className="p-1.5 text-slate-400 hover:text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 overflow-y-auto flex-1 text-sm bg-slate-50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ad Soyad *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Adınız ve Soyadınız"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
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
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
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
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
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
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
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
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
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
                        className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 ${
                          !selectedCity ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                        }`}
                      >
                        <option value="">{selectedCity ? '-- İlçe Seçiniz --' : 'Önce İl Seçiniz'}</option>
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
                      className="relative overflow-hidden group w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2 uppercase"
                    >
                      <span className="relative z-10">Başvuruyu Tamamla</span>
                      <CheckCircle2 className="w-4 h-4 relative z-10" />
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

        {/* SAĞ ALT YUKARI DÖN BUTONU */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="En yukarıya dön"
            className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shadow-2xl shadow-red-600/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 border-2 border-white/20 flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

      </div>
    </Router>
  );
}