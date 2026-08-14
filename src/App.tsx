import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { 
  BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation 
} from 'react-router-dom';

import { 
  Search, MapPin, Phone, Mail, Globe, 
  CheckCircle2, X, ShieldCheck, 
  Building2, Briefcase, Megaphone,
  TrendingUp, Key, Home, GraduationCap, ArrowRight, ArrowUp,
  Users, Navigation, UserCheck, Filter,
  Maximize2, Bed, Calendar, Tag, Flame, Send, Clock, MessageSquare, LogOut, PlusCircle, Settings, BarChart3,
  ShieldAlert, Lock, Check, AlertCircle, FileText, PieChart, Layers, MessageCircle, Menu
} from 'lucide-react';

// TÜRKİYE 81 İL VE İLÇE VERİ HARİTASI
const TURKEY_CITIES: Record<string, string[]> = {
  "Adana": ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan", "İmamoğlu", "Karataş", "Pozantı"],
  "Adıyaman": ["Merkez", "Kahta", "Besni", "Gölbaşı", "Gerger", "Samsat"],
  "Afyonkarahisar": ["Merkez", "Sandıklı", "Dinar", "Bolvadin", "Emirdağ", "Çay"],
  "Ağrı": ["Merkez", "Doğubayazıt", "Patnos", "Eleşkirt", "Tutak", "Diyadin"],
  "Amasya": ["Merkez", "Merzifon", "Suluova", "Taşova", "Gümüşhacıköy"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Gölbaşı", "Altındağ", "Pursaklar", "Akyurt", "Elmadağ", "Kahramankazan", "Polatlı", "Çubuk"],
  "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Serik", "Kemer", "Kaş", "Kumluca", "Gazipaşa", "Finike"],
  "Artvin": ["Merkez", "Hopa", "Borçka", "Arhavi", "Şavşat"],
  "Aydın": ["Efeler", "Kuşadası", "Didim", "Nazilli", "Söke", "Çine", "Germencik"],
  "Balıkesir": ["Altıeylül", "Karesi", "Bandırma", "Edremit", "Ayvalık", "Burhaniye", "Gönen", "Erdek"],
  "Bilecik": ["Merkez", "Bozüyük", "Söğüt", "Osmaneli"],
  "Bingöl": ["Merkez", "Genç", "Solhan", "Karlıova"],
  "Bitlis": ["Merkez", "Tatvan", "Ahlat", "Güroymak"],
  "Bolu": ["Merkez", "Gerede", "Mudurnu", "Mengen"],
  "Burdur": ["Merkez", "Bucak", "Gölhisar"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "İnegöl", "Gemlik", "Mudanya", "Gürsu", "Kestel", "Mustafakemalpaşa", "Karacabey"],
  "Çanakkale": ["Merkez", "Biga", "Çan", "Gelibolu", "Ezine", "Yenice", "Ayvacık"],
  "Çankırı": ["Merkez", "Çerkeş", "Ilgaz"],
  "Çorum": ["Merkez", "Sungurlu", "Osmancık", "İskilip"],
  "Denizli": ["Pamukkale", "Merkezefendi", "Çivril", "Acıpayam", "Tavas", "Honaz"],
  "Diyarbakır": ["Kayapınar", "Bağlar", "Yenişehir", "Sur", "Ergani", "Bismil", "Silvan"],
  "Edirne": ["Merkez", "Keşan", "Uzunköprü", "İpsala"],
  "Elazığ": ["Merkez", "Kovancılar", "Karakoçan", "Palu"],
  "Erzincan": ["Merkez", "Tercan", "Üzümlü"],
  "Erzurum": ["Yakutiye", "Palandöken", "Aziziye", "Oltu", "Pasinler"],
  "Eskişehir": ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Çifteler"],
  "Gaziantep": ["Şahinbey", "Şehitkamil", "Nizip", "İslahiye", "Nurdağı"],
  "Giresun": ["Merkez", "Bulancak", "Görele", "Espiye", "Tirebolu"],
  "Gümüşhane": ["Merkez", "Kelkit", "Şiran"],
  "Hakkari": ["Merkez", "Yüksekova", "Şemdinli"],
  "Hatay": ["Antakya", "İskenderun", "Defne", "Samandağ", "Kırıkhan", "Dörtyol", "Arsuz", "Reyhanlı"],
  "Isparta": ["Merkez", "Eğirdir", "Yalvaç", "Atabey"],
  "Mersin": ["Yenişehir", "Toroslar", "Akdeniz", "Mezitli", "Tarsus", "Erdemli", "Silifke", "Anamur", "Mut"],
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Ataşehir", "Bakırköy", "Beylikdüzü", "Sarıyer", "Fatih", "Maltepe", "Pendik", "Ümraniye", "Kartal", "Başakşehir", "Esenyurt", "Beykoz", "Zeytinburnu"],
  "İzmir": ["Karşıyaka", "Alsancak", "Konak", "Bornova", "Buca", "Çeşme", "Urla", "Foça", "Karabağlar", "Bayraklı", "Torbalı", "Menemen", "Seferihisar", "Tire"],
  "Kars": ["Merkez", "Sarıkamış", "Kağızman"],
  "Kastamonu": ["Merkez", "Tosya", "Taşköprü", "Cide"],
  "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Develi"],
  "Kırklareli": ["Merkez", "Lüleburgaz", "Babaeski"],
  "Kırşehir": ["Merkez", "Kaman", "Mucur"],
  "Kocaeli": ["İzmit", "Gebze", "Darıca", "Körfez", "Gölcük", "Derince", "Çayırova", "Kartepe", "Başiskele"],
  "Konya": ["Selçuklu", "Karatay", "Meram", "Ereğli", "Akşehir", "Beyşehir"],
  "Kütahya": ["Merkez", "Tavşanlı", "Simav", "Gediz"],
  "Malatya": ["Battalgazi", "Yeşilyurt", "Doğanşehir"],
  "Manisa": ["Yunusemre", "Şehzadeler", "Akhisar", "Turgutlu", "Salihli", "Soma", "Alaşehir"],
  "Kahramanmaraş": ["Onikişubat", "Dulkadiroğlu", "Elbistan", "Afşin"],
  "Mardin": ["Artuklu", "Kızıltepe", "Midyat", "Nusaybin"],
  "Muğla": ["Bodrum", "Fethiye", "Marmaris", "Menteşe", "Milas", "Datça", "Ortaca"],
  "Muş": ["Merkez", "Bulanık", "Malazgirt"],
  "Nevşehir": ["Merkez", "Ürgüp", "Avanos", "Derinkuyu"],
  "Niğde": ["Merkez", "Bor", "Çiftlik"],
  "Ordu": ["Altınordu", "Ünye", "Fatsa"],
  "Rize": ["Merkez", "Çayeli", "Ardeşen", "Pazar"],
  "Sakarya": ["Adapazarı", "Serdivan", "Erenler", "Hendek", "Akyazı", "Karasu", "Sapanca"],
  "Samsun": ["Atakum", "İlkadım", "Canik", "Bafra", "Çarşamba"],
  "Siirt": ["Merkez", "Kurtalan", "Eruh"],
  "Sinop": ["Merkez", "Boyabat", "Gerze"],
  "Sivas": ["Merkez", "Şarkışla", "Suşehri", "Zara"],
  "Tekirdağ": ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Ergene"],
  "Tokat": ["Merkez", "Erbaa", "Turhal", "Niksar"],
  "Trabzon": ["Ortahisar", "Akçaabat", "Araklı", "Of", "Yomra"],
  "Tunceli": ["Merkez", "Ovacık", "Pertek"],
  "Şanlıurfa": ["Haliliye", "Eyyübiye", "Karaköprü", "Siverek", "Viranşehir", "Birecik"],
  "Uşak": ["Merkez", "Banaz", "Eşme"],
  "Van": ["İpekyolu", "Tuşba", "Edremit", "Erciş"],
  "Yozgat": ["Merkez", "Sorgun", "Boğazlıyan"],
  "Zonguldak": ["Merkez", "Ereğli", "Çaycuma", "Devrek"],
  "Aksaray": ["Merkez", "Ortaköy", "Eskil"],
  "Bayburt": ["Merkez", "Aydıntepe"],
  "Karaman": ["Merkez", "Ermenek"],
  "Kırıkkale": ["Merkez", "Yahşihan", "Keskin"],
  "Batman": ["Merkez", "Kozluk", "Sason"],
  "Şırnak": ["Merkez", "Cizre", "Silopi", "İdil"],
  "Bartın": ["Merkez", "Amasra", "Ulus"],
  "Ardahan": ["Merkez", "Göle"],
  "Iğdır": ["Merkez", "Tuzluca", "Aralık"],
  "Yalova": ["Merkez", "Çınarcık", "Çiftlikköy", "Altınova"],
  "Karabük": ["Merkez", "Safranbolu", "Yenice"],
  "Kilis": ["Merkez", "Elbeyli"],
  "Osmaniye": ["Merkez", "Kadirli", "Düziçi"],
  "Düzce": ["Merkez", "Akçakoca", "Kaynaşlı"]
};

// ÖRNEK İLAN VERİLERİ
const SAMPLE_LISTINGS = [
  {
    id: "DEMO-001",
    title: "DEMO İLAN — Gerçek ilan bilgisi bekleniyor",
    category: "Konut",
    type: "Satılık",
    price: 0,
    currency: "₺",
    city: "Demo Şehir",
    district: "Demo İlçe",
    neighborhood: "Demo Mahalle",
    rooms: "—",
    area: 0,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=88&w=1200",
    agentName: "DEMO Danışman",
    agentPhone: "",
    date: "2026-08-14",
    isFeatured: false
  }
];

const SAMPLE_OFFICES = [
  {
    id: 1,
    name: "DEMO OFİS — Gerçek ofis bilgisi bekleniyor",
    city: "Demo Şehir",
    district: "Demo İlçe",
    address: "Gerçek adres bilgisi yönetim panelinden girilecektir.",
    phone: "",
    email: "",
    manager: "DEMO Yönetici",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=88&w=1200"
  }
];

const SAMPLE_AGENTS = [
  {
    id: 1,
    name: "DEMO DANIŞMAN — Gerçek danışman bilgisi bekleniyor",
    title: "DEMO DANIŞMAN",
    office: "DEMO OFİS",
    city: "Demo Şehir",
    district: "Demo İlçe",
    phone: "",
    email: "",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=88&w=1200",
    activeListings: 0
  }
];

const SLIDER_IMAGES = [
  "/slider/slider1.jpg",
  "/slider/slider2.jpg",
  "/slider/slider3.jpg",
  "/slider/slider4.jpg"
];

const PROPERTY_TYPES = ["EV", "ARSA", "OFİS", "VİLLA", "PORTFÖY"];

export interface ContactMessage {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'archived';
}

const INITIAL_MESSAGES: ContactMessage[] = [];

const DEFAULT_CONTACT_SETTINGS = { phone: '', email: '', address: '', whatsapp: '' };

function getContactSettings() {
  try {
    const saved = localStorage.getItem('realty-center-contact-settings');
    return saved ? { ...DEFAULT_CONTACT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_CONTACT_SETTINGS;
  } catch { return DEFAULT_CONTACT_SETTINGS; }
}

function WhatsAppSupportButton() {
  const [settings, setSettings] = useState(getContactSettings);
  useEffect(() => {
    const refresh = () => setSettings(getContactSettings());
    window.addEventListener('realty-center-contact-updated', refresh);
    return () => window.removeEventListener('realty-center-contact-updated', refresh);
  }, []);
  const href = settings.whatsapp.replace(/\D/g, '') ? 'https://wa.me/' + settings.whatsapp.replace(/\D/g, '') : '#';
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label="WhatsApp destek hattı" className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-3.5 shadow-2xl shadow-emerald-950/30 transition-transform duration-300 hover:scale-105">
      <MessageCircle className="w-6 h-6 fill-white/10" />
      <span className="hidden sm:inline text-sm font-black">WhatsApp Destek</span>
    </a>
  );
}

type ListingCategory = { id: string; title: string; type: string; category: string; image: string };
const DEFAULT_LISTING_CATEGORIES: ListingCategory[] = [
  { id: 'sale-home', title: 'Satılık Evler', type: 'Satılık', category: 'Konut', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=90&w=1200' },
  { id: 'rent-home', title: 'Kiralık Evler', type: 'Kiralık', category: 'Konut', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=90&w=1200' },
  { id: 'sale-land', title: 'Satılık Arsalar', type: 'Satılık', category: 'Arsa', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=90&w=1200' },
  { id: 'transfer-shop', title: 'Devren Dükkanlar', type: 'Devren', category: 'İşyeri', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=90&w=1200' },
  { id: 'sale-villa', title: 'Satılık Villalar', type: 'Satılık', category: 'Konut', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=90&w=1200' },
  { id: 'rent-office', title: 'Kiralık Ofisler', type: 'Kiralık', category: 'İşyeri', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=90&w=1200' },
  { id: 'sale-workplace', title: 'Satılık İş Yerleri', type: 'Satılık', category: 'İşyeri', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=90&w=1200' },
  { id: 'investment', title: 'Yatırımlık Fırsatlar', type: 'Satılık', category: '', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=90&w=1200' }
];
function getListingCategories(): ListingCategory[] {
  try {
    const saved = localStorage.getItem('realty-center-listing-categories');
    return saved ? JSON.parse(saved) : DEFAULT_LISTING_CATEGORIES;
  } catch { return DEFAULT_LISTING_CATEGORIES; }
}

const DEFAULT_CAMPAIGN_SETTINGS = { first: '1 Gün Geçerli', second: '2 Hafta Geçerli', third: 'Son 3 Gün' };
function getCampaignSettings() {
  try { const saved = localStorage.getItem('realty-center-campaign-settings'); return saved ? { ...DEFAULT_CAMPAIGN_SETTINGS, ...JSON.parse(saved) } : DEFAULT_CAMPAIGN_SETTINGS; }
  catch { return DEFAULT_CAMPAIGN_SETTINGS; }
}

function TurkeyListingMap() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const activeGroupRef = useRef<SVGGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    fetch('/turkey.svg')
      .then((response) => {
        if (!response.ok) throw new Error('Harita yüklenemedi');
        return response.text();
      })
      .then((svgText) => {
        const parsed = new DOMParser().parseFromString(svgText, 'image/svg+xml');
        parsed.querySelectorAll<SVGGElement>('g[data-city-name]').forEach((group) => {
          group.setAttribute('data-realty-city', group.dataset.cityName || '');
          group.querySelectorAll('path').forEach((path) => path.setAttribute('style', 'fill:#fee2e2;stroke:#ef4444;stroke-width:0.75;transition:fill 180ms ease;'));
        });
        setSvgMarkup(parsed.documentElement.outerHTML);
      })
      .catch(() => setMapError(true));
  }, []);

  const paintGroup = (group: SVGGElement | null, color: string) => group?.querySelectorAll('path').forEach((path) => path.style.fill = color);

  const handleMapMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const group = (event.target as Element).closest('g[data-realty-city]') as SVGGElement | null;
    const tooltip = tooltipRef.current;
    if (!group || !tooltip || !mapRef.current) return;
    if (activeGroupRef.current !== group) {
      paintGroup(activeGroupRef.current, '#fee2e2');
      paintGroup(group, '#ef2222');
      activeGroupRef.current = group;
      tooltip.textContent = group.getAttribute('data-realty-city') || '';
      tooltip.style.display = 'block';
    }
    const box = mapRef.current.getBoundingClientRect();
    tooltip.style.left = (event.clientX - box.left + 14) + 'px';
    tooltip.style.top = (event.clientY - box.top - 14) + 'px';
  };

  const handleMapLeave = () => {
    paintGroup(activeGroupRef.current, '#fee2e2');
    activeGroupRef.current = null;
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const city = (event.target as Element).closest('g[data-realty-city]')?.getAttribute('data-realty-city');
    if (city) navigate('/ilanlarimiz?city=' + encodeURIComponent(city));
  };

  return (
    <section className="bg-white py-12 text-slate-900 overflow-hidden border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-6"><span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-100 px-4 py-1.5 text-xs font-black tracking-widest text-red-700"><MapPin className="w-4 h-4" />ETKİLEŞİMLİ TÜRKİYE HARİTASI</span><h2 className="mt-3 flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black"><span>TÜRKİYE'DE</span><img src="/rlogo.png" alt="Realty Center" className="h-8 sm:h-9 w-auto object-contain" /></h2><p className="mt-2 text-sm font-medium text-slate-600">İlin üzerine gelin, seçmek için tıklayın.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-lg">
          {mapError ? <p className="py-16 text-center text-sm text-slate-500">Harita şu anda yüklenemedi.</p> : <div className="relative mx-auto w-full max-w-5xl"><div ref={mapRef} onMouseMove={handleMapMove} onMouseLeave={handleMapLeave} onClick={handleMapClick} className="turkey-listing-map w-full [&_svg]:h-auto [&_svg]:w-full [&_g[data-realty-city]]:cursor-pointer" dangerouslySetInnerHTML={{ __html: svgMarkup }} /><div ref={tooltipRef} className="pointer-events-none absolute z-20 hidden rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white shadow-xl" /></div>}
        </div>
      </div>
    </section>
  );
}

function ListingCard({ item }: { item: typeof SAMPLE_LISTINGS[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-2xl hover:border-red-700 transition-all duration-300 flex flex-col justify-between group h-full">
      <div>
        <div className="relative h-52 overflow-hidden bg-slate-900">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={`text-[10px] font-black text-white px-2.5 py-1 rounded shadow tracking-wider ${
              item.type === 'Satılık' ? 'bg-red-700' : item.type === 'Kiralık' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {item.type}
            </span>
            <span className="text-[10px] font-black text-slate-900 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded shadow tracking-wider">
              {item.category}
            </span>
          </div>

          <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/20">
            {item.id}
          </span>

          <div className="absolute bottom-3 left-3 right-3 text-white font-black text-xl drop-shadow-md">
            {item.price.toLocaleString('tr-TR')} <span className="text-sm font-bold">{item.currency}</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-red-700 transition h-10">
            {item.title}
          </h3>

          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold mb-4">
            <MapPin className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
            <span className="truncate">{item.city} / {item.district} / {item.neighborhood}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-bold mb-3">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.rooms}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.area} m²</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Danışman</span>
          <span className="font-extrabold text-slate-800">{item.agentName}</span>
        </div>
        <a 
          href={`tel:${item.agentPhone.replace(/\s+/g, '')}`}
          className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-md shadow-red-700/20"
        >
          <Phone className="w-3 h-3" />
          <span>Ara</span>
        </a>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ApplicationPage({ type }: { type: 'franchise' | 'agent' }) {
  const franchise = type === 'franchise';
  const backgroundImage = franchise ? '/applications/franchise-handshake.png' : '/applications/advisor-key-handover.png';
  return <div className="relative min-h-screen overflow-hidden bg-slate-950 py-16 px-5"><div className="absolute inset-0 bg-cover bg-center opacity-100" style={{backgroundImage: `url('${backgroundImage}')`}}/><div className="absolute inset-0 bg-gradient-to-r from-red-950/72 via-red-700/28 to-transparent"/><div className="relative mx-auto ml-auto max-w-2xl rounded-3xl border border-white/25 bg-white/95 p-7 shadow-2xl sm:p-10"><Link to="/" className="text-sm font-black text-red-700">← Ana Sayfaya Dön</Link><p className="mt-8 text-xs font-black tracking-widest text-red-700">{franchise ? 'FRANCHISE BAŞVURUSU' : 'DANIŞMAN BAŞVURUSU'}</p><h1 className="mt-3 text-3xl font-black text-slate-900">{franchise ? 'Şehrinde Realty Center ol.' : 'Realty Center ailesine katıl.'}</h1><p className="mt-3 text-sm leading-relaxed text-slate-600">Bilgilerinizi bırakın, başvurunuz ilgili ekip tarafından değerlendirilsin.</p><form className="mt-8 grid gap-4 sm:grid-cols-2"><input required placeholder="Ad Soyad" className="rounded-xl border border-slate-200 px-4 py-3"/><input required placeholder="Telefon" className="rounded-xl border border-slate-200 px-4 py-3"/><input required placeholder="E-posta" className="sm:col-span-2 rounded-xl border border-slate-200 px-4 py-3"/><input placeholder={franchise ? "İl / İlçe" : "Bulunduğunuz şehir"} className="sm:col-span-2 rounded-xl border border-slate-200 px-4 py-3"/><textarea placeholder="Mesajınız" className="sm:col-span-2 min-h-28 rounded-xl border border-slate-200 px-4 py-3"/><button type="button" className="sm:col-span-2 rounded-xl bg-red-700 py-3.5 font-black text-white hover:bg-red-800">Başvuruyu Gönder</button></form></div></div>
}


function Header({ scrolled }: { scrolled: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);
  const links = [
    ['Kurumsal', '/kurumsal/hakkimizda'], ['Ofislerimiz', '/ofislerimiz'], ['Danışmanlarımız', '/danismanlarimiz'],
    ['İlanlarımız', '/ilan-kategorileri'], ['Projelerimiz', '/projelerimiz'], ['İletişim', '/iletisim']
  ];
  return (
    <header className={`sticky top-0 z-40 w-full border-b-2 border-red-700 transition-all duration-500 ${scrolled ? 'bg-white/95 py-1.5 px-5 lg:px-10 shadow-lg backdrop-blur-md' : 'bg-white py-2.5 px-6 lg:px-12 shadow-md'}`}>
      <div className="flex items-center justify-between gap-4">
        <Link to="/" onClick={close}><img src="/rlogo.png" alt="Realty Center" className={`w-auto object-contain transition-all duration-500 ${scrolled ? 'h-12 lg:h-14' : 'h-14 lg:h-16'}`} /></Link>
        <nav className="hidden xl:flex items-center gap-6 text-sm font-extrabold text-slate-800">{links.map(([label, to]) => <Link key={to} to={to} className="hover:text-red-700">{label}</Link>)}<Link to="/danisman-basvuru" className="font-black text-red-700">Danışman Ol</Link><Link to="/franchise-basvuru" className="font-black text-red-700">Franchise Ol!</Link></nav>
        <div className="flex items-center gap-2"><Link to="/panel" className="hidden sm:inline-flex rounded-lg bg-red-700 px-5 py-2 text-sm font-black text-white shadow-lg hover:bg-red-800">Panel</Link><button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menüyü aç" className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:border-red-700 hover:text-red-700">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button></div>
      </div>
      {mobileOpen && <nav className="xl:hidden mt-3 border-t border-slate-200 pt-3 pb-2 grid grid-cols-2 gap-2 text-sm font-black text-slate-800">{links.map(([label, to]) => <Link key={to} onClick={close} to={to} className="rounded-lg bg-slate-50 px-3 py-3 hover:bg-red-50 hover:text-red-700">{label}</Link>)}<Link onClick={close} to="/danisman-basvuru" className="rounded-lg bg-red-50 px-3 py-3 text-left text-red-700">Danışman Ol</Link><Link onClick={close} to="/franchise-basvuru" className="rounded-lg bg-red-700 px-3 py-3 text-left text-white">Franchise Ol!</Link><Link onClick={close} to="/panel" className="col-span-2 rounded-lg border border-slate-200 px-3 py-3 text-center">Panele Git</Link></nav>}
    </header>
  );
}

function Footer({ openDrawer }: { openDrawer: (type: 'franchise' | 'agent') => void }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/rlogo.png" 
              alt="Realty Center" 
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Türkiye geneli franchise ağı ve uzman emlak danışmanları ile gayrimenkulde önce güven sağlayan çatı kuruluş.
          </p>
        </div>

        <div>
          <h4 className="text-white font-black mb-4 border-b-2 border-red-700 pb-1 inline-block">İletişim Bilgileri</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>Konutkent Mah. 3028. Cad. West Gate Residence No:2 A Blok Kat:26 Çankaya / ANKARA</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-bold text-white">0532 567 48 45</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-600" />
              <span>info@realtycenter.com.tr</span>
            </li>
            <li className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-red-600" />
              <span>www.realtycenter.com.tr</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black mb-4 border-b-2 border-red-700 pb-1 inline-block">Hızlı Erişim</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><button onClick={() => openDrawer('franchise')} className="hover:text-red-600 font-bold transition">Franchise Başvurusu</button></li>
            <li><button onClick={() => openDrawer('agent')} className="hover:text-red-600 font-bold transition">Danışman Başvurusu</button></li>
            <li><a href="#kvkk" className="hover:text-red-600 transition">KVKK Aydınlatma Metni</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-semibold text-slate-500">
        <span>Dijital Çözüm Ortağı</span>
        <img src="/klogo.png" alt="Kriter Medya" className="h-7 w-auto object-contain brightness-0 invert" />
      </div>
    </footer>
  );
}

function OpportunityCards() {
  const [campaign, setCampaign] = useState(getCampaignSettings);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const refresh = () => setCampaign(getCampaignSettings());
    window.addEventListener('realty-center-campaign-updated', refresh);
    return () => window.removeEventListener('realty-center-campaign-updated', refresh);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveIndex((current) => (current + 1) % SAMPLE_LISTINGS.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const item = SAMPLE_LISTINGS[activeIndex];
  const duration = [campaign.first, campaign.second, campaign.third][activeIndex % 3];

  return (
    <Link to={'/ilanlarimiz?type=' + item.type + '&category=' + item.category} className="group relative block h-[300px] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
      <img key={item.id} src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2"><span className="rounded-full bg-red-700 px-3 py-1 text-[10px] font-black tracking-wider text-white">FIRSAT GAYRİMENKUL</span><span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-red-700">{duration}</span></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white"><p className="text-xs font-black text-red-200">{item.type} • {item.category}</p><h3 className="mt-1 max-w-md text-lg font-black sm:text-xl">{item.title}</h3><div className="mt-3 flex items-center justify-between"><span className="text-2xl font-black">{item.price.toLocaleString('tr-TR')} ₺</span><span className="text-xs font-black">İncele <ArrowRight className="inline h-4 w-4" /></span></div></div>
    </Link>
  );
}

function HomePage({ counts, currentSlide, selectedCity, setSelectedCity, openDrawer }: any) {
  const [activeTab, setActiveTab] = useState<'search' | 'franchise' | 'agent'>('search');
  const [searchDistrict, setSearchDistrict] = useState('');

  const sortedListings = [...SAMPLE_LISTINGS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const marqueeListings = [...sortedListings, ...sortedListings];

  return (
    <>
      <div className="relative h-[68vh] min-h-[520px] w-full overflow-hidden border-b-4 border-red-700 shadow-xl flex items-center bg-slate-900">
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
          <div className="w-full max-w-2xl -ml-4 sm:-ml-10 lg:-ml-20">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`relative overflow-hidden group h-24 rounded-t-lg font-black flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md ${
                  activeTab === 'search' 
                    ? 'bg-red-700 text-white shadow-xl border-b-2 border-red-900 transform -translate-y-1' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Megaphone className="w-6 h-6 relative z-10" />
                <span className="text-sm font-extrabold tracking-wide relative z-10">İlanlar</span>
              </button>

              <Link
                to="/franchise-basvuru"
                className="relative overflow-hidden group h-24 rounded-t-lg bg-white text-slate-900 hover:bg-red-100 hover:text-red-700 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-700 hover:-translate-y-1"
              >
                <Building2 className="w-6 h-6 text-red-700 relative z-10" />
                <span className="text-sm font-extrabold tracking-wide relative z-10">Franchise Ol!</span>
              </Link>

              <Link
                to="/danisman-basvuru"
                className="relative overflow-hidden group h-24 rounded-t-lg bg-white text-slate-900 hover:bg-red-100 hover:text-red-700 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-700 hover:-translate-y-1"
              >
                <Briefcase className="w-6 h-6 text-red-700 relative z-10" />
                <span className="text-sm font-extrabold tracking-wide relative z-10">Danışman Ol!</span>
              </Link>
            </div>

            <div className="bg-white text-slate-900 p-6 rounded-b-lg rounded-tr-lg shadow-2xl space-y-4 border-2 border-red-700/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Satılık / Kiralık</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
                    <option>Konut</option>
                    <option>İşyeri</option>
                    <option>Arsa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">İşlem Tipi</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
                    <option>Satılık</option>
                    <option>Kiralık</option>
                    <option>Devren</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Şehir</label>
                  <select 
                    value={selectedCity} 
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSearchDistrict('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                  >
                    <option value="">İl Seçiniz</option>
                    {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">İlçe</label>
                  <select 
                    disabled={!selectedCity}
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition ${
                      !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">{selectedCity ? 'İlçe Seçiniz' : 'Önce İl Seçin'}</option>
                    {selectedCity && TURKEY_CITIES[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">İlan No</label>
                  <input type="text" placeholder="" className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-700 transition" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Min Fiyat</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-700 transition" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Maks Fiyat</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-700 transition" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Para Birimi</label>
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
                    <option>Türk Lirası</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <button className="relative overflow-hidden group w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-black px-12 py-3.5 rounded-md text-sm flex items-center justify-center space-x-2 transition duration-300 shadow-lg shadow-red-700/40 tracking-widest transform hover:scale-105">
                  <Search className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">ARA</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <img src="/rlogo.png" alt="Realty Center" className="h-12 sm:h-14 w-auto object-contain" />
        </div>
      </div>

      <section className="bg-white text-slate-900 py-12 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-700 mb-1 tracking-tight">{counts.offices}+</div>
            <div className="text-xs text-slate-700 font-extrabold tracking-widest">Franchise Ofis</div>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-700 mb-1 tracking-tight">{counts.agents.toLocaleString('tr-TR')}+</div>
            <div className="text-xs text-slate-700 font-extrabold tracking-widest">Uzman Danışman</div>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-4xl lg:text-5xl font-black text-red-700 mb-1 tracking-tight">{counts.portfolios.toLocaleString('tr-TR')}+</div>
            <div className="text-xs text-slate-700 font-extrabold tracking-widest">Aktif Portföy</div>
          </div>

          <div className="p-4">
            <div className="text-4xl lg:text-5xl font-black text-red-700 mb-1 tracking-tight">%{counts.satisfaction}</div>
            <div className="text-xs text-slate-700 font-extrabold tracking-widest">Müşteri Memnuniyeti</div>
          </div>
        </div>
      </section>

      

      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between gap-6 mb-8"><div><span className="text-xs font-black tracking-widest text-red-700">KATEGORİLER</span><h2 className="mt-2 text-3xl font-black text-slate-900">Portföylerimizi <span className="text-red-700">Keşfedin</span></h2></div><Link to="/ilan-kategorileri" className="text-sm font-black text-red-700 hover:text-red-800">Tüm kategoriler →</Link></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{getListingCategories().slice(0,4).map((category) => <Link key={category.id} to={"/ilanlarimiz?type="+encodeURIComponent(category.type)+"&category="+encodeURIComponent(category.category)} className="group relative min-h-40 overflow-hidden rounded-2xl bg-slate-900 shadow-lg"><img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" /><span className="absolute bottom-4 left-4 text-base font-black text-white">{category.title}</span></Link>)}</div>
        </div>
      </section>

      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-8"><span className="text-xs font-black tracking-widest text-red-700">VİTRİN İLANLARI</span><h2 className="mt-2 text-3xl font-black text-slate-900">Vitrin <span className="text-red-700">İlanları</span></h2></div>
          <div className="grid max-w-sm grid-cols-1 gap-6"><ListingCard item={SAMPLE_LISTINGS[0]} /></div>
        </div>
      </section>

      <section className="py-16 bg-white text-slate-900 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-8 flex items-center justify-between">
          <div><span className="inline-flex items-center space-x-1.5 text-xs font-black text-red-700 tracking-widest bg-red-100 px-3 py-1 rounded-full border border-red-300 mb-2"><Flame className="w-3.5 h-3.5 animate-bounce" /><span>Canlı İlan Akışı</span></span><h2 className="text-2xl sm:text-3xl font-black text-slate-900">EN YENİ <span className="text-red-700">GAYRİMENKUL İLANLARI</span></h2><p className="text-slate-500 text-xs font-medium mt-1">Yeni portföyler fırsat alanının yanında canlı olarak akar.</p></div>
          <Link to="/ilan-kategorileri" className="hidden sm:flex items-center space-x-2 text-xs font-black text-white bg-red-700 hover:bg-red-800 px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-700/30"><span>Tümünü Gör</span><ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="w-full shrink-0 px-6 lg:ml-[max(1.5rem,calc((100vw-80rem)/2))] lg:w-80 lg:px-0"><OpportunityCards /></div>
          <div className="relative min-w-0 flex-1 overflow-hidden py-4 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-12 before:bg-gradient-to-r before:from-white before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-20 after:bg-gradient-to-l after:from-white after:to-transparent">
            <div className="animate-marquee flex space-x-6">{marqueeListings.map((item, idx) => <div key={item.id + '-' + idx} className="w-80 flex-shrink-0 text-slate-900"><ListingCard item={item} /></div>)}</div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden relative min-h-72 bg-slate-900"><img src="/slider/slider3.jpg" alt="DEMO proje" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 to-transparent" /><div className="relative p-9 max-w-md text-white"><span className="text-xs font-black tracking-widest text-red-200">PROJELER</span><h2 className="mt-3 text-3xl font-black">DEMO PROJE</h2><p className="mt-3 text-sm text-white/85">Gerçek proje bilgileri, görselleri ve dokümanları yönetim panelinden eklenecektir.</p><Link to="/projelerimiz" className="inline-flex mt-6 rounded-xl bg-red-700 px-5 py-3 text-sm font-black hover:bg-red-800">Projeleri İncele</Link></div></div>
          <div className="rounded-3xl bg-red-700 p-8 text-white"><span className="text-xs font-black tracking-widest text-red-100">12 · FRANCHISE</span><h2 className="mt-3 text-3xl font-black">Şehrinde Realty Center ol.</h2><p className="mt-4 text-sm leading-relaxed text-red-50">Bayilik modeli, avantajlar ve başvuru süreci burada anlatılacaktır.</p><Link to="/franchise-basvuru" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-red-700">Tümünü Gör</Link></div>
        </div>
      </section>

      <section className="bg-white py-16 border-b border-slate-200 overflow-hidden"><div className="max-w-7xl mx-auto px-6 lg:px-12"><div className="mb-8 flex items-end justify-between"><div><span className="text-xs font-black tracking-widest text-red-700">ÖNE ÇIKAN OFİSLER</span><h2 className="mt-2 text-3xl font-black text-slate-900">Güçlü <span className="text-red-700">ofis ağımız</span></h2></div><Link to="/ofislerimiz" className="text-sm font-black text-red-700">Tümünü Gör →</Link></div><div className="flex w-max gap-6 animate-marquee"><Link to="/ofislerimiz" className="w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl"><img src={SAMPLE_OFFICES[0].image} alt="DEMO ofis" className="h-44 w-full rounded-xl object-cover"/><p className="mt-4 text-xs font-black text-red-700">DEMO OFİS</p><h3 className="mt-1 text-lg font-black text-slate-900">Öne Çıkan Ofis</h3></Link></div></div></section>
      <section className="bg-slate-50 py-16 border-b border-slate-200 overflow-hidden"><div className="max-w-7xl mx-auto px-6 lg:px-12"><div className="mb-8 flex items-end justify-between"><div><span className="text-xs font-black tracking-widest text-red-700">ÖNE ÇIKAN DANIŞMANLAR</span><h2 className="mt-2 text-3xl font-black text-slate-900">Uzman <span className="text-red-700">danışmanlarımız</span></h2></div><Link to="/danismanlarimiz" className="text-sm font-black text-red-700">Tümünü Gör →</Link></div><div className="flex w-max gap-6 animate-marquee"><Link to="/danismanlarimiz" className="w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl"><img src={SAMPLE_AGENTS[0].image} alt="DEMO danışman" className="h-44 w-full rounded-xl object-cover"/><p className="mt-4 text-xs font-black text-red-700">DEMO DANIŞMAN</p><h3 className="mt-1 text-lg font-black text-slate-900">Öne Çıkan Danışman</h3></Link></div></div></section>
      <section className="bg-white py-16 border-b border-slate-200 overflow-hidden"><div className="max-w-7xl mx-auto px-6 lg:px-12"><div className="mb-8"><span className="text-xs font-black tracking-widest text-red-700">BLOG YAZILARI</span><h2 className="mt-2 text-3xl font-black text-slate-900">REALTY <span className="text-red-700">BLOG</span></h2></div><div className="flex w-max gap-6 animate-marquee"><article className="w-96 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-md"><p className="text-xs font-black text-red-700">DEMO BLOG YAZISI</p><h3 className="mt-3 text-xl font-black text-slate-900">Gayrimenkul piyasasında doğru adımlar</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">Gerçek blog yazıları ve piyasa notları yönetim panelinden yayımlanacaktır.</p><button className="mt-5 text-sm font-black text-red-700">Yazıyı Oku →</button></article></div></div></section>

      

      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-red-700 p-8 text-white"><span className="text-xs font-black tracking-widest text-red-100">KARİYER</span><h2 className="mt-3 text-3xl font-black">Gayrimenkul kariyerine güçlü bir başlangıç.</h2><p className="mt-4 text-sm leading-relaxed text-red-50">Danışmanlık fırsatları, eğitimler ve kariyer başvuruları bu alandan yönetilecektir.</p><Link to="/danisman-basvuru" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-red-700">Kariyer Başvurusu</Link></div>
          <div className="rounded-3xl border border-slate-200 p-8"><span className="text-xs font-black tracking-widest text-red-700">İLETİŞİM FORMU</span><h2 className="mt-3 text-3xl font-black text-slate-900">Size ulaşalım.</h2><form className="mt-5 grid gap-3 sm:grid-cols-2"><input placeholder="Ad Soyad" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input placeholder="Telefon" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input placeholder="E-posta" className="sm:col-span-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"/><textarea placeholder="Mesajınız" className="sm:col-span-2 min-h-24 rounded-xl border border-slate-200 px-4 py-3 text-sm"/><button type="button" className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-red-700">DEMO Formu Gönder</button></form></div>
        </div>
      </section>
      <section className="bg-slate-50 py-10 border-b border-slate-200"><div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center justify-center gap-5 text-center"><div><span className="text-xs font-black tracking-widest text-red-700">SOSYAL MEDYA</span><h2 className="mt-1 text-2xl font-black text-slate-900">Realty Center’ı takip edin.</h2></div><div className="flex gap-3"><a href="#" aria-label="Instagram" className="rounded-xl bg-white border border-slate-200 p-4 text-red-700 transition hover:-translate-y-1 hover:bg-red-700 hover:text-white"><MessageCircle className="h-6 w-6"/></a><a href="#" aria-label="LinkedIn" className="rounded-xl bg-white border border-slate-200 p-4 text-red-700 transition hover:-translate-y-1 hover:bg-red-700 hover:text-white"><Globe className="h-6 w-6"/></a><a href="#" aria-label="YouTube" className="rounded-xl bg-white border border-slate-200 p-4 text-red-700 transition hover:-translate-y-1 hover:bg-red-700 hover:text-white"><Send className="h-6 w-6"/></a></div></div></section>

      <TurkeyListingMap />

      <section id="kurumsal" className="bg-slate-950 py-20 text-white border-b border-red-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-10"><div><span className="text-xs font-black tracking-widest text-red-200">GÜVEN · UZMANLIK · ŞEFFAFLIK</span><h2 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">NEDEN <span className="text-red-500">REALTY CENTER?</span></h2></div><Link to="/kurumsal/once-guven" className="inline-flex w-fit rounded-xl border border-red-400 bg-red-700 px-5 py-3 text-sm font-black text-white transition hover:bg-red-600">Tümünü Gör →</Link></div>
          <div className="grid gap-3 md:grid-cols-2">{['Önce güven ilkesiyle şeffaf hizmet','Uzman danışmanlarla doğru eşleştirme','Güncel ve doğrulanmış portföyler','Franchise ağıyla güçlü yerel erişim','Satış ve kiralama sürecinde uçtan uca destek','Yatırım kararlarında profesyonel rehberlik'].map((item, index) => <Link key={item} to="/kurumsal/once-guven" className="group flex items-center gap-4 rounded-xl bg-red-700 px-5 py-4 font-black transition hover:-translate-y-1 hover:bg-red-600"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm text-red-700">{index + 1}</span><span>{item}</span><ArrowRight className="ml-auto h-5 w-5 transition group-hover:translate-x-1"/></Link>)}</div>
        </div>
      </section>

      <section id="akademi" className="py-20 px-6 lg:px-12 bg-white text-slate-900 border-b-4 border-red-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl blur-xl opacity-40 group-hover:opacity-75 transition duration-500" />
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-red-200 bg-white aspect-video lg:aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" 
                alt="Realty Center Emlak Danışmanlığı Eğitimi" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-700 text-white rounded-lg shadow-md shadow-red-700/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-wider">REALTY CENTER AKADEMİ</h4>
                    <p className="text-xs text-slate-600 font-medium">Sertifikalı Profesyonel Eğitim</p>
                  </div>
                </div>
                <span className="text-xs font-black text-red-700 bg-red-100 px-3 py-1.5 rounded-md border border-red-300">
                  Sınırlı Kontenjan
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="inline-flex items-center space-x-2 text-xs font-black text-red-700 tracking-widest bg-red-100 px-4 py-1.5 rounded-full border border-red-300">
              <GraduationCap className="w-4 h-4" />
              <span>Geleceğinizi İnşa Edin</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              EMLAK DANIŞMANLIĞI <br className="hidden sm:inline" />
              <span className="text-red-700">
                EĞİTİMİMİZE KATIL
              </span>
            </h2>

            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Realty Center Akademi bünyesinde düzenlenen interaktif <strong className="text-slate-900 font-bold">ofis içi ve online eğitimlerimizle</strong>, gayrimenkul sektörünün zirvesine adım atın. Satış tekniklerinden hukuki mevzuatlara, portföy yönetiminden dijital pazarlamaya kadar tüm süreçleri alanında uzman eğitmenlerimizden öğrenin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-700 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Kapsamlı Ofis ve Online Eğitim</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-700 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Birebir Mentörlük Desteği</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-700 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">MEB ve Kurumsal Sertifika</span>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-red-700 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800">Anında Danışmanlık İmkânı</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => openDrawer('agent')} 
                className="relative overflow-hidden group bg-red-700 hover:bg-red-800 text-white font-black px-8 py-4 rounded-xl text-sm flex items-center justify-center space-x-3 shadow-xl shadow-red-700/30 transition duration-300 transform hover:scale-105 tracking-wider"
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

function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-700 pb-2 inline-block">Hakkımızda</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Realty Center kurumsal vizyonu, misyonu ve değerleri bu sayfada yer alacaktır.</p>
    </div>
  );
}

function TrustPrinciplePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-700 pb-2 inline-block">Önce Güven İlkesi</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Şeffaf ticaret, güvenilir altyapı ve hukuki süreç yönetimimiz bu sayfada açıklanacaktır.</p>
    </div>
  );
}

function TeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-700 pb-2 inline-block">Yönetim Kadrosu & Ekibimiz</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Realty Center yönetim kurulu üyeleri ve merkez ekibimiz bu alanda gösterilecektir.</p>
    </div>
  );
}

function AcademyPage({ openDrawer }: { openDrawer: (type: 'franchise' | 'agent') => void }) {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center space-x-2 text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Sertifikalı Profesyonel Eğitimler</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              REALTY CENTER <span className="text-red-700">AKADEMİ</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed mb-4">
              Gayrimenkul sektöründe sıradan bir danışman değil, aranan bir <strong className="text-slate-900 font-extrabold">sektör uzmanı</strong> olmanız için buradayız.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Teorik ezberlerin ötesinde; saha simülasyonları, tapu hukuku, arsa-arazi değerlemesi ve lüks konut ikna teknikleriyle geleceğinizi inşa ediyoruz.
            </p>

            <button 
              onClick={() => openDrawer('agent')} 
              className="bg-red-700 hover:bg-red-800 text-white font-black px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-red-700/30 transition transform hover:scale-105 tracking-wider flex items-center space-x-2"
            >
              <span>Eğitime Hemen Başvur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-t from-red-700 via-red-600 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-2xl overflow-hidden border-2 border-red-300 bg-white shadow-2xl aspect-video lg:aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" 
                alt="Realty Center Eğitim Sınıfı" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-white/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-red-700 tracking-widest block">Geleceğin Profesyonelleri</span>
                  <span className="text-xs font-black text-slate-900">Saha ve Online Eğitim Seçenekleriyle</span>
                </div>
                <GraduationCap className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300">
            Aktif Eğitim Paketleri
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Sertifikalı <span className="text-red-700">Eğitim Programlarımız</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-700 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
                  alt="Arazi Arsa Uzmanlığı" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-700 px-2.5 py-1 rounded shadow tracking-wider">
                  Arazi & Arsa Uzmanlığı
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">İleri Seviye Arazi & Arsa Gayrimenkul Değerleme</h3>
                <p className="text-slate-500 text-xs mb-4">Saha + Online İnteraktif / 3 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>İmar, Kadastro ve Parselasyon Analizi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Hobi Bahçesi ve Ticari İmarlı Arsa Ayrımı</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Sertifika ve Uygulama Belgesi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-slate-900">12.500 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-700 hover:bg-red-800 text-white font-black px-4 py-2.5 rounded-lg text-xs transition"
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-red-700 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between relative transform hover:-translate-y-1 group">
            <div className="absolute top-3 right-3 z-10 bg-red-700 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full shadow">
              En Çok Tercih Edilen
            </div>

            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" 
                  alt="Saha Satış Eğitimi" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-slate-900 px-2.5 py-1 rounded shadow tracking-wider">
                  Saha Satış Masterclass
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">Saha Satış & İkna Teknikleri Masterclass</h3>
                <p className="text-slate-500 text-xs mb-4">Birebir Mentörlük + Ofis İçi / 4 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Nitelikli Müşteri Portföyü Oluşturma</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Fiyat İtirazı Karşılama ve Sözleşme İkna Psikolojisi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Realty Center Kurumsal Sertifikası</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-red-100/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-red-700">18.000 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-2.5 rounded-lg text-xs transition shadow-lg shadow-red-700/30"
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-700 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800" 
                  alt="Tapu ve Sözleşme Hukuku" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-700 px-2.5 py-1 rounded shadow tracking-wider">
                  Hukuk & Mevzuat
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">Sözleşme Hukuku & Tapu Mevzuatı Eğitimi</h3>
                <p className="text-slate-500 text-xs mb-4">Online Canlı Yayın / 2 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Güvenli Sözleşme Taslakları ve Hukuki İnceleme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Hisseli Tapu ve İntikal Süreç Yönetimi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>Sertifika ve Hukuki Belge Arşivi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-slate-900">9.500 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-700 hover:bg-red-800 text-white font-black px-4 py-2.5 rounded-lg text-xs transition"
              >
                Kayıt Ol
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function OfficesPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const filteredOffices = SAMPLE_OFFICES.filter((office) => {
    if (selectedCity && office.city !== selectedCity) return false;
    if (selectedDistrict && office.district !== selectedDistrict) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="mb-8">
          <span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 inline-block mb-3">
            Franchise Ağımız
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            REALTY CENTER <span className="text-red-700">OFİSLERİMİZ</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Türkiye genelindeki bölge başkanlıklarımız ve yetkili temsilciliklerimiz
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-500 tracking-wider mr-2 hidden sm:inline flex-shrink-0">
              Hızlı Seçim:
            </span>
            <button 
              onClick={() => { setSelectedCity(''); setSelectedDistrict(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                selectedCity === '' 
                  ? 'bg-red-700 text-white shadow-md shadow-red-700/30' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tüm Ofisler
            </button>

            {["Ankara", "İstanbul", "İzmir"].map((cityName) => (
              <button 
                key={cityName}
                onClick={() => { setSelectedCity(cityName); setSelectedDistrict(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                  selectedCity === cityName 
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/30' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="relative">
              <select 
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
              >
                <option value="">-- Tüm İller (81 İl) --</option>
                {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                disabled={!selectedCity}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={`w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition ${
                  !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">{selectedCity ? '-- Tüm İlçeler --' : 'Önce İl Seçiniz'}</option>
                {selectedCity && TURKEY_CITIES[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

        </div>

        {filteredOffices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffices.map((office) => (
              <div 
                key={office.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-700 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-200">
                    {office.image ? (
                      <img 
                        src={office.image} 
                        alt={office.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="p-6 text-center flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                        <img 
                          src="/rlogo.png" 
                          alt="Realty Center" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-600 mt-2">REALTY CENTER</span>
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-700 px-3 py-1 rounded-md shadow tracking-wider">
                      {office.city} / {office.district}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-red-700 transition">
                      {office.name}
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                      <div className="flex items-start space-x-2.5">
                        <MapPin className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{office.address}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-red-700 flex-shrink-0" />
                        <span className="font-bold text-slate-900">{office.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Mail className="w-4 h-4 text-red-700 flex-shrink-0" />
                        <span>{office.email}</span>
                      </div>

                      <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-100">
                        <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-slate-700">Ofis Yöneticisi: {office.manager}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-2">
                  <a 
                    href={`tel:${office.phone.replace(/\s+/g, '')}`}
                    className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-700" />
                    <span>Ara</span>
                  </a>

                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-red-700/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Harita</span>
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aradığınız kriterlerde ofis bulunamadı.</h3>
            <p className="text-slate-500 text-xs mt-1">Lütfen farklı bir il veya ilçe seçimi yapınız.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function AgentsPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const filteredAgents = SAMPLE_AGENTS.filter((agent) => {
    if (selectedCity && agent.city !== selectedCity) return false;
    if (selectedDistrict && agent.district !== selectedDistrict) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="mb-8">
          <span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 inline-block mb-3">
            Uzman Kadromuz
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            GAYRİMENKUL <span className="text-red-700">DANIŞMANLARIMIZ</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Saha tecrübesi ve uzmanlığıyla hayalinizdeki gayrimenkule yön veren profesyonellerimiz
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-500 tracking-wider mr-2 hidden sm:inline flex-shrink-0">
              Hızlı Seçim:
            </span>
            <button 
              onClick={() => { setSelectedCity(''); setSelectedDistrict(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                selectedCity === '' 
                  ? 'bg-red-700 text-white shadow-md shadow-red-700/30' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tüm Danışmanlar
            </button>

            {["Ankara", "İstanbul", "İzmir"].map((cityName) => (
              <button 
                key={cityName}
                onClick={() => { setSelectedCity(cityName); setSelectedDistrict(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                  selectedCity === cityName 
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/30' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="relative">
              <select 
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
              >
                <option value="">-- Tüm İller (81 İl) --</option>
                {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                disabled={!selectedCity}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={`w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition ${
                  !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">{selectedCity ? '-- Tüm İlçeler --' : 'Önce İl Seçiniz'}</option>
                {selectedCity && TURKEY_CITIES[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

        </div>

        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => (
              <div 
                key={agent.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-700 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-64 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-200">
                    {agent.image ? (
                      <img 
                        src={agent.image} 
                        alt={agent.name} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="p-6 text-center flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                        <img 
                          src="/rlogo.png" 
                          alt="Realty Center" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-600 mt-2">REALTY CENTER DANIŞMANI</span>
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-700 px-3 py-1 rounded-md shadow tracking-wider">
                      {agent.city} / {agent.district}
                    </span>

                    <span className="absolute bottom-3 right-3 text-[10px] font-black text-slate-900 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow border border-slate-200">
                      {agent.activeListings} Aktif İlan
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-red-700 transition">
                      {agent.name}
                    </h3>

                    <span className="text-xs font-bold text-red-700 block mb-3 tracking-wider">
                      {agent.title}
                    </span>

                    <div className="space-y-2.5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3">
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-800 font-semibold">{agent.office}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-red-700 flex-shrink-0" />
                        <span className="font-bold text-slate-900">{agent.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Mail className="w-4 h-4 text-red-700 flex-shrink-0" />
                        <span>{agent.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-2">
                  <a 
                    href={`tel:${agent.phone.replace(/\s+/g, '')}`}
                    className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-red-700/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hemen Ara</span>
                  </a>

                  <Link 
                    to="/ilanlarimiz" 
                    className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-red-700" />
                    <span>İlanları</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aradığınız kriterlerde danışman bulunamadı.</h3>
            <p className="text-slate-500 text-xs mt-1">Lütfen farklı bir il veya ilçe seçimi yapınız.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function ListingCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ListingCategory[]>(getListingCategories);
  useEffect(() => {
    const refresh = () => setCategories(getListingCategories());
    window.addEventListener('realty-center-categories-updated', refresh);
    return () => window.removeEventListener('realty-center-categories-updated', refresh);
  }, []);
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-9"><span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 inline-block mb-3">Portföy Kategorileri</span><h1 className="text-3xl sm:text-4xl font-black text-slate-900">İLANLARI <span className="text-red-700">KEŞFEDİN</span></h1><p className="text-slate-600 text-sm font-medium mt-2">İhtiyacınıza uygun kategoriyi seçerek tüm ilanları inceleyin.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((item) => <button key={item.id} onClick={() => navigate('/ilanlarimiz?type=' + encodeURIComponent(item.type) + '&category=' + encodeURIComponent(item.category))} className="group relative h-64 overflow-hidden rounded-2xl text-left shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
            <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6"><span className="text-xs font-black tracking-widest text-red-200">{item.type}</span><h2 className="mt-1 text-xl sm:text-2xl font-black text-white leading-tight">{item.title}</h2><span className="mt-3 inline-flex items-center text-sm font-bold text-white">İlanları Gör <ArrowRight className="ml-1.5 w-4 h-4" /></span></div>
          </button>)}
        </div>
      </div>
    </div>
  );
}

function ListingsPage() {
  const location = useLocation();
  const initialCity = new URLSearchParams(location.search).get('city') || '';
  const initialType = new URLSearchParams(location.search).get('type') || '';
  const initialCategory = new URLSearchParams(location.search).get('category') || '';
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCity(params.get('city') || '');
    setSelectedType(params.get('type') || '');
    setSelectedCategory(params.get('category') || '');
  }, [location.search]);

  const filteredListings = SAMPLE_LISTINGS.filter((item) => {
    if (selectedType && item.type !== selectedType) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedCity && item.city !== selectedCity) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="mb-8">
          <span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 inline-block mb-3">
            Aktif Portföyler
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            TÜM GAYRİMENKUL <span className="text-red-700">İLANLARIMIZ</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Türkiye genelindeki kurumsal onaylı güncel emlak seçenekleri
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">İşlem Tipi</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm İşlem Tipleri</option>
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
              <option value="Devren">Devren</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">Kategori</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="Konut">Konut</option>
              <option value="İşyeri">İşyeri</option>
              <option value="Arsa">Arsa</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">Şehir</label>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm Şehirler</option>
              {Object.keys(TURKEY_CITIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => { setSelectedType(''); setSelectedCategory(''); setSelectedCity(''); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aradığınız kriterlerde ilan bulunamadı.</h3>
            <p className="text-slate-500 text-xs mt-1">Lütfen farklı filtre seçenekleri deneyiniz.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-700 pb-2 inline-block">Projelerimiz</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Konut ve ticari proje lansmanları ile kat planları bu sayfada sergilenecektir.</p>
    </div>
  );
}

function ContactPage({ onSendMessage }: { onSendMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => void }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email || !form.message) {
      alert("Lütfen tüm alanları doldurunuz.");
      return;
    }

    onSendMessage(form);
    
    setSubmitted(true);
    setForm({ fullName: '', phone: '', email: '', message: '' });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-black text-red-700 tracking-widest bg-red-200 px-3.5 py-1.5 rounded-full border border-red-300 inline-block mb-3">
            Bize Ulaşın
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            İLETİŞİM & <span className="text-red-700">DESTEK</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-2">
            Sorularınız, gayrimenkul talepleriniz veya iş birliği fırsatları için ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border-2 border-slate-200 shadow-xl relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Bize Mesaj Gönderin</h2>
                <p className="text-xs text-slate-500 font-medium">Formu doldurun, uzman ekibimiz en kısa sürede dönüş yapsın.</p>
              </div>
            </div>

            {submitted && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-3 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Mesajınız yönetim merkezimize başarıyla iletilmiştir. İlginiz için teşekkür ederiz!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                  Ad Soyad *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Adınız ve Soyadınız"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                    Telefon Numarası *
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="05XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                    E-Posta Adresi *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="ornek@domain.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                  Mesajınız *
                </label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Talep, görüş veya sorunuzu buraya detaylıca yazabilirsiniz..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 transition resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-4 rounded-xl text-xs tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-red-700/30 transition transform hover:scale-[1.01]"
              >
                <span>Mesajı Gönder</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-2xl border-2 border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white">Genel Merkez İletişim</h3>
                <p className="text-xs text-red-600 font-bold tracking-wider mt-0.5">REALTY CENTER GAYRİMENKUL A.Ş.</p>
              </div>

              <div className="space-y-4 text-xs font-medium text-slate-300">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-red-700/20 text-red-600 rounded-lg flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">Açık Adres</strong>
                    <span>Konutkent Mah. 3028. Cad. West Gate Residence No:2 A Blok Kat:26 No:244 Çankaya / ANKARA</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-700/20 text-red-600 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">Telefon / Danışma Hattı</strong>
                    <span className="text-sm font-black text-white">0532 567 48 45</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-700/20 text-red-600 rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">E-Posta</strong>
                    <span>info@realtycenter.com.tr</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-700/20 text-red-600 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">Çalışma Saatleri</strong>
                    <span>Hafta İçi & Cumartesi: 09:00 - 18:30</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <a 
                  href="https://maps.google.com/?q=West+Gate+Residence+Ankara"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-white/10 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-white/10"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Google Haritalar'da Aç</span>
                </a>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg overflow-hidden h-52 relative">
              <iframe 
                title="Realty Center Merkez Harita"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3061.2723654101886!2d32.68412!3d39.88954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3394541707d8d%3A0x8bb9d1b73489e2!2sWest%20Gate%20Residence!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str" 
                className="w-full h-full rounded-xl border-0"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    navigate('/danisman-panel');
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-6 text-center border-b-4 border-red-700">
            <img
              src="/rlogo.png"
              alt="Realty Center"
              className="h-14 w-auto mx-auto object-contain brightness-0 invert mb-3"
            />

            <h1 className="text-2xl font-black text-white">Panel Girişi</h1>
            <p className="text-slate-400 text-sm mt-2">
              Danışman ve yönetim paneline giriş yapın.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Kullanıcı Adı / E-posta
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı veya e-postanızı girin"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-700 transition"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <X className="w-5 h-5" /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-red-700" />
                <span className="text-slate-600 font-medium">Beni hatırla</span>
              </label>

              <button
                type="button"
                className="text-red-700 hover:text-red-800 font-bold text-xs"
                onClick={() => alert('Şifre yenileme bağlantısı e-posta adresinize gönderildi.')}
              >
                Şifremi unuttum
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-700/30 transition transform hover:scale-[1.02]"
            >
              <span>Danışman Girişi Yap</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* SÜPER ADMİN GEÇİŞ BUTONU */}
          <div className="px-6 pb-6 pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Sistem Yönetimi
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Link
              to="/super-admin"
              className="w-full bg-slate-900 hover:bg-black text-slate-200 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-800 transition shadow-md group"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              <span>Süper Admin Giriş Paneli</span>
            </Link>
          </div>

          <div className="border-t border-slate-200 px-6 py-3 text-center bg-slate-50">
            <p className="text-[11px] text-slate-500 font-medium">
              Yetkisiz kişilerin panele erişmesi yasaktır.
            </p>
          </div>
        </div>

        <div className="text-center mt-3">
          <Link to="/" className="text-sm text-slate-500 hover:text-red-700 font-bold transition">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuperAdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (username === 'admin' && password === '123456') {
      navigate('/super-admin-panel');
    } else {
      setErrorMsg('Süper Admin yetkisi bulunamadı veya bilgiler hatalı!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          
          <div className="p-6 text-center border-b border-slate-200 bg-white">
            <div className="w-14 h-14 bg-red-700/20 text-red-600 rounded-2xl border border-red-700/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-700/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-wide">SÜPER ADMİN</h1>
            <p className="text-xs text-red-600 font-extrabold tracking-widest mt-1 uppercase">
              Sistem Yönetim Merkezi
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
            {errorMsg && (
              <div className="bg-red-600/10 border border-red-600/30 text-red-500 p-3 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>{errorMsg}</span>
                <X className="w-4 h-4 cursor-pointer" onClick={() => setErrorMsg('')} />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                Yönetici Kullanıcı Adı
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin kullanıcı adı"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider">
                Güvenlik Parolası
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 font-bold"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3.5 rounded-xl text-xs tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-red-700/30 transition transform hover:scale-[1.01]"
            >
              <span>Sistem Paneline Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-slate-200 px-6 py-3.5 text-center bg-slate-50">
            <p className="text-[10px] text-slate-500 font-medium">
              Bu alan üst düzey yönetici erişimi içindir. Tüm erişim logları tutulmaktadır.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-slate-500 hover:text-red-600 font-bold transition">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}

// SÜPER ADMİN YÖNETİM PANELİ DASHBOARD (KAPSAMLI KOD)
function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'franchise' | 'offices' | 'agents' | 'listings' | 'categories' | 'messages' | 'settings'>('overview');
  const [contactSettings, setContactSettings] = useState(getContactSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [campaignSettings, setCampaignSettings] = useState(getCampaignSettings);
  const [categories, setCategories] = useState<ListingCategory[]>(getListingCategories);
  const [categorySaved, setCategorySaved] = useState(false);
  const [newCategory, setNewCategory] = useState<ListingCategory>({ id: '', title: '', type: 'Satılık', category: 'Konut', image: '' });

  const saveCategories = (nextCategories = categories) => {
    localStorage.setItem('realty-center-listing-categories', JSON.stringify(nextCategories));
    window.dispatchEvent(new Event('realty-center-categories-updated'));
    setCategorySaved(true);
    setTimeout(() => setCategorySaved(false), 2500);
  };
  const updateCategory = (id: string, patch: Partial<ListingCategory>) => setCategories((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addCategory = () => {
    if (!newCategory.title.trim()) return;
    const item = { ...newCategory, id: newCategory.id || 'category-' + Date.now(), image: newCategory.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=90&w=1200' };
    const next = [...categories, item];
    setCategories(next);
    saveCategories(next);
    setNewCategory({ id: '', title: '', type: 'Satılık', category: 'Konut', image: '' });
  };
  const handleCategoryImage = (id: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateCategory(id, { image: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const saveContactSettings = () => {
    localStorage.setItem('realty-center-contact-settings', JSON.stringify(contactSettings));
    window.dispatchEvent(new Event('realty-center-contact-updated'));
    localStorage.setItem('realty-center-campaign-settings', JSON.stringify(campaignSettings));
    window.dispatchEvent(new Event('realty-center-campaign-updated'));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Franchise Başvuru Verileri
  const [franchiseApps, setFranchiseApps] = useState([
    { id: 'FR-801', name: 'Ahmet Karakaş', phone: '0532 999 88 77', city: 'Bursa', district: 'Nilüfer', date: '2026-08-11', status: 'Beklemede', budget: '2.500.000 ₺' },
    { id: 'FR-802', name: 'Mustafa Şahin', phone: '0535 444 33 22', city: 'Antalya', district: 'Alanya', date: '2026-08-10', status: 'Onaylandı', budget: '3.000.000 ₺' },
    { id: 'FR-803', name: 'Selin Yıldız', phone: '0542 111 22 33', city: 'Muğla', district: 'Bodrum', date: '2026-08-09', status: 'Incelemede', budget: '4.500.000 ₺' },
    { id: 'FR-804', name: 'Oğuzhan Kaya', phone: '0555 777 66 55', city: 'Eskişehir', district: 'Tepebaşı', date: '2026-08-07', status: 'Reddedildi', budget: '1.800.000 ₺' }
  ]);

  // Ofis Listesi Verileri
  const [offices] = useState(SAMPLE_OFFICES);

  // Danışman Verileri
  const [agents] = useState(SAMPLE_AGENTS);

  // İlan Verileri (Onay Bekleyenler)
  const [listings, setListings] = useState([
    ...SAMPLE_LISTINGS.map(l => ({ ...l, approvalStatus: 'Yayında' })),
    { id: 'RC-999', title: 'Çankaya\'da Lüks Ofis Katı', category: 'İşyeri', type: 'Kiralık', price: 95000, city: 'Ankara', district: 'Çankaya', agentName: 'Hakan Uçar', date: '2026-08-12', approvalStatus: 'Onay Bekliyor' }
  ]);

  // Genel Mesajlar
  const [contactMessages] = useState([
    { id: 'MSG-01', sender: 'Kemal Sunal', email: 'kemal@test.com', phone: '0532 000 00 00', subject: 'Toplu Konut Projesi İşbirliği', status: 'Okunmadı', date: '2026-08-12' },
    { id: 'MSG-02', sender: 'Berna Tan', email: 'berna@test.com', phone: '0533 111 00 11', subject: 'Sistem Giriş Hatası', status: 'Yanıtlandı', date: '2026-08-11' }
  ]);

  const updateFranchiseStatus = (id: string, newStatus: string) => {
    setFranchiseApps(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  const updateListingApproval = (id: string, newStatus: string) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, approvalStatus: newStatus } : item));
  };

  const navButtons = [
    { key: 'overview' as const, label: 'Genel Bakış & İstatistik', icon: PieChart },
    { key: 'franchise' as const, label: 'Franchise Başvuruları', icon: FileText, badge: franchiseApps.filter(a => a.status === 'Beklemede').length },
    { key: 'offices' as const, label: 'Franchise Ofis Yönetimi', icon: Building2 },
    { key: 'agents' as const, label: 'Danışman Kontrolü', icon: Users },
    { key: 'listings' as const, label: 'İlan Onay Mekanizması', icon: Layers, badge: listings.filter(l => l.approvalStatus === 'Onay Bekliyor').length },
    { key: 'categories' as const, label: 'Kategori Yönetimi', icon: Tag },
    { key: 'messages' as const, label: 'Sistem Mesajları', icon: MessageSquare },
    { key: 'settings' as const, label: 'Sistem Ayarları', icon: Settings }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ÜST ADMİN HEADER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-700/20 text-red-600 rounded-2xl border border-red-700/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-wide">SÜPER ADMİN KONTROL PANELİ</h1>
                <span className="bg-red-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  ROOT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Realty Center Türkiye Genel Merkez Ana Kontrol ve Yetkilendirme Ekranı
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              Sistem Durumu: <span className="text-emerald-500 font-black">Online / Aktif</span>
            </span>

            <button 
              onClick={() => navigate('/super-admin')} 
              className="bg-red-700/20 hover:bg-red-700 text-red-500 hover:text-slate-900 border border-red-700/30 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Güvenli Çıkış</span>
            </button>
          </div>
        </div>

        {/* MASAÜSTÜ SİDEBAR VE İÇERİK DÜZENİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL MENÜ */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xl space-y-1">
              {navButtons.map((btn) => {
                const Icon = btn.icon;
                const isActive = activeTab === btn.key;

                return (
                  <button
                    key={btn.key}
                    onClick={() => setActiveTab(btn.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-extrabold text-xs transition duration-200 ${
                      isActive 
                        ? 'bg-red-700 text-white shadow-lg shadow-red-700/30' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                      <span>{btn.label}</span>
                    </div>

                    {btn.badge !== undefined && btn.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-red-700' : 'bg-red-700 text-white'
                      }`}>
                        {btn.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SAĞ İÇERİK EKRANI */}
          <div className="lg:col-span-9">
            
            {/* 1. GENEL BAKIŞ VE İSTATİSTİK TABI */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* METRİK KARTLARI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Franchise Ofis</span>
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">{offices.length}</div>
                    <p className="text-[11px] text-emerald-400 font-bold mt-1">↑ %12 Geçen aya göre</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aktif Danışman</span>
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">1,024</div>
                    <p className="text-[11px] text-emerald-400 font-bold mt-1">↑ 48 yeni kayıt</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Yayındaki İlan</span>
                      <Layers className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">15,480</div>
                    <p className="text-[11px] text-emerald-400 font-bold mt-1">↑ %8 Portföy artışı</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aylık Ciro</span>
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">₺ 4.2M</div>
                    <p className="text-[11px] text-emerald-400 font-bold mt-1">↑ %18 Gelir büyümesi</p>
                  </div>
                </div>

                {/* HIZLI AKIŞ TABLOLARI */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* BEKLEYEN BAŞVURULAR */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <span>Bekleyen Franchise Başvuruları</span>
                      </h3>
                      <button onClick={() => setActiveTab('franchise')} className="text-xs text-red-600 font-bold hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="space-y-3">
                      {franchiseApps.filter(a => a.status === 'Beklemede').map((app) => (
                        <div key={app.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-900">{app.name} ({app.city} / {app.district})</div>
                            <div className="text-[11px] text-slate-500 font-medium">Bütçe: {app.budget} · {app.date}</div>
                          </div>
                          <div className="flex space-x-1.5">
                            <button onClick={() => updateFranchiseStatus(app.id, 'Onaylandı')} className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-slate-900 rounded-lg transition">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => updateFranchiseStatus(app.id, 'Reddedildi')} className="p-1.5 bg-red-700/20 text-red-500 hover:bg-red-700 hover:text-white rounded-lg transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ONAY BEKLEYEN İLANLAR */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Onay Bekleyen İlanlar</span>
                      </h3>
                      <button onClick={() => setActiveTab('listings')} className="text-xs text-red-600 font-bold hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="space-y-3">
                      {listings.filter(l => l.approvalStatus === 'Onay Bekliyor').map((listing) => (
                        <div key={listing.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{listing.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{listing.agentName} · {listing.price.toLocaleString('tr-TR')} ₺</div>
                          </div>
                          <div className="flex space-x-1.5">
                            <button onClick={() => updateListingApproval(listing.id, 'Yayında')} className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-slate-900 rounded-lg transition">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => updateListingApproval(listing.id, 'Reddedildi')} className="p-1.5 bg-red-700/20 text-red-500 hover:bg-red-700 hover:text-white rounded-lg transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2. FRANCHİSE BAŞVURULARI TABI */}
            {activeTab === 'franchise' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Franchise Başvuruları</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Sistem üzerinden gönderilen yeni temsilcilik müracaatları</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Başvuru No</th>
                        <th className="p-3">Ad Soyad</th>
                        <th className="p-3">İl / İlçe</th>
                        <th className="p-3">İletişim</th>
                        <th className="p-3">Yatırım Bütçesi</th>
                        <th className="p-3">Tarih</th>
                        <th className="p-3">Durum</th>
                        <th className="p-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {franchiseApps.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-100/40 transition">
                          <td className="p-3 font-black text-red-600">{app.id}</td>
                          <td className="p-3 font-bold text-slate-900">{app.name}</td>
                          <td className="p-3 text-slate-700">{app.city} / {app.district}</td>
                          <td className="p-3 text-slate-500">{app.phone}</td>
                          <td className="p-3 font-bold text-emerald-400">{app.budget}</td>
                          <td className="p-3 text-slate-500">{app.date}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              app.status === 'Onaylandı' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              app.status === 'Beklemede' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-red-600/20 text-red-500 border border-red-600/30'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button onClick={() => updateFranchiseStatus(app.id, 'Onaylandı')} className="px-2.5 py-1 bg-emerald-600 text-slate-900 font-bold rounded-lg text-[10px] hover:bg-emerald-700 transition">Onayla</button>
                            <button onClick={() => updateFranchiseStatus(app.id, 'Reddedildi')} className="px-2.5 py-1 bg-red-700/30 text-red-500 border border-red-700/30 font-bold rounded-lg text-[10px] hover:bg-red-700 hover:text-white transition">Reddet</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. FRANCHİSE OFİS YÖNETİMİ TABI */}
            {activeTab === 'offices' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Franchise Ofis Yönetimi</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Sistemde aktif çalışan tüm bölge başkanlıkları ve temsilcilikler</p>
                  </div>
                  <button onClick={() => alert("Yeni ofis ekleme modülü açılıyor...")} className="bg-red-700 hover:bg-red-800 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md">
                    <PlusCircle className="w-4 h-4" />
                    <span>Yeni Ofis Ekle</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offices.map((office) => (
                    <div key={office.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-red-600 bg-red-700/10 px-2 py-0.5 rounded border border-red-700/20">{office.city} / {office.district}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Aktif Lisans</span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900">{office.name}</h4>
                        <p className="text-xs text-slate-500 mt-2"><strong>Yönetici:</strong> {office.manager}</p>
                        <p className="text-xs text-slate-500"><strong>Tel:</strong> {office.phone}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <button className="text-slate-500 hover:text-slate-900 font-bold text-[11px]">Düzenle</button>
                        <button className="text-red-600 hover:text-red-500 font-bold text-[11px]">Askıya Al</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. DANIŞMAN KONTROLÜ TABI */}
            {activeTab === 'agents' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Danışman Kontrol Paneli</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Sistemdeki tüm gayrimenkul danışmanlarının yetki ve profil yönetimi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-red-700 text-white font-black flex items-center justify-center text-xs">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-slate-900">{agent.name}</h4>
                            <span className="text-[10px] text-red-500 font-bold block">{agent.title}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div><strong>Ofis:</strong> {agent.office}</div>
                          <div><strong>Tel:</strong> {agent.phone}</div>
                          <div><strong>Aktif İlan:</strong> {agent.activeListings} adet</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <button className="text-xs text-slate-700 hover:text-slate-900 font-bold">Detay</button>
                        <button className="text-xs text-amber-500 hover:text-amber-400 font-bold">Şifre Sıfırla</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. İLAN ONAY MEKANİZMASI TABI */}
            {activeTab === 'listings' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">İlan Onay Mekanizması</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Danışmanlar tarafından eklenen ilanların denetim ekranı</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {listings.map((item) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img src={'image' in item ? item.image : '/demo-placeholder.svg'} alt={item.title} className="w-16 h-12 object-cover rounded-lg" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-900">{item.title}</span>
                            <span className="text-[10px] font-bold text-red-600">({item.id})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.city} / {item.district} · {item.price.toLocaleString('tr-TR')} ₺ · Danışman: {item.agentName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          item.approvalStatus === 'Yayında' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          item.approvalStatus === 'Onay Bekliyor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-600/20 text-red-500 border border-red-600/30'
                        }`}>
                          {item.approvalStatus}
                        </span>

                        {item.approvalStatus !== 'Yayında' && (
                          <button onClick={() => updateListingApproval(item.id, 'Yayında')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg transition">Yayına Al</button>
                        )}
                        {item.approvalStatus !== 'Reddedildi' && (
                          <button onClick={() => updateListingApproval(item.id, 'Reddedildi')} className="px-3 py-1 bg-red-700/30 text-red-500 hover:bg-red-700 hover:text-white font-black text-xs rounded-lg transition">Kaldır</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. KATEGORİ YÖNETİMİ TABI */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                  <div><h2 className="text-lg font-black text-slate-900">İlan Kategorileri</h2><p className="text-xs text-slate-500 font-medium mt-0.5">Kategori adlarını, filtrelerini ve kapak görsellerini buradan yönetin.</p></div>
                  <button onClick={() => saveCategories()} className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-2.5 rounded-xl text-xs transition">{categorySaved ? 'Kategoriler Kaydedildi' : 'Değişiklikleri Kaydet'}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex gap-4"><img src={item.image} alt={item.title} className="h-24 w-32 rounded-xl object-cover border border-slate-200" /><div className="flex-1 space-y-2">
                        <input value={item.title} onChange={(e) => updateCategory(item.id, { title: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700" placeholder="Kategori adı" />
                        <div className="grid grid-cols-2 gap-2"><select value={item.type} onChange={(e) => updateCategory(item.id, { type: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-700"><option>Satılık</option><option>Kiralık</option><option>Devren</option></select><select value={item.category} onChange={(e) => updateCategory(item.id, { category: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-700"><option value="Konut">Konut</option><option value="İşyeri">İşyeri</option><option value="Arsa">Arsa</option><option value="">Genel</option></select></div>
                      </div></div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2"><input value={item.image} onChange={(e) => updateCategory(item.id, { image: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700" placeholder="Görsel URL'si" /><label className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-black text-red-700 hover:bg-red-100"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleCategoryImage(item.id, e.target.files?.[0])} />Görsel Seç</label></div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50/40 p-5"><h3 className="text-sm font-black text-slate-900">Yeni Kategori Ekle</h3><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"><input value={newCategory.title} onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold" placeholder="Kategori adı" /><select value={newCategory.type} onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold"><option>Satılık</option><option>Kiralık</option><option>Devren</option></select><select value={newCategory.category} onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold"><option>Konut</option><option>İşyeri</option><option>Arsa</option><option value="">Genel</option></select><button onClick={addCategory} className="rounded-xl bg-red-700 px-4 py-2.5 text-xs font-black text-slate-900 hover:bg-red-800">Kategori Ekle</button></div><div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2"><input value={newCategory.image} onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs" placeholder="Kapak görseli URL'si (isteğe bağlı)" /><label className="cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2.5 text-center text-xs font-black text-red-700 hover:bg-red-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setNewCategory({ ...newCategory, image: String(reader.result) }); reader.readAsDataURL(file); }} />Görsel Seç</label></div></div>
              </div>
            )}

            {/* 6. SİSTEM MESAJLARI TABI */}
            {activeTab === 'messages' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-lg font-black text-slate-900">Sistem Mesajları</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">İletişim formundan genel merkeze düşen mesajlar</p>
                </div>

                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900">{msg.sender} ({msg.email})</span>
                        <span className="text-slate-500">{msg.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold">{msg.subject}</p>
                      <p className="text-xs text-slate-500">Tel: {msg.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SİSTEM AYARLARI TABI */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-lg font-black text-slate-900">Sistem & Genel Ayarlar</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Platform geneli parametreler ve sistem yapılandırması</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-black text-slate-900 mb-1">İletişim & WhatsApp Destek Hattı</h3>
                  <p className="text-xs text-slate-500 mb-4">Kaydettiğiniz WhatsApp numarası sitedeki destek düğmesinde kullanılır.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div><label className="block text-slate-700 font-bold mb-1">Telefon / Danışma Hattı</label><input value={contactSettings.phone} onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })} type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700" /></div>
                    <div><label className="block text-slate-700 font-bold mb-1">WhatsApp Destek Numarası</label><input value={contactSettings.whatsapp} onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })} type="tel" placeholder="905XXXXXXXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700" /></div>
                    <div><label className="block text-slate-700 font-bold mb-1">Destek E-posta Adresi</label><input value={contactSettings.email} onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })} type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700" /></div>
                    <div><label className="block text-slate-700 font-bold mb-1">Açık Adres</label><input value={contactSettings.address} onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700" /></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-black text-slate-900 mb-1">Fırsat Gayrimenkuller Süreleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                    {(['first', 'second', 'third'] as const).map((key, index) => <div key={key}><label className="block text-slate-700 font-bold mb-1">Fırsat {index + 1} Süresi</label><input value={campaignSettings[key]} onChange={(e) => setCampaignSettings({ ...campaignSettings, [key]: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700" /></div>)}
                  </div>
                </div>
                <button onClick={saveContactSettings} className="bg-red-700 hover:bg-red-800 text-white font-black px-6 py-3 rounded-xl text-xs transition">{settingsSaved ? 'Ayarlar Kaydedildi' : 'Ayarları Kaydet'}</button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

function AgentDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'overview' | 'listings' | 'portfolio' | 'customers' | 'messages' | 'statistics' | 'profile'>('overview');
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [listingSearch, setListingSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [customerSaved, setCustomerSaved] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const emptyListing = {
    title: '',
    category: 'Konut',
    type: 'Satılık',
    price: '',
    city: '',
    district: '',
    neighborhood: '',
    rooms: '',
    area: '',
    images: [] as string[]
  };

  const [myListings, setMyListings] = useState(() =>
    SAMPLE_LISTINGS.map((item) => ({
      ...item,
      images: [item.image],
      agentName: 'DEMO Danışman',
      status: 'Taslak'
    }))
  );

  const [newListing, setNewListing] = useState(emptyListing);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'DEMO Müşteri', phone: '', email: '', type: 'Demo', status: 'Demo', lastContact: '—' }
  ]);

  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', type: 'Alıcı', status: 'Yeni'
  });

  const [messages, setMessages] = useState([
    { id: 1, sender: 'DEMO Müşteri', subject: 'DEMO mesaj', text: 'Gerçek mesajlar burada görüntülenecektir.', time: '—', unread: false }
  ]);

  const [profile, setProfile] = useState({
    name: 'DEMO Danışman',
    email: '',
    phone: '',
    title: 'DEMO PROFİL',
    office: 'DEMO OFİS',
    region: ''
  });

  const appointments = [
    { time: '—', title: 'DEMO Randevu', customer: 'DEMO Müşteri', type: 'Demo' }
  ];

  const filteredListings = myListings.filter((item) =>
    `${item.title} ${item.id} ${item.city} ${item.district}`.toLocaleLowerCase('tr-TR').includes(listingSearch.toLocaleLowerCase('tr-TR'))
  );

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase('tr-TR').includes(customerSearch.toLocaleLowerCase('tr-TR'))
  );

  const navItems = [
    { key: 'overview' as const, label: 'Panel Anasayfa', icon: Home },
    { key: 'listings' as const, label: 'İlanlarım', icon: Building2 },
    { key: 'portfolio' as const, label: 'Portföylerim', icon: Briefcase },
    { key: 'customers' as const, label: 'Müşterilerim', icon: Users },
    { key: 'messages' as const, label: 'Mesajlar', icon: MessageSquare },
    { key: 'statistics' as const, label: 'İstatistikler', icon: BarChart3 },
    { key: 'profile' as const, label: 'Profil & Ayarlar', icon: Settings }
  ];

  const sectionTitles: Record<typeof activeSection, { title: string; description: string }> = {
    overview: { title: 'Panel Anasayfa', description: 'Bugünkü çalışmalarınıza genel bakış.' },
    listings: { title: 'İlanlarım', description: 'Yönettiğiniz tüm ilanları buradan takip edin.' },
    portfolio: { title: 'Portföylerim', description: 'Portföylerinizin durumunu ve dağılımını yönetin.' },
    customers: { title: 'Müşterilerim', description: 'Müşteri ilişkilerinizi tek ekrandan yönetin.' },
    messages: { title: 'Mesajlar', description: 'Müşterilerinizden gelen mesajları takip edin.' },
    statistics: { title: 'İstatistikler', description: 'Performansınızı ve ilanlarınızın erişimini inceleyin.' },
    profile: { title: 'Profil & Ayarlar', description: 'Hesap ve iletişim bilgilerinizi güncelleyin.' }
  };

  const activeTitle = sectionTitles[activeSection];

  const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1920;
        let width = image.width;
        let height = image.height;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.onerror = () => reject(new Error('Image load failed'));
      image.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - newListing.images.length;
    if (files.length > remainingSlots) {
      alert(`En fazla 10 görsel ekleyebilirsiniz. ${remainingSlots} adet daha seçebilirsiniz.`);
    }

    const selected = files.slice(0, remainingSlots);
    const valid = selected.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} bir görsel dosyası değil.`);
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(`${file.name} 15 MB'dan büyük olduğu için eklenmedi.`);
        return false;
      }
      return true;
    });

    const compressed: string[] = [];
    for (const file of valid) {
      try {
        compressed.push(await compressImage(file));
      } catch {
        alert(`${file.name} işlenirken bir hata oluştu.`);
      }
    }

    setNewListing((prev) => ({ ...prev, images: [...prev.images, ...compressed].slice(0, 10) }));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setNewListing((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const resetListingForm = () => {
    setNewListing(emptyListing);
    setEditingListingId(null);
    setShowListingForm(false);
  };

  const startEditListing = (item: any) => {
    setEditingListingId(item.id);
    setNewListing({
      title: item.title,
      category: item.category,
      type: item.type,
      price: String(item.price),
      city: item.city,
      district: item.district,
      neighborhood: item.neighborhood,
      rooms: item.rooms,
      area: String(item.area),
      images: item.images?.length ? item.images : [item.image]
    });
    setShowListingForm(true);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(String(newListing.price).replace(/[^0-9]/g, '')) || 0;
    const numericArea = Number(String(newListing.area).replace(/[^0-9]/g, '')) || 0;
    const primaryImage = newListing.images[0] || 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&q=80&w=1000';

    if (editingListingId) {
      setMyListings((prev) => prev.map((item) => item.id === editingListingId ? {
        ...item,
        title: newListing.title || item.title,
        category: newListing.category,
        type: newListing.type,
        price: numericPrice,
        city: newListing.city,
        district: newListing.district,
        neighborhood: newListing.neighborhood || 'Merkez',
        rooms: newListing.rooms,
        area: numericArea,
        image: primaryImage,
        images: newListing.images.length ? newListing.images : [primaryImage]
      } : item));
    } else {
      const createdListing = {
        id: `RC-${Math.floor(100 + Math.random() * 899)}`,
        title: newListing.title || 'Yeni Realty Center İlanı',
        category: newListing.category,
        type: newListing.type,
        price: numericPrice,
        currency: '₺',
        city: newListing.city,
        district: newListing.district,
        neighborhood: newListing.neighborhood || 'Merkez',
        rooms: newListing.rooms,
        area: numericArea,
        image: primaryImage,
        images: newListing.images.length ? newListing.images : [primaryImage],
        agentName: profile.name || 'DEMO Danışman',
        agentPhone: profile.phone || '',
        date: new Date().toISOString().slice(0, 10),
        isFeatured: false,
        status: 'Aktif'
      };
      setMyListings((prev) => [createdListing, ...prev]);
    }

    resetListingForm();
    setActiveSection('listings');
  };

  const deleteListing = (id: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    setMyListings((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone || !customerForm.email) {
      alert('Lütfen ad, telefon ve e-posta alanlarını doldurunuz.');
      return;
    }
    setCustomers((prev) => [{
      id: Date.now(),
      ...customerForm,
      lastContact: 'Bugün'
    }, ...prev]);
    setCustomerForm({ name: '', phone: '', email: '', type: 'Alıcı', status: 'Yeni' });
    setShowCustomerForm(false);
    setCustomerSaved(true);
    setTimeout(() => setCustomerSaved(false), 2200);
  };

  const markMessageRead = (id: number) => {
    setMessages((prev) => prev.map((message) => message.id === id ? { ...message, unread: false } : message));
  };

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Aktif İlanlarım', value: myListings.filter((item) => item.status === 'Aktif').length, icon: Building2 },
          { label: 'Toplam Portföy', value: myListings.length, icon: Briefcase },
          { label: 'Bekleyen Görüşmeler', value: 8, icon: Calendar },
          { label: 'Yeni Mesajlar', value: messages.filter((message) => message.unread).length, icon: MessageSquare }
        ].map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-500">{stat.label}</p><p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p></div><div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div></div></div>;
        })}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Son İlanlarım</h2><p className="text-xs text-slate-500 mt-1">Portföyünüzdeki son ilanlar</p></div><button onClick={() => setActiveSection('listings')} className="text-sm font-black text-red-700 hover:text-red-800">Tümünü Gör</button></div>
          <div className="divide-y divide-slate-100">{myListings.slice(0, 4).map((item) => <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center"><img src={item.image} alt={item.title} className="w-full sm:w-28 h-20 object-cover rounded-xl" /><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-black px-2 py-1 rounded ${item.status === 'Aktif' ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span><span className="text-[10px] font-bold text-slate-400">{item.id}</span></div><h3 className="text-sm font-black text-slate-900 truncate">{item.title}</h3><p className="text-xs text-slate-500 mt-1">{item.city} / {item.district} · {item.area} m²</p></div><div className="text-left sm:text-right"><div className="font-black text-slate-900">{item.price.toLocaleString('tr-TR')} ₺</div><div className="text-xs text-slate-500 font-bold mt-1">{item.type}</div></div></div>)}</div>
        </section>
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-slate-200"><h2 className="text-lg font-black text-slate-900">Bugünün Takvimi</h2><p className="text-xs text-slate-500 mt-1">11 Ağustos 2026</p></div><div className="p-5 space-y-3">{appointments.map((appointment) => <div key={`${appointment.time}-${appointment.title}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200"><div className="flex items-center justify-between"><span className="text-xs font-black text-red-700">{appointment.time}</span><span className="text-[10px] font-bold text-slate-500">{appointment.type}</span></div><p className="font-black text-slate-900 text-sm mt-2">{appointment.title}</p><p className="text-xs text-slate-500 mt-1">{appointment.customer}</p></div>)}</div></section>
      </div>
    </>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div className="relative flex-1 max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} placeholder="İlan no, başlık, il veya ilçe ara..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" /></div><button onClick={() => { setEditingListingId(null); setNewListing(emptyListing); setShowListingForm(true); }} className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-700/20"><PlusCircle className="w-5 h-5" /> Yeni İlan Ekle</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredListings.map((item) => <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="flex flex-col sm:flex-row"><img src={item.image} alt={item.title} className="w-full sm:w-48 h-44 object-cover" /><div className="p-5 flex-1"><div className="flex items-center justify-between gap-2"><span className={`text-[10px] font-black px-2.5 py-1 rounded ${item.status === 'Aktif' ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span><span className="text-xs font-bold text-slate-400">{item.id}</span></div><h3 className="font-black text-slate-900 mt-3 line-clamp-2">{item.title}</h3><p className="text-xs text-slate-500 mt-2">{item.city} / {item.district} / {item.neighborhood}</p><div className="flex items-center justify-between mt-4"><span className="text-lg font-black text-slate-900">{item.price.toLocaleString('tr-TR')} ₺</span><span className="text-xs font-bold text-slate-500">{item.area} m² · {item.rooms}</span></div><div className="flex gap-2 mt-4"><button onClick={() => startEditListing(item)} className="flex-1 border border-slate-300 hover:border-red-700 hover:text-red-700 text-slate-700 font-bold text-xs py-2.5 rounded-lg">Düzenle</button><button onClick={() => deleteListing(item.id)} className="px-3 border border-red-300 text-red-700 hover:bg-red-100 font-bold text-xs py-2.5 rounded-lg">Sil</button></div></div></div></div>)}
      </div>
      {filteredListings.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-semibold">Aradığınız kriterlere uygun ilan bulunamadı.</div>}
    </div>
  );

  const renderPortfolio = () => (<div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[{ label: 'Satılık Konut', value: myListings.filter((x) => x.category === 'Konut' && x.type === 'Satılık').length, icon: Home }, { label: 'Ticari İlan', value: myListings.filter((x) => x.category === 'İşyeri').length, icon: Building2 }, { label: 'Arsa', value: myListings.filter((x) => x.category === 'Arsa').length, icon: MapPin }].map((item) => { const Icon = item.icon; return <div key={item.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div><div><p className="text-xs font-bold text-slate-500">{item.label}</p><p className="text-2xl font-black text-slate-900">{item.value}</p></div></div>; })}</div><div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-slate-200"><h2 className="text-lg font-black text-slate-900">Portföy Dağılımı</h2><p className="text-xs text-slate-500 mt-1">Mevcut portföylerinizin kategorilere göre görünümü</p></div><div className="p-6 space-y-5">{['Konut','İşyeri','Arsa'].map((label) => { const count=myListings.filter(x=>x.category===label).length; const percentage=myListings.length?Math.round(count/myListings.length*100):0; return <div key={label}><div className="flex items-center justify-between mb-2"><span className="text-sm font-black text-slate-800">{label}</span><span className="text-xs font-bold text-slate-500">{count} portföy · %{percentage}</span></div><div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-red-700 rounded-full" style={{width:`${percentage}%`}} /></div></div>; })}</div></div></div>);

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"><div><h2 className="text-lg font-black text-slate-900">Müşteri Listesi</h2><p className="text-xs text-slate-500 mt-1">Toplam {customers.length} kayıt</p></div><div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Müşteri ara..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" /></div><button onClick={() => setShowCustomerForm(true)} className="bg-red-700 hover:bg-red-800 text-white font-black px-4 py-3 rounded-xl flex items-center justify-center gap-2"><PlusCircle className="w-4 h-4" /> Müşteri Ekle</button></div></div>
      {customerSaved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold">Müşteri başarıyla eklendi.</div>}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{filteredCustomers.map((customer) => <div key={customer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">{customer.name.split(' ').map((x)=>x[0]).slice(0,2).join('')}</div><div><h3 className="font-black text-slate-900">{customer.name}</h3><p className="text-xs text-slate-500">{customer.type}</p></div></div><span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">{customer.status}</span></div><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600"><div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-red-700" />{customer.phone}</div><div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-red-700" />{customer.email}</div></div><div className="mt-4 flex items-center justify-between text-xs"><span className="text-slate-500">Son iletişim: <strong className="text-slate-800">{customer.lastContact}</strong></span><a href={`tel:${customer.phone.replace(/\s+/g,'')}`} className="text-red-700 font-black hover:text-red-800">Ara</a></div></div>)}</div>
      {showCustomerForm && <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl"><div className="p-6 border-b border-slate-200 flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-900">Yeni Müşteri Ekle</h2><p className="text-xs text-slate-500 mt-1">Müşteri bilgilerini kaydedin.</p></div><button onClick={()=>setShowCustomerForm(false)} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><X className="w-5 h-5" /></button></div><form onSubmit={addCustomer} className="p-6 space-y-4"><input required value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})} placeholder="Ad Soyad" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><input required type="tel" value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="Telefon" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><input required type="email" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm,email:e.target.value})} placeholder="E-posta" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><div className="grid grid-cols-2 gap-4"><select value={customerForm.type} onChange={e=>setCustomerForm({...customerForm,type:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50"><option>Alıcı</option><option>Satıcı</option><option>Kiralama</option><option>Yatırımcı</option></select><select value={customerForm.status} onChange={e=>setCustomerForm({...customerForm,status:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50"><option>Yeni</option><option>Aktif</option><option>Takipte</option></select></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setShowCustomerForm(false)} className="px-5 py-3 rounded-xl border border-slate-300 font-black text-sm">Vazgeç</button><button type="submit" className="px-5 py-3 rounded-xl bg-red-700 text-white font-black text-sm">Müşteriyi Kaydet</button></div></form></div></div>}
    </div>
  );

  const renderMessages = () => (<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Gelen Mesajlar</h2><p className="text-xs text-slate-500 mt-1">Müşterilerinizle iletişiminizi buradan yönetin.</p></div><span className="text-xs font-black text-red-700 bg-red-100 px-3 py-1.5 rounded-full">{messages.filter((m)=>m.unread).length} okunmamış</span></div><div className="divide-y divide-slate-100">{messages.map((message)=><button key={message.id} onClick={()=>markMessageRead(message.id)} className={`w-full text-left p-5 hover:bg-slate-50 transition ${message.unread?'bg-red-100/40':'bg-white'}`}><div className="flex items-start gap-4"><div className={`w-11 h-11 rounded-full flex items-center justify-center font-black ${message.unread?'bg-red-700 text-white':'bg-slate-200 text-slate-700'}`}>{message.sender.split(' ').map((x)=>x[0]).slice(0,2).join('')}</div><div className="flex-1 min-w-0"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"><h3 className="font-black text-slate-900">{message.sender}</h3><span className="text-[10px] text-slate-400 font-bold">{message.time}</span></div><p className="text-sm font-bold text-slate-700 mt-1">{message.subject}</p><p className="text-xs text-slate-500 mt-1 truncate">{message.text}</p></div>{message.unread&&<span className="w-2.5 h-2.5 rounded-full bg-red-700 mt-2" />}</div></button>)}</div></div>);

  const renderStatistics = () => (<div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[{label:'Toplam Görüntülenme',value:'12.840',change:'+18,4%'},{label:'İlan Dönüşümü',value:'%7,8',change:'+2,1%'},{label:'Telefon Tıklaması',value:'326',change:'+12,6%'},{label:'Favoriye Eklenme',value:'184',change:'+9,3%'}].map(stat=><div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><p className="text-xs font-bold text-slate-500">{stat.label}</p><div className="flex items-end justify-between mt-2"><p className="text-2xl font-black text-slate-900">{stat.value}</p><span className="text-xs font-black text-emerald-600">{stat.change}</span></div></div>)}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">Haftalık Görüntülenme</h2><div className="mt-6 grid grid-cols-7 gap-3 items-end h-56">{[48,62,55,76,68,91,84].map((value,index)=><div key={index} className="flex flex-col items-center justify-end gap-2 h-full"><div className="w-full bg-slate-100 rounded-lg overflow-hidden flex items-end h-44"><div className="w-full bg-red-700 rounded-lg" style={{height:`${value}%`}} /></div><span className="text-[10px] font-bold text-slate-400">{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][index]}</span></div>)}</div></section><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">En Çok İlgi Gören İlanlar</h2><div className="mt-4 space-y-4">{myListings.slice(0,5).map((item,index)=><div key={item.id} className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">{index+1}</span><div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{item.title}</p><div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-red-700 rounded-full" style={{width:`${90-index*12}%`}} /></div></div><span className="text-xs font-black text-slate-500">{(3240-index*420).toLocaleString('tr-TR')}</span></div>)}</div></section></div></div>);

  const renderProfile = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 xl:col-span-2"><div className="flex items-center justify-between mb-6"><div><h2 className="text-lg font-black text-slate-900">Profil Bilgileri</h2><p className="text-xs text-slate-500 mt-1">Danışman profilinizde görünen bilgileri yönetin.</p></div>{profileSaved&&<span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Kaydedildi</span>}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{([['name','Ad Soyad'],['email','E-posta'],['phone','Telefon'],['title','Unvan'],['office','Ofis'],['region','Bölge']] as const).map(([key,label])=><div key={key}><label className="text-xs font-black text-slate-700 mb-2 block">{label}</label><input value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700" /></div>)}</div><button onClick={saveProfile} className="mt-6 bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl">Değişiklikleri Kaydet</button></section><section className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white h-fit"><div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-2xl font-black mx-auto">MY</div><h3 className="text-center text-xl font-black mt-4">{profile.name}</h3><p className="text-center text-sm text-slate-400 mt-1">{profile.title}</p><div className="mt-6 pt-5 border-t border-slate-700 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">Aktif İlan</span><strong>{myListings.filter((x)=>x.status==='Aktif').length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Müşteri</span><strong>{customers.length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Ofis</span><strong>{profile.office.replace('Realty Center ','')}</strong></div></div></section></div>
  );

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-100"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="flex flex-col lg:flex-row gap-6"><aside className="w-full lg:w-64 bg-slate-900 rounded-2xl shadow-xl overflow-hidden h-fit lg:sticky lg:top-24"><div className="p-5 border-b border-slate-700"><div className="flex items-center space-x-3"><div className="w-11 h-11 rounded-full bg-red-700 flex items-center justify-center text-white font-black">MY</div><div><div className="text-white font-black text-sm">{profile.name}</div><div className="text-slate-400 text-xs">Gayrimenkul Danışmanı</div></div></div></div><nav className="p-3 space-y-1">{navItems.map((item)=>{const Icon=item.icon;return <button key={item.key} onClick={()=>setActiveSection(item.key)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-bold text-sm text-left transition ${activeSection===item.key?'bg-red-700 text-white':'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon className="w-4 h-4" /><span>{item.label}</span></button>})}</nav><div className="p-3 border-t border-slate-700"><button onClick={()=>navigate('/panel')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-700 hover:text-white font-bold text-sm text-left transition"><LogOut className="w-4 h-4" /><span>Çıkış Yap</span></button></div></aside><main className="flex-1 min-w-0"><div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-sm text-slate-500 font-semibold">Hoş geldiniz,</p><h1 className="text-2xl sm:text-3xl font-black text-slate-900">{activeTitle.title}</h1><p className="text-sm text-slate-500 mt-1">{activeTitle.description}</p></div><button onClick={()=>{setEditingListingId(null);setNewListing(emptyListing);setShowListingForm(true);}} className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-700/20 transition"><PlusCircle className="w-5 h-5" /><span>Yeni İlan Ekle</span></button></div></div>{activeSection==='overview'&&renderOverview()}{activeSection==='listings'&&renderListings()}{activeSection==='portfolio'&&renderPortfolio()}{activeSection==='customers'&&renderCustomers()}{activeSection==='messages'&&renderMessages()}{activeSection==='statistics'&&renderStatistics()}{activeSection==='profile'&&renderProfile()}</main></div></div>

      {showListingForm && <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"><div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10"><div><h2 className="text-xl font-black text-slate-900">{editingListingId ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}</h2><p className="text-xs text-slate-500 mt-1">İlan bilgilerini ve en fazla 10 görseli yönetin.</p></div><button onClick={resetListingForm} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-700 flex items-center justify-center"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreateListing} className="p-6 space-y-5"><div><label className="text-xs font-black text-slate-700 mb-2 block">İlan Başlığı</label><input required value={newListing.title} onChange={(e)=>setNewListing({...newListing,title:e.target.value})} placeholder="Örn. Çankaya'da 4+1 Lüks Daire" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-700" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="text-xs font-black text-slate-700 mb-2 block">Kategori</label><select value={newListing.category} onChange={(e)=>setNewListing({...newListing,category:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm"><option>Konut</option><option>İşyeri</option><option>Arsa</option></select></div><div><label className="text-xs font-black text-slate-700 mb-2 block">İşlem Tipi</label><select value={newListing.type} onChange={(e)=>setNewListing({...newListing,type:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm"><option>Satılık</option><option>Kiralık</option><option>Devren</option></select></div><div><label className="text-xs font-black text-slate-700 mb-2 block">Oda</label><input value={newListing.rooms} onChange={(e)=>setNewListing({...newListing,rooms:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-black text-slate-700 mb-2 block">Fiyat</label><input required value={newListing.price} onChange={(e)=>setNewListing({...newListing,price:e.target.value})} placeholder="Örn. 6850000" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm" /></div><div><label className="text-xs font-black text-slate-700 mb-2 block">m²</label><input required value={newListing.area} onChange={(e)=>setNewListing({...newListing,area:e.target.value})} placeholder="Örn. 195" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm" /></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="text-xs font-black text-slate-700 mb-2 block">İl</label><select value={newListing.city} onChange={(e)=>setNewListing({...newListing,city:e.target.value,district:TURKEY_CITIES[e.target.value]?.[0]||''})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm">{Object.keys(TURKEY_CITIES).map((city)=><option key={city}>{city}</option>)}</select></div><div><label className="text-xs font-black text-slate-700 mb-2 block">İlçe</label><select value={newListing.district} onChange={(e)=>setNewListing({...newListing,district:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm">{(TURKEY_CITIES[newListing.city]||[]).map((district)=><option key={district}>{district}</option>)}</select></div><div><label className="text-xs font-black text-slate-700 mb-2 block">Mahalle</label><input value={newListing.neighborhood} onChange={(e)=>setNewListing({...newListing,neighborhood:e.target.value})} placeholder="Mahalle" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm" /></div></div><div><div className="flex items-center justify-between mb-2"><label className="text-xs font-black text-slate-700">İlan Görselleri</label><span className="text-xs font-black text-red-700">{newListing.images.length}/10</span></div><div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50"><label className="cursor-pointer inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-sm shadow-lg shadow-red-700/20 transition"><input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" /><PlusCircle className="w-5 h-5" /><span>Bilgisayardan / Galeriden Görsel Seç</span></label><p className="text-xs text-slate-500 mt-2">En fazla 10 görsel. Görseller otomatik olarak küçültülür ve JPEG olarak sıkıştırılır.</p>{newListing.images.length>0&&<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">{newListing.images.map((image,index)=><div key={`${image}-${index}`} className="relative group"><img src={image} alt={`İlan görseli ${index+1}`} className="w-full h-28 object-cover rounded-xl border border-slate-200" /><button type="button" onClick={()=>removeImage(index)} className="absolute top-1.5 right-1.5 bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>{index===0&&<span className="absolute bottom-1.5 left-1.5 text-[9px] font-black bg-slate-900/80 text-white px-2 py-1 rounded">Ana görsel</span>}</div>)}</div>}</div></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={resetListingForm} className="px-5 py-3 rounded-xl border border-slate-300 font-black text-sm text-slate-700">Vazgeç</button><button type="submit" className="px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-sm">{editingListingId?'Değişiklikleri Kaydet':'İlanı Kaydet'}</button></div></form></div></div>}
    </div>
  );
}

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

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

  const [, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);

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

  const handleSendMessage = (newMessage: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
    const messageEntry: ContactMessage = {
      ...newMessage,
      id: `MSG-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    setMessages((prev) => [messageEntry, ...prev]);
  };

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-slate-900 px-4 select-none overflow-hidden font-sans">
        <div className="relative mb-10 transform animate-pulse">
          <img 
            src="/rlogo.png" 
            alt="Realty Center" 
            className="h-24 sm:h-28 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className={`p-4 rounded-2xl transition-all duration-500 transform ${
            animationStage === 'unlocked' 
              ? 'bg-red-700 text-white shadow-xl shadow-red-700/40 scale-105' 
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
              <div className="bg-red-700 text-white p-2.5 rounded-full shadow-lg shadow-red-700/30 border-2 border-white">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-75">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

        <div className="text-lg sm:text-xl font-light text-slate-800 tracking-[0.2em] text-center flex items-center justify-center flex-wrap gap-x-2">
          <span>HAYALİNİZDEKİ</span>
          <span className={`font-extrabold text-red-700 inline-block min-w-[90px] text-center transition-all duration-300 ease-in-out transform ${
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
      <ScrollToTopOnRouteChange />
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-red-700 selection:text-white relative flex flex-col justify-between">
        
        <Header scrolled={scrolled} />

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

            <Route path="/panel" element={<LoginPage />} />
            <Route path="/danisman-panel" element={<AgentDashboard />} />
            <Route path="/super-admin" element={<SuperAdminLoginPage />} />
            <Route path="/super-admin-panel" element={<SuperAdminDashboard />} />
            
            <Route path="/kurumsal/hakkimizda" element={<AboutPage />} />
            <Route path="/kurumsal/once-guven" element={<TrustPrinciplePage />} />
            <Route path="/kurumsal/ekibimiz" element={<TeamPage />} />

            <Route path="/akademi" element={<AcademyPage openDrawer={openDrawer} />} />
            <Route path="/ofislerimiz" element={<OfficesPage />} />
            <Route path="/danismanlarimiz" element={<AgentsPage />} />
            <Route path="/ilan-kategorileri" element={<ListingCategoriesPage />} />
            <Route path="/ilanlarimiz" element={<ListingsPage />} />
            <Route path="/projelerimiz" element={<ProjectsPage />} />
            <Route path="/iletisim" element={<ContactPage onSendMessage={handleSendMessage} />} />
            <Route path="/franchise-basvuru" element={<ApplicationPage type="franchise" />} />
            <Route path="/danisman-basvuru" element={<ApplicationPage type="agent" />} />
          </Routes>
        </main>

        <Footer openDrawer={openDrawer} />
        <WhatsAppSupportButton />

        <div 
          className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${
            drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div 
            className={`absolute inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity duration-500 ease-in-out ${
              drawerOpen ? 'opacity-100' : 'opacity-0'
            }`} 
            onClick={closeDrawer} 
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div 
              className={`w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between h-full border-l-4 border-red-700 transform transition-all duration-500 ease-out ${
                drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">
                    {formType === 'franchise' ? 'Franchise Başvuru Formu' : 'Danışman Başvuru Formu'}
                  </h2>
                  <p className="text-xs text-red-600 font-black tracking-wider">REALTY CENTER Ailesine Katılın</p>
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
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
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
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
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
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-black text-red-700 tracking-wider mb-2">
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
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700"
                    >
                      <option value="">-- İl Seçiniz (81 İl) --</option>
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
                      className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-700 ${
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
                    className="mt-0.5 rounded border-slate-300 text-red-700 focus:ring-red-700"
                  />
                  <label htmlFor="kvkk" className="text-[11px] text-slate-600 font-medium leading-tight">
                    KVKK kapsamında tarafıma bilgilendirme, arama ve SMS gönderilmesini kabul ediyorum.
                  </label>
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    className="relative overflow-hidden group w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-black rounded-lg shadow-lg shadow-red-700/30 transition flex items-center justify-center space-x-2"
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

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="En yukarıya dön"
            className="fixed bottom-24 right-6 z-40 bg-red-700 hover:bg-red-800 text-white p-3.5 rounded-full shadow-2xl shadow-red-700/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 border-2 border-white/20 flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

      </div>
    </Router>
  );
}