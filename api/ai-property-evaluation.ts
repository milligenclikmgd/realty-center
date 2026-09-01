import type { IncomingMessage, ServerResponse } from 'node:http';

type EvaluationRequest = {
  city?: string;
  district?: string;
  propertyType?: string;
  propertyDetails?: string;
  features?: string;
  question?: string;
  kvkkAccepted?: boolean;
  termsAccepted?: boolean;
};

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

export default async function handler(request: IncomingMessage & { body?: EvaluationRequest }, response: ServerResponse) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Yalnızca POST isteği kabul edilir.' });

  const body = request.body || {};
  if (!body.kvkkAccepted || !body.termsAccepted) return sendJson(response, 400, { error: 'KVKK ve kullanım koşulları onayı gereklidir.' });
  const required = [body.city, body.district, body.propertyType, body.propertyDetails, body.question];
  if (required.some((value) => !value?.trim())) return sendJson(response, 400, { error: 'Lütfen zorunlu alanları eksiksiz doldurun.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(response, 503, { error: 'Yapay zeka servisi henüz etkinleştirilmedi.' });

  const prompt = `Sen Realty Center® için çalışan, Türkiye gayrimenkul piyasasına odaklı bir analiz asistanısın.
Kullanıcıya Türkçe, anlaşılır ve ihtiyatlı bir ön değerlendirme sun. Kesin fiyat, resmî ekspertiz veya yatırım garantisi verme.

İl: ${body.city}
İlçe: ${body.district}
Gayrimenkul türü: ${body.propertyType}
Mülkün temel bilgileri: ${body.propertyDetails}
Ek özellikler: ${body.features || 'Belirtilmedi'}
Kullanıcının öğrenmek istediği: ${body.question}

Yanıtını şu başlıklarla ver:
1. Ön değerlendirme
2. Değeri etkileyen unsurlar
3. Bölgesel piyasa yorumu
4. Kullanıcının sorusuna yanıt
5. Sonraki adım
En sonda bunun bilgi amaçlı bir yapay zeka analizi olduğunu ve resmî ekspertiz yerine geçmediğini belirt.`;

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 1200 } }),
    });
    const data = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!geminiResponse.ok) throw new Error(data.error?.message || 'Gemini yanıt veremedi.');
    const result = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
    if (!result) throw new Error('Analiz sonucu oluşturulamadı.');
    return sendJson(response, 200, { result });
  } catch (error) {
    console.error('Gemini evaluation error:', error instanceof Error ? error.message : error);
    return sendJson(response, 502, { error: 'Analiz şu anda tamamlanamadı. Lütfen biraz sonra tekrar deneyin.' });
  }
}
