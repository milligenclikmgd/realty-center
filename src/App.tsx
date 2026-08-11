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
  ChevronDown, Users, Award, Navigation, UserCheck, Filter
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

// ÖRNEK FRANCHISE OFİS VERİLERİ
const SAMPLE_OFFICES = [
  {
    id: 1,
    name: "Realty Center Çankaya Bölge Başkanlığı",
    city: "Ankara",
    district: "Çankaya",
    address: "Konutkent Mah. 3028. Cad. West Gate Residence No:2 A Blok Kat:26 Çankaya / ANKARA",
    phone: "0532 567 48 45",
    email: "cankaya@realtycenter.com.tr",
    manager: "Mehmet Yılmaz",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "Realty Center Kadıköy / Bağdat Caddesi",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Bağdat Cad. No:142/A Kadıköy / İSTANBUL",
    phone: "0216 411 00 00",
    email: "kadikoy@realtycenter.com.tr",
    manager: "Ayşe Kaya",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Realty Center Karşıyaka Yalı",
    city: "İzmir",
    district: "Karşıyaka",
    address: "Cemal Gürsel Cad. No:88 Karşıyaka / İZMİR",
    phone: "0232 364 00 00",
    email: "karsiyaka@realtycenter.com.tr",
    manager: "Ali Demir",
    image: ""
  },
  {
    id: 4,
    name: "Realty Center Yenimahalle Batıkent",
    city: "Ankara",
    district: "Yenimahalle",
    address: "Batıkent Bulvarı No:45 Yenimahalle / ANKARA",
    phone: "0312 255 00 00",
    email: "batikent@realtycenter.com.tr",
    manager: "Selin Öztürk",
    image: ""
  },
  {
    id: 5,
    name: "Realty Center Beşiktaş Levent",
    city: "İstanbul",
    district: "Beşiktaş",
    address: "Büyükdere Cad. No:99 Levent / İSTANBUL",
    phone: "0212 280 00 00",
    email: "levent@realtycenter.com.tr",
    manager: "Burak Arslan",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    name: "Realty Center Alsancak Liman",
    city: "İzmir",
    district: "Alsancak",
    address: "Atatürk Cad. No:210 Alsancak / İZMİR",
    phone: "0232 463 00 00",
    email: "alsancak@realtycenter.com.tr",
    manager: "Cem Şahin",
    image: ""
  }
];

// ÖRNEK DANIŞMAN VERİLERİ
const SAMPLE_AGENTS = [
  {
    id: 1,
    name: "Murat Yıldırım",
    title: "Lüks Konut & Villa Uzmanı",
    office: "Realty Center Çankaya Bölge Başkanlığı",
    city: "Ankara",
    district: "Çankaya",
    phone: "0533 111 22 33",
    email: "murat.yildirim@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    activeListings: 14
  },
  {
    id: 2,
    name: "Zeynep Çelik",
    title: "Ticari Gayrimenkul Danışmanı",
    office: "Realty Center Kadıköy / Bağdat Caddesi",
    city: "İstanbul",
    district: "Kadıköy",
    phone: "0532 222 33 44",
    email: "zeynep.celik@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    activeListings: 22
  },
  {
    id: 3,
    name: "Caner Yılmaz",
    title: "Arsa & Arazi Yatırım Uzmanı",
    office: "Realty Center Karşıyaka Yalı",
    city: "İzmir",
    district: "Karşıyaka",
    phone: "0535 333 44 55",
    email: "caner.yilmaz@realtycenter.com.tr",
    image: "",
    activeListings: 9
  },
  {
    id: 4,
    name: "Sibel Öztürk",
    title: "Konut Satış Danışmanı",
    office: "Realty Center Yenimahalle Batıkent",
    city: "Ankara",
    district: "Yenimahalle",
    phone: "0530 444 55 66",
    email: "sibel.ozturk@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    activeListings: 11
  },
  {
    id: 5,
    name: "Emre Aksoy",
    title: "Proje Satış Yöneticisi",
    office: "Realty Center Beşiktaş Levent",
    city: "İstanbul",
    district: "Beşiktaş",
    phone: "0532 555 66 77",
    email: "emre.aksoy@realtycenter.com.tr",
    image: "",
    activeListings: 18
  },
  {
    id: 6,
    name: "Elif Demir",
    title: "Kiralama Uzmanı",
    office: "Realty Center Alsancak Liman",
    city: "İzmir",
    district: "Alsancak",
    phone: "0533 666 77 88",
    email: "elif.demir@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=800",
    activeListings: 7
  }
];

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
  const [searchDistrict, setSearchDistrict] = useState('');

  return (
    <>
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
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSearchDistrict('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  >
                    <option value="">İl Seçiniz</option>
                    {Object.keys(TURKEY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 mb-1 block uppercase tracking-wider">İlçe</label>
                  <select 
                    disabled={!selectedCity}
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition ${
                      !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">{selectedCity ? 'İlçe Seçiniz' : 'Önce İl Seçin'}</option>
                    {selectedCity && TURKEY_CITIES[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}
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
// 4. ALT SAYFA DÜZENLERİ
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

function AcademyPage({ openDrawer }: { openDrawer: (type: 'franchise' | 'agent') => void }) {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center space-x-2 text-xs font-black text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Sertifikalı Profesyonel Eğitimler</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              REALTY CENTER <span className="text-red-600">AKADEMİ</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed mb-4">
              Gayrimenkul sektöründe sıradan bir danışman değil, aranan bir <strong className="text-slate-900 font-extrabold">sektör uzmanı</strong> olmanız için buradayız.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Teorik ezberlerin ötesinde; saha simülasyonları, tapu hukuku, arsa-arazi değerlemesi ve lüks konut ikna teknikleriyle geleceğinizi inşa ediyoruz.
            </p>

            <button 
              onClick={() => openDrawer('agent')} 
              className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-red-600/30 transition transform hover:scale-105 uppercase tracking-wider flex items-center space-x-2"
            >
              <span>Eğitime Hemen Başvur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-t from-red-600 via-red-500 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500" />

            <div className="relative rounded-2xl overflow-hidden border-2 border-red-200 bg-white shadow-2xl aspect-video lg:aspect-4/3">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" 
                alt="Realty Center Eğitim Sınıfı" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-white/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Geleceğin Profesyonelleri</span>
                  <span className="text-xs font-black text-slate-900">Saha ve Online Eğitim Seçenekleriyle</span>
                </div>
                <GraduationCap className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200">
            Aktif Eğitim Paketleri
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Sertifikalı <span className="text-red-600">Eğitim Programlarımız</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-600 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" 
                  alt="Arazi Arsa Uzmanlığı" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-600 px-2.5 py-1 rounded shadow uppercase tracking-wider">
                  Arazi & Arsa Uzmanlığı
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">İleri Seviye Arazi & Arsa Gayrimenkul Değerleme</h3>
                <p className="text-slate-500 text-xs mb-4">Saha + Online İnteraktif / 3 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>İmar, Kadastro ve Parselasyon Analizi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Hobi Bahçesi ve Ticari İmarlı Arsa Ayrımı</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Sertifika ve Uygulama Belgesi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-slate-900">12.500 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-lg text-xs transition"
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-red-600 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between relative transform hover:-translate-y-1 group">
            <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              En Çok Tercih Edilen
            </div>

            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" 
                  alt="Saha Satış Eğitimi" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-slate-900 px-2.5 py-1 rounded shadow uppercase tracking-wider">
                  Saha Satış Masterclass
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">Saha Satış & İkna Teknikleri Masterclass</h3>
                <p className="text-slate-500 text-xs mb-4">Birebir Mentörlük + Ofis İçi / 4 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Nitelikli Müşteri Portföyü Oluşturma</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Fiyat İtirazı Karşılama ve Sözleşme İkna Psikolojisi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Realty Center Kurumsal Sertifikası</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-red-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-red-600">18.000 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-lg text-xs transition shadow-lg shadow-red-600/30"
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-600 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800" 
                  alt="Tapu ve Sözleşme Hukuku" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-600 px-2.5 py-1 rounded shadow uppercase tracking-wider">
                  Hukuk & Mevzuat
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">Sözleşme Hukuku & Tapu Mevzuatı Eğitimi</h3>
                <p className="text-slate-500 text-xs mb-4">Online Canlı Yayın / 2 Hafta Süre</p>

                <div className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Güvenli Sözleşme Taslakları ve Hukuki İnceleme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Hisseli Tapu ve İntikal Süreç Yönetimi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Sertifika ve Hukuki Belge Arşivi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase block">Eğitim Ücreti</span>
                <span className="text-2xl font-black text-slate-900">9.500 <span className="text-sm font-bold">₺</span></span>
              </div>
              <button 
                onClick={() => openDrawer('agent')} 
                className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-lg text-xs transition"
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

// OFİSLERİMİZ SAYFASI
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
          <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 inline-block mb-3">
            Franchise Ağımız
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            REALTY CENTER <span className="text-red-600">OFİSLERİMİZ</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Türkiye genelindeki bölge başkanlıklarımız ve yetkili temsilciliklerimiz
          </p>
        </div>

        {/* YATAY FİLTRELEME BARI */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline flex-shrink-0">
              Hızlı Seçim:
            </span>
            <button 
              onClick={() => { setSelectedCity(''); setSelectedDistrict(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                selectedCity === '' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
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
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
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
                className="w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
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
                className={`w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition ${
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
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-600 transition-all duration-300 flex flex-col justify-between group"
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
                          src="/logo.png" 
                          alt="Realty Center" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase mt-2">REALTY CENTER</span>
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-md shadow uppercase tracking-wider">
                      {office.city} / {office.district}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-red-600 transition">
                      {office.name}
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                      <div className="flex items-start space-x-2.5">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{office.address}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-bold text-slate-900">{office.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
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
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>Ara</span>
                  </a>

                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-red-600/20"
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

// YENİLENMİŞ DANIŞMANLARIMIZ SAYFASI
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
        
        {/* BAŞLIK */}
        <div className="mb-8">
          <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 inline-block mb-3">
            Uzman Kadromuz
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            GAYRİMENKUL <span className="text-red-600">DANIŞMANLARIMIZ</span>
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Saha tecrübesi ve uzmanlığıyla hayalinizdeki gayrimenkule yön veren profesyonellerimiz
          </p>
        </div>

        {/* YATAY FİLTRELEME BARI */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline flex-shrink-0">
              Hızlı Seçim:
            </span>
            <button 
              onClick={() => { setSelectedCity(''); setSelectedDistrict(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex-shrink-0 ${
                selectedCity === '' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
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
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
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
                className="w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
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
                className={`w-full lg:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition ${
                  !selectedCity ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">{selectedCity ? '-- Tüm İlçeler --' : 'Önce İl Seçiniz'}</option>
                {selectedCity && TURKEY_CITIES[selectedCity]?.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* DANIŞMAN KARTLARI LİSTESİ */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => (
              <div 
                key={agent.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg hover:border-red-600 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Danışman Görseli veya Logo Fallback */}
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
                          src="/logo.png" 
                          alt="Realty Center" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase mt-2">REALTY CENTER DANIŞMANI</span>
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-md shadow uppercase tracking-wider">
                      {agent.city} / {agent.district}
                    </span>

                    <span className="absolute bottom-3 right-3 text-[10px] font-black text-slate-900 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow border border-slate-200">
                      {agent.activeListings} Aktif İlan
                    </span>
                  </div>

                  {/* Danışman Bilgileri */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-red-600 transition">
                      {agent.name}
                    </h3>

                    <span className="text-xs font-bold text-red-600 block mb-3 uppercase tracking-wider">
                      {agent.title}
                    </span>

                    <div className="space-y-2.5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3">
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-800 font-semibold">{agent.office}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-bold text-slate-900">{agent.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{agent.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-2">
                  <a 
                    href={`tel:${agent.phone.replace(/\s+/g, '')}`}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-red-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hemen Ara</span>
                  </a>

                  <Link 
                    to="/ilanlarimiz" 
                    className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-red-600" />
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
            <Route path="/akademi" element={<AcademyPage openDrawer={openDrawer} />} />
            <Route path="/ofislerimiz" element={<OfficesPage />} />
            <Route path="/danismanlarimiz" element={<AgentsPage />} />
            <Route path="/ilanlarimiz" element={<ListingsPage />} />
            <Route path="/projelerimiz" element={<ProjectsPage />} />
            <Route path="/iletisim" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer openDrawer={openDrawer} />

        {/* SAĞ SLİDE-OVER FORM DRAWER (SOFT GEÇİŞLİ / ANİMASYONLU) */}
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
              className={`w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between h-full border-l-4 border-red-600 transform transition-all duration-500 ease-out ${
                drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
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