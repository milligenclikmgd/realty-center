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
  Heart, Printer, Share2, PlayCircle, Camera, Map, ChevronLeft, ChevronRight, ChevronDown, LocateFixed, PencilRuler, RotateCcw, MapPinned, Flag, Bell, Music2, VolumeX
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

type RealtyVideo = { id: string; source: 'youtube' | 'upload'; url: string; title: string; thumbnail: string; createdAt: string };
const getRealtyVideos = (): RealtyVideo[] => {
  try { return JSON.parse(localStorage.getItem('realty-center-videos') || '[]'); } catch { return []; }
};
const getYoutubeId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)?.[1] || '';
const saveRealtyVideos = (videos: RealtyVideo[]) => { localStorage.setItem('realty-center-videos', JSON.stringify(videos)); window.dispatchEvent(new Event('realty-center-videos-updated')); };

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
  { id: 'ref-1', name: 'Kurumsal Referans', logo: '/rlogo2.png', content: 'Referans kurum ve yürütülen çalışma bilgileri bu alana eklenecektir.' }
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
  headerItem('videos','Videolar','/videolar','left'),
  headerItem('earning','Kazanç Modeli','/icerik/contribution','right',[headerItem('contribution','Katkı Payı','/icerik/contribution','right',[],'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=90&w=1400','Marka, teknoloji, eğitim ve operasyon desteğinin sürdürülebilir biçimde sunulmasını sağlayan şeffaf model.'),headerItem('sharing','Paylaşım Modeli','/icerik/sharing','right',[],'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=90&w=1400','Üretilen değerin katkıyı koruyan açık kurallarla paylaşıldığı kurumsal kazanç yaklaşımı.')]),
  headerItem('ai','Yapay Zeka Asistanı','/ai-karar-asistani','right'), headerItem('library','Realty Kütüphane','/kutuphane','right'), headerItem('why','Neden Realty Center®?','/neden-realty-center','right'), headerItem('franchise','Franchise Ol','/franchise-basvuru','right'), headerItem('advisor','Danışman Ol','/danisman-basvuru','right'), headerItem('contact','İletişim','/iletisim','right',[headerItem('contact-info','İletişim Bilgilerimiz','/iletisim','right'),headerItem('feedback','Müşteri Memnuniyeti','/geri-bildirim','right')])
];
const getHeaderMenu = (): HeaderMenuItem[] => { try { const stored: HeaderMenuItem[] = (JSON.parse(localStorage.getItem('realty-center-header-menu') || 'null') || DEFAULT_HEADER_MENU).map((item: HeaderMenuItem)=>item.id==='library'?{...item,path:'/kutuphane'}:item); const discover = stored.find((item) => item.id === 'discover'); const future = discover?.children.find((item) => item.id === 'future'); const teamContent = DEFAULT_HEADER_MENU.find((item) => item.id === 'discover')?.children.find((item) => item.id === 'future')?.children.find((item) => item.id === 'build-my-team')?.content || ''; const team = future?.children.find((item) => item.id === 'build-my-team'); if (!team && future) future.children.push(headerItem('build-my-team','Kendi Takımını Kur','/icerik/bana-takim-kur','left',[],'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400',teamContent)); else if (team) { team.label = 'Kendi Takımını Kur'; if (!team.content?.includes('Takımınızı kurun')) team.content = teamContent; } const discoverIndex = stored.findIndex((item) => item.id === 'discover'); const videosIndex = stored.findIndex((item) => item.id === 'videos'); if (discoverIndex > videosIndex && videosIndex >= 0) { const reordered = [...stored]; const [discover] = reordered.splice(discoverIndex,1); reordered.splice(videosIndex,0,discover); return reordered; } return stored; } catch { return DEFAULT_HEADER_MENU; } };
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
  city: string; district: string; neighborhood: string; rooms: string; area: number; image: string;
  agentName: string; agentPhone: string; date: string; isFeatured: boolean; details: Record<string, string>;
  images?: string[]; description?: string; videoUrl?: string; virtualTourUrl?: string; mapUrl?: string;
  monthlyFee?: string; deedInfo?: string; technicalFeatures?: string; updatedAt?: string;
};
function getSampleListingDetails(propertyType: string, rooms: string): Record<string, string> {
  if (['Ev','Villa','Daire','Residence','Müstakil Ev'].includes(propertyType)) return { rooms, buildingAge: '1-5', floor: '5', heating: 'Doğalgaz Kombi', furnished: 'Hayır', mortgage: 'Evet', bathroom: '2' };
  if (['Arsa','Tarla'].includes(propertyType)) return { zoning: propertyType === 'Arsa' ? 'Konut' : 'Tarla', deed: 'Müstakil Tapu', landQuality: propertyType, frontage: '35', road: 'Kadastro Yolu', infrastructure: 'Elektrik' };
  if (['Fabrika','Depo'].includes(propertyType)) return { closedArea: propertyType === 'Fabrika' ? '3200' : '1250', ceilingHeight: '8', power: '630', loading: 'Var', crane: 'Var', zoning: 'Var', deed: 'Müstakil Tapu' };
  if (propertyType === 'Otel') return { hotelRooms: '28', beds: '64', stars: '3', buildingAge: '6-10', restaurant: 'Var', pool: 'Yok', deed: 'Müstakil Tapu' };
  return { sections: rooms, buildingAge: '1-5', floor: '8', heating: 'Merkezi', furnished: 'Hayır', parking: 'Var', usage: 'Boş' };
}
const SAMPLE_LISTING_SEEDS: Array<[string, string, string, string, string, number, number]> = [
  ['Daire', 'Konut', 'Satılık', "Çankaya Yaşamkent'te Site İçinde 3+1 Daire", '3+1', 165, 7450000],
  ['Villa', 'Konut', 'Satılık', "Çankaya İncek'te Havuzlu Müstakil Villa", '5+1', 420, 28900000],
  ['Residence', 'Konut', 'Kiralık', "Çankaya Söğütözü'nde Manzaralı Residence", '2+1', 118, 62000],
  ['Müstakil Ev', 'Konut', 'Satılık', "Çankaya Oran'da Bahçeli Müstakil Ev", '4+1', 280, 18400000],
  ['Arsa', 'Arazi', 'Satılık', "Çankaya Karataş'ta Konut İmarlı Arsa", 'Arsa', 650, 9750000],
  ['Tarla', 'Arazi', 'Satılık', "Çankaya Tulumtaş'ta Yola Cepheli Tarla", 'Tarla', 4800, 12600000],
  ['Fabrika', 'Ticari Gayrimenkul', 'Satılık', "Çankaya Sanayi Bölgesinde Üretime Hazır Fabrika", 'Fabrika', 3200, 68500000],
  ['Depo', 'Ticari Gayrimenkul', 'Kiralık', "Çankaya Balgat'ta Yükleme Rampalı Depo", 'Depo', 1250, 185000],
  ['Ofis', 'Ticari Gayrimenkul', 'Kiralık', "Çankaya Çukurambar'da Prestijli Ofis Katı", '6 Bölüm', 310, 118000],
  ['Plaza', 'Ticari Gayrimenkul', 'Satılık', "Çankaya Söğütözü'nde Plaza Katı", 'Plaza', 540, 39800000],
  ['Otel', 'Ticari Gayrimenkul', 'Devren Satılık', "Çankaya Kızılay'da İşletmesi Devam Eden Butik Otel", '28 Oda', 1750, 54500000]
];
const DAYLIGHT_LISTING_IMAGES: Record<string, string[]> = {
  'Daire': ['/ev2.jpg', '/slider/realty-seaside.jpg'],
  'Villa': ['/ev.jpg', '/ev.jpg'],
  'Residence': ['/ev2.jpg', '/slider/realty-seaside.jpg'],
  'Müstakil Ev': ['/ev.jpg', '/ev.jpg'],
  'Arsa': ['/slider/realty-seaside.jpg', '/ev.jpg'],
  'Tarla': ['/slider/realty-seaside.jpg', '/ev.jpg'],
  'Fabrika': ['/slider/realty-city.jpg', '/ev2.jpg'],
  'Depo': ['/slider/realty-city.jpg', '/ev2.jpg'],
  'Ofis': ['/slider/realty-city.jpg', '/ev2.jpg'],
  'Plaza': ['/slider/realty-city.jpg', '/ev2.jpg'],
  'Otel': ['/slider/realty-seaside.jpg', '/ev.jpg']
};
const SAMPLE_LISTINGS: ListingItem[] = [...SAMPLE_LISTING_SEEDS.map(([propertyType, category, type, title, rooms, area, price], index) => {
  const images = DAYLIGHT_LISTING_IMAGES[propertyType] || ['/ev2.jpg', '/slider/realty-seaside.jpg'];
  return ({
  id: `RC-${String(index + 101).padStart(3, '0')}`, title, category, propertyType, type, price, currency: '₺', city: 'Ankara', district: 'Çankaya', neighborhood: ['Yaşamkent', 'İncek', 'Söğütözü', 'Oran', 'Karataş', 'Tulumtaş', 'Balgat', 'Çukurambar', 'Kızılay'][index % 9], rooms, area,
  image: images[0],
  agentName: 'Realty Center® Çankaya', agentPhone: '0532 567 48 45', date: '2026-08-15', isFeatured: index < 4,
  details: getSampleListingDetails(propertyType, rooms),
  images,
  description: `${title}; Realty Center® güvencesiyle sunulan, konumu ve kullanım özellikleriyle öne çıkan seçkin bir gayrimenkuldür. Ayrıntılı bilgi ve yerinde sunum için yetkili danışmanımızla iletişime geçebilirsiniz.`,
  monthlyFee: ['Arsa','Tarla'].includes(propertyType) ? 'Yok' : '2.750 ₺',
  deedInfo: 'Kat Mülkiyetli / Müstakil Tapu',
  technicalFeatures: 'Otopark, güvenlik, ulaşım akslarına yakınlık, yüksek hızlı internet altyapısı',
  updatedAt: '15 Ağustos 2026',
  mapUrl: `https://www.google.com/maps?q=${encodeURIComponent('Çankaya Ankara')}&output=embed`
  });
}),
  { id:'RC-201', title:'Dubai Palm Jumeirah’te Deniz Manzaralı Lüks Residence', category:'Konut', propertyType:'Residence', type:'Satılık', price:1850000, currency:'USD', city:'Dubai', district:'Palm Jumeirah', neighborhood:'Palm West Beach', rooms:'3+1', area:214, image:'/slider/realty-seaside.jpg', images:['/slider/realty-seaside.jpg','/ev2.jpg'], agentName:'Realty Center® International', agentPhone:'+90 532 567 48 45', date:'2026-08-26', isFeatured:true, details:getSampleListingDetails('Residence','3+1'), description:'Dubai Palm Jumeirah’te plaj erişimli, panoramik deniz manzaralı ve seçkin sosyal alanlara sahip uluslararası yatırım fırsatı.', monthlyFee:'1.250 USD', deedInfo:'Freehold Tapu', technicalFeatures:'Özel plaj erişimi, vale, havuz, spor salonu, 7/24 güvenlik', updatedAt:'26 Ağustos 2026', mapUrl:'https://www.google.com/maps?q=Palm+Jumeirah+Dubai&output=embed' },
  { id:'RC-202', title:'İspanya Marbella’da Golf Sahasına Cepheli Akdeniz Villası', category:'Konut', propertyType:'Villa', type:'Satılık', price:1250000, currency:'EUR', city:'Marbella', district:'Nueva Andalucía', neighborhood:'Golf Valley', rooms:'4+1', area:318, image:'/ev.jpg', images:['/ev.jpg','/ev.jpg'], agentName:'Realty Center® International', agentPhone:'+90 532 567 48 45', date:'2026-08-25', isFeatured:true, details:getSampleListingDetails('Villa','4+1'), description:'Marbella Nueva Andalucía’da golf sahasına cepheli, özel havuzlu ve geniş teraslı prestijli Akdeniz villası.', monthlyFee:'320 EUR', deedInfo:'Escritura / Mülkiyet Tapusu', technicalFeatures:'Özel havuz, golf manzarası, kapalı otopark, akıllı ev altyapısı', updatedAt:'25 Ağustos 2026', mapUrl:'https://www.google.com/maps?q=Nueva+Andalucia+Marbella&output=embed' }
];
const formatListingPrice = (price: number, currency: string) => `${price.toLocaleString('tr-TR')} ${currency}`;

const SAMPLE_OFFICES = [
  {
    id: 1,
    name: "Realty Center® Çankaya",
    city: "Ankara",
    district: "Çankaya",
    address: "Çukurambar Mah. Muhsin Yazıcıoğlu Cad. No: 39, Çankaya / Ankara",
    phone: "0532 567 48 45",
    email: "cankaya@realtycenter.com.tr",
    manager: "Mert Yalçın",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=88&w=1200"
  },
  {
    id: 2,
    name: "Realty Center® İncek",
    city: "Ankara",
    district: "Çankaya",
    address: "İncek Bulvarı No: 118, Çankaya / Ankara",
    phone: "0532 567 48 46",
    email: "incek@realtycenter.com.tr",
    manager: "Selin Arslan",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=88&w=1200"
  },
  {
    id: 3,
    name: "Realty Center® Söğütözü",
    city: "Ankara",
    district: "Çankaya",
    address: "Söğütözü Mah. 2176. Cad. No: 7, Çankaya / Ankara",
    phone: "0532 567 48 47",
    email: "sogutozu@realtycenter.com.tr",
    manager: "Burak Demir",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=88&w=1200"
  }
];

const SAMPLE_AGENTS = [
  {
    id: 1,
    name: "Mert Yalçın",
    title: "Gayrimenkul Danışmanı",
    office: "Realty Center® Çankaya",
    city: "Ankara",
    district: "Çankaya",
    phone: "0532 567 48 45",
    email: "mert.yalcin@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=88&w=1200",
    activeListings: 18
  },
  {
    id: 2,
    name: "Selin Arslan",
    title: "Konut Projeleri Uzmanı",
    office: "Realty Center® İncek",
    city: "Ankara",
    district: "Çankaya",
    phone: "0532 567 48 46",
    email: "selin.arslan@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=88&w=1200",
    activeListings: 14
  },
  {
    id: 3,
    name: "Burak Demir",
    title: "Ticari Gayrimenkul Uzmanı",
    office: "Realty Center® Söğütözü",
    city: "Ankara",
    district: "Çankaya",
    phone: "0532 567 48 47",
    email: "burak.demir@realtycenter.com.tr",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=88&w=1200",
    activeListings: 22
  }
];

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
  if (['Arsa','Tarla'].includes(propertyType)) return 'land';
  if (['Fabrika','Depo'].includes(propertyType)) return 'industrial';
  if (propertyType === 'Otel') return 'hotel';
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

const DEFAULT_FEATURED_LISTING_IDS = ['RC-201', 'RC-202', ...SAMPLE_LISTINGS.filter((listing) => listing.price <= 8000000 && listing.currency === '₺').sort((a, b) => a.price - b.price).slice(0, 3).map((listing) => listing.id)];
function getFeaturedListingIds(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem('realty-center-featured-listing-ids') || 'null');
    return Array.isArray(saved) ? [...new Set(['RC-201', 'RC-202', ...saved.filter((id): id is string => typeof id === 'string')])] : DEFAULT_FEATURED_LISTING_IDS;
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
      <div key={noticeOffset} className="network-notice-swap mt-4 space-y-2 text-xs font-bold"><div className="w-fit rounded-full border border-red-100 bg-white/92 px-3 py-2 text-slate-700 shadow-sm"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-700"/>{notices[noticeOffset]}</div><div className="w-fit rounded-full border border-slate-200 bg-white/92 px-3 py-2 text-slate-700 shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-900"/>{notices[(noticeOffset+1)%notices.length]}</div></div>
      <span className="absolute bottom-4 right-4 rounded-full bg-[#CD011E] px-3 py-2 text-[10px] font-black text-white opacity-0 shadow-lg transition group-hover:opacity-100">Haritayı aç →</span>
    </div>
  </button>{worldOpen && <WorldNetworkModal onClose={() => setWorldOpen(false)} />}</>;
}


function ListingCard({ item }: { item: typeof SAMPLE_LISTINGS[0] }) {
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

        <div className="p-4">
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

function ApplicationPage({ type }: { type: 'franchise' | 'agent' }) {
  const franchise = type === 'franchise';
  const backgroundImage = franchise ? '/applications/franchise-handshake.png' : '/applications/advisor-recruitment-v2.webp';
  const fieldClass = 'rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#CD011E] focus:ring-2 focus:ring-[#CD011E]/15';
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <img src={backgroundImage} alt={franchise ? 'Franchise iş ortaklığı' : 'Realty Center® danışmanları'} className="absolute inset-0 h-full w-full object-cover" />
      <div className={`absolute inset-0 ${franchise ? 'bg-white/10' : 'bg-gradient-to-r from-black/28 via-transparent to-black/5'}`} />
      <img src="/rlogo2.png" alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 w-[72vw] max-w-[1050px] -translate-x-1/2 -translate-y-1/2 opacity-[.075] mix-blend-soft-light" />
      <div className={`relative mx-auto flex min-h-screen max-w-[1600px] items-center px-5 py-12 sm:px-10 ${franchise ? 'justify-center' : 'justify-start'}`}>
        <div className={`relative w-full max-w-xl rounded-3xl p-7 shadow-2xl backdrop-blur-sm sm:p-10 ${franchise ? 'rc-navy-frame bg-red-700/95 text-white' : 'border border-white/70 bg-white/96 text-slate-900 shadow-black/30'}`}>
          <div className="absolute right-6 top-5 flex h-14 w-32 items-center justify-center rounded-lg bg-white/95 px-2 shadow-md sm:right-8 sm:top-7">
            <img src="/rlogo2.png" alt="Realty Center®" className="h-11 w-full object-contain" />
          </div>
          <Link to="/" className={`text-sm font-black ${franchise ? 'text-white' : 'text-[#CD011E]'}`}>← Ana Sayfaya Dön</Link>
          <p className={`mt-8 text-xs font-black tracking-widest ${franchise ? 'text-white' : 'text-[#CD011E]'}`}>{franchise ? 'FRANCHISE BAŞVURUSU' : 'DANIŞMAN BAŞVURUSU'}</p>
          <h1 className={`mt-3 text-3xl font-black ${franchise ? 'text-white' : 'text-slate-950'}`}>{franchise ? 'Şehrinde Realty Center® ol.' : 'Realty Center® ailesine katıl.'}</h1>
          <p className={`mt-3 text-sm leading-relaxed ${franchise ? 'text-white/85' : 'text-slate-600'}`}>Bilgilerinizi bırakın, başvurunuz ilgili ekip tarafından değerlendirilsin.</p>
          <form className="mt-8 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Ad Soyad" className={fieldClass} />
            <input required placeholder="Telefon" className={fieldClass} />
            <input required placeholder="E-posta" className={`${fieldClass} sm:col-span-2`} />
            <input placeholder={franchise ? 'İl / İlçe' : 'Bulunduğunuz şehir'} className={`${fieldClass} sm:col-span-2`} />
            <textarea placeholder="Mesajınız" className={`${fieldClass} min-h-28 sm:col-span-2`} />
            <label className={`flex items-start gap-2 text-xs sm:col-span-2 ${franchise ? 'text-white/85' : 'text-slate-600'}`}><input type="checkbox" className="mt-0.5 accent-[#CD011E]" />KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum.</label>
            <button type="button" className={`sm:col-span-2 rounded-xl py-3.5 font-black transition ${franchise ? 'bg-white text-red-700 hover:bg-red-50' : 'bg-[#CD011E] text-white shadow-lg shadow-red-900/20 hover:bg-[#a90019]'}`}>Başvuruyu Gönder</button>
          </form>
        </div>
      </div>
    </div>
  );
}


function LibraryHomePage() {
  const [categories,setCategories] = useState<LibraryCategory[]>(getLibraryCategories);
  useEffect(() => { const refresh=()=>setCategories(getLibraryCategories()); window.addEventListener('realty-center-library-updated',refresh); return()=>window.removeEventListener('realty-center-library-updated',refresh); },[]);
  const latestArticles = categories.flatMap((category) => category.articles.map((article) => ({ category, article }))).sort((a,b) => new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime());
  return <main className="min-h-[70vh] bg-slate-50 py-14"><div className="mx-auto max-w-7xl px-6"><p className="text-xs font-black tracking-[.24em] text-red-700">REALTY CENTER®</p><h1 className="mt-3 text-4xl font-black text-slate-950">Realty Kütüphane</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Sektörel gelişmeleri, mevzuatı, yapay zekâ destekli rehberleri ve yatırım analizlerini tek merkezden takip edin.</p><div className="mt-10 grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><h2 className="text-sm font-black text-slate-900">Kategoriler</h2><span className="text-[10px] font-black text-slate-400">{categories.length} bölüm</span></div><nav className="mt-2">{categories.map((category) => <Link key={category.id} to={`/kutuphane/${category.slug}`} className="group flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor:category.color}}/><span className="flex-1 text-sm font-black text-slate-700 transition group-hover:text-slate-950">{category.title}</span><span className="text-[10px] font-black text-slate-400">{category.articles.length}</span><ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1"/></Link>)}</nav></aside><section><div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-[10px] font-black tracking-[.18em] text-red-700">GÜNCEL İÇERİKLER</p><h2 className="mt-1 text-2xl font-black text-slate-950">Son Eklenen Yazılar</h2></div><span className="hidden text-xs font-bold text-slate-400 sm:block">{latestArticles.length} içerik</span></div>{latestArticles.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{latestArticles.map(({category,article}) => <Link key={article.id} to={`/kutuphane/${category.slug}/${article.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><img src={article.image||'/demo-placeholder.svg'} alt={article.title} className="h-48 w-full bg-slate-100 object-cover transition duration-500 group-hover:scale-105"/><div className="p-5"><div className="flex items-center justify-between gap-3 text-[10px] font-black"><span style={{color:category.color}}>{category.title.toUpperCase()}</span><span className="shrink-0 text-slate-400">{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span></div><h3 className="mt-3 text-lg font-black leading-6 text-slate-900">{article.title}</h3><p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{article.summary||stripRichText(article.content)}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-red-700">İçeriği oku <ArrowRight className="h-3.5 w-3.5"/></span></div></Link>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm font-bold text-slate-500">Henüz yayınlanmış bir içerik bulunmuyor.</div>}</section></div></div></main>;
}

function LibraryCategoryPage() {
  const { slug='' }=useParams();
  const [categories,setCategories]=useState<LibraryCategory[]>(getLibraryCategories);
  useEffect(()=>{const refresh=()=>setCategories(getLibraryCategories());window.addEventListener('realty-center-library-updated',refresh);return()=>window.removeEventListener('realty-center-library-updated',refresh);},[]);
  const category=categories.find((item)=>item.slug===slug);
  if(!category)return <LibraryHomePage/>;
  return <main className="min-h-[70vh] bg-slate-50 py-14"><div className="mx-auto max-w-7xl px-6"><Link to="/kutuphane" className="text-xs font-black text-red-700">← Realty Kütüphane</Link><div className="mt-6 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><div className="h-1.5 w-20 rounded-full" style={{backgroundColor:category.color}}/><h1 className="mt-5 text-4xl font-black text-slate-950">{category.title}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{category.description}</p></div>{category.articles.length?<div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{category.articles.map((article)=><Link key={article.id} to={`/kutuphane/${category.slug}/${article.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><img src={article.image||'/demo-placeholder.svg'} alt={article.title} className="h-48 w-full bg-slate-100 object-cover"/><div className="p-5"><p className="text-[10px] font-black" style={{color:category.color}}>{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</p><h2 className="mt-2 text-lg font-black text-slate-900">{article.title}</h2><p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{article.summary||stripRichText(article.content)}</p><span className="mt-5 inline-flex text-xs font-black" style={{color:category.color}}>İçeriği oku →</span></div></Link>)}</div>:<div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm font-bold text-slate-500">Bu bölüme henüz içerik eklenmedi.</div>}</div></main>;
}

function LibraryArticlePage(){
  const {slug='',articleId=''}=useParams(); const categories=getLibraryCategories(); const category=categories.find((item)=>item.slug===slug); const article=category?.articles.find((item)=>item.id===articleId);
  if(!category||!article)return <LibraryHomePage/>;
  return <main className="min-h-[70vh] bg-slate-50 py-12"><article className="mx-auto max-w-4xl px-6"><Link to={`/kutuphane/${category.slug}`} className="text-xs font-black text-red-700">← {category.title}</Link><div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"><img src={article.image||'/demo-placeholder.svg'} alt={article.title} className="max-h-[480px] w-full bg-slate-100 object-cover"/><div className="p-7 sm:p-10"><p className="text-[10px] font-black tracking-widest" style={{color:category.color}}>{category.title.toUpperCase()} · {new Date(article.publishedAt).toLocaleDateString('tr-TR')}</p><h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{article.title}</h1>{article.summary&&<p className="mt-5 border-l-4 pl-4 text-sm font-semibold leading-7 text-slate-600" style={{borderColor:category.color}}>{article.summary}</p>}<div className="library-rich-content mt-8 text-sm leading-8 text-slate-700" dangerouslySetInnerHTML={{__html:article.content}}/></div></div></article></main>;
}

function RichTextEditor({value,onChange}:{value:string;onChange:(value:string)=>void}){
  const editorRef=useRef<HTMLDivElement>(null);
  const command=(name:string,arg?:string)=>{editorRef.current?.focus();document.execCommand(name,false,arg);onChange(editorRef.current?.innerHTML||'');};
  useEffect(()=>{if(editorRef.current&&editorRef.current.innerHTML!==value)editorRef.current.innerHTML=value;},[value]);
  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white"><div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2"><button type="button" onClick={()=>command('bold')} className="h-8 min-w-8 rounded border bg-white px-2 text-xs font-black">B</button><button type="button" onClick={()=>command('italic')} className="h-8 min-w-8 rounded border bg-white px-2 text-xs italic">I</button><button type="button" onClick={()=>command('underline')} className="h-8 min-w-8 rounded border bg-white px-2 text-xs underline">U</button><button type="button" onClick={()=>command('insertUnorderedList')} className="h-8 rounded border bg-white px-2 text-xs font-bold">• Liste</button><select onChange={(e)=>command('formatBlock',e.target.value)} defaultValue="p" className="h-8 rounded border bg-white px-2 text-xs"><option value="p">Normal</option><option value="h2">Başlık</option><option value="h3">Alt Başlık</option><option value="blockquote">Alıntı</option></select><select onChange={(e)=>command('fontName',e.target.value)} defaultValue="Arial" className="h-8 rounded border bg-white px-2 text-xs"><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option><option>Times New Roman</option></select><label className="flex h-8 items-center gap-1 rounded border bg-white px-2 text-[10px] font-bold">Renk<input type="color" onChange={(e)=>command('foreColor',e.target.value)} className="h-5 w-6"/></label><button type="button" onClick={()=>{const url=prompt('Bağlantı adresi');if(url)command('createLink',url);}} className="h-8 rounded border bg-white px-2 text-xs font-bold">Bağlantı</button><button type="button" onClick={()=>command('removeFormat')} className="h-8 rounded border bg-white px-2 text-xs font-bold">Biçimi temizle</button></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(e)=>onChange(e.currentTarget.innerHTML)} className="min-h-64 p-4 text-sm leading-7 text-slate-800 outline-none" data-placeholder="Yazı içeriğini buraya girin..."/></div>;
}

function LegalInfoPage({ title, description }: { title: string; description: string }) {
  return <main className="min-h-[65vh] bg-slate-50 py-14"><div className="mx-auto max-w-4xl px-6"><Link to="/" className="text-xs font-black text-red-700">← Ana sayfaya dön</Link><article className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><p className="text-[10px] font-black tracking-[.2em] text-red-700">REALTY CENTER® TÜRKİYE</p><h1 className="mt-3 text-3xl font-black text-slate-900">{title}</h1><p className="mt-6 text-sm leading-7 text-slate-600">{description}</p><p className="mt-5 text-sm leading-7 text-slate-600">Bu metin; kullanıcıların bilgilendirilmesi, kişisel verilerin korunması, güvenli kullanım ve şeffaf hizmet ilkelerimizin açıklanması amacıyla hazırlanmıştır. Ayrıntılı bilgi veya başvuru için info@realtycenter.com.tr adresinden bizimle iletişime geçebilirsiniz.</p><p className="mt-8 border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">Son güncelleme: 24 Ağustos 2026</p></article></div></main>;
}

function SiteSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = new URLSearchParams(location.search).get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const searchablePages = [
    ['Gayrimenkul Rehberi','Rehber','Ev alma, satma ve kiralama kararları; tapu ve sözleşme süreçleri, bölgesel fiyat hareketleri ve doğru karşılaştırma yöntemleri.','/blog/rehber'],
    ['Gayrimenkul Hukuku','Realty Kütüphane','Tapu, sözleşme, yetkilendirme ve yasal süreçlere dair içerikler.','/blog/hukuk'],
    ['Sektörden Haberler','Realty Kütüphane','Gayrimenkul piyasasındaki güncel gelişmeler ve gündem notları.','/blog/haberler'],
    ['Yatırım Analizleri','Realty Kütüphane','Bölge, metrekare fiyatı, kira getirisi ve yatırım fırsatları.','/blog/analizler'],
    ['Hakkımızda','Kurumsal','Realty Center® kurumsal vizyonu, güven anlayışı, uzmanlık ve franchise ağı.','/kurumsal/hakkimizda'],
    ['Yönetim Kurulumuz','Kurumsal','Stratejik karar alma, kurumsal gelişim ve kalite standartları.','/kurumsal/yonetim-kurulu'],
    ['Referanslarımız','Kurumsal','Ofis ağı, danışman ağı, iş ortaklıkları ve tamamlanan portföy eşleştirmeleri.','/kurumsal/referanslar'],
    ['Neden Realty Center®?','Kurumsal','Teknolojik altyapı, eğitim, tanıtım, franchise ve danışmanlık avantajları.','/neden-realty-center'],
    ['Ofislerimiz','Kurumsal','Türkiye genelindeki Realty Center® franchise ofisleri ve iletişim bilgileri.','/ofislerimiz'],
    ['Danışmanlarımız','Kurumsal','Uzman gayrimenkul danışmanları, şehir ve ilçe bazlı danışman arama.','/danismanlarimiz'],
    ['Projelerimiz','Gayrimenkul','Yeni konut, ticari yatırım ve yaşam projeleri.','/projelerimiz'],
    ['Videolar','Medya','YouTube videoları, proje tanıtımları, gayrimenkul rehberleri ve Realty Center® TV içerikleri.','/videolar'],
    ['Harita ile Ara','Gayrimenkul','Türkiye haritasından şehir, ilçe ve konuma göre ilan arama.','/harita-ile-ara'],
    ['Yapay Zeka Gayrimenkul Asistanı','Teknoloji','Uygun ilanlar, metrekare fiyatı, kira getirisi, yatırım geri dönüşü ve otomatik değerleme.','/ai-karar-asistani'],
    ['Franchise Ol','Başvuru','Realty Center® franchise ağına katılma ve ofis başvurusu.','/franchise-basvuru'],
    ['Danışman Ol','Başvuru','Gayrimenkul danışmanlığı kariyeri ve başvuru formu.','/danisman-basvuru'],
    ['KVKK Aydınlatma Metni','Yasal','Kişisel verilerin işlenmesi, saklanması ve kullanıcı hakları.','/kvkk'],
    ['Çerez Politikası','Yasal','Zorunlu, işlevsel ve analitik çerezlerin kullanım amaçları.','/cerez-politikasi'],
    ['Gizlilik Politikası','Yasal','Kullanıcı bilgilerinin gizliliği ve korunması.','/gizlilik-politikasi'],
    ['Kullanım Koşulları','Yasal','Site kullanımı, içerikler ve kullanıcı sorumlulukları.','/kullanim-kosullari']
  ].map(([title,category,content,to]) => ({ title, category, content, to }));
  const index = [
    ...searchablePages,
    ...getLibraryCategories().flatMap((category) => [{ title: category.title, category: 'Realty Kütüphane', content: category.description, to: `/kutuphane/${category.slug}` }, ...category.articles.map((article) => ({ title: article.title, category: category.title, content: `${article.summary} ${stripRichText(article.content)}`, to: `/kutuphane/${category.slug}/${article.id}` }))]),
    ...SAMPLE_LISTINGS.map((item) => ({ title: item.title, category: 'İlan', content: `${item.type} ${item.propertyType} ${item.city} ${item.district} ${item.neighborhood} ${item.rooms} ${item.area} metrekare ${item.description || ''}`, to: `/ilan/${item.id}` })),
    ...SAMPLE_AGENTS.map((item) => ({ title: item.name, category: 'Danışman', content: `${item.title} ${item.city} ${item.district} ${item.office} ${item.email}`, to: '/danismanlarimiz' })),
    ...SAMPLE_OFFICES.map((item) => ({ title: item.name, category: 'Ofis', content: `${item.city} ${item.district} ${item.address} ${item.manager}`, to: '/ofislerimiz' })),
    ...WHY_REALTY_CENTER_ITEMS.map((content) => ({ title: content, category: 'Neden Realty Center®?', content, to: '/neden-realty-center' }))
  ];
  const terms = initialQuery.toLocaleLowerCase('tr-TR').split(/\s+/).filter(Boolean);
  const results = terms.length ? index.filter((item) => { const haystack = `${item.title} ${item.category} ${item.content}`.toLocaleLowerCase('tr-TR'); return terms.every((term) => haystack.includes(term)); }) : [];
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (query.trim()) navigate(`/arama?q=${encodeURIComponent(query.trim())}`); };
  return <div className="min-h-[65vh] bg-slate-50 py-12"><div className="mx-auto max-w-5xl px-6"><p className="text-xs font-black tracking-widest text-red-700">REALTY CENTER® SİTE İÇİ ARAMA</p><h1 className="mt-2 text-3xl font-black text-slate-900">Tüm sitede arayın</h1><form onSubmit={submit} className="mt-6 flex overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İlan, rehber yazısı, danışman, ofis veya sayfa ara..." className="min-w-0 flex-1 px-5 py-4 text-sm font-semibold outline-none"/><button className="bg-red-700 px-6 text-sm font-black text-white">Ara</button></form><div className="mt-7 flex items-center justify-between border-b border-slate-200 pb-3"><h2 className="font-black text-slate-900">“{initialQuery}” sonuçları</h2><span className="text-xs font-bold text-slate-500">{results.length} sonuç</span></div>{results.length ? <div className="divide-y divide-slate-200">{results.map((item,index) => <Link key={`${item.to}-${item.title}-${index}`} to={item.to} className="group block py-5"><span className="text-[10px] font-black uppercase tracking-widest text-red-700">{item.category}</span><h3 className="mt-1 text-lg font-black text-slate-900 group-hover:text-red-700">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.content}</p></Link>)}</div> : <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-3 text-sm font-black text-slate-700">Aramanızla eşleşen içerik bulunamadı.</p><p className="mt-1 text-xs text-slate-500">Daha kısa veya farklı bir kelime deneyebilirsiniz.</p></div>}</div></div>;
}

function DesktopHeaderNode({ item, root = true, align = 'left', menuLinkClass }: { item: HeaderMenuItem; root?: boolean; align?: 'left' | 'right'; menuLinkClass: (to: string) => string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = item.children.length > 0;
  if (!hasChildren) return <Link to={item.path} className={root ? menuLinkClass(item.path) : 'flex items-center rounded-xl px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-red-50 hover:text-red-700'}>{item.label}</Link>;
  const enter = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false),120); };
  return <div className="relative z-30" onMouseEnter={enter} onMouseLeave={leave}><Link to={item.path} className={root ? menuLinkClass(item.path) : `flex items-center justify-between rounded-xl px-4 py-3 text-xs font-black transition ${open ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-red-50 hover:text-red-700'}`}><span>{item.label}</span><ChevronDown className={`ml-1 h-3 w-3 transition duration-200 ${root ? (open ? 'rotate-180' : '') : '-rotate-90'}`}/></Link><div className={`absolute z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition duration-200 ${open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'} ${root ? `top-full ${align === 'right' ? 'right-0' : 'left-0'}` : 'left-full top-0'}`}>{item.children.map((child) => <DesktopHeaderNode key={child.id} item={child} root={false} align={align} menuLinkClass={menuLinkClass}/>)}</div></div>;
}

function MobileHeaderNodes({ items, close, depth = 0 }: { items: HeaderMenuItem[]; close: () => void; depth?: number }) {
  return <>{items.map((item) => <React.Fragment key={item.id}><Link onClick={close} to={item.path} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-white transition hover:bg-white/20 ${depth ? 'border-white/10 bg-black/10 text-xs' : 'border-white/15 bg-white/10 text-sm'}`} style={{ marginLeft: `${depth * 8}px` }}><span>{depth ? '↳ ' : ''}{item.label}</span>{item.children.length > 0 && <ChevronDown className="h-3.5 w-3.5"/>}</Link>{item.children.length > 0 && <MobileHeaderNodes items={item.children} close={close} depth={depth + 1}/>}</React.Fragment>)}</>;
}

function Header({ language, setLanguage }: { language: StaticLanguage; setLanguage: (language: StaticLanguage) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [siteSearch, setSiteSearch] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const [managedMenu, setManagedMenu] = useState<HeaderMenuItem[]>(getHeaderMenu);
  const location = useLocation();
  const navigate = useNavigate();
  const close = () => setMobileOpen(false);
  const t = STATIC_LANGUAGES[language];
  const leftItems = managedMenu.filter((item) => item.side === 'left');
  const rightItems = managedMenu.filter((item) => item.side === 'right');
  const leftLinks = leftItems.map((item) => [item.label,item.path]);
  const rightLinks = rightItems.map((item) => [item.label,item.path]);
  const isListingDetail = location.pathname.startsWith('/ilan/');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const refreshMenu = () => setManagedMenu(getHeaderMenu());
    window.addEventListener('realty-center-header-updated', refreshMenu);
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0);
      setShowCompactHeader(window.scrollY > 215);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('realty-center-header-updated', refreshMenu);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [location.pathname]);

  const menuLinkClass = (_to: string) =>
    'realty-header-link relative flex h-full min-h-0 items-center justify-center px-1.5 text-center text-[10px] font-black leading-[1.15] text-white transition lg:text-[11px] 2xl:px-2 2xl:text-xs';
  const submitSiteSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!siteSearch.trim()) return;
    navigate(`/arama?q=${encodeURIComponent(siteSearch.trim())}`);
    setSearchOpen(false);
  };

  if (isListingDetail) {
    return (
      <header className="relative z-40 w-full border-b border-red-800 bg-[#CD011E] text-white shadow-md">
        <div className="mx-auto flex min-h-[64px] max-w-[1920px] items-stretch px-3 lg:px-6">
          <Link to="/" onClick={close} className="my-2 flex w-[150px] shrink-0 items-center justify-center rounded-sm bg-white px-3 shadow-sm lg:w-[175px]" aria-label="Realty Center® ana sayfa">
            <img src="/rlogotr.png" alt="Realty Center® Türkiye" className="h-11 w-full object-contain lg:h-12" />
          </Link>
          <nav className="ml-3 hidden min-w-0 flex-1 items-stretch xl:grid" style={{ gridTemplateColumns: 'repeat(14,minmax(0,1fr))' }}>
            {[...leftLinks, ...rightLinks].map(([label, to]) => <Link key={`detail-${label}-${to}`} to={to} className="flex items-center justify-center px-1 text-center text-[10px] font-black leading-tight text-white transition hover:bg-white/12 2xl:text-[11px]">{label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-2 xl:hidden">
            <Link to="/ilanlarimiz?all=1" className="hidden rounded-md border border-white/40 px-3 py-2 text-xs font-black sm:inline-flex">İlanlarımız</Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menüyü aç" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/40 bg-white/10">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {mobileOpen && <nav className="grid grid-cols-2 gap-1.5 border-t border-white/15 px-3 py-3 text-xs font-black xl:hidden">{[...leftLinks, ...rightLinks].map(([label, to]) => <Link key={`detail-mobile-${label}-${to}`} onClick={close} to={to} className="rounded-md bg-white/10 px-3 py-2.5">{label}</Link>)}</nav>}
      </header>
    );
  }

  return (
    <header className="realty-header relative isolate z-40 w-full text-white">
      <div className={`realty-compact-header fixed inset-x-0 top-0 z-[60] hidden lg:block ${showCompactHeader ? 'is-visible' : ''}`}>
        <nav className="mx-auto grid min-h-[52px] w-full max-w-[1920px] items-stretch px-6 2xl:px-10" style={{ gridTemplateColumns: 'repeat(14,minmax(0,1fr))' }}>
          {[...leftLinks, ...rightLinks].map(([label, to]) => <Link key={`compact-${label}-${to}`} to={to} className="realty-compact-link flex items-center justify-center px-2 text-center text-[10px] font-black leading-tight text-white 2xl:text-xs">{label}</Link>)}
        </nav>
      </div>
      <div className="realty-header-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} />
      <div className="realty-header-top-space">
        <div className="realty-header-social">
          {SOCIAL_MEDIA_LINKS.map((social) => <a key={social.name} href="#" aria-label={social.name} title={social.name}><img src={social.icon} alt="" /></a>)}
        </div>
        <div className="realty-header-contact">
          <div className="flex items-center gap-1.5">
            {searchOpen && <form onSubmit={submitSiteSearch} className="header-search-pop flex w-[min(320px,36vw)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"><input autoFocus value={siteSearch} onChange={(event) => setSiteSearch(event.target.value)} placeholder="Site içinde ara..." className="min-w-0 flex-1 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"/><button type="submit" className="shrink-0 bg-[#CD011E] px-3 text-[10px] font-black text-white">Ara</button></form>}
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Site içinde ara" className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-700/15 bg-white text-[#CD011E] transition hover:border-red-700/40 hover:shadow-sm"><Search className="h-3.5 w-3.5" /></button>
          </div>
          <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-white text-[9px] font-black shadow-sm sm:flex">{(['tr','en','ar'] as StaticLanguage[]).map((item)=><button key={item} onClick={()=>setLanguage(item)} className={`px-2 py-1.5 transition ${language===item?'bg-[#CD011E] text-white':'text-slate-600 hover:bg-red-50'}`}>{item.toUpperCase()}</button>)}</div>
          <Link to="/panel" className="hidden rounded-md border border-red-700/20 bg-white px-2.5 py-1.5 text-[10px] font-black text-[#CD011E] shadow-sm transition hover:border-red-700/50 sm:inline-flex">{t.panel}</Link>
          <a href="tel:+905325674845" aria-label="Realty Center® telefon" className="realty-header-contact-item">
            <Phone className="h-3.5 w-3.5" />
            <span>0532 567 48 45</span>
          </a>
          <a href="https://wa.me/905325674845" target="_blank" rel="noreferrer" aria-label="WhatsApp ile iletişim" className="realty-header-contact-icon realty-header-whatsapp">
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="realty-header-bar">
        <nav className="realty-header-desktop mx-auto hidden w-full max-w-[1920px] grid-cols-[minmax(0,1fr)_210px_minmax(0,1fr)] items-center px-4 xl:grid 2xl:px-8">
          <div className="grid min-w-0 grid-cols-7 items-stretch">
            {leftItems.map((item) => <DesktopHeaderNode key={item.id} item={item} align={item.id === 'discover' ? 'right' : 'left'} menuLinkClass={menuLinkClass}/>)}
          </div>

          <Link to="/" onClick={close} className={`realty-header-emblem ${isHomePage ? '' : 'realty-header-emblem-inner'}`} aria-label="Realty Center® ana sayfa">
            <span className="realty-header-led" />
            <span className="realty-header-disc">
              <img src="/rlogotr.png" alt="Realty Center® Türkiye" className="realty-header-main-logo object-contain" />
            </span>
          </Link>

          <div className="grid min-w-0 grid-cols-7 items-stretch">
            {rightItems.map((item) => <DesktopHeaderNode key={item.id} item={item} align="right" menuLinkClass={menuLinkClass}/>)}
          </div>
        </nav>

        <div className="relative z-10 flex min-h-[76px] items-center justify-between px-4 xl:hidden">
          <Link to="/" onClick={close} className="realty-header-mobile-logo">
            <img src="/rlogo2.png" alt="Realty Center® Türkiye" className="h-14 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/panel" className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#CD011E] shadow-lg">{t.panel}</Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menüyü aç" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 text-white">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
      </div>

      {mobileOpen && <nav className="realty-header-mobile-menu grid grid-cols-2 gap-2 px-4 py-4 font-black xl:hidden"><MobileHeaderNodes items={managedMenu} close={close}/></nav>}
    </header>
  );
}

function DiscoverEarningPage({ section }: { section: 'discover' | 'earning' }) {
  const { slug = '' } = useParams();
  const pages: Record<string, { title: string; eyebrow: string; image: string; text: string }> = {
    'egitim': { title: 'Eğitim', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=90&w=1400', text: 'Realty Center® eğitim programları; gayrimenkul danışmanlarının mesleki bilgi, saha becerisi ve müşteri deneyimi alanlarında sürekli gelişmesini destekler. Temel başlangıç eğitimlerinden ileri seviye satış, pazarlama ve mevzuat çalışmalarına kadar planlı bir öğrenme yolculuğu sunar.' },
    'gelecegim-icin': { title: 'Geleceğim İçin', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=90&w=1400', text: 'Gayrimenkul sektöründe kendi kariyerini kurmak isteyen profesyonellere güçlü marka desteği, gelişim olanakları ve sürdürülebilir bir iş modeli sunuyoruz. Deneyiminiz ne olursa olsun, doğru eğitim ve mentorlukla geleceğinizi bugünden şekillendirebilirsiniz.' },
    'sistem-ve-modeller': { title: 'Sistem ve Modeller', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=90&w=1400', text: 'Realty Center® sistemleri; portföy yönetimi, müşteri takibi, pazarlama, raporlama ve ekip çalışmasını ortak standartlarda birleştirir. Kanıtlanmış iş modellerimiz danışmanların zamanını verimli kullanmasına ve ölçülebilir sonuçlar üretmesine yardımcı olur.' },
    'gruplar': { title: 'Gruplar', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=90&w=1400', text: 'Uzmanlık, bölge ve ilgi alanlarına göre oluşturulan çalışma grupları sayesinde bilgi paylaşımı ve iş birliği güçlenir. Danışmanlarımız ortak portföy, deneyim ve fırsatları güvene dayalı bir ağ içerisinde paylaşır.' },
    'realty-center-kulturu': { title: 'Realty Center® Kültürü', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=90&w=1400', text: 'Önce Güven anlayışımız; şeffaflık, dayanışma, sürekli gelişim ve başarıyı paylaşma değerleri üzerine kuruludur. Realty Center® kültürü yalnızca bir çalışma biçimi değil, müşterilerimiz ve iş ortaklarımızla kurduğumuz uzun vadeli ilişkinin temelidir.' },
    'dijital-emlakcilik': { title: 'Dijital Emlakçılık', eyebrow: 'KEŞFET', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=90&w=1400', text: 'Dijital portföy yönetimi, veri odaklı analiz, yapay zekâ destekli arama ve güçlü çevrim içi pazarlama araçlarıyla gayrimenkul danışmanlığını geleceğe taşıyoruz. Teknoloji, danışmanın yerini almak yerine uzmanlığını daha görünür ve etkili hâle getirir.' },
    'katki-payi': { title: 'Katkı Payı', eyebrow: 'KAZANÇ MODELİ', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=90&w=1400', text: 'Katkı payı modeli; marka altyapısı, teknoloji, eğitim, pazarlama ve operasyon desteğinin sürdürülebilir biçimde sunulmasını sağlayan şeffaf bir sistemdir. Danışman ve ofislerin aldığı hizmetlerle doğru orantılı, anlaşılır ve planlanabilir bir yapı hedeflenir.' },
    'paylasim-modeli': { title: 'Paylaşım Modeli', eyebrow: 'KAZANÇ MODELİ', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=90&w=1400', text: 'Realty Center® paylaşım modeli, üretilen değerin adil ve açık kurallarla paylaşılmasını esas alır. Ortak portföy çalışmaları, yönlendirmeler ve ekip başarıları; tarafların katkısını koruyan kurumsal sistem içerisinde yönetilir.' },
    'keplemek': { title: 'Keplemek', eyebrow: 'KAZANÇ MODELİ', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=90&w=1400', text: 'Kepleme sistemi, belirlenen üretim seviyesine ulaşan danışmanın kazanç paylaşımında daha avantajlı bir döneme geçmesini ifade eder. Hedef; yüksek performansı ödüllendiren, danışmanın büyümesini destekleyen ve kazanç potansiyelini artıran sürdürülebilir bir model oluşturmaktır.' }
  };
  const fallback = section === 'discover' ? pages.egitim : pages['katki-payi'];
  const page = pages[slug] || fallback;
  return <main className="min-h-[70vh] bg-slate-50 py-12 lg:py-16"><div className="mx-auto max-w-6xl px-6"><div className="grid overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2"><img src={page.image} alt={page.title} className="h-72 w-full object-cover lg:h-full lg:min-h-[520px]"/><article className="flex flex-col justify-center p-8 sm:p-12"><p className="text-xs font-black tracking-[.22em] text-red-700">{page.eyebrow}</p><h1 className="mt-4 text-4xl font-black text-slate-900">{page.title}</h1><div className="mt-6 h-1 w-16 rounded-full bg-red-700"/><p className="mt-7 text-sm leading-8 text-slate-600">{page.text}</p><Link to={section === 'discover' ? '/danisman-basvuru' : '/franchise-basvuru'} className="mt-8 inline-flex w-fit items-center text-sm font-black text-red-700">Daha fazla bilgi alın <ArrowRight className="ml-2 h-4 w-4"/></Link></article></div></div></main>;
}

function ManagedHeaderContentPage() {
  const { id = '' } = useParams();
  const [menus, setMenus] = useState<HeaderMenuItem[]>(getHeaderMenu);
  useEffect(() => { const refresh = () => setMenus(getHeaderMenu()); window.addEventListener('realty-center-header-updated', refresh); return () => window.removeEventListener('realty-center-header-updated', refresh); }, []);
  const page = findHeaderItem(menus, id);
  if (!page) return <main className="min-h-[60vh] bg-slate-50 py-16"><div className="mx-auto max-w-4xl px-6 text-center"><h1 className="text-3xl font-black text-slate-900">İçerik bulunamadı</h1><Link to="/" className="mt-5 inline-flex font-black text-red-700">Ana sayfaya dön</Link></div></main>;
  return <main className="min-h-[70vh] bg-slate-50 py-12 lg:py-16"><div className="mx-auto max-w-6xl px-6"><div className="grid overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2"><img src={page.image || '/rlogo2.png'} alt={page.label} className="h-72 w-full bg-slate-100 object-cover lg:h-full lg:min-h-[500px]"/><article className="flex flex-col justify-center p-8 sm:p-12"><p className="text-xs font-black tracking-[.22em] text-red-700">REALTY CENTER®</p><h1 className="mt-4 text-4xl font-black text-slate-900">{page.label}</h1><div className="mt-6 h-1 w-16 rounded-full bg-red-700"/><p className="mt-7 whitespace-pre-line text-sm leading-8 text-slate-600">{page.content || 'Bu sayfanın içeriği yönetim panelinden eklenecektir.'}</p></article></div></div></main>;
}

function CustomerFeedbackPage() {
  const [type, setType] = useState<CustomerFeedback['type']>('Memnuniyet');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '', agent: '', office: '' });
  const types: CustomerFeedback['type'][] = ['Memnuniyet', 'Danışman Değerlendirmesi', 'Ofis Değerlendirmesi', 'Şikâyet', 'Dilek / Öneri'];
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const item: CustomerFeedback = { id: `GB-${Date.now()}`, type, ...form, rating: type === 'Şikâyet' || type === 'Dilek / Öneri' ? 0 : rating, status: 'Yeni', createdAt: new Date().toISOString() };
    saveCustomerFeedback([item, ...getCustomerFeedback()]);
    setSubmitted(true);
    setForm({ name: '', phone: '', email: '', subject: '', message: '', agent: '', office: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100';
  return <div className="min-h-screen bg-slate-50 py-10 lg:py-14"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="mb-8 text-center"><span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-[10px] font-black tracking-[.18em] text-red-700">MÜŞTERİ DENEYİMİ</span><h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">Görüşünüz bizim için değerli</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">Memnuniyetinizi paylaşabilir, danışmanlarımızı ve ofislerimizi değerlendirebilir; şikâyet, dilek ve önerilerinizi doğrudan genel merkezimize iletebilirsiniz.</p></div>{submitted && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600"/><h2 className="mt-2 font-black text-emerald-900">Geri bildiriminiz alındı</h2><p className="mt-1 text-xs text-emerald-700">Kaydınız ilgili birime iletildi. Gerekli görülürse verdiğiniz iletişim bilgileri üzerinden sizinle irtibat kurulacaktır.</p></div>}<div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-[.8fr_1.2fr]"><aside className="bg-gradient-to-br from-[#b9001c] to-[#700012] p-7 text-white lg:p-10"><img src="/rlogo2.png" alt="Realty Center® Önce Güven" className="h-20 w-auto rounded-lg bg-white object-contain p-2"/><h2 className="mt-8 text-2xl font-black">Size kulak veriyoruz</h2><p className="mt-3 text-sm leading-6 text-red-50/85">Her bildirim kayıt altına alınır, ilgili ofis veya birime yönlendirilir ve hizmet kalitemizin geliştirilmesinde değerlendirilir.</p><div className="mt-8 space-y-3 text-xs font-bold">{['Gizlilikle değerlendirme','Genel merkez takibi','Danışman ve ofis bazlı ölçüm','Çözüm odaklı geri dönüş'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 p-3"><CheckCircle2 className="h-4 w-4"/>{item}</div>)}</div></aside><form onSubmit={submit} className="p-6 sm:p-8 lg:p-10"><h2 className="text-lg font-black text-slate-900">Geri bildirim türünü seçin</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{types.map((item) => <button type="button" key={item} onClick={() => setType(item)} className={`rounded-xl border px-3 py-3 text-xs font-black transition ${type === item ? 'border-red-700 bg-red-700 text-white shadow-lg shadow-red-700/20' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-red-300'}`}>{item}</button>)}</div>{!['Şikâyet','Dilek / Öneri'].includes(type) && <div className="mt-6"><label className="text-xs font-black text-slate-700">Genel değerlendirmeniz</label><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} yıldız`} className={`text-3xl transition hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}>★</button>)}</div></div>}<div className="mt-6 grid gap-4 sm:grid-cols-2"><input required value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="Adınız Soyadınız *" className={fieldClass}/><input required value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} placeholder="Telefonunuz *" className={fieldClass}/><input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} placeholder="E-posta adresiniz" className={fieldClass}/>{type === 'Danışman Değerlendirmesi' ? <select required value={form.agent} onChange={(e) => setForm({...form,agent:e.target.value})} className={fieldClass}><option value="">Danışman seçin *</option>{SAMPLE_AGENTS.map((agent) => <option key={agent.id} value={agent.name}>{agent.name}</option>)}</select> : type === 'Ofis Değerlendirmesi' ? <select required value={form.office} onChange={(e) => setForm({...form,office:e.target.value})} className={fieldClass}><option value="">Ofis seçin *</option>{SAMPLE_OFFICES.map((office) => <option key={office.id} value={office.name}>{office.name}</option>)}</select> : <input value={form.subject} onChange={(e) => setForm({...form,subject:e.target.value})} placeholder="Konu" className={fieldClass}/>}<input value={form.subject} onChange={(e) => setForm({...form,subject:e.target.value})} placeholder="Geri bildirim başlığı" className={`${fieldClass} sm:col-span-2`}/><textarea required rows={6} value={form.message} onChange={(e) => setForm({...form,message:e.target.value})} placeholder="Görüş, şikâyet, dilek veya önerinizi ayrıntılı biçimde yazın *" className={`${fieldClass} resize-none sm:col-span-2`}/></div><label className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-red-700"/><span>Geri bildirimin değerlendirilmesi ve gerektiğinde tarafımla iletişim kurulması amacıyla bilgilerimin işlenmesini kabul ediyorum. <Link to="/kvkk" className="font-black text-red-700">KVKK metni</Link></span></label><button className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-700/20 transition hover:bg-red-800">Geri Bildirimi Gönder</button></form></div></div></div>;
}

function Footer({ openDrawer }: { openDrawer: (type: 'franchise' | 'agent') => void }) {
  const footerGroups = [
    { title: 'Kurumsal', links: [['Hakkımızda','/kurumsal/hakkimizda'],['Misyonumuz ve Vizyonumuz','/kurumsal/misyon-vizyon'],['Yönetim Kadromuz','/kurumsal/ekibimiz'],['Belgelerimiz','/kurumsal/belgelerimiz'],['Referanslarımız','/kurumsal/referanslar'],['İş Ortaklarımız','/kurumsal/is-ortaklarimiz']] },
    { title: 'Gayrimenkul', links: [['İlanlarımız','/ilanlarimiz?all=1'],['Projelerimiz','/projelerimiz'],['Ofislerimiz','/ofislerimiz'],['Danışmanlarımız','/danismanlarimiz'],['Harita ile Ara','/harita-ile-ara']] },
    { title: 'Kariyer ve İş Ortaklığı', links: [['Franchise Ol','/franchise-basvuru'],['Danışman Ol','/danisman-basvuru'],['Realty Kütüphane','/kutuphane'],['Hukuk & Mevzuat','/kutuphane/hukuk-mevzuat'],['Yapay Zeka Asistanı','/ai-karar-asistani']] },
    { title: 'Gizlilik ve Kullanım', links: [['KVKK Aydınlatma Metni','/kvkk'],['Gizlilik Politikası','/gizlilik-politikasi'],['Çerez Politikası','/cerez-politikasi'],['Kullanım Koşulları','/kullanim-kosullari'],['İlan Yayınlama Kuralları','/ilan-yayinlama-kurallari']] }
  ];
  return (
    <footer className="border-t-4 border-red-700 bg-[#f7f7f7] text-slate-600">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-5">
          {footerGroups.map((group) => <div key={group.title}><h4 className="mb-4 text-sm font-black text-slate-900">{group.title}</h4><ul className="space-y-2.5 text-xs font-semibold">{group.links.map(([label,to]) => <li key={label}><Link to={to} className="transition hover:text-red-700">{label}</Link></li>)}</ul></div>)}
          <div><h4 className="mb-4 text-sm font-black text-slate-900">Bizi Takip Edin</h4><div className="flex flex-wrap gap-2">{SOCIAL_MEDIA_LINKS.map((social) => <a key={social.name} href="#" aria-label={social.name} title={social.name} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-red-300"><img src={social.icon} alt="" className="h-4 w-4"/></a>)}</div><button onClick={() => openDrawer('franchise')} className="mt-5 text-xs font-black text-red-700">Franchise başvurusu →</button><button onClick={() => openDrawer('agent')} className="mt-2 block text-xs font-black text-red-700">Danışman başvurusu →</button></div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-slate-200 pt-7 md:grid-cols-3">
          <a href="tel:+905325674845" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-white"><Phone className="h-5 w-5"/></span><span><b className="block text-xs text-red-700">Müşteri Hizmetleri</b><strong className="text-sm text-slate-900">0532 567 48 45</strong></span></a>
          <a href="mailto:info@realtycenter.com.tr" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-white"><Mail className="h-5 w-5"/></span><span><b className="block text-xs text-red-700">Yardım ve İletişim</b><strong className="text-sm text-slate-900">info@realtycenter.com.tr</strong></span></a>
          <div className="flex gap-2"><a href="https://parselsorgu.tkgm.gov.tr/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-800 hover:border-red-300">TKGM Parsel Sorgulama ↗</a><a href="https://www.mevzuat.gov.tr/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-800 hover:border-red-300">Emlak Mevzuatı ↗</a></div>
        </div>

        <div className="mt-7 rounded-lg border border-slate-200 bg-white p-4 text-[10px] leading-relaxed text-slate-500">Realty Center®’da yayımlanan ilan, açıklama ve görseller ilan sahibi veya yetkili gayrimenkul danışmanı tarafından sağlanır. Taşınmaz satın alma ve kiralama işlemlerinde tapu kayıtlarını, yetki belgelerini ve sözleşme koşullarını kontrol ediniz. Sitedeki içerikler yatırım veya hukuk danışmanlığı niteliğinde değildir.</div>
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-[10px] font-semibold text-slate-500 sm:flex-row"><span>© 2026 Realty Center® Türkiye. Tüm hakları saklıdır.</span><span className="flex items-center gap-2">Dijital Çözüm Ortağı <img src="/klogo.png" alt="Kriter Medya" className="h-6 w-auto object-contain"/></span></div>
      </div>
    </footer>
  );
}

function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('realty-center-cookie-choice'));
  if (!visible) return null;
  const choose = (choice: 'all' | 'essential') => { localStorage.setItem('realty-center-cookie-choice', choice); setVisible(false); };
  return <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex-1"><h3 className="text-sm font-black text-slate-900">Çerez kullanımı</h3><p className="mt-1 text-xs leading-5 text-slate-600">Site deneyimini geliştirmek, tercihlerinizi hatırlamak ve güvenli kullanım sağlamak için çerezlerden yararlanıyoruz. Ayrıntıları <Link to="/cerez-politikasi" className="font-black text-red-700">Çerez Politikası</Link> sayfasında inceleyebilirsiniz.</p></div><div className="flex shrink-0 gap-2"><button onClick={() => choose('essential')} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-black text-slate-700">Yalnızca Zorunlu</button><button onClick={() => choose('all')} className="rounded-lg bg-red-700 px-4 py-2 text-xs font-black text-white">Tümünü Kabul Et</button></div></div></div>;
}

function FeaturedListingsShowcase() {
  const [featuredIds, setFeaturedIds] = useState<string[]>(getFeaturedListingIds);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const featuredListings = featuredIds.map((id) => SAMPLE_LISTINGS.find((listing) => listing.id === id)).filter((listing): listing is ListingItem => Boolean(listing));

  useEffect(() => {
    const refresh = () => setFeaturedIds(getFeaturedListingIds());
    window.addEventListener('realty-center-featured-listings-updated', refresh);
    return () => window.removeEventListener('realty-center-featured-listings-updated', refresh);
  }, []);

  useEffect(() => {
    if (activeIndex >= featuredListings.length) setActiveIndex(0);
  }, [activeIndex, featuredListings.length]);

  const move = (direction: number) => {
    if (!featuredListings.length) return;
    setActiveIndex((current) => (current + direction + featuredListings.length) % featuredListings.length);
  };

  const getOffset = (index: number) => {
    let offset = index - activeIndex;
    const half = featuredListings.length / 2;
    if (offset > half) offset -= featuredListings.length;
    if (offset < -half) offset += featuredListings.length;
    return offset;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    dragStartX.current = event.clientX;
    dragMoved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    if (Math.abs(event.clientX - dragStartX.current) > 8) dragMoved.current = true;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    if (distance > 55) move(-1);
    if (distance < -55) move(1);
    dragStartX.current = null;
  };

  if (!featuredListings.length) return null;

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-red-50/30 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-8 text-center sm:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1.5 text-[10px] font-black tracking-[0.28em] text-red-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-700" />
            ÖZEL SEÇKİ
          </span>
          <h2 className="mt-4 font-serif text-4xl font-black italic tracking-tight text-slate-950 sm:text-5xl">
            Seçkin <span className="relative text-red-700 after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-full after:rounded-full after:bg-red-200">Gayrimenkuller</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              ['Tümü', '/ilanlarimiz?all=1'],
              ['Satılık', '/ilanlarimiz?type=Satılık'],
              ['Kiralık', '/ilanlarimiz?type=Kiralık'],
              ['Arsa', '/ilanlarimiz?propertyType=Arsa'],
              ['Ticari', '/ilanlarimiz?category=Ticari%20Gayrimenkul'],
              ['Turizm', '/ilanlarimiz?propertyType=Otel']
            ].map(([label, to]) => <Link key={label} to={to} className="min-w-24 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-xs font-black tracking-wide text-slate-700 transition hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 hover:text-white hover:shadow-lg sm:min-w-28">{label}</Link>)}
          </div>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-slate-500">Özenle seçilmiş, dikkat çeken gayrimenkul fırsatları</p>
        </div>

        <div
          className="relative h-[430px] cursor-grab select-none touch-pan-y active:cursor-grabbing sm:h-[470px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { dragStartX.current = null; }}
        >
          {featuredListings.map((item, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            const agent = SAMPLE_AGENTS[index % SAMPLE_AGENTS.length];
            if (Math.abs(offset) > 1) return null;
            return (
              <Link
                key={item.id}
                to={`/ilan/${item.id}`}
                draggable={false}
                onClick={(event) => { if (dragMoved.current) event.preventDefault(); }}
                className="absolute left-1/2 top-0 flex h-[400px] w-[78vw] max-w-[620px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl transition-all duration-500 ease-out sm:h-[440px] sm:w-[58vw]"
                style={{
                  transform: `translateX(${offset === 0 ? '-50%' : offset < 0 ? '-128%' : '28%'}) scale(${isActive ? 1 : 0.82})`,
                  opacity: isActive ? 1 : 0.58,
                  zIndex: isActive ? 20 : 10,
                  filter: isActive ? 'blur(0) saturate(1) brightness(1)' : 'blur(1.1px) saturate(.78) brightness(.88)'
                }}
                aria-label={`${item.title} ilanını incele`}
              >
                <div className="relative h-[245px] shrink-0 overflow-hidden bg-slate-100 sm:h-[285px]">
                  <img src={item.image} alt={item.title} draggable={false} className="h-full w-full object-cover object-center transition duration-700" />
                  <div className="absolute left-5 top-5 flex items-center gap-2">
                    <span className="rounded-full bg-red-700 px-3 py-1.5 text-[10px] font-black tracking-wider text-white shadow-lg">VİTRİN</span>
                    <span className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[10px] font-black text-slate-800 shadow-sm">{item.type}</span>
                  </div>
                </div>
                <div className={`relative flex flex-1 items-center gap-3 border-t border-red-100 bg-white px-4 py-3 text-slate-900 sm:gap-4 sm:px-5 ${isActive ? 'featured-info-ribbon' : ''}`}>
                  <img src={agent.image} alt={agent.name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-red-100 sm:h-12 sm:w-12" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-700">{item.propertyType} · {agent.name}</p>
                    <h3 className="mt-1 truncate text-sm font-black text-slate-950 sm:text-base">{item.title}</h3>
                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">{item.district}, {item.neighborhood}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-black text-red-700 sm:text-xl">{formatListingPrice(item.price, item.currency)}</p>
                    <span className="mt-1 flex items-center justify-end text-[10px] font-black text-slate-500">İlanı İncele <ArrowRight className="ml-1 h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </Link>
            );
          })}

          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(-1)} className="absolute left-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-900 shadow-xl transition hover:scale-110 hover:bg-red-700 hover:text-white sm:left-6" aria-label="Önceki vitrin ilanı"><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(1)} className="absolute right-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-900 shadow-xl transition hover:scale-110 hover:bg-red-700 hover:text-white sm:right-6" aria-label="Sonraki vitrin ilanı"><ChevronRight className="h-6 w-6" /></button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2">
          {featuredListings.map((item, index) => <button key={item.id} type="button" onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-red-700' : 'w-2 bg-slate-300 hover:bg-red-300'}`} aria-label={`${index + 1}. vitrin ilanına git`} />)}
        </div>
        <p className="mt-4 text-center text-[11px] font-bold text-slate-400">Oklarla ilerleyin veya ilanları fareyle sağa-sola kaydırın</p>
      </div>
    </section>
  );
}

function LiveListingStream({ listings }: { listings: ListingItem[] }) {
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const trackRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef(0);
  const directionRef = useRef<'left' | 'right'>('left');
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, position: 0 });

  const applyPosition = () => {
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
  };
  const setStreamDirection = (next: 'left' | 'right') => {
    directionRef.current = next;
    setDirection(next);
  };

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    const move = (time: number) => {
      const elapsed = Math.min(64, time - lastTime);
      lastTime = time;
      const track = trackRef.current;
      const loopWidth = track ? track.scrollWidth / 2 : 0;
      if (loopWidth && !hoveredRef.current && !draggingRef.current) {
        positionRef.current += (directionRef.current === 'left' ? -1 : 1) * elapsed * 0.028;
        while (positionRef.current <= -loopWidth) positionRef.current += loopWidth;
        while (positionRef.current >= 0) positionRef.current -= loopWidth;
        applyPosition();
      }
      frameId = requestAnimationFrame(move);
    };
    frameId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frameId);
  }, [listings.length]);

  if (!listings.length) return null;
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    draggingRef.current = true;
    hoveredRef.current = true;
    dragStartRef.current = { x: event.clientX, position: positionRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const track = trackRef.current;
    const loopWidth = track ? track.scrollWidth / 2 : 0;
    const delta = event.clientX - dragStartRef.current.x;
    positionRef.current = dragStartRef.current.position + delta;
    if (loopWidth) {
      while (positionRef.current <= -loopWidth) positionRef.current += loopWidth;
      while (positionRef.current >= 0) positionRef.current -= loopWidth;
    }
    applyPosition();
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = event.clientX - dragStartRef.current.x;
    if (Math.abs(delta) > 8) setStreamDirection(delta > 0 ? 'right' : 'left');
    draggingRef.current = false;
    hoveredRef.current = event.pointerType === 'mouse';
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
  };

  return <div className="relative mx-auto max-w-[1780px] px-5 sm:px-8 lg:px-12">
    <div className="mb-4 flex items-center justify-between gap-3"><p className="text-xs font-bold text-slate-500"><span className="font-black text-red-700">{listings.length}</span> ilan · Kartların üzerine gelince akış durur.</p><div className="flex items-center gap-2"><button type="button" onClick={() => setStreamDirection('left')} className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${direction === 'left' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-red-700 hover:text-red-700'}`} aria-label="Akışı sola yönlendir"><ChevronLeft className="h-5 w-5" /></button><button type="button" onClick={() => setStreamDirection('right')} className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${direction === 'right' ? 'border-red-700 bg-red-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-red-700 hover:text-red-700'}`} aria-label="Akışı sağa yönlendir"><ChevronRight className="h-5 w-5" /></button></div></div>
    <div className="relative cursor-grab overflow-hidden py-2 active:cursor-grabbing" onMouseEnter={() => { hoveredRef.current = true; }} onMouseLeave={() => { if (!draggingRef.current) hoveredRef.current = false; }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}><div ref={trackRef} className="live-listing-track card-focus-group">{[...listings, ...listings].map((item, index) => <div key={`${item.id}-${index}`} className="card-focus-item w-72 shrink-0"><ListingCard item={item} /></div>)}</div></div>
  </div>;
}

function BuyerRequestModule() {
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ type: 'Satılık', property: 'Daire', city: 'Ankara', district: 'Çankaya', budget: '', payment: 'Kredi + Peşinat', timing: '1 ay içinde', name: '', phone: '' });
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  const submitRequest = () => {
    const normalize = (value: string) => value.trim().toLocaleLowerCase('tr-TR');
    const city = normalize(form.city), district = normalize(form.district);
    const cityOffices = SAMPLE_OFFICES.filter((office) => normalize(office.city) === city);
    const matchedOffices = cityOffices.filter((office) => normalize(office.district) === district);
    const offices = matchedOffices.length ? matchedOffices : cityOffices;
    const agents = SAMPLE_AGENTS.filter((agent) => normalize(agent.city) === city && (!district || normalize(agent.district) === district || offices.some((office) => office.name === agent.office)));
    saveBuyerRequests([{ id: `TR-${Date.now()}`, ...form, createdAt: new Date().toISOString(), status: 'Yeni', officeNames: offices.map((office) => office.name), agentNames: agents.map((agent) => agent.name) }, ...getBuyerRequests()]);
    setSent(true);
  };
  if (sent) return <section className="border-b border-slate-200 bg-slate-50 py-16"><div className="mx-auto max-w-5xl px-6"><div className="rc-navy-frame rounded-3xl bg-[#CD011E] p-10 text-center text-white shadow-2xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-3xl">✓</div><h2 className="mt-5 text-3xl font-black">Talebiniz ilgili ekiplere iletildi.</h2><p className="mx-auto mt-3 max-w-xl text-sm text-white/85">Yönetici paneli, ilgili ofis ve bölgedeki danışmanlar için bildirim oluşturuldu. Size uygun portföylerle kısa süre içinde iletişime geçiyoruz.</p></div></div></section>;
  return <section id="buyer-request" className="border-b border-slate-200 bg-slate-50 py-10"><div className="mx-auto max-w-7xl px-6 lg:px-12"><div className="rc-navy-frame overflow-hidden rounded-3xl bg-white shadow-xl lg:grid lg:grid-cols-[.9fr_1.1fr]"><div className="bg-[#CD011E] p-6 text-white sm:p-7"><span className="text-xs font-black tracking-[.2em] text-white/75">ALICI TALEBİ</span><div className="mt-3 w-full max-w-[430px] -rotate-[1.5deg] rounded-[48%_52%_46%_54%/_55%_45%_55%_45%] bg-white px-5 py-3 shadow-md sm:px-7 sm:py-4"><h2 className="text-[26px] font-black leading-tight text-slate-950 sm:text-3xl"><span className="block whitespace-nowrap">Siz Aradığınızı Söyleyin,</span><span className="mt-1 block whitespace-nowrap text-center">Biz Bulalım</span></h2></div><p className="mt-3 text-sm leading-relaxed text-white/85">Kriterlerinizi paylaşın; uzmanlarımız uygun portföyleri sizin için eşleştirip size ulaşsın.</p><div className="mt-5 space-y-3 text-sm font-bold"><p>01 · İhtiyacınızı seçin</p><p>02 · Bölge ve bütçeyi belirtin</p><p>03 · Ödeme ve zaman planınızı paylaşın</p></div></div><div className="p-4 sm:p-6"><div className="mb-4 flex items-center gap-2">{[1,2,3].map(n=><span key={n} className={`h-1.5 flex-1 rounded-full ${n<=step?'bg-[#CD011E]':'bg-slate-200'}`}/>)}</div>{step===1&&<div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-black text-slate-700">İLAN TÜRÜ<select value={form.type} onChange={e=>update('type',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option>Satılık</option><option>Kiralık</option></select></label><label className="text-xs font-black text-slate-700">NE ARIYORSUNUZ?<select value={form.property} onChange={e=>update('property',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option>Daire</option><option>Villa</option><option>Ofis</option><option>Arsa</option><option>Fabrika</option></select></label></div>}{step===2&&<div className="grid gap-4 sm:grid-cols-3"><label className="text-xs font-black text-slate-700">İL<input value={form.city} onChange={e=>update('city',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"/></label><label className="text-xs font-black text-slate-700">İLÇE<input value={form.district} onChange={e=>update('district',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"/></label><label className="text-xs font-black text-slate-700">BÜTÇE<input value={form.budget} onChange={e=>update('budget',e.target.value)} placeholder="Örn. 8.000.000 ₺" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"/></label></div>}{step===3&&<div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-black text-slate-700">ÖDEME ŞEKLİ<select value={form.payment} onChange={e=>update('payment',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option>Kredi + Peşinat</option><option>Peşin</option><option>Takas</option></select></label><label className="text-xs font-black text-slate-700">SATIN ALMA ZAMANI<select value={form.timing} onChange={e=>update('timing',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"><option>Hemen</option><option>1 ay içinde</option><option>3 ay içinde</option></select></label><label className="text-xs font-black text-slate-700">AD SOYAD<input required value={form.name} onChange={e=>update('name',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"/></label><label className="text-xs font-black text-slate-700">TELEFON<input required value={form.phone} onChange={e=>update('phone',e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold"/></label></div>}<div className="mt-7 flex justify-between">{step>1?<button onClick={()=>setStep(step-1)} className="rounded-xl px-4 py-3 text-sm font-black text-slate-500">← Geri</button>:<span/>}<button onClick={()=>step<3?setStep(step+1):submitRequest()} className="rounded-xl bg-[#CD011E] px-6 py-3 text-sm font-black text-white shadow-lg">{step<3?'Devam Et →':'Talebimi Oluştur'}</button></div></div></div></div></section>;
}

function BarterBankModule() {
  const [mode, setMode] = useState<'Önce Takasla Öner' | 'Takasa Talebi'>('Önce Takasla Öner');
  const [offer, setOffer] = useState('Gayrimenkul');
  const [request, setRequest] = useState('Gayrimenkul');
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const items = JSON.parse(localStorage.getItem('realty-center-barter-requests') || '[]'); localStorage.setItem('realty-center-barter-requests', JSON.stringify([{id:`BB-${Date.now()}`, mode, offer, request, createdAt:new Date().toISOString(), status:'Yeni', data:Object.fromEntries(form)},...items])); window.dispatchEvent(new Event('realty-center-barter-requests-updated')); setSent(true); };
  const fields = (kind: string) => kind === 'Ev' ? ['İl','İlçe','Mahalle','Konut özellikleri','Fiyat'] : kind === 'Arsa' ? ['İl','İlçe','Mahalle','Ada','Parsel','Fiyat'] : kind === 'Otomobil' ? ['Marka','Model','Fiyat'] : ['Açıklama','Fiyat','Şehir / İlçe'];
  if (sent) return <section id="barter-bank" className="border-b border-slate-200 bg-slate-50 py-14"><div className="mx-auto max-w-5xl px-6"><div className="rounded-3xl bg-slate-950 p-10 text-center text-white"><h2 className="text-2xl font-black">Barter talebiniz alındı.</h2><p className="mt-3 text-sm text-slate-300">Talebiniz yönetici paneline iletildi; uygun eşleşme için sizinle iletişime geçilecektir.</p></div></div></section>;
  return <section id="barter-bank" className="border-b border-slate-200 bg-slate-50 py-14"><div className="mx-auto max-w-7xl px-6 lg:px-12"><div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid lg:grid-cols-[.78fr_1.22fr]"><aside className="bg-slate-950 p-8 text-white sm:p-10"><p className="text-xs font-black tracking-[.2em] text-red-300">BARTERBANK®</p><h2 className="mt-4 text-3xl font-black">Fazlanı ver, eksiğini al.</h2><p className="mt-4 text-sm leading-7 text-slate-300">Gayrimenkul, otomobil veya diğer değerlerinizi; kısmi ya da tam barter seçenekleriyle değerlendirin.</p><div className="mt-8 space-y-3 text-sm font-bold"><p>01 · Takas teklifini oluştur</p><p>02 · İstediğin değeri belirt</p><p>03 · Uygun eşleşmeyi bekle</p></div></aside><form onSubmit={submit} className="p-6 sm:p-10"><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setMode('Önce Takasla Öner')} className={`rounded-xl p-3 text-xs font-black ${mode==='Önce Takasla Öner'?'bg-red-700 text-white':'bg-slate-100 text-slate-700'}`}>ÖNCE TAKASLA ÖNER</button><button type="button" onClick={()=>setMode('Takasa Talebi')} className={`rounded-xl p-3 text-xs font-black ${mode==='Takasa Talebi'?'bg-red-700 text-white':'bg-slate-100 text-slate-700'}`}>TAKASA TALEBİ</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-black text-slate-700">VERMEK İSTEDİĞİN<select value={offer} onChange={e=>setOffer(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3"><option>Gayrimenkul</option><option>Otomobil</option><option>Diğer</option></select></label><label className="text-xs font-black text-slate-700">ALMAK İSTEDİĞİN<select value={request} onChange={e=>setRequest(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3"><option>Gayrimenkul</option><option>Otomobil</option><option>Diğer</option></select></label></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{[...fields(offer).map(x=>`Verilecek ${x}`),...fields(request).map(x=>`İstenen ${x}`)].map(x=><input key={x} required name={x} placeholder={x} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>)}<select name="Barter türü" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option>Tam Barter</option><option>Kısmi Barter</option></select></div><label className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-red-700"/>Bilgilerimin değerlendirilmesini kabul ediyorum; <Link to="/kvkk" className="font-black text-red-700">KVKK</Link> ve <Link to="/kullanim-kosullari" className="font-black text-red-700">Site Kullanım Politikası</Link> metinlerini okudum.</label><button className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white">Barter Talebini Gönder</button></form></div></div></section>;
}

function BarterBankModuleV2() {
  const [mode, setMode] = useState<'Takas Önerisi' | 'Takas Talebi'>('Takas Önerisi');
  const [asset, setAsset] = useState<'Ev' | 'Arsa' | 'Otomobil' | 'Diğer'>('Ev');
  const [sent, setSent] = useState(false);
  const fields = asset === 'Ev' ? ['İl', 'İlçe', 'Mahalle', 'Konut özellikleri', 'Fiyat'] : asset === 'Arsa' ? ['İl', 'İlçe', 'Mahalle', 'Ada', 'Parsel', 'Fiyat'] : asset === 'Otomobil' ? ['Marka', 'Model', 'Fiyat'] : ['Şehir / İlçe', 'Açıklama', 'Fiyat'];
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const saved = JSON.parse(localStorage.getItem('realty-center-barter-requests') || '[]'); localStorage.setItem('realty-center-barter-requests', JSON.stringify([{ id: `BB-${Date.now()}`, mode, asset, status: 'Yeni', createdAt: new Date().toISOString(), data: Object.fromEntries(new FormData(event.currentTarget)) }, ...saved])); window.dispatchEvent(new Event('realty-center-barter-requests-updated')); setSent(true); };
  if (sent) return <section id="barter-bank" className="border-b border-slate-200 bg-slate-50 py-14"><div className="mx-auto max-w-5xl px-6"><div className="rc-navy-frame rounded-3xl bg-[#CD011E] p-10 text-center text-white"><h2 className="text-2xl font-black">Barter kaydınız alındı.</h2><p className="mt-3 text-sm text-white/85">Talebiniz yönetici paneline iletildi; uygun eşleşme için sizinle iletişime geçilecektir.</p></div></div></section>;
  return <section id="barter-bank" className="border-b border-slate-200 bg-slate-50 py-14"><div className="mx-auto max-w-7xl px-6 lg:px-12"><div className="rc-navy-frame overflow-hidden rounded-3xl bg-white shadow-xl lg:grid lg:grid-cols-[.78fr_1.22fr]"><aside className="bg-[#CD011E] p-8 text-white sm:p-10"><p className="text-xs font-black tracking-[.2em] text-white/75">BARTERBANK®</p><h2 className="mt-4 text-3xl font-black">Fazlanı ver, eksiğini al.</h2><p className="mt-4 text-sm leading-7 text-white/85">Gayrimenkul, otomobil veya diğer değerlerinizi kısmi ya da tam barter seçenekleriyle değerlendirin.</p></aside><form onSubmit={submit} className="p-6 sm:p-10"><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setMode('Takas Önerisi')} className={`rounded-xl p-3 text-xs font-black ${mode === 'Takas Önerisi' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'}`}>TAKAS ÖNERİSİ</button><button type="button" onClick={() => setMode('Takas Talebi')} className={`rounded-xl p-3 text-xs font-black ${mode === 'Takas Talebi' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'}`}>TAKAS TALEBİ</button></div><div className="mt-6"><p className="text-sm font-black text-slate-900">{mode === 'Takas Önerisi' ? 'Vermek istediğiniz değer' : 'Almak istediğiniz değer'}</p><label className="mt-3 block text-xs font-black text-slate-700">DEĞER TÜRÜ<select value={asset} onChange={(e) => setAsset(e.target.value as typeof asset)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"><option>Ev</option><option>Arsa</option><option>Otomobil</option><option>Diğer</option></select></label></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{fields.map((field) => <input key={field} required name={field} placeholder={field} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/>)}<select name="Barter türü" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"><option>Tam Barter</option><option>Kısmi Barter</option></select></div><label className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-red-700"/>Bilgilerimin değerlendirilmesini kabul ediyorum; <Link to="/kvkk" className="font-black text-red-700">KVKK</Link> ve <Link to="/kullanim-kosullari" className="font-black text-red-700">Site Kullanım Politikası</Link> metinlerini okudum.</label><button className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white">Barter Talebini Gönder</button></form></div></div></section>;
}

function BarterBankModuleV3() {
  const [offer, setOffer] = useState<'Ev' | 'Arsa' | 'Otomobil' | 'Diğer'>('Ev');
  const [request, setRequest] = useState<'Ev' | 'Arsa' | 'Otomobil' | 'Diğer'>('Ev');
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const fields = (type: typeof offer) => type === 'Ev' ? ['İl', 'İlçe', 'Mahalle', 'Konut özellikleri'] : type === 'Arsa' ? ['İl', 'İlçe', 'Mahalle', 'Ada', 'Parsel'] : type === 'Otomobil' ? ['Marka', 'Model'] : ['Şehir / İlçe'];
  const column = (title: string, subtitle: string, type: typeof offer, setType: (type: typeof offer) => void, prefix: string) => (
    <section className="barter-property-card rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="text-sm font-black tracking-[.08em] text-[#071d3b]">{title}</h3><p className="mt-1 text-xs font-bold text-[#CD011E]">{subtitle}</p></div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-black text-[#CD011E]">{prefix === 'öneri' ? '01' : '02'}</span>
      </div>
      <label className="block text-[10px] font-black tracking-[.14em] text-slate-500">MÜLK TÜRÜ
        <select value={type} onChange={(e) => setType(e.target.value as typeof offer)} className="barter-field mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-800">
          <option>Ev</option><option>Arsa</option><option>Otomobil</option><option>Diğer</option>
        </select>
      </label>
      <div className="mt-3 grid gap-2.5">
        {fields(type).map((field) => <input key={field} required name={`${prefix}-${field}`} placeholder={field} className="barter-field rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm"/>)}
        <input required name={`${prefix}-Fiyat`} placeholder="Fiyat" className="barter-field rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm"/>
        <textarea required name={`${prefix}-Diğer açıklama`} rows={4} placeholder="Mülk özelliklerini buraya yazınız" className="barter-field resize-y rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-6"></textarea>
      </div>
    </section>
  );
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const saved = JSON.parse(localStorage.getItem('realty-center-barter-requests') || '[]'); localStorage.setItem('realty-center-barter-requests', JSON.stringify([{ id: `BB-${Date.now()}`, offer, request, status: 'Yeni', createdAt: new Date().toISOString(), data: Object.fromEntries(new FormData(event.currentTarget)) }, ...saved])); window.dispatchEvent(new Event('realty-center-barter-requests-updated')); setSent(true); };
  if (sent) return <section id="barter-bank" className="bg-slate-50 py-10"><div className="mx-auto max-w-5xl px-6"><div className="barter-success rc-navy-frame bg-[#CD011E] p-8 text-center text-white"><h2 className="text-2xl font-black">BARTERBANK® kaydınız alındı.</h2><p className="mt-2 text-sm text-white/85">Teklifiniz ve talebiniz yönetici paneline iletildi.</p></div></div></section>;
  return <section id="barter-bank" className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12"><div className="mx-auto max-w-6xl px-6 lg:px-12"><div className="barter-shell rc-navy-frame overflow-hidden bg-white/95">
    <header className="barter-header relative flex flex-col gap-5 overflow-hidden bg-gradient-to-r from-[#b9001b] via-[#CD011E] to-[#dc1733] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="relative z-10"><div className="flex flex-wrap items-baseline gap-x-3"><h2 className="text-2xl font-black tracking-[.08em] sm:text-3xl">BARTERBANK®</h2><span className="text-xs font-bold tracking-[.16em] text-white/65">EMLAK TAKAS SİSTEMİ</span></div></div>
      <div className="relative z-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center"><div aria-label="Fazlanı ver, eksiğini al" className="min-w-[238px] shrink-0 border-0 bg-transparent px-2 py-2 text-center text-white shadow-none outline-none ring-0 sm:min-w-[306px]" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}><span className="block text-lg font-black tracking-[.12em] sm:text-xl">FAZLANI VER</span><span className="mx-auto my-2 block h-[3px] w-24 rounded-full bg-[#071d3b] sm:w-28"></span><span className="block text-lg font-black tracking-[.12em] sm:text-xl">EKSİĞİNİ AL</span></div><button type="button" onClick={() => { setOpen(!open); if (!open) setStep(1); }} aria-expanded={open} className="barter-toggle flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white px-5 py-3 text-sm font-black text-[#CD011E] shadow-lg shadow-[#7d0013]/20 transition sm:w-auto">{open ? 'Formu Kapat' : 'Takasa Başla'} <ArrowRight className={`h-4 w-4 transition-transform duration-500 ${open ? 'rotate-90' : ''}`} /></button></div>
    </header>
    {open && <form onSubmit={submit} className="barter-form-reveal border-t-2 border-[#12345b] bg-gradient-to-br from-white via-slate-50/60 to-red-50/20 p-5 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          {[{n:1,label:'Vereceğiniz Mülk'},{n:2,label:'İstediğiniz Mülk'},{n:3,label:'İletişim'}].map((item, index) => <React.Fragment key={item.n}><button type="button" onClick={() => item.n < step && setStep(item.n as 1 | 2 | 3)} className={`group flex min-w-0 flex-1 flex-col items-center gap-2 ${item.n <= step ? 'text-[#CD011E]' : 'text-slate-400'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${item.n < step ? 'border-[#CD011E] bg-[#CD011E] text-white' : item.n === step ? 'border-[#CD011E] bg-white text-[#CD011E] shadow-[0_0_0_5px_rgba(205,1,30,.09)]' : 'border-slate-200 bg-white'}`}>{item.n < step ? '✓' : item.n}</span><span className="hidden text-[10px] font-black uppercase tracking-wide sm:block">{item.label}</span></button>{index < 2 && <span className={`mb-5 h-0.5 flex-1 rounded-full transition-colors duration-500 sm:mb-6 ${item.n < step ? 'bg-[#CD011E]' : 'bg-slate-200'}`}></span>}</React.Fragment>)}
        </div>
        <div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-black text-[#071d3b]">{step === 1 ? 'Vereceğiniz mülkü anlatın' : step === 2 ? 'Almak istediğiniz mülkü anlatın' : 'İletişim bilgilerinizi tamamlayın'}</p><p className="mt-1 text-xs text-slate-500">Adım {step} / 3</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-1.5 text-xs font-black text-[#CD011E] transition hover:bg-red-50">KAPAT</button></div>

        <div className={step === 1 ? 'barter-step-panel' : 'hidden'}>{column('TAKAS ÖNERİSİ', 'VERMEK İSTEDİĞİNİZ MÜLK', offer, setOffer, 'öneri')}</div>
        <div className={step === 2 ? 'barter-step-panel' : 'hidden'}>{column('TAKAS TALEBİ', 'ALMAK İSTEDİĞİNİZ MÜLK', request, setRequest, 'talep')}</div>
        <div className={step === 3 ? 'barter-step-panel' : 'hidden'}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="mb-4 text-xs font-black tracking-[.12em] text-[#071d3b]">İLETİŞİM BİLGİLERİNİZ</p><div className="grid gap-3 sm:grid-cols-2"><input required name="Ad Soyad" placeholder="Ad Soyad" autoComplete="name" className="barter-field rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm"/><input required name="Telefon" type="tel" placeholder="Telefon" autoComplete="tel" className="barter-field rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm"/><select required name="Barter türü" className="barter-field rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm sm:col-span-2"><option value="">Barter türünü seçin</option><option>Tam Barter</option><option>Kısmi Barter</option></select></div></section>
          <label className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-red-700"/>KVKK ve <Link to="/kullanim-kosullari" className="font-black text-red-700">Site Kullanım Politikası</Link> metinlerini okudum ve onaylıyorum.</label>
        </div>

        <div className="mt-5 flex gap-3">
          {step > 1 && <button type="button" onClick={() => setStep((step - 1) as 1 | 2)} className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-black text-[#071d3b] transition hover:bg-slate-50">GERİ</button>}
          {step < 3 ? <button type="button" onClick={() => setStep((step + 1) as 2 | 3)} className="barter-submit flex-1 rounded-xl bg-gradient-to-r from-[#b9001b] to-[#CD011E] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/15">DEVAM ET</button> : <button type="submit" className="barter-submit flex-1 rounded-xl bg-gradient-to-r from-[#b9001b] to-[#CD011E] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/15">TAKAS ÖNERİSİ VE TALEBİNİ GÖNDER</button>}
        </div>
      </div>
    </form>}
  </div></div></section>;
}

function ListingActionShortcuts() {
  return <aside className="grid self-start gap-2 sm:grid-cols-2"><Link to="/#barter-bank" className="border border-red-700 bg-[#CD011E] px-4 py-3 text-white shadow-sm transition hover:bg-red-800"><p className="text-[10px] font-black tracking-widest text-white/85">BARTERBANK®</p><strong className="mt-1 block text-sm leading-tight text-white">Takas fırsatlarını görün →</strong></Link><Link to="/#buyer-request" className="border border-red-700 bg-[#CD011E] px-4 py-3 text-white shadow-sm transition hover:bg-red-800"><p className="text-[10px] font-black tracking-widest text-white/85">SİZ ARADIĞINIZI SÖYLEYİN</p><strong className="mt-1 block text-sm leading-tight text-white">Size uygun ilanı bulalım →</strong></Link></aside>;
}

function HomeLibraryPreview() {
  const [categories, setCategories] = useState<LibraryCategory[]>(getLibraryCategories);
  useEffect(() => {
    const refresh = () => setCategories(getLibraryCategories());
    window.addEventListener('realty-center-library-updated', refresh);
    return () => window.removeEventListener('realty-center-library-updated', refresh);
  }, []);

  const categoryFallbacks: Record<string, string> = {
    'sektor-haberleri': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=88&w=1400',
    'hukuk-mevzuat': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=88&w=1400',
    'basinda-biz': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=88&w=1400',
    'yapay-zekali-rehber': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=88&w=1400',
    'yatirim-firsatlari-analizler': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=88&w=1400'
  };
  const latestArticles = categories
    .flatMap((category) => category.articles.map((article) => ({ category, article })))
    .sort((a, b) => (Date.parse(b.article.publishedAt) || 0) - (Date.parse(a.article.publishedAt) || 0))
    .slice(0, 3);

  return (
    <section className="border-b border-slate-200 bg-[#fffafa] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="text-xs font-black tracking-[.2em] text-red-700">BİLGİ · REHBER · ANALİZ</span><h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Realty <span className="text-red-700">Kütüphane</span></h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Gayrimenkul dünyasındaki güncel gelişmeleri, mevzuatı, rehberleri ve yatırım analizlerini keşfedin.</p></div>
          <Link to="/kutuphane" className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800">Tüm Kütüphaneyi Gör <ArrowRight className="h-4 w-4"/></Link>
        </div>
        {latestArticles.length ? <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          {latestArticles[0] && (() => { const { category, article } = latestArticles[0]; return <Link to={`/kutuphane/${category.slug}/${article.id}`} className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl"><img src={article.image || categoryFallbacks[category.slug] || '/demo-placeholder.svg'} alt={article.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-7 sm:p-9"><span className="inline-flex rounded-full bg-red-700 px-3 py-1 text-[10px] font-black tracking-widest text-white">{category.title}</span><p className="mt-4 text-xs font-bold text-white/70">{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</p><h3 className="mt-2 max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">{article.title}</h3><p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/75">{article.summary || stripRichText(article.content)}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-white">İçeriği Oku <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></div></Link>; })()}
          <div className="grid gap-5">{latestArticles.slice(1).map(({ category, article }) => <Link key={article.id} to={`/kutuphane/${category.slug}/${article.id}`} className="group grid min-h-[198px] grid-cols-[42%_1fr] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-700 hover:shadow-xl"><img src={article.image || categoryFallbacks[category.slug] || '/demo-placeholder.svg'} alt={article.title} loading="lazy" className="h-full min-h-[198px] w-full object-cover transition duration-500 group-hover:scale-105"/><div className="flex flex-col justify-center p-5"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black tracking-wider text-red-700">{category.title}</span><span className="text-[10px] font-bold text-slate-400">{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span></div><h3 className="mt-3 line-clamp-2 text-lg font-black leading-6 text-slate-950">{article.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{article.summary || stripRichText(article.content)}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-red-700">İçeriği Oku <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1"/></span></div></Link>)}</div>
        </div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="font-black text-slate-900">Realty Kütüphane içerikleri hazırlanıyor.</p><Link to="/kutuphane" className="mt-3 inline-flex text-sm font-black text-red-700">Kütüphaneye Git →</Link></div>}
      </div>
    </section>
  );
}

function HomePage({ counts, currentSlide, selectedCity, setSelectedCity, openDrawer }: any) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'franchise' | 'agent'>('search');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchTransactionType, setSearchTransactionType] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('');
  const aiExamples = [
    "Çankaya'da 8 milyon TL'ye kadar 3+1 daire arıyorum.",
    "İncek'te havuzlu, krediye uygun villa öner."
  ];
  const [aiQuery, setAiQuery] = useState('');
  const [aiDemoPaused, setAiDemoPaused] = useState(false);
  useEffect(() => {
    if (aiDemoPaused) return;
    let exampleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeoutId: number;
    const animate = () => {
      const current = aiExamples[exampleIndex];
      if (!deleting) {
        characterIndex += 1;
        setAiQuery(current.slice(0, characterIndex));
        if (characterIndex === current.length) {
          deleting = true;
          timeoutId = window.setTimeout(animate, 1200);
          return;
        }
        timeoutId = window.setTimeout(animate, 18);
        return;
      }
      characterIndex -= 1;
      setAiQuery(current.slice(0, Math.max(0, characterIndex)));
      if (characterIndex === 0) {
        deleting = false;
        exampleIndex = (exampleIndex + 1) % aiExamples.length;
        timeoutId = window.setTimeout(animate, 350);
        return;
      }
      timeoutId = window.setTimeout(animate, 12);
    };
    timeoutId = window.setTimeout(animate, 450);
    return () => window.clearTimeout(timeoutId);
  }, [aiDemoPaused]);

  const sortedListings = [...SAMPLE_LISTINGS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="relative h-[68vh] min-h-[520px] w-full overflow-hidden border-b-4 border-red-700 shadow-xl flex items-center bg-slate-900">
        <div className="absolute inset-0 z-0">
          {SLIDER_IMAGES && SLIDER_IMAGES.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt="Realty Center® gayrimenkul fırsatları"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ease-in-out transform ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-center">
          <div className="hero-search-entrance w-full max-w-[34rem] -ml-4 sm:-ml-10 lg:-ml-20">
            <div className="grid grid-cols-[1.2fr_.9fr_.9fr] gap-2 mb-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`relative overflow-hidden group h-[4.5rem] rounded-t-lg font-black flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md ${
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
                className="relative overflow-hidden group h-[4.5rem] rounded-t-xl bg-white/92 text-red-700 hover:bg-slate-100 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-700 hover:-translate-y-1"
              >
                <Building2 className="w-6 h-6 text-red-700 relative z-10" />
                <span className="text-sm font-extrabold tracking-wide relative z-10">Franchise Ol!</span>
              </Link>

              <Link
                to="/danisman-basvuru"
                className="relative overflow-hidden group h-[4.5rem] rounded-t-lg bg-white/92 text-red-700 hover:bg-slate-100 font-extrabold flex flex-col items-center justify-center space-y-1 transition duration-300 shadow-md border-b-2 border-transparent hover:border-red-700 hover:-translate-y-1"
              >
                <Briefcase className="w-6 h-6 text-red-700 relative z-10" />
                <span className="text-sm font-extrabold tracking-wide relative z-10">Danışman Ol!</span>
              </Link>
            </div>

            <div className="bg-white/84 text-slate-900 p-5 rounded-b-2xl rounded-tr-2xl shadow-2xl shadow-black/30 space-y-4 border border-white/65 backdrop-blur-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">Satılık / Kiralık</label>
                  <select value={searchTransactionType} onChange={(e) => setSearchTransactionType(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
                    <option value="">Seçiniz</option>
                    {LISTING_TRANSACTION_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">İlan Türü</label>
                  <select value={searchPropertyType} onChange={(e) => setSearchPropertyType(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
                    <option value="">Seçiniz</option>
                    {ALL_LISTING_PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
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

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button onClick={() => navigate('/ilanlarimiz?type=' + encodeURIComponent(searchTransactionType) + '&propertyType=' + encodeURIComponent(searchPropertyType) + '&city=' + encodeURIComponent(selectedCity) + '&district=' + encodeURIComponent(searchDistrict))} className="relative overflow-hidden group w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-black px-12 py-3.5 rounded-md text-sm flex items-center justify-center space-x-2 transition duration-300 shadow-lg shadow-red-700/40 tracking-widest transform hover:scale-105">
                  <Search className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">ARA</span>
                </button>
                <Link to="/harita-ile-ara" className="inline-flex w-full items-center justify-center rounded-md border border-red-700 bg-red-700 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:brightness-110 sm:w-auto">🗺️ Harita ile Ara</Link>
              </div>

            </div>

            <div className="mt-3 rounded-2xl border border-cyan-300/45 bg-[#071a3b]/95 p-3 shadow-xl backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between gap-3"><p className="text-[10px] font-black tracking-[.16em] text-cyan-200">🤖 YAPAY ZEKA GAYRİMENKUL ASİSTANI</p><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300"/></div>
              <div className="flex flex-col gap-2 sm:flex-row"><input value={aiQuery} onChange={(event) => { setAiDemoPaused(true); setAiQuery(event.target.value); }} onKeyDown={(event) => event.key === 'Enter' && navigate('/ai-karar-asistani?q=' + encodeURIComponent(aiQuery))} className="min-w-0 flex-1 rounded-xl border border-cyan-100/30 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-400" aria-label="Yapay zeka gayrimenkul araması" /><button onClick={() => navigate('/ai-karar-asistani?q=' + encodeURIComponent(aiQuery))} className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300">YZ ile Ara</button></div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
          <img src="/rlogo2.png" alt="Realty Center®" className="h-12 sm:h-14 w-auto object-contain" />
        </div>
      </div>

      <section className="bg-white py-10 text-slate-900 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto grid items-center gap-6 px-6 lg:grid-cols-[1.05fr_.95fr_.7fr] lg:px-12">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3"><div className="text-3xl font-black tracking-tight text-red-700 lg:text-4xl">{counts.offices}+</div><div className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-700">Franchise Ofis</div></div>
            <div className="border-l border-slate-100 p-3"><div className="text-3xl font-black tracking-tight text-red-700 lg:text-4xl">{counts.agents.toLocaleString('tr-TR')}+</div><div className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-700">Uzman Danışman</div></div>
            <div className="border-l border-slate-100 p-3"><div className="text-3xl font-black tracking-tight text-red-700 lg:text-4xl">{counts.portfolios.toLocaleString('tr-TR')}+</div><div className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-700">Aktif Portföy</div></div>
            <div className="border-l border-slate-100 p-3"><div className="text-3xl font-black tracking-tight text-red-700 lg:text-4xl">%{counts.satisfaction}</div><div className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-700">Memnuniyet</div></div>
          </div>
          <RealtyNetworkActivityPanel />
          <div className="flex justify-center lg:justify-end">
            <Link to="/ilanlarimiz" className="sales-message block max-w-56 text-center text-lg font-black leading-snug text-slate-950 sm:text-xl lg:text-left">
              DÜNYADA HER <span className="sales-pulse-highlight text-red-700">10 SANİYEDE 1 GAYRİMENKUL</span> REALTY CENTER® İLE İŞLEM GÖRÜYOR.
            </Link>
          </div>
        </div>
      </section>

      

      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between gap-6 mb-8"><div><span className="text-xs font-black tracking-widest text-red-700">KATEGORİLER</span><h2 className="mt-2 text-3xl font-black text-slate-900">Portföylerimizi <span className="text-red-700">Keşfedin</span></h2></div><Link to="/ilan-kategorileri" className="text-sm font-black text-red-700 hover:text-red-800">Tümünü Gör →</Link></div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">{getListingCategories().slice(0,4).map((category,index) => <Link key={category.id} to={"/ilanlarimiz?type="+encodeURIComponent(getCategoryTransactionType(category))+"&propertyType="+encodeURIComponent(getCategoryPropertyType(category))} className="group bg-white px-5 py-5 transition hover:bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-red-700">0{index+1} · KATEGORİ</p><h3 className="mt-2 text-base font-black text-slate-900">{category.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">Uygun ilanları inceleyin.</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-700"/></div></Link>)}</div>
        </div>
      </section>

      <FeaturedListingsShowcase />

      <BuyerRequestModule />
      <BarterBankModuleV3 />
      <section className="py-16 bg-white text-slate-900 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-8 flex items-center justify-between">
          <div><span className="inline-flex items-center space-x-1.5 text-xs font-black text-white tracking-widest bg-red-700 px-3 py-1 rounded-full border border-red-700 mb-2"><Flame className="w-3.5 h-3.5 animate-bounce" /><span>Canlı İlan Akışı</span></span><h2 className="text-2xl sm:text-3xl font-black text-slate-900">EN YENİ <span className="text-red-700">GAYRİMENKUL İLANLARI</span></h2><p className="text-slate-500 text-xs font-medium mt-1">Yeni portföyler güncel olarak akışta yer alır.</p></div>
          <Link to="/ilan-kategorileri" className="hidden sm:flex items-center space-x-2 text-xs font-black text-white bg-red-700 hover:bg-red-800 px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-700/30"><span>Tümünü Gör</span><ArrowRight className="w-4 h-4" /></Link>
        </div>
        <LiveListingStream listings={sortedListings} />
      </section>

      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 relative min-h-72 overflow-hidden rounded-3xl bg-white"><img src="/slider/realty-city.jpg" alt="İncek Vadi Evleri" className="absolute inset-0 h-full w-full object-contain" /><div className="relative max-w-md p-9 text-slate-950"><span className="text-xs font-black tracking-widest text-red-700">YENİ PROJELER</span><h2 className="mt-3 text-3xl font-black">İncek Vadi Evleri</h2><p className="mt-3 text-sm text-slate-700">Çankaya İncek'te doğayla iç içe, geniş sosyal alanlara sahip yeni nesil yaşam projesi.</p><Link to="/projelerimiz" className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white hover:bg-red-800">Projeleri İncele</Link></div></div>
          <div className="rc-navy-frame rounded-3xl bg-red-700 p-8 text-white"><span className="text-xs font-black tracking-widest text-red-100">YATIRIM FIRSATLARI</span><h2 className="mt-3 text-3xl font-black">Yatırımlarınıza doğru projeler ile başlayın</h2><p className="mt-4 text-sm leading-relaxed text-red-50">Konut ve ticari projelerde lokasyon, değerleme ve satış süreçlerini uzmanlarımızla planlayın.</p><Link to="/projelerimiz" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-red-700">Projeleri Gör</Link></div>
        </div>
      </section>

      <section className="gold-showcase relative isolate overflow-hidden border-y border-sky-200 py-16"><div className="gold-showcase-glow gold-showcase-glow-one"/><div className="gold-showcase-glow gold-showcase-glow-two"/><div className="gold-showcase-spark gold-showcase-spark-one">✦</div><div className="gold-showcase-spark gold-showcase-spark-two">✦</div><div className="gold-showcase-spark gold-showcase-spark-three">✦</div><div className="gold-showcase-spark gold-showcase-spark-four">✦</div><div className="gold-showcase-spark gold-showcase-spark-five">✦</div><div className="gold-showcase-spark gold-showcase-spark-six">✦</div><div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12"><div className="mb-10 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-white/70 shadow-sm backdrop-blur-md px-4 py-1.5 text-[10px] font-black tracking-[.2em] text-sky-800">✦ REALTY CENTER® SEÇKİNLERİ ✦</span><h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">Öne Çıkan <span className="text-sky-600">Yıldızlarımız</span></h2><p className="mt-2 text-sm text-slate-600">Başarıları ve uzmanlıklarıyla öne çıkan ofislerimiz ile danışmanlarımız.</p></div><div className="grid gap-10 xl:grid-cols-2 xl:gap-12"><div><div className="mb-5 flex items-end justify-between gap-3"><div><span className="text-xs font-black tracking-widest text-sky-600">SEÇKİN OFİSLER</span><h3 className="mt-1 text-2xl font-black text-slate-950">Öne çıkan ofislerimiz</h3></div><Link to="/ofislerimiz" className="rounded-full border border-sky-300 bg-white/70 px-3 py-1.5 text-xs font-black text-sky-800 shadow-sm transition hover:border-sky-500 hover:bg-sky-100">Tümü →</Link></div><div className="grid grid-cols-3 gap-3">{SAMPLE_OFFICES.slice(0, 3).map((office) => <Link key={office.id} to="/ofislerimiz" className="gold-showcase-card group relative overflow-hidden rounded-2xl border border-sky-200/90 bg-white/80 p-2 backdrop-blur-md transition hover:-translate-y-1 hover:border-sky-400 hover:bg-white"><img src={office.image} alt={office.name} className="h-20 w-full rounded-xl object-cover ring-1 ring-sky-200"/><p className="mt-3 text-[9px] font-black tracking-wide text-sky-600">ÖNE ÇIKAN OFİS</p><h3 className="mt-1 line-clamp-2 text-xs font-black text-slate-950">{office.name}</h3><p className="mt-1 text-[10px] text-slate-600">{office.district}, {office.city}</p></Link>)}</div></div><div><div className="mb-5 flex items-end justify-between gap-3"><div><span className="text-xs font-black tracking-widest text-sky-600">SEÇKİN DANIŞMANLAR</span><h3 className="mt-1 text-2xl font-black text-slate-950">Öne çıkan danışmanlarımız</h3></div><Link to="/danismanlarimiz" className="rounded-full border border-sky-300 bg-white/70 px-3 py-1.5 text-xs font-black text-sky-800 shadow-sm transition hover:border-sky-500 hover:bg-sky-100">Tümü →</Link></div><div className="grid grid-cols-3 gap-3">{SAMPLE_AGENTS.slice(0, 3).map((agent) => <Link key={agent.id} to="/danismanlarimiz" className="gold-showcase-card group relative overflow-hidden rounded-2xl border border-sky-200/90 bg-white/80 p-2 backdrop-blur-md transition hover:-translate-y-1 hover:border-sky-400 hover:bg-white"><img src={agent.image} alt={agent.name} className="h-20 w-full rounded-xl object-cover ring-1 ring-sky-200"/><p className="mt-3 text-[9px] font-black tracking-wide text-sky-600">ÖNE ÇIKAN DANIŞMAN</p><h3 className="mt-1 line-clamp-2 text-xs font-black text-slate-950">{agent.name}</h3><p className="mt-1 text-[10px] text-slate-600">{agent.title}</p></Link>)}</div></div></div></div></section>
      <HomeLibraryPreview />

      

      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-6 lg:grid-cols-2">
          <div className="rc-navy-frame rounded-3xl bg-red-700 p-8 text-white"><span className="text-xs font-black tracking-widest text-red-100">KARİYER</span><h2 className="mt-3 text-3xl font-black">Gayrimenkul kariyerine güçlü bir başlangıç.</h2><p className="mt-4 text-sm leading-relaxed text-red-50">Danışmanlık fırsatları, eğitimler ve kariyer başvuruları bu alandan yönetilecektir.</p><Link to="/danisman-basvuru" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-red-700">Kariyer Başvurusu</Link></div>
          <div className="rounded-3xl border border-slate-200 p-8"><span className="text-xs font-black tracking-widest text-red-700">İLETİŞİM FORMU</span><h2 className="mt-3 text-3xl font-black text-slate-900">Size ulaşalım.</h2><form className="mt-5 grid gap-3 sm:grid-cols-2"><input placeholder="Ad Soyad" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input placeholder="Telefon" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input placeholder="E-posta" className="sm:col-span-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"/><textarea placeholder="Mesajınız" className="sm:col-span-2 min-h-24 rounded-xl border border-slate-200 px-4 py-3 text-sm"/><button type="button" className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-red-700">Bilgi Talebi Gönder</button></form></div>
        </div>
      </section>
      <section className="bg-slate-50 py-10 border-b border-slate-200"><div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center justify-center gap-5 text-center"><div><span className="text-xs font-black tracking-widest text-red-700">SOSYAL MEDYA</span><h2 className="mt-1 text-2xl font-black text-slate-900">Realty Center®’ı takip edin.</h2></div><div className="flex flex-wrap justify-center gap-3">{SOCIAL_MEDIA_LINKS.map((social) => <a key={social.name} href="#" aria-label={social.name} title={social.name} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-1 hover:border-red-300"><img src={social.icon} alt={social.name} className="h-6 w-6" /></a>)}</div></div></section>

      <TurkeyListingMap />

      <section id="kurumsal" className="relative overflow-hidden border-y border-slate-200 bg-[#fffafa] py-20 text-slate-950">
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-red-700/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-red-700/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-xs font-black tracking-widest text-red-700">GÜVEN · UZMANLIK · ŞEFFAFLIK</span><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">NEDEN <span className="text-red-700">REALTY CENTER®?</span></h2><div className="mt-4 h-1 w-24 rounded-full bg-red-700" /></div><Link to="/neden-realty-center" className="inline-flex w-fit rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800">Tümünü Göster →</Link></div>
          <div className="grid gap-4 md:grid-cols-2">{WHY_REALTY_CENTER_ITEMS.slice(0, 4).map((item, index) => <div key={item} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-red-700 hover:shadow-lg"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm text-white shadow-sm">{index + 1}</span><span>{item}</span></div>)}</div>
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
                alt="Realty Center® Emlak Danışmanlığı Eğitimi" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/15 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-700 text-white rounded-lg shadow-md shadow-red-700/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-wider">REALTY CENTER® AKADEMİ</h4>
                    <p className="text-xs text-slate-600 font-medium">Sertifikalı Profesyonel Eğitim</p>
                  </div>
                </div>
                <span className="text-xs font-black text-white bg-red-700 px-3 py-1.5 rounded-md border border-red-700">
                  Sınırlı Kontenjan
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="inline-flex items-center space-x-2 text-xs font-black text-white tracking-widest bg-red-700 px-4 py-1.5 rounded-full border border-red-700">
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
              Realty Center® Akademi bünyesinde düzenlenen interaktif <strong className="text-slate-900 font-bold">ofis içi ve online eğitimlerimizle</strong>, gayrimenkul sektörünün zirvesine adım atın. Satış tekniklerinden hukuki mevzuatlara, portföy yönetiminden dijital pazarlamaya kadar tüm süreçleri alanında uzman eğitmenlerimizden öğrenin.
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
    </div>
  );
}

function AboutPage() {
  const [story, setStory] = useState(getAboutStory);
  useEffect(() => { const update = () => setStory(getAboutStory()); window.addEventListener('realty-center-corporate-updated', update); return () => window.removeEventListener('realty-center-corporate-updated', update); }, []);
  return <main className="min-h-screen bg-slate-50"><section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-6xl px-6"><p className="text-xs font-black tracking-[.22em] text-red-400">REALTY CENTER® · ÖNCE GÜVEN</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Gayrimenkulde güveni, uzmanlık ve teknolojiyle büyüten bir marka</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">Türkiye genelindeki kurumsal gayrimenkul hizmetlerimizle doğru kararların, sürdürülebilir başarının ve güçlü iş birliklerinin merkezindeyiz.</p></div></section><section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.35fr_.65fr]"><article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><h2 className="text-2xl font-black text-slate-900">Realty Center®’ın Hikâyesi</h2><div className="mt-6 space-y-5">{story.split('\n\n').map((paragraph) => <p key={paragraph.slice(0,40)} className="text-sm leading-7 text-slate-600">{paragraph}</p>)}</div></article><aside className="flex min-h-80 items-center justify-center rounded-3xl border border-red-100 bg-white p-8 shadow-sm"><img src="/rlogo2.png" alt="Realty Center® Önce Güven" className="w-full max-w-xs object-contain"/></aside></section></main>;
}

function MissionVisionPage() {
  const sections = [
    { title: 'Misyonumuz', text: 'Gayrimenkul satın alma, satma ve kiralama süreçlerini; şeffaf bilgi, etik danışmanlık, yerel uzmanlık ve güçlü teknolojiyle herkes için daha güvenli ve anlaşılır hâle getirmek.' },
    { title: 'Vizyonumuz', text: 'Türkiye genelinde güven denildiğinde ilk akla gelen; danışmanları, franchise ofisleri ve dijital çözümleriyle gayrimenkul sektörünün geleceğine yön veren öncü marka olmak.' }
  ];
  const standards = ['Doğrulanmış ve güncel portföy bilgileri','Şeffaf fiyatlandırma ve açık iletişim','Mevzuata uygun sözleşme ve işlem süreçleri','Sürekli eğitim alan uzman danışmanlar','Ölçülebilir müşteri memnuniyeti takibi','Teknoloji destekli hızlı ve güvenli hizmet'];
  return <main className="min-h-screen bg-gradient-to-b from-white via-red-50/30 to-slate-50 py-14"><div className="mx-auto max-w-6xl px-6"><p className="text-xs font-black tracking-[.2em] text-red-700">KURUMSAL YÖNÜMÜZ</p><h1 className="mt-3 text-4xl font-black text-slate-900">Misyonumuz ve Vizyonumuz</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Realty Center®’ın bugünkü hizmet anlayışını ve geleceğe dönük hedeflerini belirleyen kurumsal yaklaşımımız.</p><div className="mt-9 grid gap-6 md:grid-cols-2">{sections.map((section,index) => <article key={section.title} className="relative overflow-hidden rounded-3xl border border-red-100 bg-white p-8 shadow-[0_14px_35px_rgba(15,23,42,.07)]"><span className="absolute -right-3 -top-6 text-8xl font-black text-red-50">0{index+1}</span><span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">0{index+1}</span><h2 className="relative mt-5 text-2xl font-black text-slate-900">{section.title}</h2><p className="relative mt-4 text-sm leading-7 text-slate-600">{section.text}</p></article>)}</div><section className="mt-8 rounded-3xl border border-red-100 bg-white p-7 shadow-[0_14px_35px_rgba(15,23,42,.06)] sm:p-10"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-[10px] font-black tracking-[.2em] text-red-700">ÖNCE GÜVEN</p><h2 className="mt-3 text-3xl font-black text-slate-900">Kalite Standartlarımız</h2><p className="mt-4 text-sm leading-7 text-slate-600">Her Realty Center® ofisinde aynı güvenilir hizmet deneyimini oluşturmak için uyguladığımız temel standartlar.</p></div><div className="grid gap-3 sm:grid-cols-2">{standards.map((standard) => <div key={standard} className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/40 p-4 text-xs font-black text-slate-700"><CheckCircle2 className="h-5 w-5 shrink-0 text-red-700"/>{standard}</div>)}</div></div></section></div></main>;
}

function TrustPrinciplePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-4 border-b-4 border-red-700 pb-2 inline-block">Önce Güven İlkesi</h1>
      <p className="text-slate-600 leading-relaxed text-lg mt-4">Şeffaf ticaret, güvenilir altyapı ve hukuki süreç yönetimimiz bu sayfada açıklanacaktır.</p>
    </div>
  );
}

function WhyRealtyCenterPage() {
  return (
    <main className="min-h-screen bg-[#fffafa] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Link to="/" className="inline-flex items-center text-sm font-black text-red-700 transition hover:text-red-800">← Ana sayfaya dön</Link>
        <section className="relative mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-700/5 blur-3xl" />
          <div className="relative">
            <span className="text-xs font-black tracking-widest text-red-700">GÜVEN · UZMANLIK · ŞEFFAFLIK</span>
            <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">NEDEN <span className="text-red-700">REALTY CENTER®?</span></h1>
            <div className="mt-4 h-1 w-24 rounded-full bg-red-700" />
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">Gayrimenkul yolculuğunuzda doğru kararlar almanız için şeffaf, uzman ve çözüm odaklı bir hizmet anlayışı sunuyoruz.</p>
          </div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {WHY_REALTY_CENTER_ITEMS.map((item, index) => <article key={item} className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-base font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-red-700 hover:shadow-lg"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm text-white shadow-sm">{index + 1}</span><span className="leading-6">{item}</span></article>)}
        </section>
      </div>
    </main>
  );
}

function TeamPage() {
  const [members, setMembers] = useState(getManagementTeam);
  const [selected, setSelected] = useState<ManagementMember | null>(null);
  useEffect(() => { const update = () => setMembers(getManagementTeam()); window.addEventListener('realty-center-corporate-updated', update); return () => window.removeEventListener('realty-center-corporate-updated', update); }, []);
  return <main className="min-h-screen bg-slate-50 py-14"><div className="mx-auto max-w-6xl px-6"><p className="text-xs font-black tracking-[.2em] text-red-700">KURUMSAL YÖNETİM</p><h1 className="mt-3 text-4xl font-black text-slate-950">Yönetim Kadromuz</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Realty Center®’ın stratejisine, hizmet kalitesine ve sürdürülebilir büyümesine yön veren yönetim ekibimizle tanışın.</p><div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{members.map((member) => <button key={member.id} onClick={() => setSelected(member)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><img src={member.image} alt={member.name} className="h-72 w-full object-cover object-top transition duration-500 group-hover:scale-105"/><div className="p-5"><p className="text-[10px] font-black tracking-widest text-red-700">YÖNETİM KADROSU</p><h2 className="mt-2 text-xl font-black text-slate-900">{member.name}</h2><p className="mt-1 text-xs font-bold text-slate-500">{member.title}</p><span className="mt-4 inline-flex text-xs font-black text-red-700">Özgeçmişi görüntüle →</span></div></button>)}</div></div>{selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}><article className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-[280px_1fr]" onClick={(e) => e.stopPropagation()}><button onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow"><X className="h-5 w-5"/></button><img src={selected.image} alt={selected.name} className="h-72 w-full object-cover object-top md:h-full"/><div className="p-7 sm:p-9"><p className="text-[10px] font-black tracking-widest text-red-700">REALTY CENTER® YÖNETİM KADROSU</p><h2 className="mt-3 text-3xl font-black text-slate-900">{selected.name}</h2><p className="mt-2 text-sm font-black text-red-700">{selected.title}</p><div className="my-6 h-px bg-slate-200"/><h3 className="text-sm font-black text-slate-900">Özgeçmiş</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{selected.biography}</p></div></article></div>}</main>;
}

function DocumentsPage() {
  const [documents, setDocuments] = useState(() => getStoredCorporateItems<CorporateDocument[]>('realty-center-documents', DEFAULT_DOCUMENTS));
  const [selectedDocument, setSelectedDocument] = useState<CorporateDocument | null>(null);
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  useEffect(() => { const update = () => setDocuments(getStoredCorporateItems('realty-center-documents', DEFAULT_DOCUMENTS)); window.addEventListener('realty-center-corporate-updated', update); return () => window.removeEventListener('realty-center-corporate-updated', update); }, []);
  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];
    Promise.all(documents.map(async (document) => {
      if (!document.fileUrl) return [document.id, ''] as const;
      if (!document.fileUrl.startsWith('data:')) return [document.id, document.fileUrl] as const;
      try {
        const blob = await (await fetch(document.fileUrl)).blob();
        const url = URL.createObjectURL(blob);
        createdUrls.push(url);
        return [document.id, url] as const;
      } catch { return [document.id, ''] as const; }
    })).then((entries) => { if (active) setPdfUrls(Object.fromEntries(entries)); });
    return () => { active = false; createdUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [documents]);
  return <main className="min-h-screen bg-slate-50 py-14"><div className="mx-auto max-w-6xl px-6"><p className="text-xs font-black tracking-[.2em] text-red-700">KURUMSAL ŞEFFAFLIK</p><h1 className="mt-3 text-4xl font-black text-slate-950">Belgelerimiz</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Kurumsal yetki, kalite ve hizmet belgelerimizi inceleyebilirsiniz. Yüklenen PDF belgeleri çerçeveli belge görünümünde sunulur.</p><div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <article key={document.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="relative aspect-[4/5] overflow-hidden rounded-sm border-[10px] border-double border-[#7b4b2a] bg-[#eee8dc] p-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,.8),0_14px_28px_rgba(15,23,42,.18)]">{document.fileUrl && pdfUrls[document.id] ? <iframe title={`${document.title} önizleme`} src={`${pdfUrls[document.id]}#page=1&view=FitH&toolbar=0&navpanes=0`} className="pointer-events-none h-full w-full border-0 bg-white"/> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-white to-slate-100 p-5 text-center"><div><FileText className="mx-auto h-14 w-14 text-red-700"/><p className="mt-4 text-xs font-black tracking-widest text-slate-400">REALTY CENTER®</p><h2 className="mt-2 text-lg font-black text-slate-900">{document.fileUrl ? 'Belge hazırlanıyor…' : document.title}</h2><p className="mt-3 text-xs leading-5 text-slate-500">{document.description}</p></div></div>}<span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/15"/></div><div className="mt-4"><h2 className="text-base font-black text-slate-900">{document.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{document.description}</p></div>{document.fileUrl ? <button type="button" onClick={() => setSelectedDocument(document)} className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-xs font-black text-white">PDF Belgeyi Görüntüle</button> : <span className="mt-4 flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-400">Belge yakında yüklenecek</span>}</article>)}</div></div>{selectedDocument && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm" onClick={() => setSelectedDocument(null)}><section className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3"><div><p className="text-[10px] font-black tracking-widest text-red-700">REALTY CENTER® BELGELERİ</p><h2 className="mt-1 text-sm font-black text-slate-900">{selectedDocument.title}</h2></div><button type="button" onClick={() => setSelectedDocument(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-red-700 hover:text-white" aria-label="Belgeyi kapat"><X className="h-5 w-5"/></button></header>{pdfUrls[selectedDocument.id] ? <iframe title={selectedDocument.title} src={`${pdfUrls[selectedDocument.id]}#view=FitH&toolbar=0&navpanes=0`} className="min-h-0 flex-1 border-0 bg-slate-200"/> : <div className="flex flex-1 items-center justify-center text-sm font-black text-slate-500">Belge yükleniyor…</div>}</section></div>}</main>;
}

function LogoShowcasePage({ mode }: { mode: 'references' | 'partners' }) {
  const key = mode === 'references' ? 'realty-center-references' : 'realty-center-partners';
  const fallback = mode === 'references' ? DEFAULT_REFERENCES : DEFAULT_PARTNERS;
  const [items, setItems] = useState(() => getStoredCorporateItems<CorporateLogoItem[]>(key, fallback));
  const [selected, setSelected] = useState<CorporateLogoItem | null>(null);
  useEffect(() => { const update = () => setItems(getStoredCorporateItems(key, fallback)); window.addEventListener('realty-center-corporate-updated', update); return () => window.removeEventListener('realty-center-corporate-updated', update); }, [key]);
  const isPartners = mode === 'partners';
  return <main className="min-h-screen bg-slate-50 py-14"><div className="mx-auto max-w-6xl px-6"><p className="text-xs font-black tracking-[.2em] text-red-700">{isPartners ? 'GÜÇLÜ İŞ BİRLİKLERİ' : 'GÜVENİMİZİN REFERANSLARI'}</p><h1 className="mt-3 text-4xl font-black text-slate-950">{isPartners ? 'İş Ortaklarımız' : 'Referanslarımız'}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{isPartners ? 'Anlaşmalı bankalarımız ve çözüm ortağı kurumlarımızla sunduğumuz avantajları incelemek için logolara tıklayın.' : 'Birlikte değer ürettiğimiz kurumları ve tamamladığımız çalışmaları logolar üzerinden inceleyebilirsiniz.'}</p><div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{items.map((item) => <button key={item.id} onClick={() => setSelected(item)} className="group flex min-h-44 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-xl"><img src={item.logo} alt={item.name} className="h-20 w-full object-contain transition group-hover:scale-105"/><h2 className="mt-4 text-center text-sm font-black text-slate-800">{item.name}</h2><span className="mt-2 text-[10px] font-black text-red-700">Anlaşma detayları →</span></button>)}</div></div>{selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}><article onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl"><button onClick={() => setSelected(null)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"><X className="h-5 w-5"/></button><img src={selected.logo} alt={selected.name} className="h-24 w-48 object-contain"/><h2 className="mt-6 text-2xl font-black text-slate-900">{selected.name}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{selected.content}</p></article></div>}</main>;
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
              REALTY CENTER® <span className="text-red-700">AKADEMİ</span>
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
                alt="Realty Center® Eğitim Sınıfı" 
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
                    <span>Realty Center® Kurumsal Sertifikası</span>
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
            REALTY CENTER® <span className="text-red-700">OFİSLERİMİZ</span>
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
                          src="/rlogo2.png"
                          alt="Realty Center®" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-600 mt-2">REALTY CENTER®</span>
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
  const [agentNameInput, setAgentNameInput] = useState('');
  const [agentNameQuery, setAgentNameQuery] = useState('');

  const filteredAgents = SAMPLE_AGENTS.filter((agent) => {
    if (selectedCity && agent.city !== selectedCity) return false;
    if (selectedDistrict && agent.district !== selectedDistrict) return false;
    if (agentNameQuery && !agent.name.toLocaleLowerCase('tr-TR').includes(agentNameQuery.toLocaleLowerCase('tr-TR').trim())) return false;
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

          <div className="grid grid-cols-1 gap-3 w-full sm:grid-cols-3 lg:w-auto">
            <form onSubmit={(event) => { event.preventDefault(); setAgentNameQuery(agentNameInput.trim()); }} className="flex overflow-hidden rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-red-700">
              <input value={agentNameInput} onChange={(event) => setAgentNameInput(event.target.value)} placeholder="Danışman adı" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs font-bold text-slate-800 outline-none lg:w-32" />
              <button type="submit" className="bg-red-700 px-3 text-[10px] font-black text-white">Ara</button>
            </form>
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
                          src="/rlogo2.png"
                          alt="Realty Center®" 
                          className="h-16 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] text-red-600 mt-2">REALTY CENTER® DANIŞMANI</span>
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
  const groups = [
    { title: 'Satılık Gayrimenkuller', label: 'SATILIK', color: '#C9162B', transaction: 'Satılık', description: 'Yaşam ve yatırım ihtiyaçlarınıza uygun satılık seçenekler.', items: [['Konut','Ev','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=900'],['Villa','Villa','https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=900'],['Arsa','Arsa','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=900'],['Tüm satılık ilanlar','','https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=900']] },
    { title: 'Kiralık Gayrimenkuller', label: 'KİRALIK', color: '#275B9B', transaction: 'Kiralık', description: 'Konut ve ticari kullanım için güncel kiralama fırsatları.', items: [['Konut','Ev','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=900'],['İşyeri','Dükkan','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=900'],['Villa','Villa','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=900'],['Tüm kiralık ilanlar','','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=900']] },
    { title: 'Devren İşyerleri', label: 'DEVREN', color: '#72529C', transaction: 'Devren Satılık', description: 'Faaliyetine devam eden işletme ve ticari alan seçenekleri.', items: [['İşyeri','Dükkan','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900'],['Dükkan','Dükkan','https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=900'],['Ofis','Ofis','https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=900'],['Tüm devren ilanlar','','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900']] },
    { title: 'Yeni Projeler', label: 'PROJELER', color: '#A66A18', route: '/projelerimiz', description: 'Öne çıkan konut, villa ve ticari proje seçeneklerini inceleyin.', items: [['Yeni Konut','','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=900'],['Ticari Proje','','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=900'],['Villa Projesi','','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=900'],['Tüm projeleri incele','','https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=900']] },
  ];
  const openCategory = (group: typeof groups[number], propertyType: string) => {
    if ('route' in group && group.route) { navigate(group.route); return; }
    const query = new URLSearchParams();
    if ('transaction' in group && group.transaction) query.set('type', group.transaction);
    if (propertyType) query.set('propertyType', propertyType);
    navigate(`/ilanlarimiz?${query.toString()}`);
  };
  return (
    <div className="min-h-screen bg-[#f7f8fa] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="border-b border-slate-200 pb-9"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black tracking-[.22em] text-red-700">REALTY CENTER® · PORTFÖY KEŞFİ</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Gayrimenkul kategorileri</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">İhtiyacınıza uygun kategoriyle başlayın; seçiminiz ilgili ilan listesine ve aktif filtrelere doğrudan uygulanır.</p></div><Link to="/ilanlarimiz?all=1" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#CD011E] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/15 transition hover:bg-red-800">Tüm ilanları incele <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{groups.map((group,index) => <section key={group.title} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"><div className="relative h-20 overflow-hidden"><img src={group.items[0][2]} alt="" className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0" style={{background:`linear-gradient(90deg, ${group.color}f4 0%, ${group.color}dc 62%, ${group.color}a8 100%)`}}/><div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between"><div><p className="text-[8px] font-black tracking-[.18em] text-white/80">{group.label}</p><h2 className="mt-0.5 text-sm font-black text-white">{group.title}</h2></div><span className="text-[9px] font-bold text-white/75">0{index+1}</span></div></div><div className="p-3"><p className="truncate text-[10px] leading-4 text-slate-500">{group.description}</p><div className="mt-2.5 grid grid-cols-2 gap-1.5">{group.items.map(([label,propertyType,image],itemIndex) => <button key={`${group.title}-${label}`} onClick={() => openCategory(group, propertyType)} className="group/item relative aspect-square overflow-hidden rounded-md text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover/item:scale-110"/><span className="absolute inset-0 transition" style={{background:`linear-gradient(145deg, ${group.color}f0 0%, ${group.color}d8 58%, ${group.color}b8 100%)`}}/><span className="relative flex h-full flex-col justify-between p-2"><span className="text-[7px] font-black tracking-[.14em] text-white/75">0{itemIndex+1}</span><span><span className="block text-[11px] font-black leading-3 text-white">{label}</span><span className="mt-0.5 flex items-center gap-1 text-[7px] font-bold uppercase tracking-wide text-white/85">{propertyType || 'Tüm seçenekler'} <ArrowRight className="h-2.5 w-2.5 transition group-hover/item:translate-x-1"/></span></span></span></button>)}</div></div></section>)}</div>
      </div>
    </div>
  );
}


function AIDecisionAssistantPage() {
  const location = useLocation();
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') || "Çankaya'da 8 milyon TL'ye kadar 3+1 daire arıyorum.");
  const [searched, setSearched] = useState(true);
  const [aiTab, setAiTab] = useState<'assistant' | 'valuation'>('assistant');
  const [valuationReady, setValuationReady] = useState(false);
  const [valuationCalculating, setValuationCalculating] = useState(false);
  const [valuation, setValuation] = useState({ city: 'Ankara', district: 'Çankaya', propertyType: 'Daire', area: '120', rooms: '3+1', age: '5-10' });
  const analysis = () => {
    const normalized = query.toLocaleLowerCase('tr-TR');
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(milyon|m|bin|tl)/);
    const raw = match ? Number(match[1].replace(',', '.')) : 8;
    const budget = match ? (match[2] === 'milyon' || match[2] === 'm' ? raw * 1000000 : match[2] === 'bin' ? raw * 1000 : raw) : 8000000;
    const rooms = normalized.match(/\d\+\d/)?.[0] || '';
    const district = normalized.includes('çankaya') ? 'Çankaya' : '';
    const type = normalized.includes('daire') ? 'Daire' : '';
    const matches = SAMPLE_LISTINGS.filter((item) => (!district || item.district === district) && (!type || item.propertyType === type) && (!rooms || item.rooms === rooms) && item.price <= budget);
    return { budget, rooms, district, matches };
  };
  const result = analysis();
  const money = (value: number) => value.toLocaleString('tr-TR') + ' ₺';
  return <div className="min-h-screen bg-slate-50 py-10">
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="ai-assistant-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-2xl sm:px-10">
        <div className="ai-world-first-badge absolute right-4 top-4 z-10 flex h-24 w-24 rotate-3 flex-col items-center justify-center rounded-full border border-cyan-100/60 bg-[#071a3b]/80 text-center shadow-[0_0_30px_rgba(34,211,238,.38)] backdrop-blur-md sm:right-7 sm:top-7 sm:h-28 sm:w-28">
          <span className="text-[8px] font-black tracking-[.08em] text-cyan-200">DÜNYADA</span><span className="text-[10px] font-black leading-none text-white">İLK</span><span className="my-1.5 h-px w-11 bg-cyan-200/60"/><span className="text-[7px] font-bold tracking-[.09em] text-white/90">WORLD'S</span><span className="text-[8px] font-black leading-none text-white">FIRST</span>
        </div>
        <span className="inline-flex rounded-full border border-cyan-300/50 bg-cyan-300/10 px-3 py-1 text-[10px] font-black tracking-[.18em] text-cyan-200">ÜCRETSİZ DEMO · YAPAY ZEKA GAYRİMENKUL ASİSTANI</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Yapay Zeka <span className="text-cyan-300">Gayrimenkul Asistanı.</span></h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">İhtiyacınızı günlük dille yazın veya mülkünüzün bilgilerini girerek tahmini değer aralığını görün.</p>
        <div className="mt-6 inline-flex rounded-xl border border-white/15 bg-[#03142e]/60 p-1">
          <button onClick={() => setAiTab('assistant')} className={`rounded-lg px-5 py-3 text-sm font-black transition ${aiTab === 'assistant' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border border-white/15 bg-white/5 text-cyan-100 hover:bg-white/15'}`}>🤖 Akıllı Arama</button>
          <button onClick={() => setAiTab('valuation')} className={`rounded-lg px-5 py-3 text-sm font-black transition ${aiTab === 'valuation' ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border border-white/15 bg-white/5 text-cyan-100 hover:bg-white/15'}`}>⌁ Otomatik Değerleme</button>
        </div>
        {aiTab === 'assistant' ? <><div className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && setSearched(true)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none ring-cyan-500 focus:ring-2" placeholder="Örn. Çankaya'da 8 milyon TL'ye kadar 3+1 daire arıyorum." />
          <button onClick={() => setSearched(true)} className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white transition hover:bg-cyan-700"><Search className="mr-2 inline h-4 w-4" />Analiz Et</button>
        </div><p className="mt-3 text-xs text-slate-400">Bu ilk sürüm, ücretsiz demo amaçlı olarak site verisi ve örnek bölge metrikleriyle çalışır.</p></> : <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm"><div className="grid gap-3 sm:grid-cols-3">
          <label className="text-[11px] font-black text-cyan-100">İL<input value={valuation.city} onChange={e=>setValuation({...valuation,city:e.target.value})} className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-sm font-bold text-slate-800" /></label>
          <label className="text-[11px] font-black text-cyan-100">İLÇE<input value={valuation.district} onChange={e=>setValuation({...valuation,district:e.target.value})} className="mt-1 w-full rounded-xl border border-white/20 bg-white/95 px-3 py-2.5 text-sm font-bold text-slate-800" /></label>
          <label className="text-[11px] font-black text-cyan-100">GAYRİMENKUL TÜRÜ<select value={valuation.propertyType} onChange={e=>setValuation({...valuation,propertyType:e.target.value})} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-800"><option>Daire</option><option>Villa</option><option>Ofis</option><option>Arsa</option></select></label>
          <label className="text-[11px] font-black text-cyan-100">BRÜT m²<input value={valuation.area} onChange={e=>setValuation({...valuation,area:e.target.value})} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-800" /></label>
          <label className="text-[11px] font-black text-cyan-100">ODA SAYISI<select value={valuation.rooms} onChange={e=>setValuation({...valuation,rooms:e.target.value})} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-800"><option>3+1</option><option>2+1</option><option>4+1</option></select></label>
          <label className="text-[11px] font-black text-cyan-100">BİNA YAŞI<select value={valuation.age} onChange={e=>setValuation({...valuation,age:e.target.value})} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-800"><option>0-4</option><option>5-10</option><option>11-20</option><option>20+</option></select></label>
        </div><button disabled={valuationCalculating} onClick={()=>{setValuationReady(false);setValuationCalculating(true);window.setTimeout(()=>{setValuationCalculating(false);setValuationReady(true)},1000)}} className="mt-4 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-80">{valuationCalculating ? 'Değerleme hesaplanıyor…' : 'Otomatik Değerle'}</button>{valuationCalculating && <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100"><span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-100 border-t-transparent"/><span>Konum, piyasa ve benzer ilan verileri analiz ediliyor…</span></div>}</div>}
      </div>
      {aiTab === 'assistant' && searched && <div className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-widest text-cyan-700">AI ÖZETİ</p><h2 className="mt-1 text-2xl font-black text-slate-900">{result.district || 'Seçilen bölge'} için değerlendirme</h2></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">{result.matches.length} uygun ilan</span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><p className="text-[10px] font-black tracking-widest text-slate-500">BÜTÇE</p><p className="mt-1 text-lg font-black text-slate-900">{money(result.budget)}</p></div><div className="rounded-2xl bg-blue-50 p-4"><p className="text-[10px] font-black tracking-widest text-slate-500">ORT. m² FİYATI</p><p className="mt-1 text-lg font-black text-slate-900">45.500 ₺</p></div><div className="rounded-2xl bg-blue-50 p-4"><p className="text-[10px] font-black tracking-widest text-slate-500">TAHMİNİ KİRA</p><p className="mt-1 text-lg font-black text-slate-900">31.000 - 38.000 ₺</p></div></div>
          <div className="mt-6 space-y-3">{result.matches.length ? result.matches.map((item) => <Link key={item.id} to={'/ilan/' + item.id} className="flex gap-4 rounded-2xl border border-slate-100 p-3 transition hover:border-cyan-300 hover:bg-blue-50/70"><img src={item.image} alt="" className="h-20 w-28 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-black text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.area} m² · {item.rooms} · {item.neighborhood}, {item.district}</p><p className="mt-2 font-black text-blue-700">{money(item.price)}</p></div><ArrowRight className="mt-7 h-5 w-5 text-slate-400"/></Link>) : <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">Bu kriterlerde demo ilanda sonuç bulunamadı. Farklı bir bütçe veya ilan türü deneyin.</div>}</div>
        </section>
        <aside className="space-y-5"><div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black tracking-widest text-cyan-700">YATIRIM GÖRÜNÜMÜ</p><div className="mt-4 space-y-4 text-sm"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Tahmini brüt getiri</span><b className="text-slate-900">%5,6</b></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Geri dönüş süresi</span><b className="text-slate-900">17,8 yıl</b></div><div className="flex items-center justify-between"><span className="text-slate-500">5 yıllık fiyat değişimi</span><b className="text-emerald-600">+%164</b></div></div><p className="mt-4 text-[11px] leading-relaxed text-slate-400">Gösterimler örnek veriyle üretilmiştir; yatırım tavsiyesi değildir.</p></div><div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black tracking-widest text-cyan-700">BÖLGEDE NELER VAR?</p><div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-700"><div className="rounded-xl bg-slate-50 p-3">🏫 12 okul<br/><span className="text-slate-400">1 km içinde</span></div><div className="rounded-xl bg-slate-50 p-3">🏥 4 hastane<br/><span className="text-slate-400">3 km içinde</span></div><div className="rounded-xl bg-slate-50 p-3">🚇 Metro<br/><span className="text-slate-400">850 m mesafe</span></div><div className="rounded-xl bg-slate-50 p-3">🏦 Kredi<br/><span className="text-slate-400">Hesaplanabilir</span></div></div><Link to="/danismanlarimiz" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-4 py-3 text-xs font-black text-white hover:bg-cyan-700">Bölge danışmanlarıyla görüş <ArrowRight className="ml-2 h-4 w-4"/></Link></div></aside>
      </div>}
      {aiTab === 'valuation' && valuationReady && <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm"><p className="text-xs font-black tracking-widest text-cyan-700">OTOMATİK DEĞERLEME SONUCU</p><h2 className="mt-2 text-2xl font-black text-slate-900">{valuation.district}, {valuation.city} · {valuation.propertyType}</h2><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-cyan-50 p-4"><p className="text-[10px] font-black text-slate-500">TAHMİNİ DEĞER</p><p className="mt-1 text-xl font-black text-slate-900">{(Number(valuation.area||120)*45500*.92).toLocaleString('tr-TR')} – {(Number(valuation.area||120)*45500*1.08).toLocaleString('tr-TR')} ₺</p></div><div className="rounded-2xl bg-cyan-50 p-4"><p className="text-[10px] font-black text-slate-500">BÖLGE m² ORT.</p><p className="mt-1 text-xl font-black text-slate-900">45.500 ₺</p></div><div className="rounded-2xl bg-cyan-50 p-4"><p className="text-[10px] font-black text-slate-500">GÜVEN SKORU</p><p className="mt-1 text-xl font-black text-emerald-600">Yüksek</p></div></div><p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">Değer aralığı; konum, {valuation.area} m², {valuation.rooms} ve bina yaşı bilgilerine göre örnek piyasa metrikleriyle hesaplandı. Resmî ekspertiz yerine geçmez.</p></div><aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black tracking-widest text-cyan-700">PİYASA ÖZETİ</p><ul className="mt-4 space-y-3 text-sm font-semibold text-slate-700"><li>↗ Son 12 ayda bölgede fiyat eğilimi güçlü.</li><li>⌂ Benzer ilanların satış süresi: 42 gün.</li><li>▣ Tahmini aylık kira: 31.000 – 38.000 ₺</li></ul></aside></section>}
    </div>
  </div>;
}

type MapListing = ListingItem & { lat: number; lng: number };
const MAP_LISTING_LOCATIONS = [
  { city: 'Ankara', district: 'Çankaya', neighborhood: 'Yaşamkent', lat: 39.822, lng: 32.708 },
  { city: 'Ankara', district: 'Çankaya', neighborhood: 'İncek', lat: 39.754, lng: 32.732 },
  { city: 'Ankara', district: 'Çankaya', neighborhood: 'Söğütözü', lat: 39.911, lng: 32.809 },
  { city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Fenerbahçe', lat: 40.973, lng: 29.061 },
  { city: 'İstanbul', district: 'Beşiktaş', neighborhood: 'Levent', lat: 41.081, lng: 29.013 },
  { city: 'İstanbul', district: 'Ataşehir', neighborhood: 'Küçükbakkalköy', lat: 40.994, lng: 29.128 },
  { city: 'Antalya', district: 'Konyaaltı', neighborhood: 'Liman', lat: 36.870, lng: 30.636 },
  { city: 'Antalya', district: 'Muratpaşa', neighborhood: 'Fener', lat: 36.852, lng: 30.764 },
  { city: 'İzmir', district: 'Karşıyaka', neighborhood: 'Bostanlı', lat: 38.458, lng: 27.096 },
  { city: 'Bursa', district: 'Nilüfer', neighborhood: 'Özlüce', lat: 40.213, lng: 28.959 },
  { city: 'Muğla', district: 'Bodrum', neighborhood: 'Yalıkavak', lat: 37.105, lng: 27.290 }
];
const MAP_LISTINGS: MapListing[] = SAMPLE_LISTINGS.map((listing, index) => ({ ...listing, ...MAP_LISTING_LOCATIONS[index % MAP_LISTING_LOCATIONS.length] }));

function MapViewportListener({ onBoundsChange, onMapReady, drawing, onDrawPoint }: { onBoundsChange: (bounds: L.LatLngBounds, zoom: number) => void; onMapReady: (map: L.Map) => void; drawing: boolean; onDrawPoint: (point: L.LatLng) => void }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getZoom()),
    zoomend: () => onBoundsChange(map.getBounds(), map.getZoom()),
    click: (event) => { if (drawing) onDrawPoint(event.latlng); }
  });
  useEffect(() => { onBoundsChange(map.getBounds(), map.getZoom()); onMapReady(map); }, [map, onBoundsChange, onMapReady]);
  useEffect(() => {
    const container = map.getContainer();
    if (drawing) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      container.classList.add('map-drawing-mode');
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      container.classList.remove('map-drawing-mode');
    }
    return () => {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      container.classList.remove('map-drawing-mode');
    };
  }, [drawing, map]);
  return null;
}

function MapSearchPage() {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [viewport, setViewport] = useState<{ bounds: L.LatLngBounds | null; zoom: number }>({ bounds: null, zoom: 6 });
  const [transactionType, setTransactionType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<L.LatLng | null>(null);
  const [drawBounds, setDrawBounds] = useState<L.LatLngBounds | null>(null);
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const handleViewportChange = useCallback((bounds: L.LatLngBounds, zoom: number) => setViewport({ bounds, zoom }), []);

  const isInsideDrawnArea = (item: MapListing) => !drawBounds || drawBounds.contains([item.lat, item.lng]);
  const isNearby = (item: MapListing) => {
    if (!nearbyOnly || !userPosition) return true;
    const earthRadius = 6371;
    const dLat = ((item.lat - userPosition.lat) * Math.PI) / 180;
    const dLng = ((item.lng - userPosition.lng) * Math.PI) / 180;
    const value = Math.sin(dLat / 2) ** 2 + Math.cos((userPosition.lat * Math.PI) / 180) * Math.cos((item.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)) <= 5;
  };
  const visibleListings = MAP_LISTINGS.filter((item) => {
    if (transactionType && item.type !== transactionType) return false;
    if (propertyType && item.propertyType !== propertyType) return false;
    if (city && item.city !== city) return false;
    if (viewport.bounds && !viewport.bounds.contains([item.lat, item.lng])) return false;
    return isInsideDrawnArea(item) && isNearby(item);
  });
  const mapListings = MAP_LISTINGS.filter((item) => {
    if (transactionType && item.type !== transactionType) return false;
    if (propertyType && item.propertyType !== propertyType) return false;
    if (city && item.city !== city) return false;
    return isInsideDrawnArea(item) && isNearby(item);
  });
  const clusterMap = new globalThis.Map<string, MapListing[]>();
  if (viewport.zoom < 10) mapListings.forEach((item) => { const key = item.city; clusterMap.set(key, [...(clusterMap.get(key) || []), item]); });

  const beginDrawing = () => {
    setDrawing(true);
    setDrawStart(null);
    setDrawBounds(null);
    setLocationMessage('Haritada alanın ilk ve karşı köşesine tıklayın.');
  };
  const handleDrawPoint = (point: L.LatLng) => {
    if (!drawStart) {
      setDrawStart(point);
      setLocationMessage('İlk köşe seçildi. Şimdi karşı köşeye tıklayın.');
      return;
    }
    setDrawBounds(L.latLngBounds(drawStart, point));
    setDrawStart(null);
    setDrawing(false);
    setLocationMessage('Çizdiğiniz alan içindeki ilanlar gösteriliyor.');
  };
  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationMessage('Tarayıcınız konum özelliğini desteklemiyor.'); return; }
    setLocationMessage('Yakındaki ilanlar için konum izni isteniyor…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = L.latLng(position.coords.latitude, position.coords.longitude);
        setUserPosition(point); setNearbyOnly(true); setLocationMessage('5 km çevrenizdeki ilanlar gösteriliyor.'); mapInstance?.flyTo(point, 13);
      },
      () => setLocationMessage('Konum izni verilmedi. Yakındaki ilanları görmek için tarayıcı iznini açabilirsiniz.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const resetMap = () => {
    setTransactionType(''); setPropertyType(''); setCity(''); setDrawBounds(null); setDrawStart(null); setDrawing(false); setNearbyOnly(false); setUserPosition(null); setLocationMessage(''); mapInstance?.setView([39.0, 35.0], 6);
  };

  return <div className="min-h-screen bg-slate-100 py-6 lg:py-8">
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-[10px] font-black tracking-widest text-red-700"><MapPinned className="h-3.5 w-3.5" /> HARİTA İLE ARA</span><h1 className="mt-3 text-3xl font-black text-slate-900">Harita üzerinden <span className="text-red-700">ilan keşfedin</span></h1><p className="mt-1 text-sm text-slate-500">Haritayı hareket ettirin, yakınlaştırın veya alan çizerek sonuçları anında güncelleyin.</p></div><Link to="/ilanlarimiz?all=1" className="inline-flex w-fit items-center rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-red-700">Liste görünümüne dön <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl lg:order-1 lg:max-h-[760px] lg:overflow-y-auto"><div className="flex items-center justify-between"><h2 className="font-black text-slate-900">Harita Filtreleri</h2><button type="button" onClick={resetMap} className="text-xs font-black text-red-700"><RotateCcw className="mr-1 inline h-3.5 w-3.5" />Sıfırla</button></div><div className="mt-5 space-y-3"><select value={transactionType} onChange={(event) => setTransactionType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-800"><option value="">Tüm işlem tipleri</option>{LISTING_TRANSACTION_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-800"><option value="">Tüm ilan türleri</option>{ALL_LISTING_PROPERTY_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-800"><option value="">Tüm şehirler</option>{[...new Set(MAP_LISTINGS.map((item) => item.city))].map((item) => <option key={item}>{item}</option>)}</select></div><div className="mt-5 grid gap-2"><button type="button" onClick={requestLocation} className="flex items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-700/25 hover:bg-red-800"><LocateFixed className="mr-2 h-4 w-4" />Yakındaki İlanları Göster</button><button type="button" onClick={beginDrawing} className={`flex items-center justify-center rounded-xl border px-4 py-3 text-xs font-black transition ${drawing ? 'border-red-700 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-700'}`}><PencilRuler className="mr-2 h-4 w-4" />{drawing ? 'Haritada alan seçin' : 'Alan Çizerek Ara'}</button></div>{locationMessage && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-[11px] font-semibold leading-relaxed text-red-700">{locationMessage}</p>}<div className="mt-6 border-t border-slate-100 pt-5"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black tracking-widest text-slate-400">GÖRÜNÜR ALAN</p><h3 className="mt-1 text-2xl font-black text-slate-900">{visibleListings.length} <span className="text-sm text-slate-500">ilan</span></h3></div><span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-700">Zoom {viewport.zoom}</span></div><div className="mt-4 space-y-3">{visibleListings.length ? visibleListings.map((item) => <Link key={item.id} to={`/ilan/${item.id}`} className="flex gap-3 rounded-xl border border-slate-100 p-2 transition hover:border-red-200 hover:bg-red-50/30"><img src={item.image} alt="" className="h-16 w-20 rounded-lg object-cover" /><div className="min-w-0"><p className="truncate text-xs font-black text-slate-900">{item.title}</p><p className="mt-1 text-[10px] font-bold text-slate-500">{item.district}, {item.city}</p><p className="mt-1 text-sm font-black text-red-700">{item.price.toLocaleString('tr-TR')} ₺</p></div></Link>) : <p className="rounded-xl bg-slate-50 p-4 text-center text-xs font-bold text-slate-500">Bu alanda uygun ilan bulunamadı.</p>}</div></div></aside>
<section className="order-1 relative isolate z-0 h-[580px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-xl lg:order-2 lg:h-[760px]"><div className="pointer-events-none absolute left-16 top-4 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-slate-700 shadow-lg backdrop-blur">{viewport.zoom < 10 ? 'Kümelenmiş ilanlar gösteriliyor' : 'Tekil ilanlar gösteriliyor'}</div><MapContainer center={[39.0, 35.0]} zoom={6} scrollWheelZoom className="h-full w-full"><TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" /><MapViewportListener onBoundsChange={handleViewportChange} onMapReady={setMapInstance} drawing={drawing} onDrawPoint={handleDrawPoint} />{viewport.zoom < 10 ? [...clusterMap.entries()].map(([key, items]) => { const lat = items.reduce((sum, item) => sum + item.lat, 0) / items.length; const lng = items.reduce((sum, item) => sum + item.lng, 0) / items.length; return <CircleMarker key={key} center={[lat, lng]} radius={Math.min(26, 15 + items.length * 2)} pathOptions={{ color: '#CD011E', fillColor: '#CD011E', fillOpacity: 0.9, weight: 3 }} eventHandlers={{ click: () => { if (!drawing) mapInstance?.flyTo([lat, lng], 11); } }}><Tooltip permanent direction="center" opacity={1} className="map-cluster-label">{items.length}</Tooltip><Popup><strong>{key}</strong><br />{items.length} ilan</Popup></CircleMarker>; }) : mapListings.map((item) => <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={10} pathOptions={{ color: '#fff', fillColor: '#CD011E', fillOpacity: 1, weight: 3 }}><Popup><div className="w-52"><img src={item.image} alt="" className="h-24 w-full rounded-lg object-cover" /><p className="mt-2 text-xs font-black">{item.title}</p><p className="mt-1 text-sm font-black text-red-700">{item.price.toLocaleString('tr-TR')} ₺</p><a className="mt-2 inline-block text-xs font-black text-red-700" href={`/ilan/${item.id}`}>İlanı incele →</a></div></Popup></CircleMarker>)}{drawStart && <CircleMarker center={drawStart} radius={7} pathOptions={{ color: '#fff', fillColor: '#CD011E', fillOpacity: 1, weight: 3 }} interactive={false}><Tooltip permanent direction="top" opacity={1}>İlk köşe</Tooltip></CircleMarker>}{drawBounds && <Rectangle bounds={drawBounds} pathOptions={{ color: '#CD011E', weight: 2, fillOpacity: 0.08 }} />}{userPosition && <><CircleMarker center={userPosition} radius={9} pathOptions={{ color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}><Popup>Konumunuz</Popup></CircleMarker><Circle center={userPosition} radius={5000} pathOptions={{ color: '#2563eb', fillOpacity: 0.06 }} /></>}</MapContainer></section>
      </div>
    </div>
  </div>;
}

function ListingsPage() {
  const location = useLocation();
  const initialCity = new URLSearchParams(location.search).get('city') || '';
  const initialType = new URLSearchParams(location.search).get('type') || '';
  const initialCategory = new URLSearchParams(location.search).get('category') || '';
  const initialPropertyType = new URLSearchParams(location.search).get('propertyType') || '';
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPropertyType, setSelectedPropertyType] = useState(initialPropertyType);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [minArea, setMinArea] = useState('');
  const [rooms, setRooms] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCity(params.get('city') || '');
    setSelectedType(params.get('type') || '');
    setSelectedCategory(params.get('category') || '');
    setSelectedPropertyType(params.get('propertyType') || '');
  }, [location.search]);

  const filteredListings = (hasSearched ? SAMPLE_LISTINGS : []).filter((item) => {
    if (selectedType && item.type !== selectedType) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedPropertyType && item.propertyType !== selectedPropertyType) return false;
    if (selectedCity && item.city !== selectedCity) return false;
    if (minArea && item.area < Number(minArea)) return false;
    if (rooms && item.rooms !== rooms) return false;
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

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">İşlem Tipi</label>
            <select 
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setHasSearched(false); }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm İşlem Tipleri</option>
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
              <option value="Devren Satılık">Devren Satılık</option>
              <option value="Devren Kiralık">Devren Kiralık</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">Kategori</label>
            <select 
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setHasSearched(false); }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm Kategoriler</option>
              {LISTING_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">İlan Türü</label>
            <select value={selectedPropertyType} onChange={(e) => { setSelectedPropertyType(e.target.value); setHasSearched(false); }} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition">
              <option value="">Tüm İlan Türleri</option>
              {Object.entries(LISTING_PROPERTY_TYPES).flatMap(([, types]) => types).map((propertyType) => <option key={propertyType} value={propertyType}>{propertyType}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 block mb-1">Şehir</label>
            <select 
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setHasSearched(false); }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
            >
              <option value="">Tüm Şehirler</option>
              {Object.keys(TURKEY_CITIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-black text-slate-800 transition hover:bg-slate-200">Gelişmiş</button>
            <button onClick={() => setHasSearched(true)} className="flex-1 rounded-xl bg-red-700 py-2 text-xs font-black text-white transition hover:bg-red-800">İlan Ara</button>
          </div>
        </div>

        {advancedOpen && <div className="mb-10 -mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:grid-cols-2 lg:grid-cols-4"><div><label className="mb-1 block text-[10px] font-black text-slate-600">Minimum m²</label><input value={minArea} onChange={(e) => setMinArea(e.target.value)} type="number" placeholder="Örn. 150" className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs" /></div>{['Villa','Daire','Residence','Müstakil Ev','Ofis'].includes(selectedPropertyType) && <div><label className="mb-1 block text-[10px] font-black text-slate-600">Oda Sayısı</label><input value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Örn. 3+1" className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs" /></div>}{selectedPropertyType === 'Otel' && <div className="text-xs font-bold text-red-800">Otel için oda sayısı, yatak kapasitesi ve yıldız bilgisi ilan detayında yer alır.</div>}{['Fabrika','Depo'].includes(selectedPropertyType) && <div className="text-xs font-bold text-red-800">{selectedPropertyType} için kapalı alan, tavan yüksekliği ve yükleme bilgisi ilan detayında yer alır.</div>}<button onClick={() => { setSelectedType(''); setSelectedCategory(''); setSelectedPropertyType(''); setSelectedCity(''); setMinArea(''); setRooms(''); }} className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">Temizle</button></div>}

        {hasSearched && filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Aradığınız kriterlerde ilan bulunamadı.</h3>
            <p className="text-slate-500 text-xs mt-1">Lütfen farklı filtre seçenekleri deneyiniz.</p>
          </div>
        ) : <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-red-200"><Search className="w-12 h-12 text-red-300 mx-auto mb-3" /><h3 className="text-lg font-bold text-slate-800">Kriterlerinizi seçin ve İlan Ara butonuna basın.</h3><p className="text-slate-500 text-xs mt-1">Sonuçlar arama isteğinizden sonra listelenecektir.</p></div>}

      </div>
    </div>
  );
}

function ListingsPageV2() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialType = params.get('type') || '';
  const initialPropertyType = params.get('propertyType') || '';
  const initialCategory = params.get('category') || '';
  const initialCity = params.get('city') || '';
  const initialDistrict = params.get('district') || '';
  const showAllInitially = params.get('all') === '1' || Boolean(initialType || initialPropertyType || initialCategory || initialCity);
  const [transactionType, setTransactionType] = useState(initialType);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [neighborhood, setNeighborhood] = useState('');
  const [advanced, setAdvanced] = useState<Record<string, string>>({});
  const [appliedAdvanced, setAppliedAdvanced] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState(showAllInitially);
  const [appliedSearch, setAppliedSearch] = useState({ type: initialType, propertyType: initialPropertyType, category: initialCategory, city: initialCity, district: initialDistrict, neighborhood: '' });

  const districts = city ? TURKEY_CITIES[city] || [] : [];
  const neighborhoods = city && district ? DISTRICT_NEIGHBORHOODS[`${city}|${district}`] || [] : [];
  const filterGroup = getAdvancedFilterGroup(propertyType || appliedSearch.propertyType);
  const sideFields = propertyType || appliedSearch.propertyType ? ADVANCED_FILTERS_BY_TYPE[filterGroup] : COMMON_PRICE_AREA_FIELDS;

  const runSearch = () => {
    setAppliedSearch({ type: transactionType, propertyType, category: categoryFilter, city, district, neighborhood });
    setAppliedAdvanced({ ...advanced });
    setHasSearched(true);
  };

  const filteredListings = SAMPLE_LISTINGS.filter((item) => {
    if (!hasSearched) return false;
    if (appliedSearch.type && item.type !== appliedSearch.type) return false;
    if (appliedSearch.propertyType && item.propertyType !== appliedSearch.propertyType) return false;
    if (appliedSearch.category && item.category !== appliedSearch.category) return false;
    if (appliedSearch.city && item.city !== appliedSearch.city) return false;
    if (appliedSearch.district && item.district !== appliedSearch.district) return false;
    if (appliedSearch.neighborhood && item.neighborhood !== appliedSearch.neighborhood) return false;
    if (appliedAdvanced.minPrice && item.price < Number(appliedAdvanced.minPrice)) return false;
    if (appliedAdvanced.maxPrice && item.price > Number(appliedAdvanced.maxPrice)) return false;
    if (appliedAdvanced.minArea && item.area < Number(appliedAdvanced.minArea)) return false;
    if (appliedAdvanced.maxArea && item.area > Number(appliedAdvanced.maxArea)) return false;
    if (appliedAdvanced.rooms && item.rooms !== appliedAdvanced.rooms) return false;
    for (const [key, value] of Object.entries(appliedAdvanced)) {
      if (!value || ['minPrice','maxPrice','minArea','maxArea','rooms'].includes(key)) continue;
      const listingValue = item.details[key] || '';
      if (listingValue.toLocaleLowerCase('tr-TR') !== value.toLocaleLowerCase('tr-TR')) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setTransactionType(''); setPropertyType(''); setCategoryFilter(''); setCity(''); setDistrict(''); setNeighborhood('');
    setAdvanced({}); setAppliedAdvanced({}); setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-5 lg:px-6">
        <div className="mb-7"><span className="rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-black tracking-widest text-red-700">İLAN ARAMA</span><h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">Gayrimenkul <span className="text-red-700">İlanları</span></h1></div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1.05fr_1.05fr_1fr_1fr_auto]">
            <div><label className="mb-2 block text-xs font-black text-slate-600">İşlem Tipi</label><select value={transactionType} onChange={(e) => { setTransactionType(e.target.value); setHasSearched(false); }} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold"><option value="">Kiralık / Satılık / Devren</option>{LISTING_TRANSACTION_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
            <div><label className="mb-2 block text-xs font-black text-slate-600">İlan Türü</label><select value={propertyType} onChange={(e) => { setPropertyType(e.target.value); setCategoryFilter(''); setAdvanced({}); setHasSearched(false); }} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold"><option value="">Ev / Fabrika / Depo / Ofis / Arsa</option>{ALL_LISTING_PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
            <div><label className="mb-2 block text-xs font-black text-slate-600">İl</label><select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(''); setNeighborhood(''); setHasSearched(false); }} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold"><option value="">İl Seçiniz</option>{Object.keys(TURKEY_CITIES).map((item) => <option key={item}>{item}</option>)}</select></div>
            <div><label className="mb-2 block text-xs font-black text-slate-600">İlçe</label><select disabled={!city} value={district} onChange={(e) => { setDistrict(e.target.value); setNeighborhood(''); setHasSearched(false); }} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold disabled:opacity-50"><option value="">{city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'}</option>{districts.map((item) => <option key={item}>{item}</option>)}</select></div>
            <button onClick={runSearch} className="h-[46px] whitespace-nowrap rounded-xl bg-red-700 px-7 font-black text-white shadow-lg shadow-red-700/20 hover:bg-red-800"><Search className="mr-2 inline h-4 w-4" />İlan Ara</button>
          </div>
        </section>

        {!hasSearched ? <div className="rounded-2xl border border-dashed border-red-200 bg-white p-14 text-center"><Search className="mx-auto mb-3 h-12 w-12 text-red-300" /><h2 className="text-lg font-black text-slate-800">İşlem tipi ve ilan türünü seçerek arama yapın.</h2></div> : <div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-lg lg:sticky lg:top-24">
            <div className="border-b border-slate-200 p-5"><div className="flex items-center justify-between"><h2 className="font-black text-slate-900">Detaylı Filtrele</h2><button onClick={resetFilters} className="text-xs font-black text-red-700">Temizle</button></div><p className="mt-1 text-xs text-slate-500">{appliedSearch.propertyType || 'Tüm ilanlar'} için filtreler</p></div>
            <div className="space-y-4 p-5">
              {district && <div><label className="mb-1 block text-xs font-black text-slate-600">Mahalle</label><select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"><option value="">Tüm Mahalleler</option>{neighborhoods.map((item) => <option key={item}>{item}</option>)}</select>{!neighborhoods.length && <p className="mt-1 text-[10px] text-slate-400">Bu ilçe için mahalle verisi henüz eklenmedi.</p>}</div>}
              {sideFields.map((field) => <div key={field.key}><label className="mb-1 block text-xs font-black text-slate-600">{field.label}</label>{field.options ? <select value={advanced[field.key] || ''} onChange={(e) => setAdvanced({ ...advanced, [field.key]: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"><option value="">Tümü</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type || 'text'} value={advanced[field.key] || ''} onChange={(e) => setAdvanced({ ...advanced, [field.key]: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />}</div>)}
              <button onClick={runSearch} className="w-full rounded-xl bg-red-700 py-3 text-sm font-black text-white hover:bg-red-800">Filtreleri Uygula</button>
            </div>
          </aside>
          <main><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-900">{filteredListings.length} ilan bulundu</h2><p className="text-xs text-slate-500">{[appliedSearch.type, appliedSearch.category, appliedSearch.propertyType, appliedSearch.city, appliedSearch.district].filter(Boolean).join(' · ') || 'Tüm ilanlar'}</p></div></div>{filteredListings.length ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredListings.map((item) => <ListingCard key={item.id} item={item} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center"><Filter className="mx-auto mb-3 h-10 w-10 text-slate-300" /><h3 className="font-black text-slate-800">Seçtiğiniz kriterlere uygun ilan bulunamadı.</h3></div>}</main>
        </div>}
      </div>
    </div>
  );
}

export function ListingDetailPageLegacy() {
  const { id } = useParams();
  const item = SAMPLE_LISTINGS.find((listing) => listing.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(() => {
    try { return JSON.parse(localStorage.getItem('realty-center-favorites') || '[]').includes(id || ''); }
    catch { return false; }
  });

  if (!item) return <div className="min-h-[60vh] bg-slate-50 px-6 py-24 text-center"><h1 className="text-3xl font-black text-slate-900">İlan bulunamadı</h1><Link to="/ilanlarimiz?all=1" className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-black text-white">Tüm İlanlara Dön</Link></div>;

  const gallery = item.images?.length ? item.images : [item.image];
  const similar = SAMPLE_LISTINGS.filter((listing) => listing.id !== item.id && listing.propertyType === item.propertyType).slice(0, 3);
  const detailLabels: Record<string, string> = { rooms: 'Oda Sayısı', roomCount: 'Oda Sayısı', buildingAge: 'Bina Yaşı', floor: 'Kat', heating: 'Isınma', furnished: 'Eşyalı', mortgage: 'Krediye Uygun', bathroom: 'Banyo', zoning: 'İmar Durumu', deed: 'Tapu Durumu', landQuality: 'Nitelik', frontage: 'Cephe', road: 'Yol', infrastructure: 'Altyapı', closedArea: 'Kapalı Alan', ceilingHeight: 'Tavan Yüksekliği', power: 'Elektrik Gücü', loading: 'Yükleme Rampası', crane: 'Vinç', sections: 'Bölüm Sayısı', parking: 'Otopark', usage: 'Kullanım Durumu', hotelRooms: 'Otel Oda Sayısı', beds: 'Yatak Kapasitesi', stars: 'Yıldız', restaurant: 'Restoran', pool: 'Havuz' };

  const toggleFavorite = () => {
    const stored: string[] = JSON.parse(localStorage.getItem('realty-center-favorites') || '[]');
    const next = favorite ? stored.filter((favoriteId) => favoriteId !== item.id) : [...new Set([...stored, item.id])];
    localStorage.setItem('realty-center-favorites', JSON.stringify(next));
    setFavorite(!favorite);
  };

  const shareListing = async () => {
    const shareData = { title: item.title, text: `${item.title} - ${item.price.toLocaleString('tr-TR')} ${item.currency}`, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(window.location.href); alert('İlan bağlantısı kopyalandı.'); }
  };

  return (
    <div className="listing-detail-enter min-h-screen bg-slate-50 py-8 print:bg-white">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-5 lg:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><Link to="/ilanlarimiz?all=1" className="text-xs font-black text-red-700">← İlanlara Dön</Link><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg bg-red-700 px-3 py-1 text-xs font-black text-white">{item.type}</span><span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-black text-white">{item.propertyType}</span></div><h1 className="mt-3 max-w-4xl text-2xl font-black text-slate-900 sm:text-3xl">{item.title}</h1><p className="mt-2 flex items-center gap-1 text-sm font-bold text-slate-500"><MapPin className="h-4 w-4 text-red-700" />{item.city} / {item.district} / {item.neighborhood}</p></div><div className="lg:text-right"><p className="text-3xl font-black text-red-700">{item.price.toLocaleString('tr-TR')} {item.currency}</p><div className="mt-3 flex flex-wrap gap-2 lg:justify-end print:hidden"><button onClick={toggleFavorite} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black ${favorite ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />Favorilere Ekle</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700"><Printer className="h-4 w-4" />Yazdır</button><button onClick={shareListing} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700"><Share2 className="h-4 w-4" />Paylaş</button></div></div></div>

        <section className="overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"><div className="relative h-[360px] sm:h-[520px]"><img src={gallery[activeImage]} alt={`${item.title} ${activeImage + 1}`} className="h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white"><span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black"><Camera className="h-4 w-4" />{activeImage + 1} / {gallery.length}</span></div>{gallery.length > 1 && <><button onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"><ChevronLeft /></button><button onClick={() => setActiveImage((activeImage + 1) % gallery.length)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"><ChevronRight /></button></>}</div>{gallery.length > 1 && <div className="flex gap-3 overflow-x-auto p-3">{gallery.map((image, index) => <button key={image} onClick={() => setActiveImage(index)} className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? 'border-red-600' : 'border-transparent'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}</section>

        <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">Açıklama</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{item.description || 'Bu ilan için açıklama eklenmemiştir.'}</p></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">İlan ve Teknik Özellikler</h2><div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-0 sm:grid-cols-3">{[['İlan No', item.id], ['Güncelleme Tarihi', item.updatedAt || item.date], ['İlan Türü', item.propertyType], ['Oda Bilgisi', item.rooms], ['Toplam Alan', `${item.area} m²`], ['Aidat', item.monthlyFee || 'Belirtilmedi'], ['Tapu Bilgisi', item.deedInfo || 'Belirtilmedi'], ...Object.entries(item.details).map(([key, value]) => [detailLabels[key] || key, value])].map(([label, value]) => <div key={`${label}-${value}`} className="border-b border-slate-100 py-3"><span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span><strong className="mt-1 block text-sm text-slate-800">{value}</strong></div>)}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">Teknik Özellikler</h2><div className="mt-4 flex flex-wrap gap-2">{(item.technicalFeatures || 'Teknik özellik eklenmemiştir').split(',').map((feature) => <span key={feature} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />{feature.trim()}</span>)}</div></section>
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><h2 className="flex items-center gap-2 text-lg font-black"><PlayCircle className="h-5 w-5 text-red-700" />Video</h2></div>{item.videoUrl ? <iframe title="İlan videosu" src={item.videoUrl} className="h-72 w-full" allowFullScreen /> : <div className="flex h-52 items-center justify-center bg-slate-100 px-6 text-center text-sm font-bold text-slate-400">Bu ilan için video eklenmemiş.</div>}</div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><h2 className="flex items-center gap-2 text-lg font-black"><Globe className="h-5 w-5 text-red-700" />Sanal Tur (360°)</h2></div>{item.virtualTourUrl ? <iframe title="Sanal tur" src={item.virtualTourUrl} className="h-72 w-full" allowFullScreen /> : <div className="flex h-52 items-center justify-center bg-slate-100 px-6 text-center text-sm font-bold text-slate-400">Bu ilan için 360° sanal tur eklenmemiş.</div>}</div></section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><h2 className="flex items-center gap-2 text-xl font-black"><Map className="h-5 w-5 text-red-700" />Harita ve Konum</h2><p className="mt-1 text-sm text-slate-500">{item.city} / {item.district} / {item.neighborhood}</p></div>{item.mapUrl ? <iframe title="İlan konumu" src={item.mapUrl} className="h-80 w-full border-0" loading="lazy" /> : <div className="flex h-52 items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">Konum bilgisi eklenmemiş.</div>}</section>
          </main>
          <aside className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:sticky lg:top-24"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-xl font-black text-white">RC</div><p className="mt-4 text-xs font-black tracking-widest text-red-700">YETKİLİ DANIŞMAN</p><h2 className="mt-1 text-xl font-black text-slate-900">{item.agentName}</h2><p className="mt-2 text-sm text-slate-500">Bu ilan hakkında bilgi ve randevu için danışmanımızla iletişime geçin.</p><a href={`tel:${item.agentPhone.replace(/\s+/g, '')}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-3 font-black text-white"><Phone className="h-4 w-4" />{item.agentPhone}</a><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-black text-slate-700"><MessageSquare className="h-4 w-4" />Mesaj Gönder</button></section></aside>
        </div>

        <section className="mt-10"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black text-slate-900">Benzer İlanlar</h2><Link to={`/ilanlarimiz?propertyType=${encodeURIComponent(item.propertyType)}`} className="text-sm font-black text-red-700">Tümünü Gör →</Link></div>{similar.length ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{similar.map((listing) => <ListingCard key={listing.id} item={listing} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">Benzer ilan bulunamadı.</div>}</section>
      </div>
    </div>
  );
}

function ListingDetailPage() {
  const { id } = useParams();
  const item = SAMPLE_LISTINGS.find((listing) => listing.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'location' | 'index'>('details');
  const [favorite, setFavorite] = useState(() => {
    try { return JSON.parse(localStorage.getItem('realty-center-favorites') || '[]').includes(id || ''); }
    catch { return false; }
  });

  if (!item) return <div className="min-h-[60vh] bg-slate-50 px-6 py-24 text-center"><h1 className="text-3xl font-black text-slate-900">İlan bulunamadı</h1><Link to="/ilanlarimiz?all=1" className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-black text-white">Tüm İlanlara Dön</Link></div>;

  const gallery = item.images?.length ? item.images : [item.image];
  const thumbnailSlots = Array.from({ length: 14 }, (_, index) => gallery[index] || null);
  const agent = SAMPLE_AGENTS.find((entry) => entry.name === item.agentName) || SAMPLE_AGENTS[0];
  const similar = SAMPLE_LISTINGS.filter((listing) => listing.id !== item.id && listing.propertyType === item.propertyType).slice(0, 3);
  const detailLabels: Record<string, string> = { rooms: 'Oda Sayısı', roomCount: 'Oda Sayısı', buildingAge: 'Bina Yaşı', floor: 'Bulunduğu Kat', heating: 'Isıtma', furnished: 'Eşyalı', mortgage: 'Krediye Uygun', bathroom: 'Banyo Sayısı', zoning: 'İmar Durumu', deed: 'Tapu Durumu', landQuality: 'Nitelik', frontage: 'Cephe', road: 'Yol', infrastructure: 'Altyapı', closedArea: 'Kapalı Alan', ceilingHeight: 'Tavan Yüksekliği', power: 'Elektrik Gücü', loading: 'Yükleme Rampası', crane: 'Vinç', sections: 'Bölüm Sayısı', parking: 'Otopark', usage: 'Kullanım Durumu', hotelRooms: 'Otel Oda Sayısı', beds: 'Yatak Kapasitesi', stars: 'Yıldız', restaurant: 'Restoran', pool: 'Havuz' };
  const detailValue = (key: string, fallback = 'Belirtilmemiş') => item.details[key] || fallback;
  const detailRows: Array<[string, string]> = [
    ['İlan No', item.id], ['İlan Tarihi', item.updatedAt || item.date], ['Emlak Tipi', `${item.type} ${item.propertyType}`],
    ['m² (Brüt)', `${item.area} m²`], ['m² (Net)', `${Math.round(item.area * .9)} m²`], ['Oda Sayısı', item.rooms],
    ['Bina Yaşı', detailValue('buildingAge')], ['Kat Sayısı', detailValue('floorCount', 'Belirtilmemiş')], ['Bulunduğu Kat', detailValue('floor')],
    ['Isıtma', detailValue('heating')], ['Banyo Sayısı', detailValue('bathroom')], ['Mutfak', detailValue('kitchen', 'Açık (Amerikan)')],
    ['Balkon', detailValue('balcony', 'Var')], ['Asansör', detailValue('elevator', 'Var')], ['Otopark', detailValue('parking', 'Açık Otopark')],
    ['Eşyalı', detailValue('furnished')], ['Kullanım Durumu', detailValue('usage', 'Boş')], ['Site İçerisinde', detailValue('inSite', 'Evet')],
    ['Site Adı', detailValue('siteName')], ['Aidat (TL)', item.monthlyFee || 'Belirtilmemiş'], ['Krediye Uygun', detailValue('mortgage')],
    ['Enerji Kimlik Belgesi', detailValue('energyCertificate')], ['Tapu Durumu', item.deedInfo || detailValue('deed')],
    ['Kimden', 'Realty Center®'], ['Takas', detailValue('swap', 'Hayır')]
  ];
  const features = (item.technicalFeatures || 'Otopark, güvenlik, ulaşım akslarına yakınlık').split(',').map((feature) => feature.trim());

  const toggleFavorite = () => {
    const stored: string[] = JSON.parse(localStorage.getItem('realty-center-favorites') || '[]');
    const next = favorite ? stored.filter((favoriteId) => favoriteId !== item.id) : [...new Set([...stored, item.id])];
    localStorage.setItem('realty-center-favorites', JSON.stringify(next));
    setFavorite(!favorite);
  };
  const shareListing = async () => {
    const shareData = { title: item.title, text: `${item.title} - ${item.price.toLocaleString('tr-TR')} ${item.currency}`, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(window.location.href); alert('İlan bağlantısı kopyalandı.'); }
  };

  return (
    <div className="listing-detail-enter min-h-screen bg-white px-0 pb-6 pt-4 print:bg-white">
      <div className="mx-auto max-w-[1360px] px-3 sm:px-5 lg:px-6">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2.5 text-[11px] font-bold text-red-700">
          <Link to="/ilanlarimiz?all=1">Emlak</Link><ChevronRight className="h-3 w-3 text-slate-400"/><Link to={`/ilanlarimiz?category=${encodeURIComponent(item.category)}`}>{item.category}</Link><ChevronRight className="h-3 w-3 text-slate-400"/><Link to={`/ilanlarimiz?type=${encodeURIComponent(item.type)}`}>{item.type}</Link><ChevronRight className="h-3 w-3 text-slate-400"/><span>{item.propertyType}</span><ChevronRight className="h-3 w-3 text-slate-400"/><span>{item.city}</span><ChevronRight className="h-3 w-3 text-slate-400"/><span className="text-slate-500">{item.district}</span>
        </nav>

        <div className="mb-4 flex flex-col gap-2.5 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-black uppercase text-slate-900 sm:text-2xl">{item.title}</h1>
          <div className="flex flex-wrap gap-1.5 print:hidden"><button onClick={toggleFavorite} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-black ${favorite ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}><Heart className={`h-3.5 w-3.5 ${favorite ? 'fill-current' : ''}`}/>Favorilere Ekle</button><button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-700"><Printer className="h-3.5 w-3.5"/>Yazdır</button><button onClick={shareListing} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-700"><Share2 className="h-3.5 w-3.5"/>Paylaş</button></div>
        </div>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px_275px]">
          <div className="min-w-0 xl:flex xl:h-[620px] xl:flex-col">
            <div className="relative h-[310px] shrink-0 overflow-hidden border border-slate-200 bg-white sm:h-[390px]"><img src={gallery[activeImage]} alt={`${item.title} ${activeImage + 1}`} className="h-full w-full bg-white object-contain"/>{gallery.length > 1 && <><button onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg"><ChevronLeft className="h-5 w-5"/></button><button onClick={() => setActiveImage((activeImage + 1) % gallery.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg"><ChevronRight className="h-5 w-5"/></button></>}</div>
            <div className="mt-1.5 flex items-center justify-between border-y border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-black text-slate-600"><span className="inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-red-700"/>Büyük Fotoğraf</span><span>{activeImage + 1} / {gallery.length}</span></div>
            <div className="mt-1.5 grid min-h-[138px] flex-1 grid-cols-5 grid-rows-3 gap-1.5 border border-dashed border-slate-300 bg-slate-50/60 p-1.5 sm:grid-cols-7 sm:grid-rows-2">{thumbnailSlots.map((image, index) => image ? <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} className={`min-h-0 overflow-hidden border-2 bg-white ${activeImage === index ? 'border-red-700' : 'border-slate-200 hover:border-red-300'}`}><img src={image} alt="" className="h-full w-full bg-white object-contain"/></button> : <span key={`empty-${index}`} aria-hidden="true" className="min-h-0 border border-dashed border-slate-200 bg-white/70" />)}</div>
          </div>

          <div className="min-w-0 xl:h-[620px] xl:overflow-hidden">
            <div className="border-b border-slate-200 pb-3"><p className="text-2xl font-black text-red-700">{item.price.toLocaleString('tr-TR')} {item.currency}</p><p className="mt-3 flex items-center gap-1.5 text-xs font-black text-slate-800"><MapPin className="h-3.5 w-3.5 text-red-700"/>{item.city} / {item.district} / {item.neighborhood}</p></div>
            <dl className="mt-1 text-[10px] leading-[1.15]">{detailRows.map(([label, value]) => <div key={`${label}-${value}`} className="grid grid-cols-[118px_1fr] gap-2 border-b border-dotted border-slate-300 py-[4px]"><dt className="font-black leading-tight text-slate-800">{label}</dt><dd className={label === 'İlan No' || label === 'Kimden' ? 'font-bold text-red-700' : 'font-medium text-slate-700'}>{value}</dd></div>)}</dl>
            <Link to="/iletisim" className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-700"><Flag className="h-3.5 w-3.5"/>İlan ile ilgili şikayetim var</Link>
          </div>

          <aside className="space-y-3">
            <section className="border border-slate-200 bg-slate-50 p-4 shadow-sm"><div className="flex items-center gap-2.5"><img src={agent.image} alt={agent.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white"/><div><p className="text-[9px] font-black tracking-widest text-red-700">YETKİLİ DANIŞMAN</p><h2 className="mt-0.5 text-base font-black text-slate-900">{agent.name}</h2><p className="text-[11px] text-slate-500">{agent.title}</p></div></div><a href={`tel:${item.agentPhone.replace(/\s+/g, '')}`} className="mt-4 flex items-center justify-between border border-slate-300 bg-white px-3 py-2.5"><span className="text-xs font-bold text-slate-600">Cep</span><strong className="text-sm text-slate-950">{item.agentPhone}</strong></a><button className="mt-2.5 flex w-full items-center justify-center gap-2 border border-red-700 bg-red-700 py-2.5 text-xs font-black text-white"><MessageSquare className="h-3.5 w-3.5"/>Mesaj Gönder</button></section>
            <section className="border border-slate-200 bg-white p-4"><h3 className="flex items-center gap-2 text-sm font-black text-slate-900"><ShieldAlert className="h-4 w-4 text-red-700"/>Güvenlik İpuçları</h3><p className="mt-2 text-xs leading-4 text-slate-600">Gayrimenkulü görmeden kapora ödemeyin, para göndermeyin.</p><Link to="/iletisim" className="mt-2 inline-flex text-[11px] font-black text-red-700">Detaylı bilgi alın →</Link></section>
            <section className="border border-red-200 bg-red-50 p-4"><p className="text-[9px] font-black tracking-widest text-red-700">REALTY CENTER® GÜVENCESİ</p><h3 className="mt-1.5 text-sm font-black text-slate-900">Doğrulanmış kurumsal ilan</h3><p className="mt-1.5 text-[11px] leading-4 text-slate-600">Portföy ve danışman bilgileri Realty Center® ağı tarafından kontrol edilir.</p></section>
          </aside>
        </section>

        <section className="mt-6">
          <div className="flex flex-wrap gap-1 border-b-2 border-red-700">{[['details','İlan Detayları'],['location','Konumu ve Bölge Bilgisi'],['index','Emlak Endeksi']].map(([key,label]) => <button key={key} onClick={() => setActiveTab(key as 'details' | 'location' | 'index')} className={`border border-b-0 px-4 py-2.5 text-xs font-black sm:px-6 ${activeTab === key ? 'border-red-700 bg-red-700 text-white' : 'border-slate-300 bg-slate-50 text-slate-700 hover:text-red-700'}`}>{label}</button>)}</div>
          {activeTab === 'details' && <div className="space-y-3 pt-1"><div className="border border-slate-200"><h2 className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-base font-black">Açıklama</h2><p className="min-h-20 whitespace-pre-line px-4 py-4 text-xs leading-6 text-slate-700">{item.description || 'Bu ilan için açıklama eklenmemiştir.'}</p></div><div className="border border-slate-200"><h2 className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-base font-black">Özellikler</h2><div className="grid gap-2.5 bg-amber-50/45 p-4 sm:grid-cols-2 lg:grid-cols-4">{features.map((feature) => <span key={feature} className="flex items-center gap-2 text-xs font-bold text-slate-800"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600"/>{feature}</span>)}{Object.entries(item.details).map(([key,value]) => <span key={key} className="flex items-center gap-2 text-xs font-bold text-slate-800"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600"/>{detailLabels[key] || key}: {value}</span>)}</div></div><div className="grid gap-4 md:grid-cols-2"><div className="border border-slate-200"><h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-black"><PlayCircle className="h-4 w-4 text-red-700"/>Video</h2>{item.videoUrl ? <iframe title="İlan videosu" src={item.videoUrl} className="h-64 w-full" allowFullScreen/> : <div className="flex h-36 items-center justify-center text-xs font-bold text-slate-400">Bu ilan için video eklenmemiş.</div>}</div><div className="border border-slate-200"><h2 className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-black"><Globe className="h-4 w-4 text-red-700"/>Sanal Tur (360°)</h2>{item.virtualTourUrl ? <iframe title="Sanal tur" src={item.virtualTourUrl} className="h-64 w-full" allowFullScreen/> : <div className="flex h-36 items-center justify-center text-xs font-bold text-slate-400">Bu ilan için 360° tur eklenmemiş.</div>}</div></div></div>}
          {activeTab === 'location' && <div className="border border-slate-200"><div className="border-b border-slate-200 bg-slate-100 p-4"><h2 className="text-lg font-black">Konum ve Bölge Bilgisi</h2><p className="mt-1 text-sm text-slate-600">{item.city} / {item.district} / {item.neighborhood}</p></div>{item.mapUrl ? <iframe title="İlan konumu" src={item.mapUrl} className="h-[460px] w-full border-0" loading="lazy"/> : <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-400">Konum bilgisi eklenmemiş.</div>}</div>}
          {activeTab === 'index' && <div className="grid gap-5 border border-slate-200 p-6 md:grid-cols-3"><div className="bg-slate-50 p-5"><p className="text-xs font-black text-slate-500">BÖLGE ORTALAMA m²</p><p className="mt-2 text-2xl font-black text-red-700">{Math.round(item.price / Math.max(item.area, 1)).toLocaleString('tr-TR')} ₺</p></div><div className="bg-slate-50 p-5"><p className="text-xs font-black text-slate-500">TAHMİNİ GERİ DÖNÜŞ</p><p className="mt-2 text-2xl font-black text-slate-900">18–22 Yıl</p></div><div className="bg-slate-50 p-5"><p className="text-xs font-black text-slate-500">BÖLGE EĞİLİMİ</p><p className="mt-2 text-2xl font-black text-emerald-600">Yükselişte</p></div><p className="md:col-span-3 text-xs leading-5 text-slate-500">Bu göstergeler örnek ilan verileri üzerinden bilgilendirme amacıyla hesaplanır; ekspertiz veya yatırım garantisi değildir.</p></div>}
        </section>

        <section className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_530px]"><div><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">Benzer İlanlar</h2><Link to={`/ilanlarimiz?propertyType=${encodeURIComponent(item.propertyType)}`} className="text-xs font-black text-red-700">Tümünü Gör →</Link></div>{similar.length ? <div className="max-w-sm">{similar.slice(0, 1).map((listing) => <ListingCard key={listing.id} item={listing}/>)}</div> : <div className="border border-slate-200 bg-white p-6 text-xs font-bold text-slate-500">Benzer ilan bulunamadı.</div>}</div><ListingActionShortcuts /></section>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const projects = [
    { category: 'YENİ İNŞAAT PROJESİ', title: 'İncek Vadi Evleri', location: 'Çankaya · İncek', description: '2+1, 3+1 ve 4+1 seçenekleri; peyzaj alanları, kapalı otopark ve sosyal tesisleriyle aile yaşamına odaklanan yeni konut projesi.', status: 'Teslim: Aralık 2027', image: '/slider/realty-city.jpg', tags: ['2+1 – 4+1', 'Sosyal tesis', 'Kapalı otopark'] },
    { category: 'TİCARİ PROJE', title: 'Söğütözü Business Hub', location: 'Çankaya · Söğütözü', description: 'Yüksek görünürlük, esnek ofis metrekareleri ve toplantı alanlarıyla şirketler ve yatırımcılar için tasarlanan çağdaş ticari proje.', status: 'Ön talep dönemi', image: '/ev.jpg', tags: ['Ofis katları', 'Cadde mağazaları', 'Metroya yakın'] }
  ];
  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-6 lg:px-12"><div className="max-w-3xl"><span className="text-xs font-black tracking-widest text-red-700">REALTY CENTER® PROJELER</span><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Yeni yaşam ve yatırım <span className="text-red-700">projeleri</span></h1><p className="mt-5 text-lg leading-relaxed text-slate-600">Yeni inşaat ve ticari projeleri; lokasyon, teslim takvimi ve öne çıkan özellikleriyle inceleyin. Proje danışmanlarımız size en uygun seçenek için yanınızda.</p></div><div className="mt-10 grid gap-7 lg:grid-cols-2">{projects.map((project) => <article key={project.title} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-64 overflow-hidden bg-white"><img src={project.image} alt={project.title} className="h-full w-full object-contain transition duration-500"/><span className="absolute left-5 top-5 rounded-full bg-red-700 px-3 py-1.5 text-[11px] font-black tracking-wider text-white">{project.category}</span><div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-800 shadow"><MapPin className="h-4 w-4 text-red-700"/>{project.location}</div></div><div className="p-6"><h2 className="text-2xl font-black text-slate-900">{project.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p><div className="mt-5 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{tag}</span>)}</div><div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5"><span className="text-sm font-black text-red-700">{project.status}</span><Link to="/iletisim" className="inline-flex items-center gap-1 text-sm font-black text-slate-900 transition hover:text-red-700">Bilgi Al <ArrowRight className="h-4 w-4"/></Link></div></div></article>)}</div></div></div>
  );
}

function VideosPage() {
  const [videos, setVideos] = useState<RealtyVideo[]>(getRealtyVideos);
  useEffect(() => { const refresh = () => setVideos(getRealtyVideos()); window.addEventListener('realty-center-videos-updated', refresh); return () => window.removeEventListener('realty-center-videos-updated', refresh); }, []);
  return <div className="min-h-screen bg-slate-50 py-12"><div className="mx-auto max-w-7xl px-6 lg:px-12"><p className="text-xs font-black tracking-widest text-red-700">REALTY CENTER® TV</p><h1 className="mt-2 text-4xl font-black text-slate-900">Videolar</h1><p className="mt-3 max-w-2xl text-sm text-slate-600">Gayrimenkul rehberleri, proje tanıtımları, danışman içerikleri ve Realty Center®’dan güncel videolar.</p>{videos.length ? <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{videos.map((video) => <article key={video.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="aspect-video bg-slate-950">{video.source === 'youtube' ? <iframe title={video.title} src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`} className="h-full w-full" allowFullScreen/> : <video src={video.url} controls poster={video.thumbnail || undefined} className="h-full w-full object-contain"/>}</div><div className="p-5"><span className="text-[10px] font-black tracking-widest text-red-700">{video.source === 'youtube' ? 'YOUTUBE' : 'REALTY CENTER®'}</span><h2 className="mt-2 text-lg font-black text-slate-900">{video.title}</h2></div></article>)}</div> : <div className="mt-9 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center"><PlayCircle className="mx-auto h-10 w-10 text-slate-300"/><h2 className="mt-3 font-black text-slate-800">Henüz video eklenmedi</h2><p className="mt-1 text-xs text-slate-500">Videolar admin panelinden yayınlandığında burada görüntülenecek.</p></div>}</div></div>;
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
                <p className="text-xs text-red-600 font-bold tracking-wider mt-0.5">REALTY CENTER® GAYRİMENKUL A.Ş.</p>
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
                title="Realty Center® Merkez Harita"
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
    <div className="min-h-[calc(100vh-100px)] bg-slate-100 flex items-center justify-center px-4 py-8 xl:pb-12 xl:pt-28">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-6 text-center border-b-4 border-red-700">
            <img
              src="/rlogo2.png"
              alt="Realty Center®"
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
function HeaderMenuEditorNode({ item, depth, onUpdate, onRemove, onAddChild }: { item: HeaderMenuItem; depth: number; onUpdate: (id: string, patch: Partial<HeaderMenuItem>) => void; onRemove: (id: string) => void; onAddChild: (id: string, side: 'left' | 'right') => void }) {
  return <div className={`rounded-2xl border p-4 ${depth === 0 ? 'border-slate-300 bg-white shadow-sm' : depth === 1 ? 'border-red-100 bg-red-50/40' : 'border-slate-200 bg-slate-50'}`}><div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-700 text-[10px] font-black text-white">{depth + 1}</span><strong className="text-xs text-slate-800">{depth === 0 ? 'Ana başlık' : depth === 1 ? 'Alt başlık' : 'Alt başlığın altı'}</strong></div><button type="button" onClick={() => onRemove(item.id)} className="text-[10px] font-black text-red-700">Kaldır</button></div><div className="grid gap-3 md:grid-cols-2"><input value={item.label} onChange={(e) => onUpdate(item.id,{ label:e.target.value })} placeholder="Menü başlığı" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"/><input value={item.path} onChange={(e) => onUpdate(item.id,{ path:e.target.value })} placeholder="/icerik/sayfa-adi" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"/>{depth === 0 && <select value={item.side} onChange={(e) => onUpdate(item.id,{ side:e.target.value as 'left' | 'right' })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="left">Logonun solu</option><option value="right">Logonun sağı</option></select>}<input value={item.image || ''} onChange={(e) => onUpdate(item.id,{ image:e.target.value })} placeholder="Sol bölüm görsel URL'si" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"/><textarea rows={4} value={item.content || ''} onChange={(e) => onUpdate(item.id,{ content:e.target.value })} placeholder="Sayfanın sağında gösterilecek metin" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-5 md:col-span-2"/></div>{depth < 2 && <button type="button" onClick={() => onAddChild(item.id,item.side)} className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-[10px] font-black text-red-700">+ Alt başlık ekle</button>}{item.children.length > 0 && <div className="mt-4 space-y-3 border-l-2 border-red-200 pl-3">{item.children.map((child) => <HeaderMenuEditorNode key={child.id} item={child} depth={depth + 1} onUpdate={onUpdate} onRemove={onRemove} onAddChild={onAddChild}/>)}</div>}</div>;
}

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'franchise' | 'offices' | 'agents' | 'listings' | 'categories' | 'videos' | 'library' | 'messages' | 'buyerRequests' | 'feedback' | 'corporate' | 'header' | 'settings'>('overview');
  const [contactSettings, setContactSettings] = useState(getContactSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [featuredListingIds, setFeaturedListingIds] = useState<string[]>(getFeaturedListingIds);
  const [categories, setCategories] = useState<ListingCategory[]>(getListingCategories);
  const [categorySaved, setCategorySaved] = useState(false);
  const [newCategory, setNewCategory] = useState<ListingCategory>({ id: '', title: '', type: 'Satılık', category: 'Konut', image: '' });
  const [videos, setVideos] = useState<RealtyVideo[]>(getRealtyVideos);
  const [videoDraft, setVideoDraft] = useState({ source: 'youtube' as 'youtube' | 'upload', url: '', title: '', thumbnail: '' });
  const [videoSaving, setVideoSaving] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<CustomerFeedback[]>(getCustomerFeedback);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(getBuyerRequests);
  const [aboutStory, setAboutStory] = useState(getAboutStory);
  const [management, setManagement] = useState<ManagementMember[]>(getManagementTeam);
  const [corporateDocuments, setCorporateDocuments] = useState<CorporateDocument[]>(() => getStoredCorporateItems('realty-center-documents', DEFAULT_DOCUMENTS));
  const [corporateReferences, setCorporateReferences] = useState<CorporateLogoItem[]>(() => getStoredCorporateItems('realty-center-references', DEFAULT_REFERENCES));
  const [corporatePartners, setCorporatePartners] = useState<CorporateLogoItem[]>(() => getStoredCorporateItems('realty-center-partners', DEFAULT_PARTNERS));
  const [corporateSaved, setCorporateSaved] = useState(false);
  const [headerMenuItems, setHeaderMenuItems] = useState<HeaderMenuItem[]>(getHeaderMenu);
  const [headerSaved, setHeaderSaved] = useState(false);
  const [libraryCategories,setLibraryCategories]=useState<LibraryCategory[]>(getLibraryCategories);
  const [librarySaved,setLibrarySaved]=useState(false);
  const [editingLibraryArticle,setEditingLibraryArticle]=useState<{categoryId:string;articleId:string}|null>(null);
  useEffect(() => { const refresh = () => setBuyerRequests(getBuyerRequests()); window.addEventListener('realty-center-buyer-requests-updated', refresh); return () => window.removeEventListener('realty-center-buyer-requests-updated', refresh); }, []);

  const updateManagedHeaderItem = (id: string, patch: Partial<HeaderMenuItem>) => setHeaderMenuItems((current) => updateHeaderMenuItem(current,id,patch));
  const removeManagedHeaderItem = (id: string) => setHeaderMenuItems((current) => removeHeaderMenuItem(current,id));
  const addManagedHeaderChild = (parentId: string, side: 'left' | 'right') => { const id = `menu-${Date.now()}`; setHeaderMenuItems((current) => appendHeaderMenuChild(current,parentId,headerItem(id,'Yeni Alt Başlık',`/icerik/${id}`,side,[],'','Sayfa metnini buraya yazın.'))); };
  const addManagedHeaderRoot = (side: 'left' | 'right') => { const id = `menu-${Date.now()}`; setHeaderMenuItems((current) => [...current,headerItem(id,'Yeni Ana Başlık',`/icerik/${id}`,side,[],'','Sayfa metnini buraya yazın.')]); };
  const saveManagedHeader = () => { saveHeaderMenu(headerMenuItems); setHeaderSaved(true); setTimeout(() => setHeaderSaved(false),2200); };
  const updateLibraryCategory=(id:string,patch:Partial<LibraryCategory>)=>setLibraryCategories((current)=>current.map((item)=>item.id===id?{...item,...patch}:item));
  const updateLibraryArticle=(categoryId:string,articleId:string,patch:Partial<LibraryArticle>)=>setLibraryCategories((current)=>current.map((category)=>category.id===categoryId?{...category,articles:category.articles.map((article)=>article.id===articleId?{...article,...patch}:article)}:category));
  const addLibraryCategory=()=>{const id=`library-${Date.now()}`;setLibraryCategories((current)=>[...current,{id,slug:`yeni-kategori-${Date.now()}`,title:'Yeni Kategori',description:'Kategori açıklaması',color:'#CD011E',articles:[]}]);};
  const addLibraryArticle=(categoryId:string)=>{const articleId=`article-${Date.now()}`;setLibraryCategories((current)=>current.map((category)=>category.id===categoryId?{...category,articles:[...category.articles,{id:articleId,title:'Yeni İçerik',summary:'İçerik özeti',image:'',content:'<p>Yazı içeriğini buraya girin.</p>',publishedAt:new Date().toISOString()}]}:category));setEditingLibraryArticle({categoryId,articleId});};
  const uploadLibraryImage=(categoryId:string,articleId:string,file?:File)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>updateLibraryArticle(categoryId,articleId,{image:String(reader.result)});reader.readAsDataURL(file);};
  const saveLibrary=()=>{saveLibraryCategories(libraryCategories);setLibrarySaved(true);setTimeout(()=>setLibrarySaved(false),2200);};

  const addVideo = async () => {
    if (!videoDraft.url) return alert('YouTube bağlantısı veya video dosyası ekleyin.');
    setVideoSaving(true);
    let title = videoDraft.title.trim();
    let thumbnail = videoDraft.thumbnail.trim();
    if (videoDraft.source === 'youtube') {
      const youtubeId = getYoutubeId(videoDraft.url);
      if (!youtubeId) { setVideoSaving(false); return alert('Geçerli bir YouTube bağlantısı girin.'); }
      if (!thumbnail) thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      if (!title) try { const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoDraft.url)}&format=json`); if (response.ok) { const data = await response.json(); title = data.title || ''; thumbnail = data.thumbnail_url || thumbnail; } } catch { /* YouTube kapak ve varsayılan başlıkla devam eder. */ }
    }
    const next = [{ id: `video-${Date.now()}`, source: videoDraft.source, url: videoDraft.url, title: title || (videoDraft.source === 'upload' ? 'Realty Center® Videosu' : 'YouTube Videosu'), thumbnail, createdAt: new Date().toISOString() }, ...videos];
    try { saveRealtyVideos(next); setVideos(next); setVideoDraft({ source: 'youtube', url: '', title: '', thumbnail: '' }); } catch { alert('Video dosyası tarayıcı depolama sınırını aşıyor. Canlı sistemde dosya sunucuya yüklenecektir.'); }
    setVideoSaving(false);
  };
  const handleDirectVideo = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setVideoDraft((current) => ({ ...current, source: 'upload', url: String(reader.result), title: current.title || file.name.replace(/\.[^.]+$/, '') })); reader.readAsDataURL(file); };
  const handleVideoCover = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setVideoDraft((current) => ({ ...current, thumbnail: String(reader.result) })); reader.readAsDataURL(file); };
  const removeVideo = (id: string) => { const next = videos.filter((video) => video.id !== id); setVideos(next); saveRealtyVideos(next); };
  const updateFeedbackStatus = (id: string, status: CustomerFeedback['status']) => {
    const next = feedbackItems.map((item) => item.id === id ? { ...item, status } : item);
    setFeedbackItems(next);
    saveCustomerFeedback(next);
  };
  const saveCorporateContent = () => {
    localStorage.setItem('realty-center-about-story', aboutStory);
    saveManagementTeam(management);
    localStorage.setItem('realty-center-documents', JSON.stringify(corporateDocuments));
    localStorage.setItem('realty-center-references', JSON.stringify(corporateReferences));
    localStorage.setItem('realty-center-partners', JSON.stringify(corporatePartners));
    window.dispatchEvent(new Event('realty-center-corporate-updated'));
    setCorporateSaved(true);
    setTimeout(() => setCorporateSaved(false), 2200);
  };
  const uploadCorporatePdf = (index: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCorporateDocuments(corporateDocuments.map((item,i) => i === index ? { ...item, fileUrl: String(reader.result) } : item));
    reader.readAsDataURL(file);
  };

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
    if (newStatus !== 'Yayında' && featuredListingIds.includes(id)) {
      const next = featuredListingIds.filter((listingId) => listingId !== id);
      setFeaturedListingIds(next);
      saveFeaturedListingIds(next);
    }
  };
  const toggleFeaturedListing = (id: string) => {
    const next = featuredListingIds.includes(id) ? featuredListingIds.filter((listingId) => listingId !== id) : [...featuredListingIds, id];
    setFeaturedListingIds(next);
    saveFeaturedListingIds(next);
  };

  const navButtons = [
    { key: 'overview' as const, label: 'Genel Bakış & İstatistik', icon: PieChart },
    { key: 'franchise' as const, label: 'Franchise Başvuruları', icon: FileText, badge: franchiseApps.filter(a => a.status === 'Beklemede').length },
    { key: 'offices' as const, label: 'Franchise Ofis Yönetimi', icon: Building2 },
    { key: 'agents' as const, label: 'Danışman Kontrolü', icon: Users },
    { key: 'listings' as const, label: 'İlan Onay Mekanizması', icon: Layers, badge: listings.filter(l => l.approvalStatus === 'Onay Bekliyor').length },
    { key: 'categories' as const, label: 'Kategori Yönetimi', icon: Tag },
    { key: 'videos' as const, label: 'Video Yönetimi', icon: PlayCircle },
    { key: 'library' as const, label: 'Realty Kütüphane Yönetimi', icon: GraduationCap },
    { key: 'messages' as const, label: 'Sistem Mesajları', icon: MessageSquare },
    { key: 'buyerRequests' as const, label: 'Alıcı Talepleri', icon: Bell, badge: buyerRequests.filter((item) => item.status === 'Yeni').length },
    { key: 'feedback' as const, label: 'Müşteri Geri Bildirimleri', icon: Flag, badge: feedbackItems.filter((item) => item.status === 'Yeni').length },
    { key: 'corporate' as const, label: 'Kurumsal İçerik Yönetimi', icon: Briefcase },
    { key: 'header' as const, label: 'Header & Sayfa Yönetimi', icon: Menu },
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
                Realty Center® Türkiye Genel Merkez Ana Kontrol ve Yetkilendirme Ekranı
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
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Yayındaki ilanları denetleyin; vitrin görünürlüğünü buradan ekleyip kaldırın.</p>
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
                        {item.approvalStatus === 'Yayında' && (
                          <button onClick={() => toggleFeaturedListing(item.id)} className={`px-3 py-1 font-black text-xs rounded-lg transition ${featuredListingIds.includes(item.id) ? 'bg-red-700 text-white hover:bg-red-800' : 'border border-red-200 bg-white text-red-700 hover:bg-red-50'}`}>{featuredListingIds.includes(item.id) ? 'Vitrinden Çıkar' : 'Vitrine Ekle'}</button>
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

            {activeTab === 'library' && <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black text-slate-900">Realty Kütüphane Yönetimi</h2><p className="mt-1 text-xs text-slate-500">Kategorileri ve bu kategorilerde yayımlanacak zengin içerikleri yönetin.</p></div><button onClick={addLibraryCategory} className="rounded-xl bg-red-700 px-4 py-3 text-xs font-black text-white">+ Yeni Kategori</button></div><div className="mt-5 space-y-4">{libraryCategories.map((category)=><div key={category.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]"><input value={category.title} onChange={(e)=>updateLibraryCategory(category.id,{title:e.target.value})} placeholder="Kategori adı" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black"/><input value={category.slug} onChange={(e)=>updateLibraryCategory(category.id,{slug:e.target.value.toLocaleLowerCase('tr-TR').replace(/\s+/g,'-')})} placeholder="kategori-baglantisi" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"/><label className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-black">Renk<input type="color" value={category.color} onChange={(e)=>updateLibraryCategory(category.id,{color:e.target.value})} className="h-7 w-8"/></label><button onClick={()=>setLibraryCategories((current)=>current.filter((item)=>item.id!==category.id))} className="px-2 text-[10px] font-black text-red-700">Kategoriyi kaldır</button><textarea rows={2} value={category.description} onChange={(e)=>updateLibraryCategory(category.id,{description:e.target.value})} placeholder="Kategori açıklaması" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-5 md:col-span-4"/></div><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4"><strong className="text-xs text-slate-800">İçerikler ({category.articles.length})</strong><button onClick={()=>addLibraryArticle(category.id)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-[10px] font-black text-red-700">+ İçerik Ekle</button></div>{category.articles.length>0&&<div className="mt-3 grid gap-2 sm:grid-cols-2">{category.articles.map((article)=><div key={article.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><img src={article.image||'/demo-placeholder.svg'} alt="" className="h-14 w-20 rounded-lg bg-slate-100 object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-slate-900">{article.title}</p><button onClick={()=>setEditingLibraryArticle({categoryId:category.id,articleId:article.id})} className="mt-1 text-[10px] font-black text-red-700">İçeriği düzenle</button></div><button onClick={()=>updateLibraryCategory(category.id,{articles:category.articles.filter((item)=>item.id!==article.id)})} className="text-xs font-black text-slate-400">×</button></div>)}</div>}</div>)}</div><button onClick={saveLibrary} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white">{librarySaved?'Kütüphane kaydedildi ✓':'Tüm Kütüphaneyi Kaydet'}</button></section>{editingLibraryArticle&&(()=>{const category=libraryCategories.find((item)=>item.id===editingLibraryArticle.categoryId);const article=category?.articles.find((item)=>item.id===editingLibraryArticle.articleId);if(!category||!article)return null;return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-[10px] font-black text-red-700">{category.title}</p><h3 className="mt-1 font-black text-slate-900">İçerik Editörü</h3></div><button onClick={()=>setEditingLibraryArticle(null)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Kapat</button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><input value={article.title} onChange={(e)=>updateLibraryArticle(category.id,article.id,{title:e.target.value})} placeholder="İçerik başlığı" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black md:col-span-2"/><textarea rows={3} value={article.summary} onChange={(e)=>updateLibraryArticle(category.id,article.id,{summary:e.target.value})} placeholder="Kartta ve yazı girişinde görünecek özet" className="rounded-xl border border-slate-300 px-4 py-3 text-xs leading-5 md:col-span-2"/><input type="date" value={article.publishedAt.slice(0,10)} onChange={(e)=>updateLibraryArticle(category.id,article.id,{publishedAt:new Date(`${e.target.value}T12:00:00`).toISOString()})} className="rounded-xl border border-slate-300 px-4 py-3 text-xs"/><input value={article.image.startsWith('data:')?'':article.image} onChange={(e)=>updateLibraryArticle(category.id,article.id,{image:e.target.value})} placeholder="Kapak görseli URL'si" className="rounded-xl border border-slate-300 px-4 py-3 text-xs"/><label className="cursor-pointer rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-4 text-center text-xs font-black text-red-700 md:col-span-2"><input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadLibraryImage(category.id,article.id,e.target.files?.[0])}/>{article.image?'Kapak görselini değiştir':'Bilgisayardan kapak görseli seç'}</label>{article.image&&<img src={article.image} alt="Kapak önizleme" className="max-h-56 w-full rounded-xl bg-slate-100 object-cover md:col-span-2"/>}<div className="md:col-span-2"><RichTextEditor value={article.content} onChange={(content)=>updateLibraryArticle(category.id,article.id,{content})}/></div></div><button onClick={saveLibrary} className="mt-5 w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">{librarySaved?'İçerik kaydedildi ✓':'İçeriği Kaydet ve Yayınla'}</button></section>;})()}</div>}

            {activeTab === 'videos' && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="border-b border-slate-200 pb-4"><h2 className="text-lg font-black text-slate-900">Video Yönetimi</h2><p className="mt-1 text-xs text-slate-500">YouTube bağlantısı yapıştırın veya kendi video dosyanızı yükleyin. Başlık ve kapak boşsa YouTube bilgileri otomatik alınır.</p></div><div className="mt-5 flex gap-2"><button onClick={() => setVideoDraft({ ...videoDraft, source: 'youtube', url: '' })} className={`rounded-lg px-4 py-2 text-xs font-black ${videoDraft.source === 'youtube' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'}`}>YouTube Videosu</button><button onClick={() => setVideoDraft({ ...videoDraft, source: 'upload', url: '' })} className={`rounded-lg px-4 py-2 text-xs font-black ${videoDraft.source === 'upload' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'}`}>Dosya Yükle</button></div><div className="mt-5 grid gap-4 md:grid-cols-2">{videoDraft.source === 'youtube' ? <div className="md:col-span-2"><label className="mb-1 block text-xs font-black text-slate-600">YouTube bağlantısı</label><input value={videoDraft.url} onChange={(e) => setVideoDraft({ ...videoDraft, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"/></div> : <label className="md:col-span-2 cursor-pointer rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-6 text-center text-xs font-black text-red-700"><input type="file" accept="video/*" className="hidden" onChange={(e) => handleDirectVideo(e.target.files?.[0])}/>{videoDraft.url ? 'Video dosyası seçildi ✓' : 'Bilgisayardan video dosyası seç'}</label>}<div><label className="mb-1 block text-xs font-black text-slate-600">Özel başlık (isteğe bağlı)</label><input value={videoDraft.title} onChange={(e) => setVideoDraft({ ...videoDraft, title: e.target.value })} placeholder="Boşsa YouTube başlığı kullanılır" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"/></div><div><label className="mb-1 block text-xs font-black text-slate-600">Kapak görseli URL’si (isteğe bağlı)</label><input value={videoDraft.thumbnail.startsWith('data:') ? '' : videoDraft.thumbnail} onChange={(e) => setVideoDraft({ ...videoDraft, thumbnail: e.target.value })} placeholder="Boşsa YouTube kapağı kullanılır" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"/></div><label className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-xs font-black text-slate-700"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleVideoCover(e.target.files?.[0])}/>Özel kapak görseli seç</label><button onClick={addVideo} disabled={videoSaving} className="rounded-xl bg-red-700 px-5 py-3 text-xs font-black text-white disabled:opacity-60">{videoSaving ? 'YouTube bilgileri alınıyor…' : 'Videoyu Yayınla'}</button></div></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><h3 className="font-black text-slate-900">Yayındaki Videolar ({videos.length})</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{videos.map((video) => <div key={video.id} className="flex gap-3 rounded-xl border border-slate-200 p-3"><img src={video.thumbnail || '/demo-placeholder.svg'} alt="" className="h-20 w-28 rounded-lg bg-slate-100 object-cover"/><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-black text-slate-900">{video.title}</p><p className="mt-1 text-[10px] font-bold text-red-700">{video.source === 'youtube' ? 'YouTube' : 'Yüklenen Video'}</p><button onClick={() => removeVideo(video.id)} className="mt-3 text-[10px] font-black text-red-700">Videoyu kaldır</button></div></div>)}</div></section>
              </div>
            )}

            {/* 6. SİSTEM MESAJLARI TABI */}
            {activeTab === 'buyerRequests' && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="border-b border-slate-200 pb-4"><h2 className="text-lg font-black text-slate-900">Alıcı Talepleri ve Bildirimler</h2><p className="mt-1 text-xs text-slate-500">Her talep genel merkeze, ilgili ofise ve bölgedeki danışmanlara yönlendirilir.</p></div>{buyerRequests.length ? buyerRequests.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-black text-red-700">{item.id} · {new Date(item.createdAt).toLocaleString('tr-TR')}</p><h3 className="mt-1 font-black text-slate-900">{item.name} · {item.type} {item.property}</h3><p className="mt-1 text-xs text-slate-600">{item.city} / {item.district} · {item.budget || 'Bütçe belirtilmedi'} · {item.phone}</p></div><select value={item.status} onChange={(e) => { const next = buyerRequests.map((entry) => entry.id === item.id ? { ...entry, status: e.target.value as BuyerRequest['status'] } : entry); setBuyerRequests(next); saveBuyerRequests(next); }} className="h-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"><option>Yeni</option><option>İnceleniyor</option><option>Eşleştirildi</option></select></div><div className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><p className="rounded-lg bg-white p-3 text-slate-600"><strong className="text-slate-900">Ofis bildirimi:</strong> {item.officeNames.length ? item.officeNames.join(', ') : 'Genel merkez eşleştirmesi bekliyor'}</p><p className="rounded-lg bg-white p-3 text-slate-600"><strong className="text-slate-900">Danışman bildirimi:</strong> {item.agentNames.length ? item.agentNames.join(', ') : 'Bölge danışmanı eşleştirmesi bekliyor'}</p></div></div>) : <p className="py-10 text-center text-sm font-bold text-slate-500">Henüz alıcı talebi yok.</p>}</div>
            )}

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

            {activeTab === 'feedback' && (
              <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4"><div><h2 className="text-lg font-black text-slate-900">Müşteri Geri Bildirimleri</h2><p className="mt-1 text-xs text-slate-500">Memnuniyet, danışman/ofis değerlendirmeleri, şikâyet ve dilek kayıtları.</p></div><span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-700">{feedbackItems.length} kayıt</span></div><div className="mt-5 space-y-3">{feedbackItems.length ? feedbackItems.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black text-red-700">{item.type}</span>{item.rating > 0 && <span className="text-sm tracking-wide text-amber-400">{'★'.repeat(item.rating)}<span className="text-slate-300">{'★'.repeat(5-item.rating)}</span></span>}</div><h3 className="mt-2 text-sm font-black text-slate-900">{item.subject || item.agent || item.office || 'Geri bildirim'}</h3><p className="mt-1 text-[11px] font-bold text-slate-500">{item.name} · {item.phone} {item.email && `· ${item.email}`}</p></div><select value={item.status} onChange={(e) => updateFeedbackStatus(item.id, e.target.value as CustomerFeedback['status'])} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-black text-slate-700"><option>Yeni</option><option>İnceleniyor</option><option>Yanıtlandı</option></select></div>{(item.agent || item.office) && <p className="mt-3 text-[11px] font-black text-red-700">{item.agent ? `Danışman: ${item.agent}` : `Ofis: ${item.office}`}</p>}<p className="mt-3 whitespace-pre-line text-xs leading-5 text-slate-700">{item.message}</p><p className="mt-3 text-[10px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleString('tr-TR')} · {item.id}</p></article>) : <div className="rounded-xl bg-slate-50 p-8 text-center text-xs font-bold text-slate-500">Henüz müşteri geri bildirimi bulunmuyor.</div>}</div></div></div>
            )}

            {activeTab === 'corporate' && (
              <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="border-b border-slate-200 pb-4"><h2 className="text-lg font-black text-slate-900">Hakkımızda ve Yönetim Kadrosu</h2><p className="mt-1 text-xs text-slate-500">Kurumsal hikâyeyi, yönetici fotoğraflarını, unvanlarını ve özgeçmişlerini düzenleyin.</p></div><label className="mt-5 block text-xs font-black text-slate-700">SEO uyumlu Hakkımızda hikâyesi</label><textarea rows={12} value={aboutStory} onChange={(e) => setAboutStory(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-red-600"/></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h3 className="font-black text-slate-900">Yönetim Kadrosu</h3><button onClick={() => setManagement([...management,{ id:`yonetim-${Date.now()}`, name:'Yeni Yönetici', title:'Görevi', image:'/demo-placeholder.svg', biography:'Özgeçmiş bilgisi giriniz.' }])} className="rounded-lg bg-red-700 px-4 py-2 text-xs font-black text-white">+ Yönetici Ekle</button></div><div className="mt-5 space-y-4">{management.map((member,index) => <div key={member.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[110px_1fr]"><img src={member.image} alt="" className="h-28 w-28 rounded-xl bg-white object-cover object-top"/><div className="grid gap-3 sm:grid-cols-2"><input value={member.name} onChange={(e) => setManagement(management.map((item,i) => i === index ? {...item,name:e.target.value} : item))} placeholder="Ad Soyad" className="rounded-lg border border-slate-300 px-3 py-2 text-xs"/><input value={member.title} onChange={(e) => setManagement(management.map((item,i) => i === index ? {...item,title:e.target.value} : item))} placeholder="Unvan" className="rounded-lg border border-slate-300 px-3 py-2 text-xs"/><input value={member.image} onChange={(e) => setManagement(management.map((item,i) => i === index ? {...item,image:e.target.value} : item))} placeholder="Fotoğraf URL'si" className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2"/><textarea rows={4} value={member.biography} onChange={(e) => setManagement(management.map((item,i) => i === index ? {...item,biography:e.target.value} : item))} placeholder="Özgeçmiş" className="rounded-lg border border-slate-300 px-3 py-2 text-xs leading-5 sm:col-span-2"/><button onClick={() => setManagement(management.filter((_,i) => i !== index))} className="w-fit text-[10px] font-black text-red-700">Yöneticiyi kaldır</button></div></div>)}</div><button onClick={saveCorporateContent} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">{corporateSaved ? 'Kaydedildi ✓' : 'Kurumsal İçeriği Kaydet'}</button></section></div>
            )}

            {activeTab === 'corporate' && <div className="mt-6 space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-center justify-between gap-3"><div><h3 className="font-black text-slate-900">Belgelerimiz</h3><p className="mt-1 text-xs text-slate-500">PDF dosyaları sitede çerçeveli belge kartı olarak görünür.</p></div><button onClick={() => setCorporateDocuments([...corporateDocuments,{id:`belge-${Date.now()}`,title:'Yeni Belge',description:'Belge açıklaması',fileUrl:''}])} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Belge Ekle</button></div><div className="mt-5 space-y-3">{corporateDocuments.map((document,index) => <div key={document.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"><input value={document.title} onChange={(e) => setCorporateDocuments(corporateDocuments.map((item,i) => i===index?{...item,title:e.target.value}:item))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Belge adı"/><input value={document.description} onChange={(e) => setCorporateDocuments(corporateDocuments.map((item,i) => i===index?{...item,description:e.target.value}:item))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Belge açıklaması"/><label className="cursor-pointer rounded-lg border border-dashed border-red-300 bg-red-50 px-3 py-3 text-center text-xs font-black text-red-700"><input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadCorporatePdf(index,e.target.files?.[0])}/>{document.fileUrl ? 'PDF yüklendi ✓ Değiştir' : 'PDF Belgesi Yükle'}</label><button onClick={() => setCorporateDocuments(corporateDocuments.filter((_,i)=>i!==index))} className="text-xs font-black text-red-700">Belgeyi kaldır</button></div>)}</div></section>
              {([['Referanslarımız',corporateReferences,setCorporateReferences],['İş Ortaklarımız',corporatePartners,setCorporatePartners]] as const).map(([title,items,setItems]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-center justify-between gap-3"><div><h3 className="font-black text-slate-900">{title}</h3><p className="mt-1 text-xs text-slate-500">Logo ve tıklandığında açılacak çalışma içeriğini yönetin.</p></div><button onClick={() => setItems([...items,{id:`logo-${Date.now()}`,name:'Yeni Kurum',logo:'/demo-placeholder.svg',content:'İş birliği veya referans açıklaması.'}])} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">+ Logo Ekle</button></div><div className="mt-5 space-y-3">{items.map((item,index) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"><input value={item.name} onChange={(e) => setItems(items.map((entry,i)=>i===index?{...entry,name:e.target.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Kurum adı"/><input value={item.logo} onChange={(e) => setItems(items.map((entry,i)=>i===index?{...entry,logo:e.target.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Logo URL'si"/><textarea rows={3} value={item.content} onChange={(e) => setItems(items.map((entry,i)=>i===index?{...entry,content:e.target.value}:entry))} className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2" placeholder="Anlaşma / çalışma içeriği"/><button onClick={() => setItems(items.filter((_,i)=>i!==index))} className="w-fit text-xs font-black text-red-700">Kaydı kaldır</button></div>)}</div></section>)}
              <button onClick={saveCorporateContent} className="w-full rounded-xl bg-red-700 px-5 py-4 text-sm font-black text-white">{corporateSaved ? 'Tüm içerikler kaydedildi ✓' : 'Belgeler, Referanslar ve İş Ortaklarını Kaydet'}</button>
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

  const [myListings, setMyListings] = useState(() =>
    SAMPLE_LISTINGS.map((item) => ({
      ...item,
      images: item.images?.length ? item.images : [item.image],
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
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      window.setTimeout(() => { void context.close(); }, 420);
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
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.032, context.currentTime + 1.2);
    master.connect(context.destination);
    audioContextRef.current = context;
    masterGainRef.current = master;

    const playNote = (frequency: number, start: number, duration: number) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(0.17, start + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(noteGain);
      noteGain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    };

    const playPhrase = () => {
      const now = context.currentTime + 0.08;
      const notes = [261.63, 329.63, 392, 523.25, 440, 349.23, 329.63, 293.66, 261.63, 329.63, 392, 493.88, 440, 392, 329.63, 261.63];
      notes.forEach((frequency, index) => playNote(frequency, now + index * 0.48, 1.35));
      [130.81, 110, 146.83, 98].forEach((frequency, index) => playNote(frequency, now + index * 1.92, 2.5));
    };

    await context.resume();
    playPhrase();
    loopRef.current = window.setInterval(playPhrase, 7680);
    setPlaying(true);
  }, []);

  useEffect(() => () => {
    if (loopRef.current !== null) window.clearInterval(loopRef.current);
    void audioContextRef.current?.close();
  }, []);

  return <button type="button" onClick={() => { if (playing) void stopMusic(); else void startMusic(); }} aria-pressed={playing} aria-label={playing ? 'Müziği sessize al' : 'Klasik müzik çal'} className="fixed bottom-5 left-5 z-[90] inline-flex items-center gap-2 rounded-full border-2 border-[#071d3b] bg-white/95 px-4 py-2.5 text-xs font-black text-[#071d3b] shadow-[0_8px_24px_rgba(7,29,59,.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#CD011E] hover:text-[#CD011E]">
    {playing ? <VolumeX className="h-4 w-4"/> : <Music2 className="h-4 w-4"/>}
    <span>{playing ? 'Sessize Al' : 'Müzik Çal'}</span>
    {playing && <span className="h-2 w-2 animate-pulse rounded-full bg-[#CD011E]"/>}
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
        <div className="relative mb-10 transform animate-pulse">
          <img 
            src="/rlogo2.png"
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
