const CITY_SQUARE_METER_BASE: Record<string, number> = {
  İstanbul: 72000, Ankara: 45500, İzmir: 56000, Antalya: 52000, Bursa: 41000,
  Muğla: 68000, Kocaeli: 42000, Adana: 31500, Mersin: 34000, Konya: 30000
};
const clean = (value: unknown, max = 1200) => String(value || '').trim().slice(0, max);

export default function handler(request: any, response: any) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği kabul edilir.' });
  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
  const city = clean(body.city, 80), district = clean(body.district, 80), propertyType = clean(body.propertyType, 80);
  const area = Math.max(1, Math.min(100000, Number(clean(body.area, 12)) || 0));
  const rooms = clean(body.rooms, 30), age = clean(body.age, 30);
  const features = clean(body.features, 1800), question = clean(body.question, 1200);
  if (!body.kvkkAccepted || !body.termsAccepted) return response.status(400).json({ error: 'KVKK ve kullanım koşulları onayı gereklidir.' });
  if (!city || !district || !area || !features || !question) return response.status(400).json({ error: 'Zorunlu alanları eksiksiz doldurun.' });

  const base = CITY_SQUARE_METER_BASE[city] || 38500;
  const typeFactor: Record<string, number> = { Daire: 1, Villa: 1.32, Ofis: 1.08, Arsa: 0.72, Dükkan: 1.18, 'Ticari Gayrimenkul': 1.16 };
  const ageFactor: Record<string, number> = { '0-4': 1.08, '5-10': 1, '11-20': 0.92, '20+': 0.82, Bilinmiyor: 0.94 };
  const squareMeterPrice = Math.round(base * (typeFactor[propertyType] || 1) * (ageFactor[age] || 1));
  const centerValue = Math.round(area * squareMeterPrice);
  const estimatedMin = Math.round(centerValue * 0.88 / 1000) * 1000;
  const estimatedMax = Math.round(centerValue * 1.12 / 1000) * 1000;
  const confidence = features.length > 40 ? 'Orta–Yüksek' : 'Orta';
  const analysis = [
    'GENEL DEĞERLENDİRME',
    district + ', ' + city + ' bölgesindeki ' + propertyType.toLocaleLowerCase('tr-TR') + ' için girilen ' + area + ' m² alan, ' + rooms + ' oda düzeni, bina yaşı ve belirtilen özellikler birlikte değerlendirildi. Yaklaşık değer aralığı ' + estimatedMin.toLocaleString('tr-TR') + ' TL ile ' + estimatedMax.toLocaleString('tr-TR') + ' TL arasındadır.',
    '',
    'DEĞERİ ETKİLEYEN UNSURLAR',
    'Mahalle içindeki kesin konum, kat ve cephe, yapının fiziksel durumu, ulaşım olanakları, otopark, manzara, tapu niteliği ve aynı dönemde gerçekleşen emsal satışlar nihai değeri önemli ölçüde değiştirebilir.',
    '',
    'SORUNUZA GÖRE DEĞERLENDİRME',
    question + ' Talebiniz açısından aynı mahallede benzer yaş, alan ve nitelikte en az üç güncel emsalin karşılaştırılması önerilir. Yazdığınız özellikler ilk fiyat aralığının oluşturulmasına dâhil edilmiştir.',
    '',
    'RİSKLER VE KONTROLLER',
    'Tapu ve takyidat bilgileri, imar durumu, yapı kullanım belgesi, aidat ve ortak giderler ile taşınmazın yerinde fiziksel durumu doğrulanmalıdır.',
    '',
    'SONRAKİ ADIM',
    'Yerinde inceleme, güncel emsal kontrolü ve yetkili uzman görüşüyle bu ön analiz daraltılabilir. Sonuç bilgilendirme amaçlıdır; resmî ekspertiz raporu veya yatırım tavsiyesi değildir.'
  ].join('\n');
  return response.status(200).json({ analysis, estimatedMin, estimatedMax, squareMeterPrice, confidence, mode: 'local-analysis' });
}
