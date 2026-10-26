export type MainCategory = 'Konut' | 'Arsa' | 'İşyeri';
export type TransactionKind = 'Satılık' | 'Kiralık' | 'Devren';
export type CatalogField = { key: string; label: string; kind: 'select' | 'number' | 'text'; options?: string[]; group: string; multiple?: boolean };

export const TRANSACTION_KINDS: TransactionKind[] = ['Satılık', 'Kiralık', 'Devren'];

const residential = ['Daire', 'Rezidans', 'Müstakil Ev', 'Villa', 'Yazlık', 'Yalı', 'Yalı Dairesi', 'Köşk', 'Konak', 'Çiftlik Evi', 'Dağ Evi', 'Prefabrik Ev', 'Kooperatif', 'Bina', 'Devre Mülk', 'Tiny House', 'Bungalov', 'Taş Ev', 'Konut Projesi'];
const land = ['Konut İmarlı', 'Ticari İmarlı', 'Konut + Ticari İmarlı', 'Sanayi İmarlı', 'Turizm İmarlı', 'Tarla', 'Bağ', 'Bahçe', 'Zeytinlik', 'Meyvelik', 'Sera', 'Çiftlik', 'Hobi Bahçesi', 'Depo / Antrepo İmarlı', 'Eğitim Tesisi İmarlı', 'Sağlık Tesisi İmarlı', 'Akaryakıt İstasyonu İmarlı', 'Özel Kullanım', 'İmarsız', 'Muhtelif Arsa'];
const commercial = ['Ofis / Büro', 'Plaza Katı', 'İş Hanı Katı', 'Dükkan', 'Mağaza', 'Showroom', 'AVM Dükkanı', 'Restoran / Lokanta', 'Kafe / Pastane', 'Otel', 'Apart Otel', 'Pansiyon', 'Turistik Tesis', 'Fabrika', 'İmalathane', 'Atölye', 'Depo', 'Antrepo', 'Soğuk Hava Deposu', 'Lojistik Merkezi', 'Sanayi Tesisi', 'Akaryakıt İstasyonu', 'Otopark', 'Sağlık Tesisi', 'Eğitim Tesisi', 'Yurt', 'Spor Tesisi', 'Düğün / Organizasyon Salonu', 'Çiftlik / Üretim Tesisi', 'Diğer Ticari'];
const devrenCommercial = ['Restoran / Lokanta', 'Kafe / Pastane', 'Dükkan', 'Mağaza', 'Showroom', 'Otel', 'Apart Otel', 'Pansiyon', 'Turistik Tesis', 'Spor Tesisi', 'Düğün / Organizasyon Salonu', 'Diğer Ticari'];

export const CATEGORY_TREE: Record<MainCategory, string[]> = { Konut: residential, Arsa: land, İşyeri: commercial };
export const legacyMainCategory = (value?: string) : MainCategory | '' => value === 'Arazi' || value === 'Arsa' ? 'Arsa' : value === 'Ticari Gayrimenkul' || value === 'İşyeri' ? 'İşyeri' : value === 'Konut' ? 'Konut' : '';
export const normalizePropertyType = (value?: string) => ({ Residence: 'Rezidans', Ev: 'Müstakil Ev', Arazi: 'Muhtelif Arsa', Ofis: 'Ofis / Büro', Plaza: 'Plaza Katı', Market: 'Mağaza', AVM: 'AVM Dükkanı', Restoran: 'Restoran / Lokanta', Kafe: 'Kafe / Pastane' }[value || ''] || value || '');
export const categoriesFor = (main: MainCategory | '', transaction: TransactionKind | '') => !main ? [] : main === 'İşyeri' && transaction === 'Devren' ? devrenCommercial : transaction === 'Devren' ? [] : CATEGORY_TREE[main];

const priceArea: CatalogField[] = [
  { key: 'minPrice', label: 'En az fiyat', kind: 'number', group: 'Temel Bilgiler' },
  { key: 'maxPrice', label: 'En çok fiyat', kind: 'number', group: 'Temel Bilgiler' },
  { key: 'minArea', label: 'En az m²', kind: 'number', group: 'Temel Bilgiler' },
  { key: 'maxArea', label: 'En çok m²', kind: 'number', group: 'Temel Bilgiler' },
];
const homeFields: CatalogField[] = [
  { key: 'rooms', label: 'Oda sayısı', kind: 'select', group: 'Temel Bilgiler', multiple: true, options: ['Stüdyo','1+0','1+1','1+2','2+0','2+1','2+2','3+1','3+2','4+1','4+2','5+1','5+2','6+1','6+2','7+1','7+2','8+1','8+2','9+ ve üzeri','Özel plan'] },
  { key: 'building_age', label: 'Bina yaşı', kind: 'select', group: 'Bina Özellikleri', options: ['0 (Yeni)','1','2','3','4','5','6–10','11–15','16–20','21–25','26–30','31 ve üzeri'] },
  { key: 'heating', label: 'Isıtma', kind: 'select', group: 'Bina Özellikleri', multiple: true, options: ['Kombi (Doğalgaz)','Merkezi Sistem (Doğalgaz)','Merkezi Sistem (Pay Ölçer)','Yerden Isıtma','Kat Kaloriferi','Klima','Soba (Kömür)','Elektrikli Isıtma','Isı Pompası','Jeotermal','Şömine','Isıtma Yok'] },
  { key: 'floor', label: 'Bulunduğu kat', kind: 'select', group: 'Bina Özellikleri', options: ['Bodrum Kat','Bahçe Katı','Giriş Katı','Yüksek Giriş','Asma Kat',...Array.from({ length: 20 }, (_, i) => String(i + 1)),'21 ve üzeri','Çatı Katı','Müstakil'] },
  { key: 'parking', label: 'Otopark', kind: 'select', group: 'Dış Özellikler', options: ['Açık','Kapalı','Açık ve Kapalı','Yok'] },
  { key: 'mortgage', label: 'Krediye uygunluk', kind: 'select', group: 'Tapu ve Finansman', options: ['Evet','Hayır','Bilinmiyor'] },
  { key: 'deed', label: 'Tapu durumu', kind: 'select', group: 'Tapu ve Finansman', options: ['Kat Mülkiyetli','Kat İrtifaklı','Hisseli Tapu','Müstakil Tapu','Arsa Tapulu','Kooperatif Hisseli','Diğer'] },
];
const landFields: CatalogField[] = [
  { key: 'zoning', label: 'İmar durumu', kind: 'select', group: 'İmar', options: ['Konut','Ticaret','Konut + Ticaret','Sanayi','Küçük Sanayi','Depolama','Turizm','Tarım','Eğitim Tesisi','Sağlık Tesisi','Sosyal Tesis','Spor Tesisi','Akaryakıt İstasyonu','Plansız Alan','Bilinmiyor / Doğrulanmadı'] },
  { key: 'deed', label: 'Tapu durumu', kind: 'select', group: 'Tapu', options: ['Müstakil Tapu','Hisseli Tapu','Kat İrtifakı','Diğer'] },
  { key: 'title_deed_type', label: 'Tapu niteliği', kind: 'select', group: 'Tapu', options: ['Arsa','Tarla','Bağ','Bahçe','Zeytinlik','Diğer'] },
  { key: 'kaks', label: 'KAKS / Emsal', kind: 'number', group: 'İmar' },
  { key: 'taks', label: 'TAKS', kind: 'number', group: 'İmar' },
  { key: 'frontage', label: 'Yola cephe (m)', kind: 'number', group: 'Parsel Özellikleri' },
  { key: 'infrastructure', label: 'Altyapı', kind: 'select', group: 'Altyapı', multiple: true, options: ['Elektrik','Su','Kanalizasyon','Doğalgaz','Fiber İnternet','Kadastro Yolu','Asfalt Yol','Tarımsal Sulama','Artezyen / Kuyu'] },
  { key: 'mortgage', label: 'Krediye uygunluk', kind: 'select', group: 'Tapu ve Finansman', options: ['Evet','Hayır','Bilinmiyor'] },
];
const commercialFields: CatalogField[] = [
  { key: 'building_age', label: 'Yapı yaşı', kind: 'select', group: 'Yapı Özellikleri', options: ['0 (Yeni)','1–5','6–10','11–15','16–20','21 ve üzeri'] },
  { key: 'floor', label: 'Bulunduğu kat', kind: 'text', group: 'Yapı Özellikleri' },
  { key: 'heating', label: 'Isıtma', kind: 'select', group: 'Yapı Özellikleri', options: ['Kombi (Doğalgaz)','Merkezi Sistem','Yerden Isıtma','Klima','Isıtma Yok'] },
  { key: 'parking', label: 'Otopark', kind: 'select', group: 'Yapı Özellikleri', options: ['Açık','Kapalı','Açık ve Kapalı','Yok'] },
  { key: 'mortgage', label: 'Krediye uygunluk', kind: 'select', group: 'Tapu ve Finansman', options: ['Evet','Hayır','Bilinmiyor'] },
];
const industrialFields: CatalogField[] = [
  { key: 'closed_area', label: 'Kapalı alan (m²)', kind: 'number', group: 'Teknik Altyapı' },
  { key: 'ceiling_height', label: 'Tavan yüksekliği (m)', kind: 'number', group: 'Teknik Altyapı' },
  { key: 'power_capacity', label: 'Elektrik gücü (kVA)', kind: 'number', group: 'Teknik Altyapı' },
  { key: 'loading_ramp', label: 'Yükleme rampası', kind: 'select', group: 'Teknik Altyapı', options: ['Var','Yok'] },
  { key: 'tir_access', label: 'TIR girişi', kind: 'select', group: 'Teknik Altyapı', options: ['Var','Yok'] },
  { key: 'osb', label: 'OSB içerisinde', kind: 'select', group: 'Teknik Altyapı', options: ['Evet','Hayır'] },
];
const transferFields: CatalogField[] = [
  { key: 'transfer_fee', label: 'Devir bedeli', kind: 'number', group: 'İşletme Bilgileri' },
  { key: 'monthly_rent', label: 'Aylık kira', kind: 'number', group: 'İşletme Bilgileri' },
  { key: 'deposit', label: 'Depozito', kind: 'number', group: 'İşletme Bilgileri' },
  { key: 'stock_included', label: 'Stok dahil mi?', kind: 'select', group: 'İşletme Bilgileri', options: ['Evet','Hayır'] },
  { key: 'license_status', label: 'Ruhsat durumu', kind: 'select', group: 'İşletme Bilgileri', options: ['Var','Yok','Başvuru aşamasında'] },
];

export const fieldsFor = (main: MainCategory | '', propertyType: string, transaction: TransactionKind | ''): CatalogField[] => {
  const normalized = normalizePropertyType(propertyType);
  if (transaction === 'Devren') return [...priceArea, ...commercialFields, ...transferFields];
  if (main === 'Konut') return [...priceArea, ...homeFields];
  if (main === 'Arsa') return [...priceArea, ...landFields];
  if (['Fabrika','İmalathane','Atölye','Depo','Antrepo','Soğuk Hava Deposu','Lojistik Merkezi','Sanayi Tesisi'].includes(normalized)) return [...priceArea, ...commercialFields, ...industrialFields];
  return [...priceArea, ...commercialFields];
};

export const listingBelongsTo = (category: string, propertyType: string, main: MainCategory | '') => {
  if (!main) return true;
  if (legacyMainCategory(category) === main) return true;
  return categoriesFor(main, '').includes(normalizePropertyType(propertyType));
};
