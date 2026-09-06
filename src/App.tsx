Warning: truncated output (original token count: 144461)
Total output lines: 5759

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Popup, Rectangle, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { 
  BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams
} from 'react-router-dom';

import { 
  Search, MapPin, Phone, Mail, Globe, 
  CheckCircle2, X, 
  Building2, Briefcase, Megaphone,
  TrendingUp, Key, Home, GraduationCap, ArrowRight, ArrowUp,
  Users, Navigation, UserCheck, Filter,
  Maximize2, Bed, Calendar, Tag, Flame, Send, Clock, MessageSquare, LogOut, PlusCircle, Settings, BarChart3,
  ShieldAlert, Lock, Check, AlertCircle, FileText, PieChart, Layers, MessageCircle, Menu,
  Heart, Printer, Share2, PlayCircle, Camera, Map, ChevronLeft, ChevronRight, ChevronDown, LocateFixed, PencilRuler, RotateCcw, MapPinned, Flag, Bell, Music2, VolumeX, BookOpen, ShieldCheck
} from 'lucide-react';

const STATIC_LANGUAGES = {
  tr: { corporate:'Kurumsal', offices:'Ofislerimiz', agents:'Danışmanlarımız', listings:'İlanlarımız', ai:'🤖 Yapay Zeka Asistanı', projects:'Projelerimiz', contact:'İletişim', advisor:'Danışman Ol', franchise:'Franchise Ol!', panel:'Panel' },
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
const getRealtyVideos = (): RealtyVideo[] => {
  try { return (JSON.parse(localStorage.getItem('realty-center-videos') || '[]') as Partial<RealtyVideo>[]).map((video) => ({ ...video, source: video.source || 'youtube', category: video.category || 'tv', description: video.description || '' } as RealtyVideo)); } catch { return []; }
};
const getYoutubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1] || '';
const saveRealtyVideos = (videos: RealtyVideo[]) => { localStorage.setItem('realty-center-videos', JSON.stringify(videos)); window.dispatchEvent(new Event('realty-center-videos-updated')); };
const getYoutubeChannelUrl = () => localStorage.getItem('realty-center-youtube-channel-url') || '';
const saveYoutubeChannelUrl = (url: string) => { localStorage.setItem('realty-center-youtube-channel-url', url.trim()); window.dispatchEvent(new Event('realty-center-youtube-channel-updated')); };

type LibraryArticle = { id: string; title: string; summary: string; image: string; content: string; publishedAt: string };
type LibraryCategory = { id: string; slug: string; title: string; description: string; color: string; articles: LibraryArticle[] };
const DEFAULT_LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id:'library-news', slug:'sektor-haberleri', title:'Sektör Haberleri', description:'Gayrimenkul sektöründeki güncel gelişmeler, yeni düzenlemeler ve piyasa gündemi.', color:'#CD011E', articles:[
    { id:'sektor-2026', title:'Gayrimenkulde 2026’nın ikinci yarısına bakış', summary:'Konut talebi, yeni arz ve finansman koşullarının piyasaya olası etkilerini birlikte değerlendirin.', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-24T12:00:00.000Z', content:'<p>Gayrimenkul piyasasında doğru karar; bölgesel veriyi, finansman maliyetini ve taşınmazın kullanım amacını birlikte okumayı gerektirir.</p><h2>Takip edilmesi gereken başlıklar</h2><ul><li>Yeni proje ve ikinci el arz dengesi</li><li>Bölgesel kira hareketleri</li><li>Kredi koşulları ve nakit akışı</li></ul>' },
    { id:'sektor-danismanlik', title:'Gayrimenkul danışmanlığında güven neden belirleyici?', summary:'Şeffaf bilgi, doğru fiyatlama ve düzenli iletişim; sürecin her iki tarafı için de fark oluşturur.', image:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-18T12:00:00.000Z', content:'<p>Danışmanlık hizmetinde güven, yalnızca sonuçta değil; ilk görüşmeden satış sonrasına kadar tüm süreçte inşa edilir.</p>' }
  ] },
  { id:'library-law', slug:'hukuk-mevzuat', title:'Hukuk & Mevzuat', description:'Tapu, sözleşme, yetkilendirme ve gayrimenkul mevzuatına dair açıklayıcı içerikler.', color:'#183B66', articles:[
    { id:'hukuk-tapu', title:'Tapu işlemi öncesinde kontrol edilmesi gereken 6 başlık', summary:'Tapu kaydı, yetki belgeleri ve ödeme planı gibi kritik noktaları işlem öncesinde gözden geçirin.', image:'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-21T12:00:00.000Z', content:'<p>Tapu işlemlerinde taşınmaza ve taraflara ilişkin bilgilerin doğrulanması, sağlıklı bir sürecin temelidir.</p><h2>Ön kontrol listesi</h2><ul><li>Tapu kaydı ve taşınmaz bilgileri</li><li>Tarafların kimlik ve temsil yetkileri</li><li>Ödeme yöntemi ve resmi belgeler</li></ul>' }
  ] },
  { id:'library-press', slug:'basinda-biz', title:'Basında Biz', description:'Realty Center® hakkında basında yayımlanan haberler, röportajlar ve duyurular.', color:'#7C2D12', articles:[
    { id:'basin-guven', title:'Realty Center® “Önce Güven” yaklaşımını anlattı', summary:'Markamızın şeffaf danışmanlık ve güçlü ofis ağı yaklaşımı sektör gündeminde yer aldı.', image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-14T12:00:00.000Z', content:'<p>Realty Center®, hizmet anlayışını teknoloji, yerel uzmanlık ve güven ilkesi etrafında geliştirmeye devam ediyor.</p>' }
  ] },
  { id:'library-ai', slug:'yapay-zekali-rehber', title:'Yapay Zekâlı Rehber', description:'Gayrimenkul kararlarında yapay zekâdan yararlanmayı kolaylaştıran uygulamalı rehberler.', color:'#6D28D9', articles:[
    { id:'ai-degerleme', title:'Yapay zekâ ile bölgesel fiyat araştırması nasıl yapılır?', summary:'Bir yatırım bölgesini analiz ederken yapay zekâdan doğru sorularla nasıl yararlanabileceğinizi öğrenin.', image:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-23T12:00:00.000Z', content:'<p>Yapay zekâ, kararın yerine geçmez; dağınık verileri karşılaştırmak ve araştırma sürecini hızlandırmak için güçlü bir yardımcıdır.</p>' }
  ] },
  { id:'library-investment', slug:'yatirim-firsatlari-analizler', title:'Yatırım Fırsatları ve Analizler', description:'Bölgesel fiyat hareketleri, kira getirileri ve yatırım fırsatlarına dair uzman analizleri.', color:'#047857', articles:[
    { id:'yatirim-kira-getirisi', title:'Kira getirisi analizinde yalnızca fiyata bakmayın', summary:'Brüt kira çarpanı, bakım gideri ve bölgesel talep gibi değişkenler yatırımın gerçek resmini verir.', image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=88&w=1200', publishedAt:'2026-08-20T12:00:00.000Z', content:'<p>Sağlıklı yatırım analizi, satın alma bedelinin yanında düzenli giderleri ve uzun dönemli bölge potansiyelini dikkate alır.</p>' }
  ] }
];
const getLibraryCategories = (): LibraryCategory[] => { try { return JSON.parse(localStorage.getItem('realty-center-library') || 'null') || DEFAULT_LIBRARY_CATEGORIES; } catch { return DEFAULT_LIBRARY_CATEGORIES; } };
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
  { id: 'ref-1', name: 'Kurumsal Referans', logo: '/dglogo.svg', content: 'Referans kurum ve yürütülen çalışma bilgileri bu alana eklenecektir.' }
];
const DEFAULT_PARTNERS: CorporateLogoItem[] = [
  { id: 'partner-1', name: 'Anlaşmalı Banka', logo: '/demo-placeholder.svg', content: 'Gayrimenkul finansmanı ve müşterilere sunulan avantajlı çözümlere ilişkin anlaşma ayrıntıları burada yer alacaktır.' },
  { id: 'partner-2', name: 'Çözüm Ortağı Kurum', logo: '/demo-placeholder.svg', content: 'Realty Center® ile kurum arasında yürütülen iş birliği ve müşterilere sağlanan avantajlar burada açıklanacaktır.' }
];
const getStoredCorporateItems = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } };

type HeaderMenuItem = { id: string; label: string; path: string; side: 'left' | 'right'; image?: string; content?: string; children: HeaderMenuItem[] };
const headerItem = (id: string, label: string, path: string, side: 'left' | 'right', children: HeaderMenuItem[] = [], image = '', content = ''): HeaderMenuItem => ({ id, label, path, side, image, content, children });
const DEFAULT_HEADER_MENU: HeaderMenuItem[] = [
  headerItem('corporate','Kurumsal','/kurumsal/hakkimizda','left',[headerItem('about','Hakkımızda','/kurumsal/hakkimizda','left'),headerItem('mission','Misyonumuz ve Vizyonumuz','/kurumsal/misyon-vizyon','left'),headerItem('team','Yönetim Kadromuz','/kurumsal/ekibimiz','left'),headerItem('documents','Belgelerimiz','/kurumsal/belgelerimiz','left'),headerItem('references','Referanslarımız','/kurumsal/referanslar','left'),headerItem('partners','İş Ortaklarımız','/kurumsal/is-ortaklarimiz','left')]),
  headerItem('offices','Ofislerimiz','/ofislerimiz','left'), headerItem('agents','Danışmanlarımız','/danismanlarimiz','left'), headerItem('listings','İlanlarımız','/ilan-kategorileri','left'), headerItem('projects','Projelerimiz','/projelerimiz','left'),
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
    ],'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=90&w=1400','Üretilen değerin katkıyı koruyan açık kurallarla paylaşıldığı kurumsal kazanç yaklaşımı.'),headerItem('financial-solutions','Finansal Çözümler','/finansal-cozumler','right',[],'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=90&w=1400','Bankalar, katılım bankaları ve Eminevim finansman seçenekleri için çözüm talebi oluşturun.')]),
  headerItem('ai','Yapay Zeka Asistanı','/ai-karar-asistani','right'), headerItem('library','Realty Kütüphane','/kutuphane','right'), headerItem('why','Neden Realty Center®?','/neden-realty-center','right'), headerItem('franchise','Franchise Ol','/franchise-basvuru','right'), headerItem('advisor','Danışman Ol','/danisman-basvuru','right'), headerItem('contact','İletişim','/iletisim','right',[headerItem('contact-info','İletişim Bilgilerimiz','/iletisim','right'),headerItem('feedback','Müşteri Memnuniyeti','/geri-bildirim','right')])
];
const getHeaderMenu = (): HeaderMenuItem[] => {
  try {
    const stored: HeaderMenuItem[] = (JSON.parse(localStorage.getItem('realty-center-header-menu') || 'null') || DEFAULT_HEADER_MENU)
      .map((item: HeaderMenuItem) => item.id === 'library' ? { ...item, path: '/kutuphane' } : item);

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
    if (earning && !earning.children.some((item) => item.id === 'financial-solutions')) {
      earning.children.push(headerItem('financial-solutions','Finansal Çözümler','/finansal-cozumler','right',[],'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=90&w=1400','Bankalar, katılım bankaları ve Eminevim finansman seçenekleri için çözüm talebi oluşturun.'));
    }
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
type ListingItem = {
  id: string; title: string; category: string; propertyType: string; type: string; price: number; currency: string;
  city: string; district: string; neighborhood: string; rooms: string; area: number; image: string;…124461 tokens truncated…nput required value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})} placeholder="Ad Soyad" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><input required type="tel" value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="Telefon" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><input required type="email" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm,email:e.target.value})} placeholder="E-posta" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50" /><div className="grid grid-cols-2 gap-4"><select value={customerForm.type} onChange={e=>setCustomerForm({...customerForm,type:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50"><option>Alıcı</option><option>Satıcı</option><option>Kiralama</option><option>Yatırımcı</option></select><select value={customerForm.status} onChange={e=>setCustomerForm({...customerForm,status:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50"><option>Yeni</option><option>Aktif</option><option>Takipte</option></select></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setShowCustomerForm(false)} className="px-5 py-3 rounded-xl border border-slate-300 font-black text-sm">Vazgeç</button><button type="submit" className="px-5 py-3 rounded-xl bg-red-700 text-white font-black text-sm">Müşteriyi Kaydet</button></div></form></div></div>}
    </div>
  );

  const renderMessages = () => (<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Gelen Mesajlar</h2><p className="text-xs text-slate-500 mt-1">Müşterilerinizle iletişiminizi buradan yönetin.</p></div><span className="text-xs font-black text-red-700 bg-red-100 px-3 py-1.5 rounded-full">{messages.filter((m)=>m.unread).length} okunmamış</span></div><div className="divide-y divide-slate-100">{messages.map((message)=><button key={message.id} onClick={()=>markMessageRead(message.id)} className={`w-full text-left p-5 hover:bg-slate-50 transition ${message.unread?'bg-red-100/40':'bg-white'}`}><div className="flex items-start gap-4"><div className={`w-11 h-11 rounded-full flex items-center justify-center font-black ${message.unread?'bg-red-700 text-white':'bg-slate-200 text-slate-700'}`}>{message.sender.split(' ').map((x)=>x[0]).slice(0,2).join('')}</div><div className="flex-1 min-w-0"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"><h3 className="font-black text-slate-900">{message.sender}</h3><span className="text-[10px] text-slate-400 font-bold">{message.time}</span></div><p className="text-sm font-bold text-slate-700 mt-1">{message.subject}</p><p className="text-xs text-slate-500 mt-1 truncate">{message.text}</p></div>{message.unread&&<span className="w-2.5 h-2.5 rounded-full bg-red-700 mt-2" />}</div></button>)}</div></div>);

  const renderStatistics = () => (<div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[{label:'Toplam Görüntülenme',value:'12.840',change:'+18,4%'},{label:'İlan Dönüşümü',value:'%7,8',change:'+2,1%'},{label:'Telefon Tıklaması',value:'326',change:'+12,6%'},{label:'Favoriye Eklenme',value:'184',change:'+9,3%'}].map(stat=><div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><p className="text-xs font-bold text-slate-500">{stat.label}</p><div className="flex items-end justify-between mt-2"><p className="text-2xl font-black text-slate-900">{stat.value}</p><span className="text-xs font-black text-emerald-600">{stat.change}</span></div></div>)}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">Haftalık Görüntülenme</h2><div className="mt-6 grid grid-cols-7 gap-3 items-end h-56">{[48,62,55,76,68,91,84].map((value,index)=><div key={index} className="flex flex-col items-center justify-end gap-2 h-full"><div className="w-full bg-slate-100 rounded-lg overflow-hidden flex items-end h-44"><div className="w-full bg-red-700 rounded-lg" style={{height:`${value}%`}} /></div><span className="text-[10px] font-bold text-slate-400">{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][index]}</span></div>)}</div></section><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"><h2 className="text-lg font-black text-slate-900">En Çok İlgi Gören İlanlar</h2><div className="mt-4 space-y-4">{myListings.slice(0,5).map((item,index)=><div key={item.id} className="flex items-center gap-3"><span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">{index+1}</span><div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-800 truncate">{item.title}</p><div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-red-700 rounded-full" style={{width:`${90-index*12}%`}} /></div></div><span className="text-xs font-black text-slate-500">{(3240-index*420).toLocaleString('tr-TR')}</span></div>)}</div></section></div></div>);

  const renderProfile = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"><section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 xl:col-span-2"><div className="flex items-center justify-between mb-6"><div><h2 className="text-lg font-black text-slate-900">Profil Bilgileri</h2><p className="text-xs text-slate-500 mt-1">Danışman profilinizde görünen bilgileri yönetin.</p></div>{profileSaved&&<span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Kaydedildi</span>}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{([['name','Ad Soyad'],['email','E-posta'],['phone','Telefon'],['title','Unvan'],['office','Ofis'],['region','Bölge']] as const).map(([key,label])=><div key={key}><label className="text-xs font-black text-slate-700 mb-2 block">{label}</label><input value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700" /></div>)}</div><button onClick={saveProfile} className="mt-6 bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl">Değişiklikleri Kaydet</button></section><section className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white h-fit"><div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-2xl font-black mx-auto">MY</div><h3 className="text-center text-xl font-black mt-4">{profile.name}</h3><p className="text-center text-sm text-slate-400 mt-1">{profile.title}</p><div className="mt-6 pt-5 border-t border-slate-700 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">Aktif İlan</span><strong>{myListings.filter((x)=>x.status==='Aktif').length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Müşteri</span><strong>{customers.length}</strong></div><div className="flex justify-between"><span className="text-slate-400">Ofis</span><strong>{profile.office.replace('Realty Center® ','')}</strong></div></div></section></div>
  );

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-100"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="flex flex-col lg:flex-row gap-6"><aside className="w-full lg:w-64 bg-slate-900 rounded-2xl shadow-xl overflow-hidden h-fit lg:sticky lg:top-24"><div className="p-5 border-b border-slate-700"><div className="flex items-center space-x-3"><div className="w-11 h-11 rounded-full bg-red-700 flex items-center justify-center text-white font-black">MY</div><div><div className="text-white font-black text-sm">{profile.name}</div><div className="text-slate-400 text-xs">Gayrimenkul Danışmanı</div></div></div></div><nav className="p-3 space-y-1">{navItems.map((item)=>{const Icon=item.icon;return <button key={item.key} onClick={()=>setActiveSection(item.key)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-bold text-sm text-left transition ${activeSection===item.key?'bg-red-700 text-white':'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon className="w-4 h-4" /><span>{item.label}</span></button>})}</nav><div className="p-3 border-t border-slate-700"><button onClick={()=>navigate('/panel')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-700 hover:text-white font-bold text-sm text-left transition"><LogOut className="w-4 h-4" /><span>Çıkış Yap</span></button></div></aside><main className="flex-1 min-w-0"><div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-sm text-slate-500 font-semibold">Hoş geldiniz,</p><h1 className="text-2xl sm:text-3xl font-black text-slate-900">{activeTitle.title}</h1><p className="text-sm text-slate-500 mt-1">{activeTitle.description}</p></div><button onClick={()=>{setEditingListingId(null);setNewListing(emptyListing);setShowListingForm(true);}} className="bg-red-700 hover:bg-red-800 text-white font-black px-5 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-700/20 transition"><PlusCircle className="w-5 h-5" /><span>Yeni İlan Ekle</span></button></div></div>{activeSection==='overview'&&renderOverview()}{activeSection==='listings'&&renderListings()}{activeSection==='portfolio'&&renderPortfolio()}{activeSection==='customers'&&renderCustomers()}{activeSection==='messages'&&renderMessages()}{activeSection==='statistics'&&renderStatistics()}{activeSection==='profile'&&renderProfile()}</main></div></div>

      {showListingForm && (<div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/70 p-4"><form onSubmit={handleCreateListing} className="mx-auto max-w-4xl space-y-5 rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-black">{editingListingId ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}</h2><button type="button" onClick={resetListingForm}><X /></button></div><input required value={newListing.title} onChange={e=>setNewListing({...newListing,title:e.target.value})} placeholder="İlan Başlığı" className="w-full rounded-xl border p-3" /><div className="grid gap-3 md:grid-cols-3"><select value={newListing.category} onChange={e=>{const category=e.target.value;setNewListing({...newListing,category,propertyType:LISTING_PROPERTY_TYPES[category as keyof typeof LISTING_PROPERTY_TYPES][0],details:{}})}} className="rounded-xl border p-3">{LISTING_CATEGORIES.map(x=><option key={x}>{x}</option>)}</select><select value={newListing.propertyType} onChange={e=>setNewListing({...newListing,propertyType:e.target.value,details:{}})} className="rounded-xl border p-3">{(LISTING_PROPERTY_TYPES[newListing.category as keyof typeof LISTING_PROPERTY_TYPES]||[]).map(x=><option key={x}>{x}</option>)}</select><select value={newListing.type} onChange={e=>setNewListing({...newListing,type:e.target.value})} className="rounded-xl border p-3">{LISTING_TRANSACTION_TYPES.map(x=><option key={x}>{x}</option>)}</select></div><div className="rounded-xl bg-red-50 p-4"><h3 className="mb-3 font-black text-red-800">{newListing.propertyType} Özellikleri</h3><div className="grid gap-3 sm:grid-cols-2">{(PROPERTY_DETAIL_FIELDS[newListing.propertyType]||[]).map(field=><div key={field.key}><label className="mb-1 block text-xs font-black">{field.label}</label><input type={field.type || 'text'} value={newListing.details[field.key] || ''} onChange={e=>setNewListing({...newListing,details:{...newListing.details,[field.key]:e.target.value},...(field.key === 'roomCount'?{rooms:e.target.value}:{})})} placeholder={field.placeholder||field.label} className="w-full rounded-xl border p-3" /></div>)}</div></div><div className="grid gap-3 md:grid-cols-2"><input required value={newListing.price} onChange={e=>setNewListing({...newListing,price:e.target.value})} placeholder="Fiyat" className="rounded-xl border p-3" /><input required value={newListing.area} onChange={e=>setNewListing({...newListing,area:e.target.value})} placeholder="Toplam alan m²" className="rounded-xl border p-3" /></div><ListingOptionalDetailFields listing={newListing} onChange={(updates) => setNewListing({ ...newListing, ...updates })} /><label><input type="file" accept="image/*" multiple onChange={handleImageChange} /> Görsel seç ({newListing.images.length}/10)</label><div className="flex justify-end gap-3"><button type="button" onClick={resetListingForm}>Vazgeç</button><button type="submit" className="rounded-xl bg-red-700 px-5 py-3 font-black text-white">İlanı Kaydet</button></div></form></div>)}
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

function AmbientMusicButton() {
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
            src="/dglogo.svg"
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
            <Route path="/danisman-panel" element={<AgentDashboard />} />
            <Route path="/super-admin" element={<SuperAdminLoginPage />} />
            <Route path="/super-admin-panel" element={<SuperAdminDashboard />} />
            
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
