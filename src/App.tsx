Warning: truncated output (original token count: 159459)
Total output lines: 6051

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { PAGE_COPY, MEDIA_SELECTION } from './content-refresh';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Circle, CircleMarker, MapContainer, Marker, Popup, Rectangle, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { 
  BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams
} from 'react-router-dom';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import AdminControlCenter from './AdminControlCenter';
import { categoriesFor, fieldsFor, legacyMainCategory, listingBelongsTo, normalizePropertyType, TRANSACTION_KINDS, type MainCategory, type TransactionKind } from './listingCatalog';

import { 
  Bot, Search, MapPin, Phone, Mail, Globe, 
  CheckCircle2, X, 
  Building2, Briefcase, Megaphone,
  TrendingUp, Key, Home, GraduationCap, ArrowRight, ArrowUp,
  Users, Navigation, UserCheck, Filter,
  Maximize2, Bed, Calendar, Tag, Flame, Send, Clock, MessageSquare, LogOut, PlusCircle, Settings, BarChart3,
  ShieldAlert, Lock, Check, AlertCircle, FileText, PieChart, Layers, MessageCircle, Menu,
  Heart, Printer, Share2, PlayCircle, Camera, Map, ChevronLeft, ChevronRight, ChevronDown, LocateFixed, PencilRuler, RotateCcw, MapPinned, Flag, Bell, Music2, VolumeX, BookOpen, ShieldCheck, Star
} from 'lucide-react';

const STATIC_LANGUAGES = {
  tr: { corporate:'Kurumsal', offices:'Ofislerimiz', agents:'Danışmanlar', listings:'İlanlarımız', ai:'🤖 Yapay Zeka Asistanı', projects:'Projelerimiz', contact:'İletişim', advisor:'Danışman Ol', franchise:'Franchise Ol!', panel:'Panel' },
  en: { corporate:'Corporate', offices:'Our Offices', agents:'Our Advisors', listings:'Listings', ai:'🤖 AI Real Estate Assistant', projects:'Projects', contact:'Contact', advisor:'Become an Advisor', franchise:'Become a Franchise!', panel:'Panel' },
  ar: { corporate:'الشركة', offices:'مكاتبنا', agents:'مستشارونا', listings:'العقارات', ai:'🤖 مساعد العقارات الذكي', projects:'المشاريع', contact:'اتصل بنا', advisor:'كن مستشاراً', franchise:'كن شريك امتياز!', panel:'لوحة التحكم' }
} as const;
type StaticLanguage = keyof typeof STATIC_LANGUAGES;

const SOCIAL_MEDIA_LINKS = [
  { name: 'Instagram', icon: 'https://cdn.simpleicons.org/instagram/BE123C' },
  { name: 'X', icon: 'https://cdn.simpleicons.org/x/BE123C' },
  { name: 'Facebook', icon: 'https://cdn.simpleicons.org/facebook/BE123C' },
  { name: 'YouTube', icon: 'https://cdn.simpleicons.org/youtube/BE123C' },
  { name: 'Telegram', icon: 'https://cdn.simpleicons.org/telegram/BE123C' },
  { name: 'LinkedIn', icon: '/linkedin.svg' }
];

type TrainingEvent = { id: string; title: string; date: string; time: string; location: string; format: string };
type TrainingCenter = { id: string; name: string; city: string; address: string; description: string };
type TrainingType = { id: string; title: string; duration: string; description: string };
type TrainingContent = {
  calendarIntro: string;
  centersIntro: string;
  typesIntro: string;
  events: TrainingEvent[];
  centers: TrainingCenter[];
  types: TrainingType[];
};
const DEFAULT_TRAINING_CONTENT: TrainingContent = {
  calendarIntro: 'Realty Center® eğitim takviminden yaklaşan sınıf eğitimlerini, çevrim içi programları ve saha çalışmalarını takip edebilirsiniz.',
  centersIntro: 'Eğitim merkezlerimiz; danışmanlarımızın mesleki gelişimini destekleyen, uygulamalı çalışmalar ve güncel sektör eğitimleri için hazırlanan öğrenme alanlarıdır.',
  typesIntro: 'Gayrimenkul kariyerinin her aşamasına uygun eğitim programlarımızla satış, mevzuat, pazarlama, teknoloji ve portföy yönetimi alanlarında sürekli gelişim sağlıyoruz.',
  events: [
    { id: 'training-event-1', title: 'Gayrimenkule Başlangıç', date: '2026-09-05', time: '10:00', location: 'Ankara Eğitim Merkezi', format: 'Sınıf Eğitimi' },
    { id: 'training-event-2', title: 'Dijital Pazarlama Atölyesi', date: '2026-09-12', time: '14:00', location: 'Çevrim içi', format: 'Online' },
    { id: 'training-event-3', title: 'Portföy ve Müşteri Yönetimi', date: '2026-09-19', time: '10:30', location: 'İstanbul Eğitim Merkezi', format: 'Sınıf Eğitimi' }
  ],
  centers: [
    { id: 'training-center-1', name: 'Ankara Eğitim Merkezi', city: 'Ankara', address: 'Konutkent Mah. 3028. Cad. West Gate Residence, Çankaya / Ankara', description: 'Genel merkez bünyesinde sınıf ve uygulama eğitimleri.' }
  ],
  types: [
    { id: 'training-type-1', title: 'Gayrimenkule Başlangıç Eğitimi', duration: '2 Gün', description: 'Sektöre yeni başlayan danışmanlar için temel süreçler, mevzuat ve müşteri iletişimi.' },
    { id: 'training-type-2', title: 'Portföy Yönetimi', duration: '1 Gün', description: 'Doğru portföy alma, fiyatlama, sunum ve takip yöntemleri.' },
    { id: 'training-type-3', title: 'Dijital Pazarlama', duration: '1 Gün', description: 'İlan sunumu, sosyal medya, kişisel marka ve dijital müşteri kazanımı.' }
  ]
};
const getTrainingContent = (): TrainingContent => {
  try { return { ...DEFAULT_TRAINING_CONTENT, ...(JSON.parse(localStorage.getItem('realty-center-training-content') || 'null') || {}) }; }
  catch { return DEFAULT_TRAINING_CONTENT; }
};
const saveTrainingContent = (content: TrainingContent) => {
  localStorage.setItem('realty-center-training-content', JSON.stringify(content));
  window.dispatchEvent(new Event('realty-center-training-updated'));
};

type RealtyVideo = { id: string; source: 'youtube' | 'upload' | 'youtube-channel'; category: 'tv' | 'news'; url: string; title: string; thumbnail: string; description: string; createdAt: string };
const DEFAULT_REALTY_VIDEOS: RealtyVideo[] = MEDIA_SELECTION.map((video) => ({
  id: video.id, source: 'youtube', category: video.category,
  url: `https://www.youtube.com/watch?v=${video.youtubeId}`, title: video.title,
  thumbnail: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`,
  description: video.description, createdAt: '2026-10-18T18:00:00.000Z'
}));
const getRealtyVideos = (): RealtyVideo[] => {
  try {
    const raw = localStorage.getItem('realty-center-videos');
    const saved = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(saved)) return structuredClone(DEFAULT_REALTY_VIDEOS);
    let videos: RealtyVideo[] = saved.map((video: RealtyVideo) => ({ ...video, source: video.source || 'youtube', category: video.category || 'tv', description: video.description || '' }));
    if (localStorage.getItem('realty-media-seed-version') !== '2026-10-18') {
      videos = [...videos, ...DEFAULT_REALTY_VIDEOS.filter((seed) => !videos.some((video) => video.id === seed.id || video.url === seed.url))];
      localStorage.setItem('realty-center-videos', JSON.stringify(videos));
      localStorage.setItem('realty-media-seed-version', '2026-10-18');
    }
    return videos;
  } catch { return structuredClone(DEFAULT_REALTY_VIDEOS); }
};
const getYoutubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1] || '';
const saveRealtyVideos = (videos: RealtyVideo[]) => { localStorage.setItem('realty-center-videos', JSON.stringify(videos)); window.dispatchEvent(new Event('realty-center-videos-updated')); };
const getYoutubeChannelUrl = () => localStorage.getItem('realty-center-youtube-channel-url') || '';
const saveYoutubeChannelUrl = (url: string) => { localStorage.setItem('realty-center-youtube-channel-url', url.trim()); window.dispatchEvent(new Event('realty-center-youtube-channel-updated')); };

type LibraryArticle = { id: string; title: string; summary: string; image: string; content: string; publishedAt: string };
type LibraryCategory = { id: string; slug: string; title: string; description: string; color: string; articles: LibraryArticle[] };
const DEFAULT_LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id:'library-guide', slug:'gayrimenkul-rehberi', title:'Gayrimenkul Rehberi', description:'Alım, satım ve kiralama sürecini kolaylaştıran pratik bilgi yazıları ve kontrol listeleri.', color:'#CD011E', articles:[
    { id:'sektor-2026', title:'Gayrimenkul alırken doğru fiyat nasıl değerlendirilir?', summary:'Bölge, metrekare, bina niteliği ve güncel emsalleri birlikte inceleyerek daha sağlıklı karar verin.', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-09-10T10:00:00.000Z', content:'<p>Doğru fiyat değerlendirmesi; yalnızca ilan bedeline değil, bölgesel emsallere, taşınmazın fiziksel durumuna ve kullanım amacına bakmayı gerektirir.</p><h2>Kontrol edilmesi gerekenler</h2><ul><li>Aynı bölgedeki güncel emsal ilanlar</li><li>Metrekare, bina yaşı ve ulaşım avantajları</li><li>Tapu, iskan ve kullanım durumu</li></ul>' },
    { id:'sektor-danismanlik', title:'Satış ve kiralama sürecinde güvenli ilerleme rehberi', summary:'Şeffaf bilgi, doğru fiyatlama ve yazılı süreç takibi; tarafların güvenle ilerlemesini sağlar.', image:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-18T12:00:00.000Z', content:'<p>Gayrimenkul sürecinde ilk görüşmeden sözleşmeye kadar her adımı yazılı ve doğrulanabilir şekilde yürütmek güveni güçlendirir.</p>' }
  ] },
  { id:'library-law', slug:'hukuk-mevzuat', title:'Hukuk & Mevzuat', description:'Tapu, sözleşme, yetkilendirme ve gayrimenkul mevzuatına dair açıklayıcı içerikler.', color:'#183B66', articles:[
    { id:'hukuk-tapu', title:'Tapu işlemi öncesinde kontrol edilmesi gereken 6 başlık', summary:'Tapu kaydı, yetki belgeleri ve ödeme planı gibi kritik noktaları işlem öncesinde gözden geçirin.', image:'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-09-09T10:00:00.000Z', content:'<p>Tapu işlemlerinde taşınmaza ve taraflara ilişkin bilgilerin doğrulanması, sağlıklı bir sürecin temelidir.</p><h2>Ön kontrol listesi</h2><ul><li>Tapu kaydı ve taşınmaz bilgileri</li><li>Tarafların kimlik ve temsil yetkileri</li><li>Ödeme yöntemi ve resmi belgeler</li></ul>' }
  ] },
  { id:'library-process', slug:'islem-rehberleri', title:'İşlem Rehberleri', description:'Tapu, ekspertiz, sözleşme ve teslim süreçleri için sade ve açıklayıcı içerikler.', color:'#7C2D12', articles:[
    { id:'islem-ekspertiz', title:'Ekspertiz, tapu ve teslim sürecinde temel adımlar', summary:'Bir işlemde hangi aşamada hangi belgenin ve kontrolün gerekli olduğunu adım adım öğrenin.', image:'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-09-08T10:00:00.000Z', content:'<p>Ekspertiz, ödeme planı, tapu ve teslim adımlarının doğru sırayla yürütülmesi sağlıklı bir gayrimenkul işleminin temelidir.</p>' }
  ] },
  { id:'library-ai', slug:'yapay-zekali-rehber', title:'Yapay Zekâlı Rehber', description:'Gayrimenkul kararlarında yapay zekâdan yararlanmayı kolaylaştıran uygulamalı rehberler.', color:'#6D28D9', articles:[
    { id:'ai-degerleme', title:'Yapay zekâ ile bölgesel fiyat araştırması nasıl yapılır?', summary:'Bir yatırım bölgesini analiz ederken yapay zekâdan doğru sorularla nasıl yararlanabileceğinizi öğrenin.', image:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-23T12:00:00.000Z', content:'<p>Yapay zekâ, kararın yerine geçmez; dağınık verileri karşılaştırmak ve araştırma sürecini hızlandırmak için güçlü bir yardımcıdır.</p>' }
  ] },
  { id:'library-investment', slug:'yatirim-firsatlari-analizler', title:'Yatırım Fırsatları ve Analizler', description:'Bölgesel fiyat hareketleri, kira getirileri ve yatırım fırsatlarına dair uzman analizleri.', color:'#047857', articles:[
    { id:'yatirim-kira-getirisi', title:'Kira getirisi analizinde yalnızca fiyata bakmayın', summary:'Brüt kira çarpanı, bakım gideri ve bölgesel talep gibi değişkenler yatırımın gerçek resmini verir.', image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-20T12:00:00.000Z', content:'<p>Sağlıklı yatırım analizi, satın alma bedelinin yanında düzenli giderleri ve uzun dönemli bölge potansiyelini dikkate alır.</p>' }
  ] }
];
const getLibraryCategories = (): LibraryCategory[] => { try { const items=JSON.parse(localStorage.getItem('realty-center-library') || 'null') || DEFAULT_LIBRARY_CATEGORIES; const defaults=Object.fromEntries(DEFAULT_LIBRARY_CATEGORIES.flatMap((category)=>category.articles.map((article)=>[article.id,article]))); const legacyTitles=new Set(['Gayrimenkulde 2026’nın ikinci yarısına bakış','Gayrimenkul danışmanlığında güven neden belirleyici?','Realty Center® “Önce Güven” yaklaşımını anlattı']); return items.map((item:LibraryCategory)=>{const normalized=item.id==='library-news'||item.slug==='sektor-haberleri'?{...item,id:'library-guide',slug:'gayrimenkul-rehberi',title:'Gayrimenkul Rehberi',description:'Alım, satım ve kiralama sürecini kolaylaştıran pratik bilgi yazıları ve kontrol listeleri.'}:item.id==='library-press'||item.slug==='basinda-biz'?{...item,id:'library-process',slug:'islem-rehberleri',title:'İşlem Rehberleri',description:'Tapu, ekspertiz, sözleşme ve teslim süreçleri için sade ve açıklayıcı içerikler.'}:item; return {...normalized,articles:normalized.articles.map((article)=>legacyTitles.has(article.title)?(defaults[article.id]||article):article)};}); } catch { return DEFAULT_LIBRARY_CATEGORIES; } };
const saveLibraryCategories = (items: LibraryCategory[]) => { localStorage.setItem('realty-center-library',JSON.stringify(items)); window.dispatchEvent(new Event('realty-center-library-updated')); };
const stripRichText = (html: string) => html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

type CustomerFeedback = {
  id: string;
  type: 'Memnuniyet' | 'Danışman Değerlendirmesi' | 'Ofis Değerlendirmesi' | 'Şikâyet' | 'Dilek / Öneri';
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  rating: number;
  agent: string;
  office: string;
  status: 'Yeni' | 'İnceleniyor' | 'Yanıtlandı';
  createdAt: string;
};
const getCustomerFeedback = (): CustomerFeedback[] => {
  try { return JSON.parse(localStorage.getItem('realty-center-customer-feedback') || '[]'); } catch { return []; }
};
const saveCustomerFeedback = (items: CustomerFeedback[]) => {
  localStorage.setItem('realty-center-customer-feedback', JSON.stringify(items));
  window.dispatchEvent(new Event('realty-center-feedback-updated'));
};

type BuyerRequest = {
  id: string; type: string; property: string; city: string; district: string; budget: string; payment: string; timing: string; name: string; phone: string;
  description: string;
  createdAt: string; status: 'Yeni' | 'İnceleniyor' | 'Eşleştirildi'; officeNames: string[]; agentNames: string[];
};
const getBuyerRequests = (): BuyerRequest[] => { try { return JSON.parse(localStorage.getItem('realty-center-buyer-requests') || '[]'); } catch { return []; } };
const saveBuyerRequests = (items: BuyerRequest[]) => {
  localStorage.setItem('realty-center-buyer-requests', JSON.stringify(items));
  window.dispatchEvent(new Event('realty-center-buyer-requests-updated'));
};

type ManagementMember = { id: string; name: string; title: string; image: string; biography: string };
const DEFAULT_ABOUT_STORY = `Realty Center®, gayrimenkul sektöründe güvenin yalnızca verilen bir söz değil, her işlemde yeniden kazanılan bir değer olduğuna inanır. “Önce Güven” anlayışıyla çıktığımız bu yolculukta; evini satmak, yeni bir yaşam alanı kiralamak veya doğru yatırıma ulaşmak isteyen herkesi şeffaf bilgi, yerel uzmanlık ve güçlü teknolojiyle buluşturuyoruz.

Türkiye genelinde gelişen ofis ve gayrimenkul danışmanı ağımız, bölgesini yakından tanıyan profesyonellerden oluşur. Her portföyü yalnızca bir ilan olarak değil; sahibinin emeğini, alıcısının beklentisini ve geleceğe dair kararını taşıyan özel bir değer olarak ele alırız. Bu nedenle doğru fiyatlandırmadan etkili tanıtıma, hukuki süreçlerden satış sonrası iletişime kadar bütün aşamalarda ölçülebilir ve güvenilir bir hizmet sunarız.

Realty Center®’ın hedefi, geleneksel emlak danışmanlığını dijital çözümler, sürekli eğitim ve insan odaklı hizmet kültürüyle geleceğe taşımaktır. Gayrimenkul satın alma, satma ve kiralama süreçlerini daha anlaşılır, daha hızlı ve daha güvenli hâle getirirken; danışmanlarımızın ve franchise ofislerimizin sürdürülebilir başarısını da güçlü kurumsal altyapımızla destekliyoruz.`;
const DEFAULT_MANAGEMENT: ManagementMember[] = [
  { id: 'yonetim-1', name: 'Mehmet Kaya', title: 'Yönetim Kurulu Başkanı', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=88&w=900', biography: 'Gayrimenkul, marka yönetimi ve franchise yapılanması alanlarında uzun yıllara dayanan deneyime sahiptir. Realty Center®’ın büyüme stratejisi, kurumsal standartları ve ulusal ofis ağının gelişimine liderlik etmektedir.' },
  { id: 'yonetim-2', name: 'Selin Arslan', title: 'Yönetim Kurulu Başkan Yardımcısı', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=88&w=900', biography: 'Kurumsal iletişim, müşteri deneyimi ve gayrimenkul pazarlaması alanlarında uzmanlaşmıştır. Hizmet kalitesinin geliştirilmesi ve danışman başarı programlarının yürütülmesinden sorumludur.' },
  { id: 'yonetim-3', name: 'Burak Demir', title: 'Franchise Geliştirme Direktörü', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=88&w=900', biography: 'Ofis yapılanması, saha operasyonları ve ticari gayrimenkul konularında deneyimlidir. Franchise adaylarının değerlendirilmesi, yeni ofislerin kurulması ve operasyonel gelişim süreçlerini yönetmektedir.' }
];
const getAboutStory = () => localStorage.getItem('realty-center-about-story') || DEFAULT_ABOUT_STORY;
const getManagementTeam = (): ManagementMember[] => { try { return JSON.parse(localStorage.getItem('realty-center-management') || 'null') || DEFAULT_MANAGEMENT; } catch { return DEFAULT_MANAGEMENT; } };
const saveManagementTeam = (items: ManagementMember[]) => { localStorage.setItem('realty-center-management', JSON.stringify(items)); window.dispatchEvent(new Event('realty-center-corporate-updated')); };
type CorporateDocument = { id: string; title: string; description: string; fileUrl: string };
type CorporateLogoItem = { id: string; name: string; logo: string; content: string };
const DEFAULT_DOCUMENTS: CorporateDocument[] = [
  { id: 'belge-1', title: 'Yetki Belgesi', description: 'Realty Center® kurumsal yetkilendirme belgesi.', fileUrl: '' },
  { id: 'belge-2', title: 'Kalite ve Hizmet Belgesi', description: 'Hizmet süreçlerimize ilişkin kurumsal belge.', fileUrl: '' }
];
const DEFAULT_REFERENCES: CorporateLogoItem[] = [
  { id: 'ref-ato', name: 'Ankara Ticaret Odası (ATO)', logo: '/partner-ato.png', content: 'Kurumsal gelişim, ticaret ağı ve sektörel iş birliği çalışmaları.' },
  { id: 'ref-tedb', name: 'Tüm Emlak Danışmanları Birliği', logo: '/partner-tedb.png', content: 'Gayrimenkul danışmanlığı alanındaki mesleki iş birlikleri ve sektörel gelişim çalışmaları.' },
  { id: 'ref-business', name: 'Business Akademi', logo: '/partner-business-akademi.png', content: 'Eğitim, gelişim ve kurumsal yetkinlik programları.' },
  { id: 'ref-tobb', name: 'Türkiye Odalar ve Borsalar Birliği (TOBB)', logo: '/partner-tobb.png', content: 'İş dünyası, oda-borsa ağı ve kurumsal iş birliği çalışmaları.' }
];
const DEFAULT_PARTNERS: CorporateLogoItem[] = [
  { id: 'partner-tedb', name: 'Tüm Emlak Danışmanları Birliği', logo: '/partner-tedb.png', content: 'Gayrimenkul danışmanlığı alanındaki mesleki iş birlikleri ve sektörel gelişim çalışmaları.' },
  { id: 'partner-ato', name: 'Ankara Ticaret Odası (ATO)', logo: '/partner-ato.png', content: 'Kurumsal gelişim, ticaret ağı ve sektörel iş birliği çalışmaları.' },
  { id: 'partner-trade', name: 'T.C. Ticaret Bakanlığı', logo: 'https://www.google.com/s2/favicons?domain=ticaret.gov.tr&sz=256', content: 'Gayrimenkul ticareti ve ilgili mevzuat süreçlerinde kamu kurumu bilgileri.' },
  { id: 'partner-business', name: 'Business Akademi', logo: '/partner-business-akademi.png', content: 'Eğitim, gelişim ve kurumsal yetkinlik programları.' },
  { id: 'partner-tobb', name: 'Türkiye Odalar ve Borsalar Birliği (TOBB)', logo: '/partner-tobb.png', content: 'İş dünyası, oda-borsa ağı ve kurumsal iş birliği çalışmaları.' },
  { id: 'partner-kriter', name: 'Kriter Medya', logo: '/klogo.png', content: 'Realty Center® dijital çözüm ortağı; web altyapısı, içerik ve teknik operasyon desteği.' },
  { id: 'partner-eminevim', name: 'Eminevim', logo: 'https://www.google.com/s2/favicons?domain=eminevim.com&sz=256', content: 'Tasarruf finansmanı alanında kurumsal çözüm ortağı.' },
  { id: 'partner-katilimevim', name: 'Katılımevim', logo: 'https://www.google.com/s2/favicons?domain=katilimevim.com.tr&sz=256', content: 'Tasarruf finansmanı alanında çözüm ve bilgi iş birliği.' },
  { id: 'partner-fuzulev', name: 'Fuzulev', logo: 'https://www.google.com/s2/favicons?domain=fuzulev.com.tr&sz=256', content: 'Tasarruf finansmanı alanında çözüm ve bilgi iş birliği.' },
  { id: 'partner-ziraat', name: 'Ziraat Bankası', logo: 'https://www.google.com/s2/favicons?domain=ziraatbank.com.tr&sz=256', content: 'Gayrimenkul finansmanı ve bankacılık çözümlerine ilişkin iş birliği.' },
  { id: 'partner-garanti', name: 'Garanti BBVA', logo: 'https://www.google.com/s2/favicons?domain=garantibbva.com.tr&sz=256', content: 'Bankacılık ve finansal çözüm iş birliği.' },
  { id: 'partner-halkbank', name: 'Halkbank', logo: 'https://www.google.com/s2/favicons?domain=halkbank.com.tr&sz=256', content: 'Bankacılık ve finansal çözüm iş birliği.' },
  { id: 'partner-kuveyt', name: 'Kuveyt Türk', logo: 'https://www.google.com/s2/favicons?domain=kuveytturk.com.tr&sz=256', content: 'Katılım bankacılığı ve finansal çözüm iş birliği.' },
  { id: 'partner-albaraka', name: 'Albaraka Türk', logo: 'https://www.google.com/s2/favicons?domain=albaraka.com.tr&sz=256', content: 'Katılım bankacılığı ve finansal çözüm iş birliği.' },
  { id: 'partner-denizbank', name: 'DenizBank', logo: 'https://www.google.com/s2/favicons?domain=denizbank.com&sz=256', content: 'Bankacılık ve finansal çözüm iş birliği.' }
];
const getStoredCorporateItems = <T,>(key: string, fallback: T): T => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (!Array.isArray(stored)) return stored || fallback;
    const defaults = fallback as unknown as CorporateLogoItem[];
    const savedExtras = (stored as CorporateLogoItem[]).filter((item) => item.id !== 'ref-1' && !defaults.some((defaultItem) => defaultItem.id === item.id));
    return [...defaults, ...savedExtras] as T;
  } catch { return fallback; }
};

type HeaderMenuItem = { id: string; label: string; path: string; side: 'left' | 'right'; image?: string; content?: string; children: HeaderMenuItem[] };
const headerItem = (id: string, label: string, path: string, side: 'left' | 'right', children: HeaderMenuItem[] = [], image = '', content = ''): HeaderMenuItem => ({ id, label, path, side, image, content, children });
const DEFAULT_HEADER_MENU: HeaderMenuItem[] = [
  headerItem('corporate','Kurumsal','/kurumsal/hakkimizda','left',[headerItem('about','Hakkımızda','/kurumsal/hakkimizda','left'),headerItem('mission','Misyonumuz ve Vizyonumuz','/kurumsal/misyon-vizyon','left'),headerItem('team','Yönetim Kadromuz','/kurumsal/ekibimiz','left'),headerItem('documents','Belgelerimiz','/kurumsal/belgelerimiz','left'),headerItem('references','Referanslarımız','/kurumsal/referanslar','left'),headerItem('partners','İş Ortaklarımız','/kurumsal/is-ortaklarimiz','left',[headerItem('financial-solutions','Finansal Çözümler','/finansal-cozumler','left',[],'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=90&w=1400','Katılım bankaları ve evim sistemi seçenekleri için çözüm talebi oluşturun.')])]),
  headerItem('offices','Ofislerimiz','/ofislerimiz','left'), headerItem('agents','Danışmanlar','/danismanlarimiz','left'), headerItem('listings','İlanlarımız','/ilan-kategorileri','left'), headerItem('projects','Projelerimiz','/projelerimiz','left'),
  headerItem('discover','Keşfet','/icerik/education','left',[
    headerItem('education','Eğitim','/icerik/education','left',[
      headerItem('education-calendar','Eğitim Takvimi','/icerik/education-calendar','left',[],'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=90&w=1400','Realty Center® eğitim takvimi; çevrim içi programları, sınıf eğitimlerini, saha çalışmalarını ve gelişim buluşmalarını tek planda takip etmenizi sağlar.'),
      headerItem('education-centers','Eğitim Merkezleri','/icerik/education-centers','left',[],'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=90&w=1400','Türkiye genelindeki eğitim merkezlerimiz, danışmanlarımızın güncel sektör bilgisine ve uygulamalı gelişim programlarına erişmesini sağlar.'),
      headerItem('education-types','Eğitim Çeşitlerimiz','/icerik/education-types','left',[],'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=90&w=1400','Başlangıç, uzmanlık, mevzuat, satış, pazarlama ve teknoloji eğitimleriyle her kariyer aşamasına uygun gelişim seçenekleri sunuyoruz.')
    ],'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=90&w=1400','Realty Center® eğitim programları, gayrimenkul profesyonellerinin bilgi ve saha becerilerini sürekli geliştiren planlı bir öğrenme yolculuğudur.'),
    headerItem('future','Geleceğim İçin','/icerik/future','left',[headerItem('build-my-team','Kendi Takımını Kur','/icerik/bana-takim-kur','left',[],'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400','Takımınızı kurun, etkinizi büyütün.\n\nGayrimenkulde kalıcı büyüme yalnızca daha çok satış yapmakla değil; doğru insanları, doğru görevlerle bir araya getirmekle başlar. Realty Center® danışmanları, iş hacimleri geliştikçe kendi işlerini sistemli bir ekip yapısına dönüştürebilir.\n\nİlk aşamada operasyon ve takip süreçlerini düzenleyecek bir idari asistan; müşteri trafiği arttığında alıcı ihtiyaçlarını yönetecek bir danışman; portföy hacmi büyüdüğünde ise satışa sunulacak gayrimenkullerden sorumlu bir portföy uzmanı ekibe değer katar.\n\nAmaç herkesin aynı işi yapması değil, her rolün kendi uzmanlığında güçlenmesidir. Eğitim, mentorluk ve kurumsal sistem desteğimizle ekibinizi planlı biçimde büyütür; daha düzenli, daha verimli ve sürdürülebilir bir iş modeli kurmanıza eşlik ederiz.\n\nBirlikte çalışan güçlü bir ekip, kariyerinizdeki en sağlam yatırımlardan biridir.')],'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400','Gayrimenkul sektöründe güçlü bir kariyer kurmanız için eğitim, mentorluk ve kurumsal marka desteğini bir araya getiriyoruz.'),
    headerItem('systems','Sistem ve Modeller','/icerik/systems','left',[],'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=90&w=1400','Portföy, müşteri, pazarlama ve raporlama süreçlerini ölçülebilir sistemlerle yönetiyoruz.'),
    headerItem('culture','Realty Center® Kültürü','/icerik/culture','left',[],'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=90&w=1400','Önce Güven anlayışı; şeffaflık, dayanışma, gelişim ve başarıyı paylaşma değerleri üzerine kuruludur.')
  ]),
  headerItem('videos','Realty Medya','/videolar','left',[headerItem('realty-tv','Realty TV','/videolar?bolum=tv','left'),headerItem('realty-news','Realty Haberler','/videolar?bolum=haberler','left')]),
  headerItem('earning','Kazanç Modeli','/icerik/contribution','right',[headerItem('contribution','Katkı Payı','/icerik/contribution','right',[],'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=90&w=1400','Marka, teknoloji, eğitim ve operasyon desteğinin sürdürülebilir biçimde sunulmasını sağlayan şeffaf model.'),headerItem('sharing','Paylaşım Modeli','/icerik/sharing','right',[
      headerItem('sharing-advisors','Danışman Kazanç Paylaşımı','/icerik/sharing-advisors','right',[],'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=90&w=1400','Danışmanın emeğini ve üretimini merkeze alan şeffaf kazanç modeli.\n\nRealty Center® danışman paylaşım yaklaşımında; portföyün kazanılması, alıcı veya satıcı ilişkisinin yönetilmesi, pazarlama çalışması, işlem takibi ve sonuçlandırma sürecindeki katkılar ayrı ayrı değerlendirilir. Amaç yalnızca işlem sonunda bir oran bölmek değil, değeri oluşturan emeği görünür ve ölçülebilir hâle getirmektir.\n\nDanışman; marka gücü, teknoloji altyapısı, eğitim, ilan ve pazarlama desteği, ofis olanakları ve operasyonel hizmetlerden yararlanırken kendi üretiminden doğan kazancını önceden bilinen esaslarla takip eder. Ortak portföy, yönlendirme veya birden fazla danışmanın görev aldığı işlemlerde paylaşım; çalışma başlamadan önce görev, sorumluluk ve katkı kapsamı belirlenerek kayıt altına alınır.\n\nUygulanacak oranlar; ofis yapısı, danışmanın deneyimi, üretim seviyesi, kullanılan hizmetler ve ilgili sözleşmeye göre değişebilir. Esas olan sürpriz kesintilerin olmadığı, performansı destekleyen ve sürdürülebilir büyümeyi hedefleyen açık bir sistemdir.'),
      headerItem('sharing-franchise','Franchise Ofis Kazanç Modeli','/icerik/sharing-franchise','right',[],'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=90&w=1400','Ofis yatırımını, yerel büyümeyi ve danışman başarısını birlikte gözeten sürdürülebilir franchise yaklaşımı.\n\nRealty Center® franchise ofisi; marka kullanım hakkı, kurumsal sistemler, eğitim programları, teknoloji altyapısı, pazarlama desteği ve operasyon standartlarıyla yerel bir gayrimenkul işletmesi oluşturur. Ofisin kazanç modeli; danışman üretimi, işlem hacmi, hizmet gelirleri ve yerel iş geliştirme faaliyetlerinin sürdürülebilir biçimde yönetilmesine dayanır.\n\nPaylaşım yapısında ofisin üstlendiği mekân, personel, tanıtım, teknoloji, mevzuat uyumu, işlem kontrolü ve danışman desteği gibi sorumluluklar dikkate alınır. Danışman ile ofis arasındaki model; sabit gider, hizmet paketi, işlem bazlı paylaşım veya performans basamakları gibi farklı bileşenlerle sözleşmeye bağlanabilir.\n\nHer franchise ofisinin pazar koşulları ve operasyon yapısı farklıdır. Bu nedenle sitedeki açıklamalar sabit bir gelir ya da oran taahhüdü değildir. Nihai koşullar; bölge, yatırım planı, ofis kapasitesi ve tarafların yazılı mutabakatıyla belirlenir.'),
      headerItem('sharing-team','Takım Liderliği ve Ekip Paylaşımı','/icerik/sharing-team','right',[],'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400','Takım liderinin kurduğu sistemi ve ekip üyelerinin üretimini dengeli biçimde koruyan iş modeli.\n\nKendi takımını oluşturan danışman; müşteri ve portföy akışını yönetmenin yanında ekip seçimi, eğitim, mentorluk, pazarlama, görev dağılımı, performans takibi ve operasyon koordinasyonu gibi sorumluluklar üstlenir. Ekip paylaşım modeli, liderin sağladığı sistem ve fırsatlarla ekip üyesinin işlemdeki doğrudan emeğini birlikte değerlendirir.\n\nHer işlemde müşteri kaynağı, portföy kaynağı, randevu ve gösterim süreci, müzakere, sözleşme takibi ve kapanış sorumlulukları netleştirilir. Paylaşım oranı; bu görev dağılımı, sağlanan destek ve işlem türü esas alınarak önceden yazılı hâle getirilir. Böylece ekip büyürken görev belirsizliği ve sonradan ortaya çıkan paylaşım anlaşmazlıkları azaltılır.\n\nTakım liderliği yalnızca ekip kurmak değil; üretimi artıran, danışmanı geliştiren ve müşteri deneyimini koruyan bir sistem oluşturmaktır. Kazanç modeli de bu liderlik sorumluluğunu performans, kalite ve sürdürülebilirlik ilkeleriyle destekler.'),
      headerItem('sharing-other','İş Birliği ve Diğer Paylaşım Modelleri','/icerik/sharing-other','right',[],'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=90&w=1400','Yönlendirme, ortak portföy, proje ve uzmanlık iş birlikleri için katkı bazlı esnek modeller.\n\nGayrimenkul işlemleri her zaman tek bir danışman veya tek bir ofis tarafından yürütülmeyebilir. Farklı şehirlerden gelen müşteri yönlendirmeleri, ortak portföy çalışmaları, proje satışları, ticari gayrimenkul uzmanlığı, kurumsal müşteri hizmetleri ve çözüm ortaklıkları için ayrı paylaşım modelleri uygulanabilir.\n\nYönlendirme modelinde müşteriyi veya iş fırsatını sisteme kazandıran tarafın katkısı; ortak işlem modelinde ise portföyü yöneten, müşteriyi temsil eden ve süreci sonuçlandıran tarafların görevleri korunur. Proje ve kurumsal anlaşmalarda pazarlama bütçesi, ekip kapasitesi, operasyon süresi ve uzmanlık sorumluluğu paylaşım çerçevesine dâhil edilir.\n\nTüm modellerde temel ilke aynıdır: görevler işlem öncesinde tanımlanır, paylaşım yazılı olarak kayıt altına alınır, yasal ve vergisel yükümlülükler gözetilir ve ödeme ancak gerçekleşen işlem ile doğrulanmış katkı üzerinden değerlendirilir. Detaylar ilgili ofis, proje ve sözleşme koşullarına göre belirlenir.')
    ],'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=90&w=1400','Üretilen değerin katkıyı koruyan açık kurallarla paylaşıldığı kurumsal kazanç yaklaşımı.')]),
  headerItem('ai','Yapay Zeka Asistanı','/ai-karar-asistani','right'), headerItem('library','Realty Kütüphane','/kutuphane','right'), headerItem('why','Neden Realty Center®?','/neden-realty-center','right'), headerItem('franchise','Franchise Ol','/franchise-basvuru','right'), headerItem('advisor','Danışman Ol','/danisman-basvuru','right'), headerItem('contact','İletişim','/iletisim','right',[headerItem('contact-info','İletişim Bilgilerimiz','/iletisim','right'),headerItem('feedback','Müşteri Memnuniyeti','/geri-bildirim','right')])
];
const applyRefreshedCopy = (items: HeaderMenuItem[]) => {
  for (const item of items) {
    if (PAGE_COPY[item.id]) item.content = PAGE_COPY[item.id].text;
    if (item.id === 'culture') item.image = '/images/realty-culture-team.webp';
    if (item.id === 'agents') item.label = 'Danışmanlar';
    applyRefreshedCopy(item.children);
  }
};
applyRefreshedCopy(DEFAULT_HEADER_MENU);
const getHeaderMenu = (): HeaderMenuItem[] => {
  try {
    const stored: HeaderMenuItem[] = (JSON.parse(localStorage.getItem('realty-center-header-menu') || 'null') || structuredClone(DEFAULT_HEADER_MENU))
      .map((item: HeaderMenuItem) => item.id === 'library' ? { ...item, path: '/kutuphane' } : item);

    if (localStorage.getItem('realty-content-refresh-version') !== '2026-10-18') {
      applyRefreshedCopy(stored);
      localStorage.setItem('realty-center-header-menu', JSON.stringify(stored));
      localStorage.setItem('realty-content-refresh-version', '2026-10-18');
    }
    const agents = stored.find((item) => item.id === 'agents');
    if (agents?.label === 'Danışmanlarımız') agents.label = 'Danışmanlar';
    const discover = stored.find((item) => item.id === 'discover');
    const future = discover?.children.find((item) => item.id === 'future');
    const teamContent = DEFAULT_HEADER_MENU.find((item) => item.id === 'discover')?.children
      .find((item) => item.id === 'future')?.children
      .find((item) => item.id === 'build-my-team')?.content || '';
    const team = future?.children.find((item) => item.id === 'build-my-team');

    if (!team && future) {
      future.children.push(headerItem('build-my-team','Kendi Takımını Kur','/icerik/bana-takim-kur','left',[],'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400',teamContent));
    } else if (team) {
      team.label = 'Kendi Takımını Kur';
      if (!team.content?.includes('Takımınızı kurun')) team.content = teamContent;
    }

    const earning = stored.find((item) => item.id === 'earning');
    if (earning) earning.children = earning.children.filter((item) => item.id !== 'financial-solutions');
    const corporate = stored.find((item) => item.id === 'corporate');
    const partners = corporate?.children.find((item) => item.id === 'partners');
    if (partners && !partners.children.some((item) => item.id === 'financial-solutions')) partners.children.push(headerItem('financial-solutions','Finansal Çözümler','/finansal-cozumler','left',[],'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=90&w=1400','Katılım bankaları ve evim sistemi seçenekleri için çözüm talebi oluşturun.'));
    const defaultSharing = DEFAULT_HEADER_MENU.find((item) => item.id === 'earning')?.children.find((item) => item.id === 'sharing');
    const storedSharing = earning?.children.find((item) => item.id === 'sharing');
    if (storedSharing && defaultSharing) {
      const requiredSharingChildren = defaultSharing.children.filter((required) => !storedSharing.children.some((child) => child.id === required.id));
      if (requiredSharingChildren.length) storedSharing.children.push(...requiredSharingChildren);
      storedSharing.label = 'Paylaşım Modeli';
      storedSharing.path = '/icerik/sharing';
    }

    const media = stored.find((item) => item.id === 'videos');
    if (media) {
      media.label = 'Realty Medya';
      media.path = '/videolar';
      const mediaChildren = [headerItem('realty-tv','Realty TV','/videolar?bolum=tv','left'),headerItem('realty-news','Realty Haberler','/videolar?bolum=haberler','left')];
      media.children = mediaChildren;
    }

    const discoverIndex = stored.findIndex((item) => item.id === 'discover');
    const videosIndex = stored.findIndex((item) => item.id === 'videos');
    if (discoverIndex > videosIndex && videosIndex >= 0) {
      const reordered = [...stored];
      const [discoverItem] = reordered.splice(discoverIndex, 1);
      reordered.splice(videosIndex, 0, discoverItem);
      return reordered;
    }
    return stored;
  } catch {
    return DEFAULT_HEADER_MENU;
  }
};
const saveHeaderMenu = (items: HeaderMenuItem[]) => { localStorage.setItem('realty-center-header-menu', JSON.stringify(items)); window.dispatchEvent(new Event('realty-center-header-updated')); };
const findHeaderItem = (items: HeaderMenuItem[], id: string): HeaderMenuItem | undefined => { for (const item of items) { if (item.id === id) return item; const found = findHeaderItem(item.children, id); if (found) return found; } return undefined; };
const updateHeaderMenuItem = (items: HeaderMenuItem[], id: string, patch: Partial<HeaderMenuItem>): HeaderMenuItem[] => items.map((item) => item.id === id ? { ...item, ...patch } : { ...item, children: updateHeaderMenuItem(item.children, id, patch) });
const removeHeaderMenuItem = (items: HeaderMenuItem[], id: string): HeaderMenuItem[] => items.filter((item) => item.id !== id).map((item) => ({ ...item, children: removeHeaderMenuItem(item.children, id) }));
const appendHeaderMenuChild = (items: HeaderMenuItem[], parentId: string, child: HeaderMenuItem): HeaderMenuItem[] => items.map((item) => item.id === parentId ? { ...item, children: [...item.children, child] } : { ...item, children: appendHeaderMenuChild(item.children, parentId, child) });
// TÜRKİYE 81 İL VE 973 İLÇE VERİ HARİTASI
const TURKEY_CITIES: Record<string, string[]> = {"Adana":["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Karataş","Kozan","Pozantı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"],"Adıyaman":["Besni","Çelikhan","Gerger","Gölbaşı","Kahta","Merkez","Samsat","Sincik","Tut"],"Afyonkarahisar":["Başmakçı","Bayat","Bolvadin","Çay","Çobanlar","Dazkırı","Dinar","Emirdağ","Evciler","Hocalar","İhsaniye","İscehisar","Kızılören","Merkez","Sandıklı","Sinanpaşa","Sultandağı","Şuhut"],"Ağrı":["Diyadin","Doğubayazıt","Eleşkirt","Hamur","Merkez","Patnos","Taşlıçay","Tutak"],"Aksaray":["Ağaçören","Eskil","Gülağaç","Güzelyurt","Merkez","Ortaköy","Sarıyahşi","Sultanhanı"],"Amasya":["Göynücek","Gümüşhacıköy","Hamamözü","Merkez","Merzifon","Suluova","Taşova"],"Ankara":["Akyurt","Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"],"Antalya":["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"],"Ardahan":["Çıldır","Damal","Göle","Hanak","Merkez","Posof"],"Artvin":["Ardanuç","Arhavi","Borçka","Hopa","Kemalpaşa","Merkez","Murgul","Şavşat","Yusufeli"],"Aydın":["Bozdoğan","Buharkent","Çine","Didim","Efeler","Germencik","İncirliova","Karacasu","Karpuzlu","Koçarlı","Köşk","Kuşadası","Kuyucak","Nazilli","Söke","Sultanhisar","Yenipazar"],"Balıkesir":["Altıeylül","Ayvalık","Balya","Bandırma","Bigadiç","Burhaniye","Dursunbey","Edremit","Erdek","Gömeç","Gönen","Havran","İvrindi","Karesi","Kepsut","Manyas","Marmara","Savaştepe","Sındırgı","Susurluk"],"Bartın":["Amasra","Kurucaşile","Merkez","Ulus"],"Batman":["Beşiri","Gercüş","Hasankeyf","Kozluk","Merkez","Sason"],"Bayburt":["Aydıntepe","Demirözü","Merkez"],"Bilecik":["Bozüyük","Gölpazarı","İnhisar","Merkez","Osmaneli","Pazaryeri","Söğüt","Yenipazar"],"Bingöl":["Adaklı","Genç","Karlıova","Kiğı","Merkez","Solhan","Yayladere","Yedisu"],"Bitlis":["Adilcevaz","Ahlat","Güroymak","Hizan","Merkez","Mutki","Tatvan"],"Bolu":["Dörtdivan","Gerede","Göynük","Kıbrıscık","Mengen","Merkez","Mudurnu","Seben","Yeniçağa"],"Burdur":["Ağlasun","Altınyayla","Bucak","Çavdır","Çeltikçi","Gölhisar","Karamanlı","Kemer","Merkez","Tefenni","Yeşilova"],"Bursa":["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"],"Çanakkale":["Ayvacık","Bayramiç","Biga","Bozcaada","Çan","Eceabat","Ezine","Gelibolu","Gökçeada","Lapseki","Merkez","Yenice"],"Çankırı":["Atkaracalar","Bayramören","Çerkeş","Eldivan","Ilgaz","Kızılırmak","Korgun","Kurşunlu","Merkez","Orta","Şabanözü","Yapraklı"],"Çorum":["Alaca","Bayat","Boğazkale","Dodurga","İskilip","Kargı","Laçin","Mecitözü","Merkez","Oğuzlar","Ortaköy","Osmancık","Sungurlu","Uğurludağ"],"Denizli":["Acıpayam","Babadağ","Baklan","Bekilli","Beyağaç","Bozkurt","Buldan","Çal","Çameli","Çardak","Çivril","Güney","Honaz","Kale","Merkezefendi","Pamukkale","Sarayköy","Serinhisar","Tavas"],"Diyarbakır":["Bağlar","Bismil","Çermik","Çınar","Çüngüş","Dicle","Eğil","Ergani","Hani","Hazro","Kayapınar","Kocaköy","Kulp","Lice","Silvan","Sur","Yenişehir"],"Düzce":["Akçakoca","Cumayeri","Çilimli","Gölyaka","Gümüşova","Kaynaşlı","Merkez","Yığılca"],"Edirne":["Enez","Havsa","İpsala","Keşan","Lalapaşa","Meriç","Merkez","Süloğlu","Uzunköprü"],"Elazığ":["Ağın","Alacakaya","Arıcak","Baskil","Karakoçan","Keban","Kovancılar","Maden","Merkez","Palu","Sivrice"],"Erzincan":["Çayırlı","İliç","Kemah","Kemaliye","Merkez","Otlukbeli","Refahiye","Tercan","Üzümlü"],"Erzurum":["Aşkale","Aziziye","Çat","Hınıs","Horasan","İspir","Karaçoban","Karayazı","Köprüköy","Narman","Oltu","Olur","Palandöken","Pasinler","Pazaryolu","Şenkaya","Tekman","Tortum","Uzundere","Yakutiye"],"Eskişehir":["Alpu","Beylikova","Çifteler","Günyüzü","Han","İnönü","Mahmudiye","Mihalgazi","Mihalıççık","Odunpazarı","Sarıcakaya","Seyitgazi","Sivrihisar","Tepebaşı"],"Gaziantep":["Araban","İslahiye","Karkamış","Nizip","Nurdağı","Oğuzeli","Şahinbey","Şehitkamil","Yavuzeli"],"Giresun":["Alucra","Bulancak","Çamoluk","Çanakçı","Dereli","Doğankent","Espiye","Eynesil","Görele","Güce","Keşap","Merkez","Piraziz","Şebinkarahisar","Tirebolu","Yağlıdere"],"Gümüşhane":["Kelkit","Köse","Kürtün","Merkez","Şiran","Torul"],"Hakkari":["Çukurca","Derecik","Merkez","Şemdinli","Yüksekova"],"Hatay":["Altınözü","Antakya","Arsuz","Belen","Defne","Dörtyol","Erzin","Hassa","İskenderun","Kırıkhan","Kumlu","Payas","Reyhanlı","Samandağ","Yayladağı"],"Iğdır":["Aralık","Karakoyunlu","Merkez","Tuzluca"],"Isparta":["Aksu","Atabey","Eğirdir","Gelendost","Gönen","Keçiborlu","Merkez","Senirkent","Sütçüler","Şarkikaraağaç","Uluborlu","Yalvaç","Yenişarbademli"],"İstanbul":["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"],"İzmir":["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"],"Kahramanmaraş":["Afşin","Andırın","Çağlayancerit","Dulkadiroğlu","Ekinözü","Elbistan","Göksun","Nurhak","Onikişubat","Pazarcık","Türkoğlu"],"Karabük":["Eflani","Eskipazar","Merkez","Ovacık","Safranbolu","Yenice"],"Karaman":["Ayrancı","Başyayla","Ermenek","Kazımkarabekir","Merkez","Sarıveliler"],"Kars":["Akyaka","Arpaçay","Digor","Kağızman","Merkez","Sarıkamış","Selim","Susuz"],"Kastamonu":["Abana","Ağlı","Araç","Azdavay","Bozkurt","Cide","Çatalzeytin","Daday","Devrekani","Doğanyurt","Hanönü","İhsangazi","İnebolu","Küre","Merkez","Pınarbaşı","Seydiler","Şenpazar","Taşköprü","Tosya"],"Kayseri":["Akkışla","Bünyan","Develi","Felahiye","Hacılar","İncesu","Kocasinan","Melikgazi","Özvatan","Pınarbaşı","Sarıoğlan","Sarız","Talas","Tomarza","Yahyalı","Yeşilhisar"],"Kırıkkale":["Bahşılı","Balışeyh","Çelebi","Delice","Karakeçili","Keskin","Merkez","Sulakyurt","Yahşihan"],"Kırklareli":["Babaeski","Demirköy","Kofçaz","Lüleburgaz","Merkez","Pehlivanköy","Pınarhisar","Vize"],"Kırşehir":["Akçakent","Akpınar","Boztepe","Çiçekdağı","Kaman","Merkez","Mucur"],"Kilis":["Elbeyli","Merkez","Musabeyli","Polateli"],"Kocaeli":["Başiskele","Çayırova","Darıca","Derince","Dilovası","Gebze","Gölcük","İzmit","Kandıra","Karamürsel","Kartepe","Körfez"],"Konya":["Ahırlı","Akören","Akşehir","Altınekin","Beyşehir","Bozkır","Cihanbeyli","Çeltik","Çumra","Derbent","Derebucak","Doğanhisar","Emirgazi","Ereğli","Güneysınır","Hadim","Halkapınar","Hüyük","Ilgın","Kadınhanı","Karapınar","Karatay","Kulu","Meram","Sarayönü","Selçuklu","Seydişehir","Taşkent","Tuzlukçu","Yalıhüyük","Yunak"],"Kütahya":["Altıntaş","Aslanapa","Çavdarhisar","Domaniç","Dumlupınar","Emet","Gediz","Hisarcık","Merkez","Pazarlar","Simav","Şaphane","Tavşanlı"],"Malatya":["Akçadağ","Arapgir","Arguvan","Battalgazi","Darende","Doğanşehir","Doğanyol","Hekimhan","Kale","Kuluncak","Pütürge","Yazıhan","Yeşilyurt"],"Manisa":["Ahmetli","Akhisar","Alaşehir","Demirci","Gölmarmara","Gördes","Kırkağaç","Köprübaşı","Kula","Salihli","Sarıgöl","Saruhanlı","Selendi","Soma","Şehzadeler","Turgutlu","Yunusemre"],"Mardin":["Artuklu","Dargeçit","Derik","Kızıltepe","Mazıdağı","Midyat","Nusaybin","Ömerli","Savur","Yeşilli"],"Mersin":["Akdeniz","Anamur","Aydıncık","Bozyazı","Çamlıyayla","Erdemli","Gülnar","Mezitli","Mut","Silifke","Tarsus","Toroslar","Yenişehir"],"Muğla":["Bodrum","Dalaman","Datça","Fethiye","Kavaklıdere","Köyceğiz","Marmaris","Menteşe","Milas","Ortaca","Seydikemer","Ula","Yatağan"],"Muş":["Bulanık","Hasköy","Korkut","Malazgirt","Merkez","Varto"],"Nevşehir":["Acıgöl","Avanos","Derinkuyu","Gülşehir","Hacıbektaş","Kozaklı","Merkez","Ürgüp"],"Niğde":["Altunhisar","Bor","Çamardı","Çiftlik","Merkez","Ulukışla"],"Ordu":["Akkuş","Altınordu","Aybastı","Çamaş","Çatalpınar","Çaybaşı","Fatsa","Gölköy","Gülyalı","Gürgentepe","İkizce","Kabadüz","Kabataş","Korgan","Kumru","Mesudiye","Perşembe","Ulubey","Ünye"],"Osmaniye":["Bahçe","Düziçi","Hasanbeyli","Kadirli","Merkez","Sumbas","Toprakkale"],"Rize":["Ardeşen","Çamlıhemşin","Çayeli","Derepazarı","Fındıklı","Güneysu","Hemşin","İkizdere","İyidere","Kalkandere","Merkez","Pazar"],"Sakarya":["Adapazarı","Akyazı","Arifiye","Erenler","Ferizli","Geyve","Hendek","Karapürçek","Karasu","Kaynarca","Kocaali","Pamukova","Sapanca","Serdivan","Söğütlü","Taraklı"],"Samsun":["19 Mayıs","Alaçam","Asarcık","Atakum","Ayvacık","Bafra","Canik","Çarşamba","Havza","İlkadım","Kavak","Ladik","Salıpazarı","Tekkeköy","Terme","Vezirköprü","Yakakent"],"Siirt":["Baykan","Eruh","Kurtalan","Merkez","Pervari","Şirvan","Tillo"],"Sinop":["Ayancık","Boyabat","Dikmen","Durağan","Erfelek","Gerze","Merkez","Saraydüzü","Türkeli"],"Sivas":["Akıncılar","Altınyayla","Divriği","Doğanşar","Gemerek","Gölova","Gürün","Hafik","İmranlı","Kangal","Koyulhisar","Merkez","Suşehri","Şarkışla","Ulaş","Yıldızeli","Zara"],"Şanlıurfa":["Akçakale","Birecik","Bozova","Ceylanpınar","Eyyübiye","Halfeti","Haliliye","Harran","Hilvan","Karaköprü","Siverek","Suruç","Viranşehir"],"Şırnak":["Beytüşşebap","Cizre","Güçlükonak","İdil","Merkez","Silopi","Uludere"],"Tekirdağ":["Çerkezköy","Çorlu","Ergene","Hayrabolu","Kapaklı","Malkara","Marmaraereğlisi","Muratlı","Saray","Süleymanpaşa","Şarköy"],"Tokat":["Almus","Artova","Başçiftlik","Erbaa","Merkez","Niksar","Pazar","Reşadiye","Sulusaray","Turhal","Yeşilyurt","Zile"],"Trabzon":["Akçaabat","Araklı","Arsin","Beşikdüzü","Çarşıbaşı","Çaykara","Dernekpazarı","Düzköy","Hayrat","Köprübaşı","Maçka","Of","Ortahisar","Sürmene","Şalpazarı","Tonya","Vakfıkebir","Yomra"],"Tunceli":["Çemişgezek","Hozat","Mazgirt","Merkez","Nazımiye","Ovacık","Pertek","Pülümür"],"Uşak":["Banaz","Eşme","Karahallı","Merkez","Sivaslı","Ulubey"],"Van":["Bahçesaray","Başkale","Çaldıran","Çatak","Edremit","Erciş","Gevaş","Gürpınar","İpekyolu","Muradiye","Özalp","Saray","Tuşba"],"Yalova":["Altınova","Armutlu","Çınarcık","Çiftlikköy","Merkez","Termal"],"Yozgat":["Akdağmadeni","Aydıncık","Boğazlıyan","Çandır","Çayıralan","Çekerek","Kadışehri","Merkez","Saraykent","Sarıkaya","Sorgun","Şefaatli","Yenifakılı","Yerköy"],"Zonguldak":["Alaplı","Çaycuma","Devrek","Ereğli","Gökçebey","Kilimli","Kozlu","Merkez"]};

const TURKEY_PROVINCES = Object.keys(TURKEY_CITIES).sort((a, b) => a.localeCompare(b, 'tr-TR'));
const getTurkeyDistricts = (city: string) => (TURKEY_CITIES[city] || []).slice().sort((a, b) => a.localeCompare(b, 'tr-TR'));

if (TURKEY_PROVINCES.length !== 81 || TURKEY_PROVINCES.reduce((total, city) => total + TURKEY_CITIES[city].length, 0) !== 973) {
  throw new Error('Türkiye il-ilçe verisi eksik veya hatalı.');
}

// İLAN MODELİ — ilanlar yalnızca yönetim paneli üzerinden oluşturulur.
type ListingItem = {
  id: string; title: string; category: string; propertyType: string; type: string; price: number; currency: string;
  city: string; district: string; neighborhood: string; rooms: string; area: number; image: string;
  agentName: string; agentPhone: string; date: string; isFeatured: boolean; details: Record<string, string>;
  images?: string[]; description?: string; videoUrl?: string; virtualTourUrl?: string; mapUrl?: string;
  monthlyFee?: string; deedInfo?: string; technicalFeatures?: string; updatedAt?: string;
};
const SAMPLE_LISTINGS: ListingItem[] = [];
const formatListingPrice = (price: number, currency: string) => `${price.toLocaleString('tr-TR')} ${currency}`;

function usePublishedListings() {
  const [items, setItems] = useState<ListingItem[]>([]);
  useEffect(() => {
    const load = async () => {
      // Keep the public request aligned with the database check constraint and
      // RLS policy. Using a simple equality avoids PostgREST OR parsing issues
      // with the Turkish status value.
      const { data, error } = await supabase.from('listings').select('id,owner_id,title,category,property_type,transaction_type,price,currency,city,district,neighborhood,rooms,area,description,video_url,virtual_tour_url,map_url,monthly_fee,deed_info,technical_features,details,images,is_featured,created_at,updated_at').eq('approval_status', 'Yayında').is('deleted_at', null).order('created_at', { ascending: false }).limit(15);
      if (error) console.error('Yayınlanan ilanlar alınamadı:', error.message);
      const rows: any[] = data || [];
      const ids = [...new Set(rows.map((row) => row.owner_id).filter(Boolean))];
      const { data: profiles } = ids.length ? await supabase.from('profiles').select('id,first_name,last_name,phone').in('id', ids) : { data: [] as any[] };
      // `Map` is also used as a lucide icon in this module; explicitly use the
      // native constructor here so the public listing feed cannot crash while
      // enriching listings with advisor details.
      const names = new globalThis.Map((profiles || []).map((profile: any) => [profile.id, { name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Realty Center Danışmanı', phone: profile.phone || '0 554 322 22 22' }]));
      setItems(rows.map((row) => ({ id: row.id, title: row.title, category: row.category, propertyType: row.property_type, type: row.transaction_type, price: Number(row.price || 0), currency: row.currency || '₺', city: row.city, district: row.district, neighborhood: row.neighborhood || '', rooms: row.rooms || 'Belirtilmemiş', area: Number(row.area || 0), image: row.images?.[0] || '/slider/slider-01-tall-building.webp', images: row.images || [], agentName: names.get(row.owner_id)?.name || 'Realty Center Danışmanı', agentPhone: names.get(row.owner_id)?.phone || '0 554 322 22 22', date: row.created_at, updatedAt: row.updated_at || row.created_at, isFeatured: Boolean(row.is_featured), description: row.description || '', videoUrl: row.video_url || '', virtualTourUrl: row.virtual_tour_url || '', mapUrl: row.map_url || '', monthlyFee: row.monthly_fee || '', deedInfo: row.deed_info || '', technicalFeatures: row.technical_features || '', details: row.details || {} })));
    };
    void load();
    const refreshOnFocus = () => { void load(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, []);
  return items;
}

const SAMPLE_OFFICES: Array<{id:string; name:string; city:string; district:string; address:string; phone:string; email:string; manager:string; image:string}> = [];
const SAMPLE_AGENTS: Array<{id:string; name:string; title:string; office:string; city:string; district:string; phone:string; email:string; image:string; activeListings:number}> = [];

const SLIDER_IMAGES = [
  "/slider/slider-01-tall-building.webp",
  "/slider/slider-02-villa-sign.webp",
  "/slider/slider-03-city-terrace.webp",
  "/slider/slider-04-seaside-pool.webp"
];

const PROPERTY_TYPES = ["EV", "ARSA", "OFİS", "VİLLA", "PORTFÖY"];
const WHY_REALTY_CENTER_ITEMS = [
  'Güçlü Marka Kimliği ve Güven Veren Kurumsal Yapı',
  'Yeni Nesil Teknolojik Altyapı ve Akıllı Gayrimenkul Çözümleri',
  'Türkiye Genelinde Büyüyen Realty Center® Ofis Ağı',
  'Şeffaf, Sürdürülebilir ve Avantajlı Franchise Modeli',
  'Realty Center® Akademi ile Sürekli Mesleki Gelişim ve Eğitim Desteği',
  'Ulusal ve Uluslararası Dijital Tanıtım Gücü',
  'Gayrimenkul Platformlarıyla Hızlı ve Kolay İlan Entegrasyonu',
  'Danışman İstihdamına Yönelik İlan ve Kariyer Desteği',
  'Yeni Ofislere Özel Kurulum ve Açılış Desteği',
  'Kurumsal Afiş, Branda ve Tanıtım Materyali Desteği',
  'Realty Center® Kurumsal Kimliğine Uygun Araç Giydirme Tasarımları',
  'Mobil ve Kredi Kartıyla Güvenli Ödeme Kolaylığı',
  'Franchise Ödemelerinde Esnek ve Taksitli Ödeme Seçenekleri',
  'Ofis Materyalleri ve Promosyon Ürünlerinde Uygun Tedarik Avantajı',
  'Başarıyı Ödüllendiren Motivasyon Etkinlikleri ve Organizasyonlar',
  'Sosyal Sorumluluk Projelerine Katılım ve Toplumsal Fayda Odaklı Çalışmalar',
  'İşletme, Pazarlama ve Gayrimenkul Süreçlerinde Sürekli Danışmanlık',
  'Güçlü İletişim Ağı ve Kesintisiz Merkez Ofis Desteği',
  'Kendi İşinizi Kurarak Güçlü Bir Markanın Parçası Olma Fırsatı'
];

const LISTING_CATEGORIES = ['Konut', 'Arazi', 'Ticari Gayrimenkul'] as const;
const LISTING_PROPERTY_TYPES = {
  'Konut': ['Ev', 'Villa', 'Daire', 'Residence', 'Müstakil Ev'],
  'Arazi': ['Arsa', 'Tarla'],
  'Ticari Gayrimenkul': ['Fabrika', 'Depo', 'Ofis', 'Dükkan', 'Plaza', 'Otel']
} as const;
const LISTING_TRANSACTION_TYPES = ['Satılık', 'Kiralık', 'Devren Satılık', 'Devren Kiralık'] as const;
const ALL_LISTING_PROPERTY_TYPES = Object.values(LISTING_PROPERTY_TYPES).flat() as string[];
// Arama deneyiminde kullanıcı önce işlem türünü, sonra ana kategoriyi seçer.
// Yönetim tarafındaki mevcut kategori isimleri veri uyumluluğu için korunur.
const LISTING_SEARCH_TRANSACTION_TYPES = ['Satılık', 'Kiralık', 'Devren'] as const;
const LISTING_MAIN_CATEGORIES = ['Konut', 'Arsa', 'İşyeri'] as const;
const LISTING_PROPERTY_TYPES_BY_MAIN_CATEGORY = {
  'Konut': ['Daire', 'Residence', 'Villa', 'Müstakil Ev'],
  'Arsa': ['Arsa', 'Tarla', 'Bağ', 'Bahçe', 'Zeytinlik', 'Çiftlik', 'Arazi'],
  'İşyeri': ['Ofis', 'Dükkan', 'Mağaza', 'Market', 'AVM', 'Plaza', 'Depo', 'Antrepo', 'Fabrika', 'Atölye', 'İmalathane', 'Akaryakıt İstasyonu', 'Otel', 'Motel', 'Pansiyon', 'Apart Otel', 'Butik Otel', 'Restoran', 'Kafe', 'Pastane', 'Eğlence Merkezi', 'Sağlık Tesisi', 'Okul', 'Kreş', 'Dershane', 'Otopark']
} as const;
const LEGACY_LISTING_CATEGORY_BY_MAIN: Record<string, string> = {
  'Konut': 'Konut',
  'Arsa': 'Arazi',
  'İşyeri': 'Ticari Gayrimenkul'
};
const DISTRICT_NEIGHBORHOODS: Record<string, string[]> = {
  'Ankara|Çankaya': ['Ayrancı', 'Balgat', 'Bahçelievler', 'Birlik', 'Çukurambar', 'Dikmen', 'İncek', 'Kavaklıdere', 'Kızılay', 'Oran', 'Söğütözü', 'Tulumtaş', 'Yaşamkent', 'Yıldız'],
  'Ankara|Keçiören': ['Aktepe', 'Bağlum', 'Etlik', 'Esertepe', 'Kalaba', 'Ovacık', 'Şenlik'],
  'Ankara|Yenimahalle': ['Batıkent', 'Demetevler', 'İvedik', 'Macunköy', 'Ostim', 'Şentepe'],
  'İstanbul|Kadıköy': ['Acıbadem', 'Bostancı', 'Caddebostan', 'Erenköy', 'Fenerbahçe', 'Kozyatağı', 'Moda', 'Suadiye'],
  'İstanbul|Beşiktaş': ['Akatlar', 'Bebek', 'Etiler', 'Levent', 'Ortaköy', 'Ulus'],
  'İzmir|Konak': ['Alsancak', 'Basmane', 'Göztepe', 'Güzelyalı', 'Hatay', 'Kahramanlar']
};

type SearchField = { key: string; label: string; type?: 'number' | 'text'; options?: string[] };
const COMMON_PRICE_AREA_FIELDS: SearchField[] = [
  { key: 'minPrice', label: 'En Az Fiyat', type: 'number' }, { key: 'maxPrice', label: 'En Çok Fiyat', type: 'number' },
  { key: 'minArea', label: 'En Az m²', type: 'number' }, { key: 'maxArea', label: 'En Çok m²', type: 'number' }
];
const ADVANCED_FILTERS_BY_TYPE: Record<string, SearchField[]> = {
  home: [...COMMON_PRICE_AREA_FIELDS, { key: 'rooms', label: 'Oda Sayısı', options: ['1+0','1+1','2+1','3+1','4+1','5+1'] }, { key: 'buildingAge', label: 'Bina Yaşı', options: ['0','1-5','6-10','11-20','21+'] }, { key: 'floor', label: 'Bulunduğu Kat' }, { key: 'heating', label: 'Isınma', options: ['Doğalgaz Kombi','Merkezi','Yerden Isıtma','Klima'] }, { key: 'furnished', label: 'Eşyalı', options: ['Evet','Hayır'] }, { key: 'mortgage', label: 'Krediye Uygun', options: ['Evet','Hayır'] }, { key: 'bathroom', label: 'Banyo Sayısı', type: 'number' }],
  land: [...COMMON_PRICE_AREA_FIELDS, { key: 'zoning', label: 'İmar Durumu', options: ['Konut','Ticari','Sanayi','Tarla','Bağ Bahçe'] }, { key: 'deed', label: 'Tapu Durumu', options: ['Müstakil Tapu','Hisseli Tapu','Kat İrtifakı'] }, { key: 'landQuality', label: 'Arsa Niteliği', options: ['Arsa','Tarla','Bağ','Bahçe','Zeytinlik'] }, { key: 'frontage', label: 'Cephe (m)', type: 'number' }, { key: 'road', label: 'Yol Durumu', options: ['Kadastro Yolu','Asfalt','Stabilize'] }, { key: 'infrastructure', label: 'Altyapı', options: ['Elektrik','Su','Doğalgaz','Kanalizasyon'] }],
  industrial: [...COMMON_PRICE_AREA_FIELDS, { key: 'closedArea', label: 'Kapalı Alan (m²)', type: 'number' }, { key: 'ceilingHeight', label: 'Tavan Yüksekliği', type: 'number' }, { key: 'power', label: 'Elektrik Gücü (kVA)', type: 'number' }, { key: 'loading', label: 'Yükleme Rampası', options: ['Var','Yok'] }, { key: 'crane', label: 'Vinç', options: ['Var','Yok'] }, { key: 'zoning', label: 'Sanayi İmarı', options: ['Var','Yok'] }, { key: 'deed', label: 'Tapu Durumu' }],
  commercial: [...COMMON_PRICE_AREA_FIELDS, { key: 'sections', label: 'Bölüm / Oda Sayısı' }, { key: 'buildingAge', label: 'Bina Yaşı' }, { key: 'floor', label: 'Kat' }, { key: 'heating', label: 'Isınma' }, { key: 'furnished', label: 'Eşyalı', options: ['Evet','Hayır'] }, { key: 'parking', label: 'Otopark', options: ['Var','Yok'] }, { key: 'usage', label: 'Kullanım Durumu', options: ['Boş','Kiracılı','Mülk Sahibi'] }],
  hotel: [...COMMON_PRICE_AREA_FIELDS, { key: 'hotelRooms', label: 'Otel Oda Sayısı', type: 'number' }, { key: 'beds', label: 'Yatak Kapasitesi', type: 'number' }, { key: 'stars', label: 'Yıldız Sayısı', options: ['Butik','2','3','4','5'] }, { key: 'buildingAge', label: 'Bina Yaşı' }, { key: 'restaurant', label: 'Restoran', options: ['Var','Yok'] }, { key: 'pool', label: 'Havuz', options: ['Var','Yok'] }, { key: 'deed', label: 'Tapu Durumu' }]
};

function getAdvancedFilterGroup(propertyType: string) {
  if (['Ev','Villa','Daire','Residence','Müstakil Ev'].includes(propertyType)) return 'home';
  if (['Arsa','Tarla','Bağ','Bahçe','Zeytinlik','Çiftlik','Arazi'].includes(propertyType)) return 'land';
  if (['Fabrika','Depo','Antrepo','Atölye','İmalathane'].includes(propertyType)) return 'industrial';
  if (['Otel','Motel','Pansiyon','Apart Otel','Butik Otel'].includes(propertyType)) return 'hotel';
  return 'commercial';
}

type PropertyDetailField = { key: string; label: string; placeholder?: string; type?: 'text' | 'number' };
const PROPERTY_DETAIL_FIELDS: Record<string, PropertyDetailField[]> = {
  'Ev': [{ key: 'roomCount', label: 'Oda Sayısı', placeholder: '3+1' }, { key: 'bathroomCount', label: 'Banyo Sayısı', type: 'number' }, { key: 'floor', label: 'Bulunduğu Kat', type: 'number' }, { key: 'buildingAge', label: 'Bina Yaşı', type: 'number' }],
  'Villa': [{ key: 'roomCount', label: 'Oda Sayısı', placeholder: '5+1' }, { key: 'bathroomCount', label: 'Banyo Sayısı', type: 'number' }, { key: 'floorCount', label: 'Kat Sayısı', type: 'number' }, { key: 'gardenArea', label: 'Bahçe Alanı (m²)', type: 'number' }],
  'Daire': [{ key: 'roomCount', label: 'Oda Sayısı', placeholder: '3+1' }, { key: 'bathroomCount', label: 'Banyo Sayısı', type: 'number' }, { key: 'floor', label: 'Bulunduğu Kat', type: 'number' }, { key: 'buildingAge', label: 'Bina Yaşı', type: 'number' }],
  'Residence': [{ key: 'roomCount', label: 'Oda Sayısı', placeholder: '2+1' }, { key: 'floor', label: 'Bulunduğu Kat', type: 'number' }, { key: 'buildingAge', label: 'Bina Yaşı', type: 'number' }, { key: 'siteFeatures', label: 'Site Özellikleri', placeholder: 'Güvenlik, havuz, otopark' }],
  'Müstakil Ev': [{ key: 'roomCount', label: 'Oda Sayısı', placeholder: '4+1' }, { key: 'bathroomCount', label: 'Banyo Sayısı', type: 'number' }, { key: 'floorCount', label: 'Kat Sayısı', type: 'number' }, { key: 'gardenArea', label: 'Bahçe Alanı (m²)', type: 'number' }],
  'Arsa': [{ key: 'zoningStatus', label: 'İmar Durumu', placeholder: 'Konut imarlı' }, { key: 'parcelNo', label: 'Ada / Parsel No', placeholder: '123 / 45' }, { key: 'frontage', label: 'Cephe (m)', type: 'number' }, { key: 'titleDeed', label: 'Tapu Durumu', placeholder: 'Müstakil tapu' }],
  'Tarla': [{ key: 'zoningStatus', label: 'İmar Durumu', placeholder: 'Tarla' }, { key: 'parcelNo', label: 'Ada / Parsel No', placeholder: '123 / 45' }, { key: 'waterSource', label: 'Su Kaynağı', placeholder: 'Kuyu, sulama kanalı' }, { key: 'roadAccess', label: 'Yol Durumu', placeholder: 'Kadastro yolu' }],
  'Fabrika': [{ key: 'closedArea', label: 'Kapalı Alan (m²)', type: 'number' }, { key: 'ceilingHeight', label: 'Tavan Yüksekliği (m)', type: 'number' }, { key: 'powerCapacity', label: 'Elektrik Gücü (kVA)', type: 'number' }, { key: 'loadingDocks', label: 'Yükleme Rampası Sayısı', type: 'number' }],
  'Depo': [{ key: 'closedArea', label: 'Kapalı Alan (m²)', type: 'number' }, { key: 'ceilingHeight', label: 'Tavan Yüksekliği (m)', type: 'number' }, { key: 'loadingDocks', label: 'Yükleme Rampası Sayısı', type: 'number' }, { key: 'security', label: 'Güvenlik', placeholder: '7/24 güvenlik' }],
  'Ofis': [{ key: 'roomCount', label: 'Bölüm / Oda Sayısı', placeholder: '4 bölüm' }, { key: 'floor', label: 'Bulunduğu Kat', type: 'number' }, { key: 'meetingRooms', label: 'Toplantı Odası Sayısı', type: 'number' }, { key: 'parking', label: 'Otopark', placeholder: 'Açık / kapalı' }],
  'Dükkan': [{ key: 'frontage', label: 'Cephe (m)', type: 'number' }, { key: 'floor', label: 'Kat', type: 'number' }, { key: 'warehouseArea', label: 'Depo Alanı (m²)', type: 'number' }, { key: 'usageStatus', label: 'Kullanım Durumu', placeholder: 'Boş / kiracılı' }],
  'Plaza': [{ key: 'floor', label: 'Bulunduğu Kat', type: 'number' }, { key: 'floorCount', label: 'Toplam Kat Sayısı', type: 'number' }, { key: 'elevatorCount', label: 'Asansör Sayısı', type: 'number' }, { key: 'parking', label: 'Otopark', placeholder: 'Açık / kapalı' }],
  'Otel': [{ key: 'hotelRoomCount', label: 'Otel Oda Sayısı', type: 'number' }, { key: 'bedCapacity', label: 'Yatak Kapasitesi', type: 'number' }, { key: 'starRating', label: 'Yıldız Sayısı', placeholder: '5 yıldız' }, { key: 'restaurantCount', label: 'Restoran Sayısı', type: 'number' }]
};

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

const REALTY_PHONE_DISPLAY = '0 554 322 22 22';
const REALTY_PHONE_E164 = '905543222222';
const REALTY_WHATSAPP_MESSAGE = 'Merhaba, Realty Center hakkında bilgi almak istiyorum.';
const DEFAULT_CONTACT_SETTINGS = { phone: REALTY_PHONE_DISPLAY, email: '', address: '', whatsapp: REALTY_PHONE_E164 };

function getContactSettings() {
  try {
    const saved = localStorage.getItem('realty-center-contact-settings');
    if (!saved) return DEFAULT_CONTACT_SETTINGS;
    const settings = { ...DEFAULT_CONTACT_SETTINGS, ...JSON.parse(saved) };
    const normalize = (value: string) => value.replace(/\D/g, '');
    if (normalize(settings.phone) === '905325674845' || normalize(settings.phone) === '05325674845') settings.phone = REALTY_PHONE_DISPLAY;
    if (normalize(settings.whatsapp) === '905325674845' || normalize(settings.whatsapp) === '05325674845') settings.whatsapp = REALTY_PHONE_E164;
    return settings;
  } catch { return DEFAULT_CONTACT_SETTINGS; }
}

function WhatsAppSupportButton() {
  const [settings, setSettings] = useState(getContactSettings);
  useEffect(() => {
    const refresh = () => setSettings(getContactSettings());
    window.addEventListener('realty-center-contact-updated', refresh);
    return () => window.removeEventListener('realty-center-contact-updated', refresh);
  }, []);
  const whatsappNumber = settings.whatsapp.replace(/\D/g, '') || REALTY_PHONE_E164;
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(REALTY_WHATSAPP_MESSAGE)}`;
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
  { id: 'rent-home', title: 'Kiralık Gayrimenkuller', type: 'Kiralık', category: 'Konut', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=90&w=1200' },
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
    const categories: ListingCategory[] = saved ? JSON.parse(saved) : DEFAULT_LISTING_CATEGORIES;
    return categories.map((item) => item.id === 'rent-home' ? { ...item, title: 'Kiralık Gayrimenkuller' } : item);
  } catch { return DEFAULT_LISTING_CATEGORIES; }
}

function getCategoryPropertyType(item: ListingCategory) {
  const text = `${item.title} ${item.category}`.toLocaleLowerCase('tr-TR');
  if (text.includes('villa')) return 'Villa';
  if (text.includes('arsa')) return 'Arsa';
  if (text.includes('ofis')) return 'Ofis';
  if (text.includes('dükkan')) return 'Dükkan';
  if (text.includes('iş yeri') || text.includes('işyeri')) return 'Dükkan';
  if (text.includes('konut') || text.includes('ev')) return 'Ev';
  return '';
}

function getCategoryTransactionType(item: ListingCategory) {
  return item.type === 'Devren' ? 'Devren Satılık' : item.type;
}

const DEFAULT_FEATURED_LISTING_IDS: string[] = [];
function getFeaturedListingIds(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem('realty-center-featured-listing-ids') || 'null');
    return Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === 'string'))] : DEFAULT_FEATURED_LISTING_IDS;
  } catch { return DEFAULT_FEATURED_LISTING_IDS; }
}
function saveFeaturedListingIds(ids: string[]) {
  localStorage.setItem('realty-center-featured-listing-ids', JSON.stringify(ids));
  window.dispatchEvent(new Event('realty-center-featured-listings-updated'));
}

function TurkeyListingMap() {
  const navigate = useNavigate();
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
          const city = group.dataset.cityName || '';
          group.setAttribute('data-realty-city', city);
          group.querySelectorAll('path').forEach((path) => {
            path.setAttribute('style', 'fill:#CD011E;fill-opacity:0.34;stroke:none;');
          });
        });
        setSvgMarkup(parsed.documentElement.outerHTML);
      })
      .catch(() => setMapError(true));
  }, []);

  const handleMapMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    const group = target instanceof Element ? target.closest('g[data-realty-city]') : null;
    const city = group?.getAttribute('data-realty-city');
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    if (!city) {
      tooltip.style.display = 'none';
      return;
    }
    tooltip.textContent = city;
    tooltip.style.transform = 'translate3d(' + (event.clientX + 16) + 'px, ' + (event.clientY + 16) + 'px, 0)';
    tooltip.style.display = 'block';
  };

  const hideMapTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    const group = target instanceof Element ? target.closest('g[data-realty-city]') : null;
    const city = group?.getAttribute('data-realty-city');
    if (city) navigate('/ilanlarimiz?city=' + encodeURIComponent(city));
  };

  return (
    <section className="bg-white py-12 text-slate-900 overflow-hidden border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-100 px-4 py-1.5 text-xs font-black tracking-widest text-red-700"><MapPin className="w-4 h-4" />ETKİLEŞİMLİ TÜRKİYE HARİTASI</span>
          <h2 className="mt-3 flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black"><span>TÜRKİYE'DE REALTY CENTER®</span></h2>
          <p className="mt-2 text-sm font-medium text-slate-600">İlin üzerine gelin, seçmek için tıklayın.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-lg">
          {mapError ? <p className="py-16 text-center text-sm text-slate-500">Harita şu anda yüklenemedi.</p> : <><div onMouseMove={handleMapMove} onMouseLeave={hideMapTooltip} onClick={handleMapClick} className="turkey-listing-map w-full [&_svg]:h-auto [&_svg]:w-full [&_g[data-realty-city]]:cursor-pointer" dangerouslySetInnerHTML={{ __html: svgMarkup }} /><div ref={tooltipRef} className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-black text-white shadow-2xl" /></>}
        </div>
      </div>
    </section>
  );
}


function WorldNetworkModal({ onClose }: { onClose: () => void }) {
  const offices = [
    {country:'İngiltere',name:'Londra',pos:[51.5,-.12] as [number,number]},
    {country:'Almanya',name:'Berlin',pos:[52.52,13.4] as [number,number]},
    {country:'Fransa',name:'Paris',pos:[48.86,2.35] as [number,number]},
    {country:'İspanya',name:'Madrid',pos:[40.42,-3.7] as [number,number]},
    {country:'İtalya',name:'Roma',pos:[41.9,12.5] as [number,number]},
    {country:'Hollanda',name:'Amsterdam',pos:[52.37,4.9] as [number,number]},
    {country:'Belçika',name:'Brüksel',pos:[50.85,4.35] as [number,number]},
    {country:'Birleşik Arap Emirlikleri',name:'Dubai',pos:[25.2,55.27] as [number,number]},
    {country:'ABD',name:'New York',pos:[40.7,-74] as [number,number]},
    {country:'Avustralya',name:'Sidney',pos:[-33.8,151.2] as [number,number]},
    {country:'Yeni Zelanda',name:'Auckland',pos:[-36.85,174.76] as [number,number]},
    {country:'Türkiye',name:'İstanbul',pos:[41.01,28.98] as [number,number]},
    {country:'Türkiye',name:'Ankara',pos:[39.93,32.86] as [number,number]}
  ];
  const [zoom, setZoom] = useState(2);
  const WorldZoomListener = () => { useMapEvents({ zoomend: (event) => setZoom(event.target.getZoom()) }); return null; };
  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}><section className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><header className="flex items-center justify-between bg-[#CD011E] px-6 py-5 text-white"><div><p className="text-[10px] font-black tracking-[.2em] text-white/70">KÜRESEL AĞ</p><h2 className="mt-1 text-2xl font-black">DÜNYADA REALTY CENTER®</h2></div><button onClick={onClose} className="rounded-full bg-white/15 px-4 py-2 text-xs font-black">Kapat</button></header><div className="h-[460px]"><MapContainer center={[25,20]} zoom={2} scrollWheelZoom className="h-full w-full"><TileLayer attribution="&copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" /><WorldZoomListener />{offices.map((office, index) => <CircleMarker key={office.name} center={office.pos} radius={9} pathOptions={{color:'#fff',fillColor:'#CD011E',fillOpacity:1,weight:3}}>{zoom >= 4 ? <Tooltip permanent direction="top" opacity={1}>{office.name}</Tooltip> : offices.findIndex((item) => item.country === office.country) === index ? <Tooltip permanent direction="top" opacity={1}>{office.country}</Tooltip> : null}</CircleMarker>)}</MapContainer></div><p className="px-6 py-4 text-xs text-slate-500">Önce ülkeleri görün; haritayı yakınlaştırdıkça ofis şehirleri görünür.</p></section></div>;
}

function WorldRealtyCenterModule() {
  const offices = [
    { country:'Türkiye', city:'İstanbul', pos:[41.01,28.98] as [number,number] }, { country:'Türkiye', city:'Ankara', pos:[39.93,32.86] as [number,number] },
    { country:'İngiltere', city:'Londra', pos:[51.5,-.12] as [number,number] }, { country:'Almanya', city:'Berlin', pos:[52.52,13.4] as [number,number] }, { country:'Fransa', city:'Paris', pos:[48.86,2.35] as [number,number] }, { country:'İspanya', city:'Madrid', pos:[40.42,-3.7] as [number,number] }, { country:'İtalya', city:'Roma', pos:[41.9,12.5] as [number,number] }, { country:'Hollanda', city:'Amsterdam', pos:[52.37,4.9] as [number,number] }, { country:'İsveç', city:'Stockholm', pos:[59.33,18.07] as [number,number] }, { country:'Polonya', city:'Varşova', pos:[52.23,21.01] as [number,number] },
    { country:'ABD', city:'New York', pos:[40.71,-74] as [number,number] }, { country:'Kanada', city:'Toronto', pos:[43.65,-79.38] as [number,number] }, { country:'Meksika', city:'Mexico City', pos:[19.43,-99.13] as [number,number] }, { country:'Brezilya', city:'São Paulo', pos:[-23.55,-46.63] as [number,number] }, { country:'Arjantin', city:'Buenos Aires', pos:[-34.6,-58.38] as [number,number] },
    { country:'Birleşik Arap Emirlikleri', city:'Dubai', pos:[25.2,55.27] as [number,number] }, { country:'Hindistan', city:'Mumbai', pos:[19.08,72.88] as [number,number] }, { country:'Singapur', city:'Singapur', pos:[1.35,103.82] as [number,number] }, { country:'Japonya', city:'Tokyo', pos:[35.68,139.69] as [number,number] }, { country:'Avustralya', city:'Sidney', pos:[-33.87,151.21] as [number,number] }, { country:'Yeni Zelanda', city:'Auckland', pos:[-36.85,174.76] as [number,number] }
  ];
  const [zoom, setZoom] = useState(2);
  const WorldZoomListener = () => { useMapEvents({ zoomend: (event) => setZoom(event.target.getZoom()) }); return null; };
  const markerIcon = L.divIcon({ className:'realty-world-marker-shell', html:'<span class="realty-world-marker"><img src="/favicon.png" alt="Realty Center ev simgesi" class="realty-world-brand-mark" /></span>', iconSize:[34,34], iconAnchor:[17,17] });
  return <section className="relative overflow-hidden border-t border-slate-200 bg-[#f5f8fc] py-14 sm:py-20"><div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-red-100/50 blur-3xl"/><div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl"/><div className="relative mx-auto max-w-7xl px-6 lg:px-12"><div className="mb-8 flex items-end justify-between gap-5"><h2 className="text-4xl font-black tracking-tight text-[#071d3b] sm:text-5xl">DÜNYADA <span className="text-red-700">REALTY CENTER®</span><span className="home-title-en">GLOBAL REAL ESTATE NETWORK</span></h2><span className="hidden items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2.5 text-xs font-black text-[#071d3b] shadow-sm sm:inline-flex"><Globe className="h-4 w-4 text-red-700"/>20+ ÜLKE</span></div><div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,.11)] sm:p-5"><div className="relative h-[390px] overflow-hidden rounded-2xl border border-slate-100 bg-[#edf3fa] sm:h-[540px]"><MapContainer center={[22,8]} zoom={2} minZoom={2} maxZoom={8} scrollWheelZoom className="h-full w-full"><TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"/><WorldZoomListener />{offices.map((office,index) => <Marker key={`${office.country}-${office.city}`} position={office.pos} icon={markerIcon}><Tooltip permanent direction="top" offset={[0,-14]} opacity={1}>{zoom >= 4 ? office.city : offices.findIndex((item) => item.country === office.country) === index ? office.country : ''}</Tooltip><Popup><strong>{office.city}</strong><br/>{office.country}<br/><span className="text-xs text-red-700">REALTY CENTER® ağı</span></Popup></Marker>)}</MapContainer></div></div></div></section>;
}

function RealtyNetworkActivityPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [noticeOffset, setNoticeOffset] = useState(0);
  const [worldOpen, setWorldOpen] = useState(false);
  const notices = [
    'Londra’da yeni ofis açıldı', 'Ankara’da 1 yeni ilan eklendi', 'Dubai’de yeni danışman ağa katıldı',
    'İstanbul’da 3 portföy güncellendi', 'Berlin’den yatırım talebi alındı'
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setNoticeOffset((value) => (value + 1) % notices.length), 4400);
    return () => window.clearInterval(timer);
  }, [notices.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0, width = 0, height = 0;
    const random = (seed: number) => { const value = Math.sin(seed * 91.731) * 43758.5453; return value - Math.floor(value); };
    const regions = [[-102,40,23,19,160],[-63,-16,15,24,115],[11,48,19,13,135],[22,7,17,26,145],[92,34,34,18,210],[135,-24,15,10,65]] as const;
    const points = regions.flatMap(([lng,lat,lngSpread,latSpread,count], region) => Array.from({ length: count }, (_, i) => ({
      lng: lng + (random(i*7+region*47)-.5) * lngSpread * 2,
      lat: lat + (random(i*11+region*23)-.5) * latSpread * 2,
      alpha: .16 + random(i+region*13) * .35
    })));
    const hubs = [{lng:32.86,lat:39.93},{lng:-.12,lat:51.5},{lng:55.27,lat:25.2},{lng:-74,lat:40.7},{lng:28.98,lat:41.01},{lng:151.2,lat:-33.8}];
    const connections = [[0,1],[0,2],[1,3],[4,0],[2,5],[3,4]];

    const resize = () => {
      const box = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      width=box.width; height=box.height; canvas.width=Math.max(1,Math.floor(width*dpr)); canvas.height=Math.max(1,Math.floor(height*dpr)); ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const project = (lng:number,lat:number,angle:number) => {
      const longitude=lng*Math.PI/180+angle, latitude=lat*Math.PI/180;
      const x=Math.cos(latitude)*Math.sin(longitude), y=Math.sin(latitude), z=Math.cos(latitude)*Math.cos(longitude);
      const size=Math.min(width,height)*.67;
      return {x:width*.66+x*size, y:height*.54-y*size, z};
    };
    const draw = (time:number) => {
      const angle=time*.000055;
      ctx.clearRect(0,0,width,height);
      const glow=ctx.createRadialGradient(width*.65,height*.52,8,width*.65,height*.52,Math.min(width,height)*.8);
      glow.addColorStop(0,'rgba(205,1,30,.1)'); glow.addColorStop(.55,'rgba(86,71,255,.04)'); glow.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=glow; ctx.fillRect(0,0,width,height);
      points.map(point=>({ ...project(point.lng,point.lat,angle), alpha:point.alpha })).filter(point=>point.z>-0.18).sort((a,b)=>a.z-b.z).forEach((point,i)=>{
        ctx.fillStyle='rgba('+(i%5===0?'205,1,30':'42,31,120')+','+(point.alpha*Math.max(.18,point.z+.2))+')';
        ctx.beginPath(); ctx.arc(point.x,point.y,point.z>.25?1.05:.7,0,Math.PI*2); ctx.fill();
      });
      const projectedHubs=hubs.map(hub=>project(hub.lng,hub.lat,angle));
      connections.forEach(([a,b],index)=>{
        const from=projectedHubs[a],to=projectedHubs[b]; if(from.z<-.05&&to.z<-.05)return;
        const cx=(from.x+to.x)/2,cy=(from.y+to.y)/2-Math.min(width,height)*.14;
        const line=ctx.createLinearGradient(from.x,from.y,to.x,to.y); line.addColorStop(0,'rgba(18,24,45,.18)');line.addColorStop(.5,'rgba(205,1,30,.58)');line.addColorStop(1,'rgba(115,80,255,.26)');
        ctx.strokeStyle=line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.quadraticCurveTo(cx,cy,to.x,to.y);ctx.stroke();
        const p=(time*.00014+index*.17)%1,px=(1-p)*(1-p)*from.x+2*(1-p)*p*cx+p*p*to.x,py=(1-p)*(1-p)*from.y+2*(1-p)*p*cy+p*p*to.y;
        ctx.fillStyle='#CD011E';ctx.shadowColor='#ef6577';ctx.shadowBlur=13;ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      });
      projectedHubs.filter(hub=>hub.z>-.08).forEach((hub,index)=>{const pulse=3.4+Math.sin(time*.003+index)*.9;ctx.fillStyle='#CD011E';ctx.beginPath();ctx.arc(hub.x,hub.y,pulse,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hub.x,hub.y,1.1,0,Math.PI*2);ctx.fill();});
      raf=requestAnimationFrame(draw);
    };
    resize(); const observer=new ResizeObserver(resize);observer.observe(canvas);raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  }, []);

  return <><button type="button" onClick={() => setWorldOpen(true)} className="group relative min-h-[238px] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-lg transition hover:-translate-y-1 hover:border-red-500 hover:shadow-xl">
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Dönen Realty Center® Network haritası" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/96 via-white/30 to-white/5" />
    <div className="relative z-10 p-5"><p className="text-sm font-black tracking-[.16em] text-red-700 sm:text-base">DÜNYADA REALTY CENTER®</p><h3 className="mt-2 text-xl font-black text-slate-950">Küresel bağlantı ağı</h3>
      <div key={noticeOffset} className="network-notice-swap mt-4 space-y-2 text-xs font-bold"><div className="w-fit rounded-full border border-red-100 bg-white/92 px-3 py-2 text-slate-700 shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-700"/>{notices[noticeOffset]}</div><div className="w-fit rounded-full border border-slate-200 bg-white/92 px-3 py-2 text-slate-700 shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-900"/>{notices[(noticeOffset+1)%notices.length]}</div></div>
      <span className="absolute bottom-4 right-4 rounded-full bg-[#CD011E] px-3 py-2 text-[10px] font-black text-white opacity-0 shadow-lg transition group-hover:opacity-100">Haritayı aç →</span>
    </div>
  </button>{worldOpen && <WorldNetworkModal onClose={() => setWorldOpen(false)} />}</>;
}


function ListingCard({ item }: { item: ListingItem }) {
  return (
    <article className="listing-cinematic-card relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:border-red-700 hover:shadow-2xl group">
      <Link to={`/ilan/${item.id}`} aria-label={`${item.title} ilanını incele`} className="absolute inset-0 z-10" />
      <div className="pointer-events-none relative z-20">
        <div className="listing-card-photo relative h-48 overflow-hidden bg-slate-100">
          <img 
            src={item.image} 
            alt={item.title} 
            className="block h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035]"
          />
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

          <span className="absolute top-3 right-3 rounded border border-slate-200 bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm">
            {item.id}
          </span>
        </div>

        <div className="relative p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xl font-black text-red-700">{item.price.toLocaleString('tr-TR')} <span className="text-sm">{item.currency}</span></p>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.propertyType}</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-red-700 transition h-10">
            {item.title}
          </h3>

          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold mb-3">
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
          <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-4 h-11 w-10 overflow-hidden opacity-[0.13]">
            <img src="/rc_logo_og.svg" alt="" className="h-11 w-auto max-w-none" />
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative z-20 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Danışman</span>
          <span className="font-extrabold text-slate-800">{item.agentName}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2"><Link to={`/ilan/${item.id}`} className="relative z-30 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 font-black text-red-700 transition hover:bg-red-50">İncele <ArrowRight className="h-3 w-3"/></Link><a href={`tel:${item.agentPhone.replace(/\s+/g, '')}`} className="relative z-30 flex items-center space-x-1 rounded-lg bg-red-700 px-3 py-1.5 font-bold text-white shadow-md shadow-red-700/20 transition hover:bg-red-800"><Phone className="w-3 h-3" /><span>Ara</span></a></div>
      </div>
    </article>
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

function FinancialSolutionsPage() {
  const [sent, setSent] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');

  const solutions = [
    {
      title: 'Bankalar',
      description: 'Konut kredisi seçenekleri ve ödeme planları için talep oluşturun.',
      institutions: [
        ['Ziraat Bankası', 'ziraatbank.com.tr', 'ziraatbankasi'], ['Türkiye İş Bankası', 'isbank.com.tr', 'turkiyeisbankasi'], ['Garanti BBVA', 'garantibbva.com.tr', 'garantibbva'],
        ['Akbank', 'akbank.com', 'akbank'], ['Yapı Kredi', 'yapikredi.com.tr', 'yapikredi'], ['Halkbank', 'halkbank.com.tr', 'halkbank'], ['VakıfBank', 'vakifbank.com.tr', 'vakifbank']
      ]
    },
    {
      title: 'Katılım Bankaları',
      description: 'Kâr payı esaslı konut finansmanı alternatiflerini değerlendirin.',
      institutions: [
        ['Kuveyt Türk', 'kuveytturk.com.tr', 'kuveytturk'], ['Türkiye Finans', 'turkiyefinans.com.tr', 'turkiyefinans'], ['Albaraka Türk', 'albaraka.com.tr', 'albaraka'],
        ['Ziraat Katılım', 'ziraatkatilim.com.tr', 'ziraatkatilim'], ['Vakıf Katılım', 'vakifkatilim.com.tr', 'vakifkatilim'], ['Emlak Katılım', 'emlakkatilim.com.tr', 'emlakkatilim']
      ]
    },
    {
      title: 'Evim Sistemleri',
      description: 'Tasarruf finansmanı modelleri hakkında bilgi ve yönlendirme talep edin.',
      institutions: [
        ['Eminevim', 'eminevim.com', 'eminevim'], ['Katılımevim', 'katilimevim.com.tr', 'katilimevim'], ['FuzulEv', 'fuzulev.com.tr', 'fuzulev'], ['Birevim', 'birevim.com', 'birevim']
      ]
    }
  ];

  const activeSolution = solutions.find((solution) => solution.title === selectedSolution);

  const selectSolution = (title: string) => {
    setSelectedSolution(title);
    setSelectedInstitution('');
    setSent(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const requests = JSON.parse(localStorage.getItem('realty-center-financial-requests') || '[]');
    localStorage.setItem('realty-center-financial-requests', JSON.stringify([
      { id: `FC-${Date.now()}`, status: 'Yeni', createdAt: new Date().toISOString(), data: Object.fromEntries(form) },
      ...requests
    ]));
    window.dispatchEvent(new Event('realty-center-financial-requests-updated'));
    event.currentTarget.reset();
    setSent(true);
  };

  return <div className="min-h-screen bg-slate-50">
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <p className="text-xs font-black tracking-[.22em] text-red-700">KAZANÇ MODELİ</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Finansal Çözümler</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Gayrimenkul yatırımınız için bankalar, katılım bankaları ve tasarruf finansman seçenekleri arasından ihtiyacınıza uygun çözüm için talep oluşturun.</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="grid gap-4 md:grid-cols-3">
        {solutions.map((solution, index) => {
          const isActive = selectedSolution === solution.title;
          return <button type="button" onClick={() => selectSolution(solution.title)} key={solution.title} className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md ${isActive ? 'border-red-700 bg-red-700 ring-2 ring-red-100' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isActive ? 'bg-white text-red-700' : 'bg-slate-950 text-amber-300'}`}>0{index + 1}</span><div><h2 className={`font-black ${isActive ? 'text-white' : 'text-slate-950'}`}>{solution.title}</h2><p className={`mt-2 text-sm leading-6 ${isActive ? 'text-white/85' : 'text-slate-600'}`}>{solution.description}</p></div></div>
          </button>;
        })}
      </div>

      {activeSolution ? <div className="mt-8 space-y-7">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black tracking-[.18em] text-red-700">{activeSolution.title.toUpperCase()}</p><h2 className="mt-2 text-2xl font-black text-slate-950">Tercih ettiğiniz kurumu seçin</h2><p className="mt-2 text-sm text-slate-500">Dilerseniz kurum seçmeden genel finansman talebi de bırakabilirsiniz.</p></div>
            {selectedInstitution && <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-700">Seçim: {selectedInstitution}</span>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeSolution.institutions.map(([name, domain, logoSlug]) => {
              const isSelected = selectedInstitution === name;
              return <button type="button" key={name} onClick={() => { setSelectedInstitution(name); setSent(false); }} className={`group flex min-h-28 flex-col items-center justify-center rounded-2xl border p-4 transition ${isSe…109459 tokens truncated…rget.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Kurum adı"/><input value={item.logo} onChange={(e) => setItems(items.map((entry,i)=>i===index?{...entry,logo:e.target.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Logo URL'si"/><textarea rows={3} value={item.content} onChange={(e) => setItems(items.map((entry,i)=>i===index?{...entry,content:e.target.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2" placeholder="Anlaşma / çalışma içeriği"/><button onClick={() => setItems(items.filter((_,i)=>i!==index))} className="w-fit text-xs font-black text-red-700">Kaydı kaldır</button></div>)}</div></section>)}
              <button onClick={saveCorporateContent} className="w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white">{corporateSaved ? 'Tüm içerikler kaydedildi ✓' : 'Belgeler, Referanslar ve İş Ortaklarını Kaydet'}</button>
            </div>}

            {activeTab === 'education' && <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
                  <div><h2 className="text-lg font-black text-slate-900">Eğitim Yönetimi</h2><p className="mt-1 text-xs leading-5 text-slate-500">Takvim, eğitim merkezleri ve eğitim çeşitlerinin tamamını tek ekrandan yönetin.</p></div>
                  <button onClick={saveTraining} className="rounded-xl bg-red-700 px-5 py-3 text-xs font-black text-white">{trainingSaved ? 'Eğitim içerikleri kaydedildi ✓' : 'Tümünü Kaydet'}</button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {([['calendar','Eğitim Takvimi'],['centers','Eğitim Merkezleri'],['types','Eğitim Çeşitleri']] as const).map(([key,label]) => <button key={key} onClick={() => setTrainingSection(key)} className={'rounded-full px-4 py-2 text-xs font-black transition ' + (trainingSection === key ? 'bg-[#071f3d] text-white' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-red-300')}>{label}</button>)}
                </div>

                {trainingSection === 'calendar' && <div className="mt-6 space-y-5">
                  <div><label className="mb-1 block text-xs font-black text-slate-600">Takvim üstü açıklama</label><textarea rows={3} value={trainingContent.calendarIntro} onChange={(e) => setTrainingContent({ ...trainingContent, calendarIntro: e.target.value })} className="w-full rounded-xl border border-slate-300 p-3 text-sm"/></div>
                  <div className="flex items-center justify-between"><h3 className="font-black text-slate-900">Takvimdeki Eğitimler</h3><button onClick={addTrainingEvent} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Eğitim Ekle</button></div>
                  <div className="space-y-4">{trainingContent.events.map((event) => <div key={event.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                    <input value={event.title} onChange={(e) => setTrainingContent({ ...trainingContent, events: trainingContent.events.map((item) => item.id === event.id ? { ...item, title: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Eğitim adı"/>
                    <input type="date" value={event.date} onChange={(e) => setTrainingContent({ ...trainingContent, events: trainingContent.events.map((item) => item.id === event.id ? { ...item, date: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs"/>
                    <input type="time" value={event.time} onChange={(e) => setTrainingContent({ ...trainingContent, events: trainingContent.events.map((item) => item.id === event.id ? { ...item, time: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs"/>
                    <input value={event.format} onChange={(e) => setTrainingContent({ ...trainingContent, events: trainingContent.events.map((item) => item.id === event.id ? { ...item, format: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Online / Sınıf eğitimi"/>
                    <input value={event.location} onChange={(e) => setTrainingContent({ ...trainingContent, events: trainingContent.events.map((item) => item.id === event.id ? { ...item, location: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs md:col-span-2" placeholder="Konum"/>
                    <button onClick={() => setTrainingContent({ ...trainingContent, events: trainingContent.events.filter((item) => item.id !== event.id) })} className="w-fit text-xs font-black text-red-700">Eğitimi kaldır</button>
                  </div>)}</div>
                </div>}

                {trainingSection === 'centers' && <div className="mt-6 space-y-5">
                  <div><label className="mb-1 block text-xs font-black text-slate-600">Eğitim merkezleri açıklaması</label><textarea rows={4} value={trainingContent.centersIntro} onChange={(e) => setTrainingContent({ ...trainingContent, centersIntro: e.target.value })} className="w-full rounded-xl border border-slate-300 p-3 text-sm"/></div>
                  <div className="flex items-center justify-between"><h3 className="font-black text-slate-900">Eğitim Merkezi Adresleri</h3><button onClick={addTrainingCenter} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Merkez Ekle</button></div>
                  <div className="space-y-4">{trainingContent.centers.map((center) => <div key={center.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                    <input value={center.name} onChange={(e) => setTrainingContent({ ...trainingContent, centers: trainingContent.centers.map((item) => item.id === center.id ? { ...item, name: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Merkez adı"/>
                    <input value={center.city} onChange={(e) => setTrainingContent({ ...trainingContent, centers: trainingContent.centers.map((item) => item.id === center.id ? { ...item, city: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Şehir"/>
                    <textarea rows={2} value={center.address} onChange={(e) => setTrainingContent({ ...trainingContent, centers: trainingContent.centers.map((item) => item.id === center.id ? { ...item, address: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs md:col-span-2" placeholder="Açık adres"/>
                    <textarea rows={3} value={center.description} onChange={(e) => setTrainingContent({ ...trainingContent, centers: trainingContent.centers.map((item) => item.id === center.id ? { ...item, description: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs md:col-span-2" placeholder="Merkez açıklaması"/>
                    <button onClick={() => setTrainingContent({ ...trainingContent, centers: trainingContent.centers.filter((item) => item.id !== center.id) })} className="w-fit text-xs font-black text-red-700">Merkezi kaldır</button>
                  </div>)}</div>
                </div>}

                {trainingSection === 'types' && <div className="mt-6 space-y-5">
                  <div><label className="mb-1 block text-xs font-black text-slate-600">Eğitim çeşitleri açıklaması</label><textarea rows={4} value={trainingContent.typesIntro} onChange={(e) => setTrainingContent({ ...trainingContent, typesIntro: e.target.value })} className="w-full rounded-xl border border-slate-300 p-3 text-sm"/></div>
                  <div className="flex items-center justify-between"><h3 className="font-black text-slate-900">Eğitim Çeşitleri</h3><button onClick={addTrainingType} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Eğitim Çeşidi Ekle</button></div>
                  <div className="space-y-4">{trainingContent.types.map((type) => <div key={type.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                    <input value={type.title} onChange={(e) => setTrainingContent({ ...trainingContent, types: trainingContent.types.map((item) => item.id === type.id ? { ...item, title: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Eğitim adı"/>
                    <input value={type.duration} onChange={(e) => setTrainingContent({ ...trainingContent, types: trainingContent.types.map((item) => item.id === type.id ? { ...item, duration: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Süre"/>
                    <textarea rows={3} value={type.description} onChange={(e) => setTrainingContent({ ...trainingContent, types: trainingContent.types.map((item) => item.id === type.id ? { ...item, description: e.target.value } : item) })} className="rounded-lg border border-slate-300 px-3 py-2 text-xs md:col-span-2" placeholder="Eğitim açıklaması"/>
                    <button onClick={() => setTrainingContent({ ...trainingContent, types: trainingContent.types.filter((item) => item.id !== type.id) })} className="w-fit text-xs font-black text-red-700">Eğitim çeşidini kaldır</button>
                  </div>)}</div>
                </div>}
              </section>
            </div>}

            {activeTab === 'header' && <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center"><div><h2 className="text-lg font-black text-slate-900">Header ve İçerik Sayfaları</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Ana başlıkları, alt başlıkları ve üçüncü seviye başlıkları yönetin. Dinamik sayfalarda görsel solda, metin sağda gösterilir.</p></div><div className="flex gap-2"><button onClick={() => addManagedHeaderRoot('left')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700">+ Sola Başlık</button><button onClick={() => addManagedHeaderRoot('right')} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Sağa Başlık</button></div></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Bağlantı kullanımı:</strong> Panelde oluşturulan içerik sayfaları için <code>/icerik/sayfa-kimligi</code> biçimini kullanın. Mevcut bir sayfaya yönlendirmek isterseniz onun bağlantısını doğrudan yazabilirsiniz.</div><div className="mt-5 grid gap-5 xl:grid-cols-2">{(['left','right'] as const).map((side) => <div key={side}><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">{side === 'left' ? 'Logonun Solundaki Menüler' : 'Logonun Sağındaki Menüler'}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{headerMenuItems.filter((item) => item.side === side).length} başlık</span></div><div className="space-y-4">{headerMenuItems.filter((item) => item.side === side).map((item) => <HeaderMenuEditorNode key={item.id} item={item} depth={0} onUpdate={updateManagedHeaderItem} onRemove={removeManagedHeaderItem} onAddChild={addManagedHeaderChild}/>)}</div></div>)}</div><button onClick={saveManagedHeader} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-700/20">{headerSaved ? 'Header ve sayfalar kaydedildi ✓' : 'Header ve Sayfa Yapısını Kaydet'}</button></section></div>}

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
                <button onClick={saveContactSettings} className="bg-red-700 hover:bg-red-800 text-white font-black px-6 py-3 rounded-xl text-xs transition">{settingsSaved ? 'Ayarlar Kaydedildi' : 'Ayarları Kaydet'}</button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

function ListingOptionalDetailFields({ listing, onChange }: { listing: any; onChange: (updates: Record<string, string>) => void }) {
  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700';
  return <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="mb-4"><h3 className="font-black text-slate-900">İlan Detay Sayfası Bilgileri</h3><p className="mt-1 text-xs text-slate-500">Bu alanların tamamı isteğe bağlıdır. Girilen bilgiler ilan detayında gösterilir.</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="md:col-span-2"><label className="mb-1 block text-xs font-black text-slate-600">İlan Açıklaması</label><textarea value={listing.description} onChange={(e) => onChange({ description: e.target.value })} rows={5} placeholder="Gayrimenkulün konumu, avantajları ve kullanım özellikleri..." className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">Video Bağlantısı</label><input value={listing.videoUrl} onChange={(e) => onChange({ videoUrl: e.target.value })} placeholder="YouTube/Vimeo embed bağlantısı" className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">360° Sanal Tur Bağlantısı</label><input value={listing.virtualTourUrl} onChange={(e) => onChange({ virtualTourUrl: e.target.value })} placeholder="Sanal tur bağlantısı" className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">Harita Bağlantısı</label><input value={listing.mapUrl} onChange={(e) => onChange({ mapUrl: e.target.value })} placeholder="Google Maps embed bağlantısı" className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">Aidat</label><input value={listing.monthlyFee} onChange={(e) => onChange({ monthlyFee: e.target.value })} placeholder="Örn. 2.750 ₺" className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">Tapu Bilgisi</label><input value={listing.deedInfo} onChange={(e) => onChange({ deedInfo: e.target.value })} placeholder="Kat mülkiyetli, müstakil tapu..." className={fieldClass} /></div><div><label className="mb-1 block text-xs font-black text-slate-600">Teknik Özellikler</label><input value={listing.technicalFeatures} onChange={(e) => onChange({ technicalFeatures: e.target.value })} placeholder="Virgülle ayırın: otopark, güvenlik, internet..." className={fieldClass} /></div></div></section>;
}

type CRMStage = 'Yeni' | 'Görüşülüyor' | 'Randevu' | 'Teklif' | 'Sonuçlandı' | 'Kaybedildi';
type CRMCustomer = {
  id: string; name: string; phone: string; email: string; type: string; stage: CRMStage;
  source: string; city: string; district: string; budget: string; preference: string;
  owner: string; lastContact: string; nextAction: string; notes: Array<{ id: string; text: string; date: string }>;
};

const CRM_STAGES: CRMStage[] = ['Yeni', 'Görüşülüyor', 'Randevu', 'Teklif', 'Sonuçlandı', 'Kaybedildi'];
const getCRMCustomers = (): CRMCustomer[] => {
  try { const records = JSON.parse(localStorage.getItem('realty-center-crm-customers') || '[]'); return Array.isArray(records) ? records : []; }
  catch { return []; }
};

function CRMWorkspace({ isManager, advisorName }: { isManager: boolean; advisorName: string }) {
  const [records, setRecords] = useState<CRMCustomer[]>([]);
  const [crmConnection, setCrmConnection] = useState<'loading' | 'connected' | 'offline'>('loading');
  const [tab, setTab] = useState<'customers' | 'leads' | 'followups' | 'appointments'>('customers');
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'Tümü' | CRMStage>('Tümü');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const emptyForm = { name: '', phone: '', email: '', type: 'Alıcı', stage: 'Yeni' as CRMStage, source: 'Manuel kayıt', city: '', district: '', budget: '', preference: '', nextAction: '' };
  const [form, setForm] = useState(emptyForm);

  const mapRemoteRecord = (record: any, activities: any[] = []): CRMCustomer => ({
    id: record.id, name: record.name, phone: record.phone, email: record.email || '', type: record.customer_type,
    stage: record.stage as CRMStage, source: record.source, city: record.city || '', district: record.district || '',
    budget: record.budget || '', preference: record.preference || '', owner: record.assigned_to ? 'Atanmış danışman' : 'Merkez',
    lastContact: record.last_contact_at ? new Date(record.last_contact_at).toLocaleDateString('tr-TR') : new Date(record.created_at).toLocaleDateString('tr-TR'),
    nextAction: record.next_action || '', notes: activities.filter((activity) => activity.customer_id === record.id).map((activity) => ({ id: activity.id, text: activity.body, date: new Date(activity.created_at).toLocaleString('tr-TR') }))
  });

  useEffect(() => {
    let mounted = true;
    const loadCRM = async () => {
      const cached = getCRMCustomers();
      if (!isSupabaseConfigured) { if (mounted) { setRecords(cached); setCrmConnection('offline'); } return; }
      const { data: customers, error } = await supabase.from('crm_customers').select('*').is('archived_at', null).order('created_at', { ascending: false });
      if (error || !customers) { if (mounted) { setRecords(cached); setCrmConnection('offline'); } return; }
      const ids = customers.map((customer) => customer.id);
      const { data: activities } = ids.length ? await supabase.from('crm_activities').select('id, customer_id, body, created_at').in('customer_id', ids).order('created_at', { ascending: false }) : { data: [] };
      if (mounted) { setRecords(customers.map((customer) => mapRemoteRecord(customer, activities || []))); setCrmConnection('connected'); }
    };
    void loadCRM();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { localStorage.setItem('realty-center-crm-customers', JSON.stringify(records)); }, [records]);

  const visibleRecords = records.filter((record) => {
    const matchesQuery = `${record.name} ${record.phone} ${record.email} ${record.city} ${record.district}`.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));
    const matchesStage = stageFilter === 'Tümü' || record.stage === stageFilter;
    const matchesTab = tab === 'leads' ? ['Yeni','Görüşülüyor'].includes(record.stage) : tab === 'followups' ? ['Görüşülüyor','Teklif'].includes(record.stage) : tab === 'appointments' ? Boolean(record.nextAction) : true;
    return matchesQuery && matchesStage && matchesTab;
  });
  const selected = records.find((record) => record.id === selectedId) || visibleRecords[0] || null;
  const statCards = [
    { label: 'Yeni Lead', value: records.filter((record) => record.stage === 'Yeni').length, accent: 'bg-red-50 text-red-700' },
    { label: 'Takip Bekliyor', value: records.filter((record) => ['Görüşülüyor','Teklif'].includes(record.stage)).length, accent: 'bg-amber-50 text-amber-700' },
    { label: 'Randevu', value: records.filter((record) => record.stage === 'Randevu').length, accent: 'bg-blue-50 text-blue-700' },
    { label: 'Sonuçlanan', value: records.filter((record) => record.stage === 'Sonuçlandı').length, accent: 'bg-emerald-50 text-emerald-700' }
  ];
  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    const now = new Date();
    let record: CRMCustomer = { id: `crm-${Date.now()}`, ...form, owner: advisorName || (isManager ? 'Yönetici' : 'Danışman'), lastContact: now.toLocaleDateString('tr-TR'), notes: [] };
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('crm_customers').insert({
          owner_id: user.id, assigned_to: user.id, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null,
          customer_type: form.type, stage: form.stage, source: form.source, city: form.city.trim() || null, district: form.district.trim() || null,
          budget: form.budget.trim() || null, preference: form.preference.trim() || null, next_action: form.nextAction.trim() || null, last_contact_at: now.toISOString()
        }).select('*').single();
        if (!error && data) { record = mapRemoteRecord(data); setCrmConnection('connected'); }
      }
    }
    setRecords((current) => [record, ...current]);
    setForm(emptyForm); setShowForm(false); setTab('customers');
  };
  const changeStage = async (stage: CRMStage) => {
    if (!selected) return;
    const now = new Date();
    setRecords((current) => current.map((record) => record.id === selected.id ? { ...record, stage, lastContact: now.toLocaleDateString('tr-TR') } : record));
    if (isSupabaseConfigured && !selected.id.startsWith('crm-')) {
      await supabase.from('crm_customers').update({ stage, last_contact_at: now.toISOString() }).eq('id', selected.id);
    }
  };
  const addNote = async () => {
    if (!selected || !noteText.trim()) return;
    const note = { id: `note-${Date.now()}`, text: noteText.trim(), date: new Date().toLocaleString('tr-TR') };
    setRecords((current) => current.map((record) => record.id === selected.id ? { ...record, lastContact: 'Bugün', notes: [note, ...record.notes] } : record));
    if (isSupabaseConfigured && !selected.id.startsWith('crm-')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('crm_activities').insert({ customer_id: selected.id, actor_id: user.id, activity_type: 'note', body: note.text }).select('id, created_at').single();
        if (data) setRecords((current) => current.map((record) => record.id === selected.id ? { ...record, notes: record.notes.map((item) => item.id === note.id ? { ...item, id: data.id, date: new Date(data.created_at).toLocaleString('tr-TR') } : item) } : record));
      }
    }
    setNoteText('');
  };
  const deleteRecord = async () => {
    if (!selected || !window.confirm('Bu müşteri kaydı çöp kutusuna alınacak. Devam edilsin mi?')) return;
    if (isSupabaseConfigured && !selected.id.startsWith('crm-')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from('crm_customers').update({ archived_at: new Date().toISOString(), archived_by: user.id }).eq('id', selected.id);
    }
    setRecords((current) => current.filter((record) => record.id !== selected.id));
    setSelectedId(null);
  };
  const stageClass: Record<CRMStage, string> = {
    'Yeni': 'bg-red-50 text-red-700', 'Görüşülüyor': 'bg-amber-50 text-amber-700', 'Randevu': 'bg-blue-50 text-blue-700',
    'Teklif': 'bg-violet-50 text-violet-700', 'Sonuçlandı': 'bg-emerald-50 text-emerald-700', 'Kaybedildi': 'bg-slate-100 text-slate-600'
  };

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-2xl bg-[#071d3b] p-5 text-white shadow-xl sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[10px] font-black tracking-[.22em] text-red-200">REALTY CENTER® CRM</p><h2 className="mt-2 text-2xl font-black">Müşteri ilişkilerini tek yerden yönetin.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Müşteri, talep, not, takip ve randevu süreçlerini kategorilere ayırarak kolayca yönetin.</p><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${crmConnection === 'connected' ? 'bg-emerald-400/20 text-emerald-100' : crmConnection === 'offline' ? 'bg-amber-300/20 text-amber-100' : 'bg-white/10 text-white/70'}`}>{crmConnection === 'connected' ? 'Supabase senkronize' : crmConnection === 'offline' ? 'Bağlantı bekleniyor' : 'CRM yükleniyor'}</span></div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CD011E] px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"><PlusCircle className="h-4 w-4"/> Yeni müşteri</button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{statCards.map((item) => <div key={item.label} className="rounded-xl bg-white/10 p-4"><p className="text-[10px] font-black tracking-wider text-white/65">{item.label.toUpperCase()}</p><div className="mt-2 flex items-center justify-between"><strong className="text-2xl">{item.value}</strong><span className={`rounded-lg px-2 py-1 text-[10px] font-black ${item.accent}`}>CRM</span></div></div>)}</div>
    </section>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">{[
            ['customers','Müşteriler',Users], ['leads','Lead Havuzu',Filter], ['followups','Takipler',Clock], ['appointments','Randevular',Calendar]
          ].map(([key,label,Icon]) => { const ActiveIcon = Icon as typeof Users; return <button key={key as string} onClick={() => setTab(key as typeof tab)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${tab === key ? 'bg-[#CD011E] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><ActiveIcon className="h-3.5 w-3.5"/>{label as string}</button>; })}</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, telefon, e-posta veya bölge ara..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50"/></div><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as typeof stageFilter)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700"><option>Tümü</option>{CRM_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></div>
        </div>
        <div className="divide-y divide-slate-100">{visibleRecords.length ? visibleRecords.map((record) => <button key={record.id} onClick={() => setSelectedId(record.id)} className={`w-full p-4 text-left transition hover:bg-slate-50 sm:p-5 ${selected?.id === record.id ? 'bg-red-50/45' : ''}`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071d3b] text-xs font-black text-white">{record.name.split(' ').map((part) => part[0]).slice(0,2).join('')}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-slate-900">{record.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${stageClass[record.stage]}`}>{record.stage}</span></div><p className="mt-1 text-xs text-slate-500">{record.type} · {record.city || 'Bölge belirtilmedi'}{record.district ? ` / ${record.district}` : ''}</p><div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600"><span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-red-700"/>{record.phone}</span><span>Son iletişim: {record.lastContact}</span>{record.nextAction && <span className="text-[#CD011E]">• {record.nextAction}</span>}</div></div></div></button>) : <div className="p-12 text-center"><Users className="mx-auto h-9 w-9 text-slate-300"/><h3 className="mt-3 font-black text-slate-800">Bu kategoride kayıt yok</h3><p className="mt-1 text-xs text-slate-500">Yeni müşteri ekleyerek CRM sürecini başlatabilirsiniz.</p></div>}</div>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">{selected ? <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.18em] text-red-700">MÜŞTERİ KARTI</p><h2 className="mt-1 text-xl font-black text-slate-900">{selected.name}</h2><p className="mt-1 text-xs text-slate-500">{selected.type} · Sorumlu: {selected.owner}</p></div><button onClick={deleteRecord} className="rounded-lg bg-slate-100 px-2.5 py-2 text-[10px] font-black text-slate-600 hover:bg-red-50 hover:text-red-700">Arşivle</button></div>
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><a href={`tel:${selected.phone.replace(/\\s+/g,'')}`} className="rounded-xl bg-slate-50 p-3 font-bold text-slate-700"><Phone className="mb-1 h-4 w-4 text-red-700"/>{selected.phone}</a><a href={`mailto:${selected.email}`} className="min-w-0 rounded-xl bg-slate-50 p-3 font-bold text-slate-700"><Mail className="mb-1 h-4 w-4 text-red-700"/><span className="block truncate">{selected.email || 'E-posta yok'}</span></a></div>
        <div className="mt-5 border-y border-slate-100 py-4"><p className="text-[10px] font-black tracking-wider text-slate-400">İHTİYAÇ ÖZETİ</p><p className="mt-2 text-sm font-bold text-slate-800">{selected.preference || 'Tercih bilgisi girilmedi'}</p><p className="mt-1 text-xs text-slate-500">{selected.city || 'Şehir yok'}{selected.district ? ` / ${selected.district}` : ''}{selected.budget ? ` · ${selected.budget}` : ''}</p></div>
        <div className="mt-5"><p className="text-[10px] font-black tracking-wider text-slate-400">SÜREÇ DURUMU</p><div className="mt-2 grid grid-cols-3 gap-1.5">{CRM_STAGES.map((stage) => <button key={stage} onClick={() => changeStage(stage)} className={`rounded-lg px-1.5 py-2 text-[9px] font-black transition ${selected.stage === stage ? 'bg-[#CD011E] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{stage}</button>)}</div></div>
        <div className="mt-5"><p className="text-[10px] font-black tracking-wider text-slate-400">GÖRÜŞME NOTLARI</p><div className="mt-2 max-h-36 space-y-2 overflow-y-auto">{selected.notes.length ? selected.notes.map((note) => <div key={note.id} className="rounded-lg bg-slate-50 p-2.5"><p className="text-xs leading-5 text-slate-700">{note.text}</p><small className="mt-1 block text-[9px] font-bold text-slate-400">{note.date}</small></div>) : <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Henüz görüşme notu yok.</p>}</div><div className="mt-2 flex gap-2"><input value={noteText} onChange={(event) => setNoteText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addNote(); }} placeholder="Not ekleyin..." className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-red-500"/><button onClick={addNote} className="rounded-lg bg-[#071d3b] px-3 text-xs font-black text-white">Ekle</button></div></div>
      </div> : <div className="p-10 text-center"><MessageSquare className="mx-auto h-9 w-9 text-slate-300"/><p className="mt-3 text-sm font-black text-slate-700">Bir müşteri seçin</p><p className="mt-1 text-xs text-slate-500">Detay, not ve süreç yönetimi burada açılır.</p></div>}</aside>
    </div>

    {showForm && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-200 p-5"><div><p className="text-[10px] font-black tracking-[.2em] text-red-700">CRM · YENİ KAYIT</p><h2 className="mt-1 text-xl font-black text-slate-900">Yeni müşteri veya lead ekle</h2></div><button onClick={() => setShowForm(false)} className="rounded-lg bg-slate-100 p-2 text-slate-600"><X className="h-5 w-5"/></button></div><form onSubmit={saveRecord} className="space-y-4 p-5"><div className="grid gap-3 sm:grid-cols-2"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ad Soyad *" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Telefon *" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="E-posta" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><option>Alıcı</option><option>Satıcı</option><option>Kiracı</option><option>Mal Sahibi</option><option>Yatırımcı</option></select><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="İl" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><input value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} placeholder="İlçe" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><input value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="Bütçe (örn. 5–7 milyon TL)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><option>Manuel kayıt</option><option>Web formu</option><option>Telefon</option><option>WhatsApp</option><option>Referans</option><option>Sosyal medya</option></select></div><textarea value={form.preference} onChange={(event) => setForm({ ...form, preference: event.target.value })} placeholder="İhtiyaç, tercih, ilgilendiği ilan veya özel not" rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/><div className="grid gap-3 sm:grid-cols-2"><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value as CRMStage })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">{CRM_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select><input value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} placeholder="Sonraki takip / randevu tarihi" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/></div><div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">Vazgeç</button><button type="submit" className="rounded-xl bg-[#CD011E] px-5 py-3 text-sm font-black text-white">CRM kaydını oluştur</button></div></form></div></div>}
  </div>;
}

function AgentDashboard({ panelRole = 'advisor' }: { panelRole?: 'advisor' | 'manager' }) {
  const navigate = useNavigate();
  const isManager = panelRole === 'manager';
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
    propertyType: 'Daire',
    type: 'Satılık',
    price: '',
    city: '',
    district: '',
    neighborhood: '',
    rooms: '',
    area: '',
    description: '',
    videoUrl: '',
    virtualTourUrl: '',
    mapUrl: '',
    monthlyFee: '',
    deedInfo: '',
    technicalFeatures: '',
    details: {} as Record<string, string>,
    images: [] as string[]
  };

  // Gerçek ilan kayıtları bağlanana kadar panel boş başlar; örnek/demo kayıt gösterilmez.
  const [myListings, setMyListings] = useState<any[]>([]);

  const [newListing, setNewListing] = useState(emptyListing);

  const [customers, setCustomers] = useState<Array<{ id: number; name: string; phone: string; email: string; type: string; status: string; lastContact: string }>>([]);

  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', type: 'Alıcı', status: 'Yeni'
  });

  const [messages, setMessages] = useState<Array<{ id: number; sender: string; subject: string; text: string; time: string; unread: boolean }>>([]);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    title: isManager ? 'Yönetici' : 'Gayrimenkul Danışmanı',
    office: '',
    region: ''
  });

  const appointments: Array<{ time: string; title: string; customer: string; type: string }> = [];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('first_name, last_name, email, phone').eq('id', user.id).maybeSingle();
      setProfile((current) => ({
        ...current,
        name: [data?.first_name, data?.last_name].filter(Boolean).join(' ') || current.name,
        email: data?.email || user.email || current.email,
        phone: data?.phone || current.phone,
        title: isManager ? 'Yönetici' : 'Gayrimenkul Danışmanı',
      }));
    };
    void loadProfile();
  }, [isManager]);

  const filteredListings = myListings.filter((item) =>
    `${item.title} ${item.id} ${item.city} ${item.district}`.toLocaleLowerCase('tr-TR').includes(listingSearch.toLocaleLowerCase('tr-TR'))
  );

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase('tr-TR').includes(customerSearch.toLocaleLowerCase('tr-TR'))
  );

  const navItems = [
    { key: 'overview' as const, label: isManager ? 'Yönetici Ana Sayfa' : 'Panel Anasayfa', icon: Home },
    { key: 'listings' as const, label: isManager ? 'İlan Yönetimi' : 'İlanlarım', icon: Building2 },
    { key: 'portfolio' as const, label: isManager ? 'Portföy Yönetimi' : 'Portföylerim', icon: Briefcase },
    { key: 'customers' as const, label: 'CRM & Müşteriler', icon: Users },
    { key: 'messages' as const, label: 'Mesajlar', icon: MessageSquare },
    { key: 'statistics' as const, label: 'İstatistikler', icon: BarChart3 },
    { key: 'profile' as const, label: 'Profil & Ayarlar', icon: Settings }
  ];

  const sectionTitles: Record<typeof activeSection, { title: string; description: string }> = {
    overview: { title: isManager ? 'Yönetici Paneli' : 'Danışman Paneli', description: isManager ? 'Operasyonlarınız için genel görünüm.' : 'Bugünkü çalışmalarınıza genel bakış.' },
    listings: { title: isManager ? 'İlan Yönetimi' : 'İlanlarım', description: 'Yönettiğiniz tüm ilanları buradan takip edin.' },
    portfolio: { title: isManager ? 'Portföy Yönetimi' : 'Portföylerim', description: 'Portföylerin durumunu ve dağılımını yönetin.' },
    customers: { title: 'CRM & Müşteriler', description: 'Müşteri, lead, takip ve randevu süreçlerinizi tek ekrandan yönetin.' },
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
  void removeImage;

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
      propertyType: item.propertyType || 'Daire',
      type: item.type,
      price: String(item.price),
      city: item.city,
      district: item.district,
      neighborhood: item.neighborhood,
      rooms: item.rooms,
      area: String(item.area),
      description: item.description || '',
      videoUrl: item.videoUrl || '',
      virtualTourUrl: item.virtualTourUrl || '',
      mapUrl: item.mapUrl || '',
      monthlyFee: item.monthlyFee || '',
      deedInfo: item.deedInfo || '',
      technicalFeatures: item.technicalFeatures || '',
      details: item.details || {},
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
        propertyType: newListing.propertyType,
        type: newListing.type,
        price: numericPrice,
        city: newListing.city,
        district: newListing.district,
        neighborhood: newListing.neighborhood || 'Merkez',
        rooms: newListing.rooms,
        area: numericArea,
        description: newListing.description,
        videoUrl: newListing.videoUrl,
        virtualTourUrl: newListing.virtualTourUrl,
        mapUrl: newListing.mapUrl,
        monthlyFee: newListing.monthlyFee,
        deedInfo: newListing.deedInfo,
        technicalFeatures: newListing.technicalFeatures,
        updatedAt: new Date().toLocaleDateString('tr-TR'),
        details: newListing.details,
        image: primaryImage,
        images: newListing.images.length ? newListing.images : [primaryImage]
      } : item));
    } else {
      const createdListing = {
        id: `RC-${Math.floor(100 + Math.random() * 899)}`,
        title: newListing.title || 'Yeni Realty Center® İlanı',
        category: newListing.category,
        propertyType: newListing.propertyType,
        type: newListing.type,
        price: numericPrice,
        currency: '₺',
        city: newListing.city,
        district: newListing.district,
        neighborhood: newListing.neighborhood || 'Merkez',
        rooms: newListing.rooms,
        area: numericArea,
        description: newListing.description,
        videoUrl: newListing.videoUrl,
        virtualTourUrl: newListing.virtualTourUrl,
        mapUrl: newListing.mapUrl,
        monthlyFee: newListing.monthlyFee,
        deedInfo: newListing.deedInfo,
        technicalFeatures: newListing.technicalFeatures,
        updatedAt: new Date().toLocaleDateString('tr-TR'),
        details: newListing.details,
        image: primaryImage,
        images: newListing.images.length ? newListing.images : [primaryImage],
        agentName: profile.name || (isManager ? 'Yönetici' : 'Danışman'),
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

  const renderCustomers = () => <CRMWorkspace isManager={isManager} advisorName={profile.name} />;

  const renderMessages = () => (<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Gelen Mesajlar</h2><p className="text-xs text-slate-500 mt-1">Müşterilerinizle iletişiminizi buradan yönetin.</p></div><span className="text-xs font-black text-red-700 bg-red-100 px-3 py-1.5 rounded-full">{messages.filter((m)=>m.unread).length} okunmamış</span></div><div className="divide-y divide-slate-100">{messages.map((message)=><button key={message.id} onClick={()=>markMessageRead(message.id)} className={`w-full text-left p-5 hover:bg-slate-50 transition ${message.unread?'bg-red-100/40':'bg-white'}`}><div className="flex items-start gap-4"><div className={`w-11 h-11 rounded-full flex items-center justify-center font-black ${message.unread?'bg-red-700 text-white':'bg-slate-200 text-slate-700'}`}>{message.sender.split(' ').map((x)=>x[0]).slice(0,2).join('')}</div><div className="flex-1 min-w-0"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"><h3 className="font-black text-slate-900">{message.sender}</h3><span className="text-[10px] text-slate-400 font-bold">{message.time}</span></div><p className="text-sm font-bold text-slate-700 mt-1">{message.subject}</p><p className="text-xs text-slate-500 mt-1 truncate">{message.text}</p></div>{message.unread&&<span className="w-2.5 h-2.5 rounded-full bg-red-700 mt-2" />}</div></button>)}</div></div>);

  const renderStatistics = () => (<div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[{label:'Toplam Görüntülenme',value:'12.840',change:'+18,4%'},{label:'İlan Dönüşümü',value:'%7,8',change:'+2,1%'},{label:'Telefon Tıklaması',value:'326',change:'+12,6%'},{label:'Favoriye Eklenme',value:'184',change:'+9,3%'}].map(stat=><div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><p className="text-xs font-bold text-slate-500">{stat.label}</p><div className="flex items-end justify-between mt-2"><p className="text-2xl font-black text-slate-900">{stat.value}</p><span className="text-xs font-black text-emerald-600">{stat.change}</span></div></div>)}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">Haftalık Görüntülenme</h2><div className="mt-6 grid grid-cols-7 gap-3 items-end h-56">{[48,62,55,76,68,91,84].map((value,index)=><div key={index} className="flex flex-col items-center justify-end gap-2 h-full"><div className="w-full bg-slate-100 rounded-lg overflow-hidden flex items-end h-44"><div className="w-full bg-red-700 rounded-lg" style={{height:`${value}%`}} /></div><span className="text-[10px] font-bold text-slate-400">{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][index]}</span></div>)}</div></section><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">En Çok İlgi Gören İlanlar</h2><div className="mt-4 space-y-4">{myListings.slice(0,5).map((item,index)=><div key={item.id} className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">{index+1}</span><div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{item.title}</p><div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-red-700 rounded-full" style={{width:`${90-index*12}%`}} /></div></div><span className="text-xs font-black text-slate-500">{(3240-index*420).toLocaleString('tr-TR')}</span></div>)}</div></section></div></div>);

  const renderProfile = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 xl:col-span-2"><div className="flex items-center justify-between mb-6"><div><h2 className="text-lg font-black text-slate-900">Profil Bilgileri</h2><p className="text-xs text-slate-500 mt-1">Danışman profilinizde görünen bilgileri yönetin.</p></div>{profileSaved&&<span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Kaydedildi</span>}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{([['name','Ad Soyad'],['email','E-posta'],['phone','Telefon'],['title','Unvan'],['office','Ofis'],['region','Bölge']] as const).map(([key,label])=><div key={key}><label className="text-xs font-black text-slate-700 mb-2 block">{label}</label><input value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700" /></div>)}</div><button onClick={saveProfile} className="mt-6 bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl">Değişiklikleri Kaydet</button></section><section className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white h-fit"><div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-2xl font-black mx-auto">MY</div><h3 className="text-center text-xl font-black mt-4">{profile.name}</h3><p className="text-center text-sm text-slate-400 mt-1">{profile.title}</p><div className="mt-6 pt-5 border-t border-slate-700 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">Aktif İlan</span><strong>{myListings.filter((x)=>x.status==='Aktif').length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Müşteri</span><strong>{customers.length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Ofis</span><strong>{profile.office.replace('Realty Center® ','')}</strong></div></div></section></div>
  );

  const profileInitials = profile.name ? profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() : 'RC';

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-100"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="flex flex-col lg:flex-row gap-6"><aside className="w-full lg:w-64 bg-slate-900 rounded-2xl shadow-xl overflow-hidden h-fit lg:sticky lg:top-24"><div className="p-5 border-b border-slate-700"><div className="flex items-center space-x-3"><div className="w-11 h-11 rounded-full bg-red-700 flex items-center justify-center text-white font-black">{profileInitials}</div><div><div className="text-white font-black text-sm">{profile.name || 'Realty Center'}</div><div className="text-slate-400 text-xs">{isManager ? 'Yönetici' : 'Gayrimenkul Danışmanı'}</div></div></div></div><nav className="p-3 space-y-1">{navItems.map((item)=>{const Icon=item.icon;return <button key={item.key} onClick={()=>setActiveSection(item.key)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-bold text-sm text-left transition ${activeSection===item.key?'bg-red-700 text-white':'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon className="w-4 h-4" /><span>{item.label}</span></button>})}</nav><div className="p-3 border-t border-slate-700"><button onClick={()=>navigate('/panel')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-700 hover:text-white font-bold text-sm text-left transition"><LogOut className="w-4 h-4" /><span>Çıkış Yap</span></button></div></aside><main className="flex-1 min-w-0"><div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-sm text-slate-500 font-semibold">Hoş geldiniz,</p><h1 className="text-2xl sm:text-3xl font-black text-slate-900">{activeTitle.title}</h1><p className="text-sm text-slate-500 mt-1">{activeTitle.description}</p></div><button onClick={()=>{setEditingListingId(null);setNewListing(emptyListing);setShowListingForm(true);}} className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-700/20 transition"><PlusCircle className="w-5 h-5" /><span>Yeni İlan Ekle</span></button></div></div>{activeSection==='overview'&&renderOverview()}{activeSection==='listings'&&renderListings()}{activeSection==='portfolio'&&renderPortfolio()}{activeSection==='customers'&&renderCustomers()}{activeSection==='messages'&&renderMessages()}{activeSection==='statistics'&&renderStatistics()}{activeSection==='profile'&&renderProfile()}</main></div></div>

      {showListingForm && (<div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/70 p-4"><form onSubmit={handleCreateListing} className="mx-auto max-w-4xl space-y-5 rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-black">{editingListingId ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}</h2><button type="button" onClick={resetListingForm}><X /></button></div><input required value={newListing.title} onChange={e=>setNewListing({...newListing,title:e.target.value})} placeholder="İlan Başlığı" className="w-full rounded-xl border p-3" /><div className="grid gap-3 md:grid-cols-3"><select value={newListing.category} onChange={e=>{const category=e.target.value;setNewListing({...newListing,category,propertyType:LISTING_PROPERTY_TYPES[category as keyof typeof LISTING_PROPERTY_TYPES][0],details:{}})}} className="rounded-xl border p-3">{LISTING_CATEGORIES.map(x=><option key={x}>{x}</option>)}</select><select value={newListing.propertyType} onChange={e=>setNewListing({...newListing,propertyType:e.target.value,details:{}})} className="rounded-xl border p-3">{(LISTING_PROPERTY_TYPES[newListing.category as keyof typeof LISTING_PROPERTY_TYPES]||[]).map(x=><option key={x}>{x}</option>)}</select><select value={newListing.type} onChange={e=>setNewListing({...newListing,type:e.target.value})} className="rounded-xl border p-3">{LISTING_TRANSACTION_TYPES.map(x=><option key={x}>{x}</option>)}</select></div><div className="rounded-xl bg-red-50 p-4"><h3 className="mb-3 font-black text-red-800">{newListing.propertyType} Özellikleri</h3><div className="grid gap-3 sm:grid-cols-2">{(PROPERTY_DETAIL_FIELDS[newListing.propertyType]||[]).map(field=><div key={field.key}><label className="mb-1 block text-xs font-black">{field.label}</label><input type={field.type || 'text'} value={newListing.details[field.key] || ''} onChange={e=>setNewListing({...newListing,details:{...newListing.details,[field.key]:e.target.value},...(field.key === 'roomCount'?{rooms:e.target.value}:{})})} placeholder={field.placeholder||field.label} className="w-full rounded-xl border p-3" /></div>)}</div></div><div className="grid gap-3 md:grid-cols-2"><input required value={newListing.price} onChange={e=>setNewListing({...newListing,price:e.target.value})} placeholder="Fiyat" className="rounded-xl border p-3" /><input required value={newListing.area} onChange={e=>setNewListing({...newListing,area:e.target.value})} placeholder="Toplam alan m²" className="rounded-xl border p-3" /></div><ListingOptionalDetailFields listing={newListing} onChange={(updates) => setNewListing({ ...newListing, ...updates })} /><label><input type="file" accept="image/*" multiple onChange={handleImageChange} /> Görsel seç ({newListing.images.length}/10)</label><div className="flex justify-end gap-3"><button type="button" onClick={resetListingForm}>Vazgeç</button><button type="submit" className="rounded-xl bg-red-700 px-5 py-3 font-black text-white">İlanı Kaydet</button></div></form></div>)}
    </div>
  );
}

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    const shouldRestoreHomePosition = location.pathname === '/' && sessionStorage.getItem('realty-center-restore-home-position') === 'true';
    if (shouldRestoreHomePosition) {
      sessionStorage.removeItem('realty-center-restore-home-position');
      const savedPosition = Number(sessionStorage.getItem('realty-center-home-scroll') || '0');
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        window.scrollTo({ top: Number.isFinite(savedPosition) ? savedPosition : 0, left: 0, behavior: 'auto' });
      }));
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

function HomeReturnButton() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== '/') return;
    const saveHomePosition = () => sessionStorage.setItem('realty-center-home-scroll', String(window.scrollY));
    saveHomePosition();
    const saveBeforeNavigation = () => saveHomePosition();
    window.addEventListener('scroll', saveHomePosition, { passive: true });
    document.addEventListener('pointerdown', saveBeforeNavigation, true);
    document.addEventListener('keydown', saveBeforeNavigation, true);
    return () => {
      saveHomePosition();
      window.removeEventListener('scroll', saveHomePosition);
      document.removeEventListener('pointerdown', saveBeforeNavigation, true);
      document.removeEventListener('keydown', saveBeforeNavigation, true);
    };
  }, [location.pathname]);

  if (location.pathname === '/' || ['/super-admin-panel', '/yonetici-panel', '/danisman-panel', '/panel', '/super-admin'].includes(location.pathname)) return null;

  const returnHome = () => {
    sessionStorage.setItem('realty-center-restore-home-position', 'true');
    navigate('/');
  };

  return <button
    type="button"
    onClick={returnHome}
    className="fixed right-4 top-32 z-[70] inline-flex items-center gap-2 rounded-full bg-[#CD011E] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-900/25 transition hover:-translate-y-0.5 hover:bg-[#A90018] sm:right-6"
    aria-label="Ana sayfaya, kaldığınız yere dönün"
  >
    <Home className="h-4 w-4" />
    Ana Sayfaya Dön
  </button>;
}

function AmbientMusicButton() {
  const location = useLocation();
  const [playing, setPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const loopRef = useRef<number | null>(null);

  const stopMusic = useCallback(async () => {
    if (loopRef.current !== null) window.clearInterval(loopRef.current);
    loopRef.current = null;
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      window.setTimeout(() => { if (context.state !== 'closed') void context.close(); }, 520);
    }
    audioContextRef.current = null;
    masterGainRef.current = null;
    setPlaying(false);
  }, []);

  const startMusic = useCallback(async () => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    const warmth = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    warmth.type = 'lowpass';
    warmth.frequency.setValueAtTime(4200, context.currentTime);
    warmth.Q.setValueAtTime(0.65, context.currentTime);
    compressor.threshold.setValueAtTime(-24, context.currentTime);
    compressor.knee.setValueAtTime(18, context.currentTime);
    compressor.ratio.setValueAtTime(3, context.currentTime);
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 1.8);
    master.connect(warmth);
    warmth.connect(compressor);
    compressor.connect(context.destination);
    audioContextRef.current = context;
    masterGainRef.current = master;

    const playPianoNote = (frequency: number, start: number, duration = 2.8, velocity = 0.12) => {
      const noteGain = context.createGain();
      const tone = context.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.setValueAtTime(Math.min(5200, frequency * 10), start);
      tone.frequency.exponentialRampToValueAtTime(Math.max(900, frequency * 3.4), start + duration);
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(velocity, start + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(Math.max(velocity * 0.34, 0.0002), start + 0.32);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      noteGain.connect(tone);
      tone.connect(master);

      [
        { ratio: 1, level: 1, type: 'triangle' as OscillatorType },
        { ratio: 2, level: 0.24, type: 'sine' as OscillatorType },
        { ratio: 3, level: 0.1, type: 'sine' as OscillatorType }
      ].forEach((harmonic) => {
        const oscillator = context.createOscillator();
        const harmonicGain = context.createGain();
        oscillator.type = harmonic.type;
        oscillator.frequency.setValueAtTime(frequency * harmonic.ratio, start);
        oscillator.detune.setValueAtTime((harmonic.ratio - 1) * 1.5, start);
        harmonicGain.gain.setValueAtTime(harmonic.level, start);
        oscillator.connect(harmonicGain);
        harmonicGain.connect(noteGain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.08);
      });
    };

    const playPhrase = () => {
      const now = context.currentTime + 0.12;
      // Beethoven – Für Elise giriş motifi. Beste kamu malıdır; ses kaydı kullanılmaz,
      // bütün notalar ziyaretçinin tarayıcısında Web Audio ile anlık üretilir.
      const melody = [
        [659.25,0],[622.25,0.34],[659.25,0.68],[622.25,1.02],[659.25,1.36],
        [493.88,1.78],[587.33,2.2],[523.25,2.62],[440,3.04],
        [261.63,3.64],[329.63,4.06],[440,4.48],[493.88,4.9],
        [329.63,5.5],[415.3,5.92],[493.88,6.34],[523.25,6.76],
        [329.63,7.36],[659.25,7.78],[622.25,8.12],[659.25,8.46],[622.25,8.8],
        [659.25,9.14],[493.88,9.56],[587.33,9.98],[523.25,10.4],[440,10.82]
      ] as Array<[number, number]>;
      melody.forEach(([frequency, offset], index) => playPianoNote(frequency, now + offset, index < 5 ? 1.45 : 2.1, index % 9 === 0 ? 0.125 : 0.1));
      [
        [130.81,3.04],[164.81,3.64],[220,4.48],
        [123.47,4.9],[164.81,5.5],[207.65,6.34],
        [130.81,6.76],[164.81,7.36],[220,7.78],
        [130.81,10.4],[164.81,10.82]
      ].forEach(([frequency, offset]) => playPianoNote(frequency, now + offset, 2.7, 0.052));
    };

    await context.resume();
    playPhrase();
    loopRef.current = window.setInterval(playPhrase, 11880);
    setPlaying(true);
  }, []);

  useEffect(() => () => {
    if (loopRef.current !== null) window.clearInterval(loopRef.current);
    if (audioContextRef.current?.state !== 'closed') void audioContextRef.current?.close();
  }, []);

  if (['/super-admin-panel', '/yonetici-panel', '/danisman-panel', '/panel', '/super-admin'].includes(location.pathname)) return null;
  return <button type="button" onClick={() => { if (playing) void stopMusic(); else void startMusic(); }} aria-pressed={playing} aria-label={playing ? 'Piyano müziğini sessize al' : 'Telif içermeyen piyano müziği çal'} title="Beethoven – Für Elise · Telifsiz piyano düzenlemesi" className="fixed bottom-5 left-5 z-[90] inline-flex items-center gap-2 rounded-full border-2 border-[#071d3b] bg-white/95 px-4 py-2.5 text-xs font-black text-[#071d3b] shadow-[0_8px_24px_rgba(7,29,59,.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#CD011E] hover:text-[#CD011E]">
    {playing ? <VolumeX className="h-4 w-4"/> : <Music2 className="h-4 w-4"/>}
    <span>{playing ? 'Sessize Al' : 'Müzik Çal'}</span>
    {playing && <span className="h-2 w-2 rounded-full bg-[#CD011E]"/>}
  </button>;
}

export default function RealtyCenterApp() {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<StaticLanguage>(() => (localStorage.getItem('realty-language') as StaticLanguage) || 'tr');
  const [animationStage, setAnimationStage] = useState<'approaching' | 'unlocking' | 'unlocked'>('approaching');
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<'franchise' | 'agent'>('franchise');
  const [, setScrolled] = useState(false);
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

  useEffect(() => {
    localStorage.setItem('realty-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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
        <div className="relative mb-10 transform">
          <img 
            src="/rc_logo_og.svg"
            alt="Realty Center®" 
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
                <Key className="w-5 h-5" />
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
        
        <Header language={language} setLanguage={setLanguage} />
        <HomeReturnButton />
        <AmbientMusicButton />

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
            <Route path="/danisman-panel" element={<ProtectedPanelRoute roles={['advisor']}><AgentDashboard panelRole="advisor" /></ProtectedPanelRoute>} />
            <Route path="/yonetici-panel" element={<ProtectedPanelRoute roles={['manager']}><AgentDashboard panelRole="manager" /></ProtectedPanelRoute>} />
            <Route path="/super-admin" element={<LoginPage />} />
            <Route path="/super-admin-panel" element={<ProtectedPanelRoute roles={['admin']}><AdminControlCenter /></ProtectedPanelRoute>} />
            
            <Route path="/kurumsal/hakkimizda" element={<AboutPage />} />
            <Route path="/kurumsal/once-guven" element={<TrustPrinciplePage />} />
            <Route path="/neden-realty-center" element={<WhyRealtyCenterPage />} />
            <Route path="/finansal-cozumler" element={<FinancialSolutionsPage />} />
            <Route path="/kurumsal/ekibimiz" element={<TeamPage />} />
            <Route path="/kurumsal/yonetim-kurulu" element={<TeamPage />} />
            <Route path="/kurumsal/misyon-vizyon" element={<MissionVisionPage />} />
            <Route path="/kurumsal/belgelerimiz" element={<DocumentsPage />} />
            <Route path="/kurumsal/referanslar" element={<LogoShowcasePage mode="references" />} />
            <Route path="/kurumsal/is-ortaklarimiz" element={<LogoShowcasePage mode="partners" />} />
            <Route path="/kesfet/:slug" element={<DiscoverEarningPage section="discover" />} />
            <Route path="/kazanc-modeli/:slug" element={<DiscoverEarningPage section="earning" />} />
            <Route path="/icerik/:id" element={<ManagedHeaderContentPage />} />
            <Route path="/kutuphane" element={<LibraryHomePage />} />
            <Route path="/kutuphane/:slug" element={<LibraryCategoryPage />} />
            <Route path="/kutuphane/:slug/:articleId" element={<LibraryArticlePage />} />
            <Route path="/blog/rehber" element={<LibraryHomePage />} />
            <Route path="/blog/hukuk" element={<LibraryHomePage />} />
            <Route path="/blog/haberler" element={<LibraryHomePage />} />
            <Route path="/blog/analizler" element={<LibraryHomePage />} />
            <Route path="/kvkk" element={<LegalInfoPage title="KVKK Aydınlatma Metni" description="Kişisel verilerinizin hangi amaçlarla işlendiği, saklandığı ve haklarınız kapsamında nasıl başvuru yapabileceğiniz hakkında bilgilendirme metnidir." />} />
            <Route path="/gizlilik-politikasi" element={<LegalInfoPage title="Gizlilik Politikası" description="Realty Center® web sitesi ve dijital hizmetlerinde kullanıcı bilgilerinin gizliliğine ilişkin temel ilkeleri açıklar." />} />
            <Route path="/cerez-politikasi" element={<LegalInfoPage title="Çerez Politikası" description="Zorunlu, işlevsel ve analitik çerezlerin kullanım amaçları ile kullanıcı tercihlerini nasıl yönetebileceğini açıklar." />} />
            <Route path="/kullanim-kosullari" element={<LegalInfoPage title="Kullanım Koşulları" description="Web sitesine erişim, içeriklerin kullanımı, kullanıcı sorumlulukları ve hizmet kapsamına ilişkin koşulları açıklar." />} />
            <Route path="/ilan-yayinlama-kurallari" element={<LegalInfoPage title="İlan Yayınlama Kuralları" description="İlan bilgilerinin doğruluğu, görsel kullanımı, yetkilendirme, güncellik ve hukuka uygunluk konularındaki yayın ilkelerini açıklar." />} />
            <Route path="/arama" element={<SiteSearchPage />} />

            <Route path="/akademi" element={<AcademyPage openDrawer={openDrawer} />} />
            <Route path="/ofislerimiz" element={<OfficesPage />} />
            <Route path="/danismanlarimiz" element={<AgentsPage />} />
            <Route path="/ilan-kategorileri" element={<ListingCategoriesPage />} />
            <Route path="/ilanlarimiz" element={<ListingsPageV2 />} />
            <Route path="/harita-ile-ara" element={<MapSearchPage />} />
            <Route path="/ai-karar-asistani" element={<AIDecisionAssistantPage />} />
            <Route path="/ilan/:id" element={<ListingDetailPage />} />
            <Route path="/projelerimiz" element={<ProjectsPage />} />
            <Route path="/videolar" element={<VideosPage />} />
            <Route path="/iletisim" element={<ContactPage onSendMessage={handleSendMessage} />} />
            <Route path="/geri-bildirim" element={<CustomerFeedbackPage />} />
            <Route path="/franchise-firsatlari" element={<FranchiseOpportunitiesPage />} />
            <Route path="/franchise-basvuru" element={<ApplicationPage type="franchise" />} />
            <Route path="/danisman-basvuru" element={<ApplicationPage type="agent" />} />
          </Routes>
        </main>

        <Footer openDrawer={openDrawer} />
        <WhatsAppSupportButton />
        <CookieConsent />

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
                  <p className="text-xs text-red-600 font-black tracking-wider">REALTY CENTER® Ailesine Katılın</p>
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
                Realty Center® Gayrimenkul Franchise & Danışman Ağı
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
