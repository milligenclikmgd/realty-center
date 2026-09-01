import type { IncomingMessage, ServerResponse } from 'node:http';

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  response.end(JSON.stringify(body));
};

type ChannelResponse = { items?: Array<{ id?: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }>; error?: { message?: string } };
type PlaylistResponse = { items?: Array<{ snippet?: { title?: string; description?: string; publishedAt?: string; resourceId?: { videoId?: string }; thumbnails?: { high?: { url?: string }; medium?: { url?: string } } } }>; error?: { message?: string } };

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Yalnızca GET isteği kabul edilir.' });
  const requestUrl = new URL(request.url || '/', 'https://realty-center.local');
  const channelUrl = (requestUrl.searchParams.get('channelUrl') || '').trim();
  if (!channelUrl) return sendJson(response, 200, { videos: [], configured: false });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return sendJson(response, 503, { videos: [], configured: false, error: 'YouTube API bağlantısı henüz etkinleştirilmedi.' });

  try {
    const idMatch = channelUrl.match(/youtube\.com\/channel\/(UC[\w-]+)/i);
    const handleMatch = channelUrl.match(/youtube\.com\/@([^/?#]+)/i);
    if (!idMatch && !handleMatch) return sendJson(response, 400, { videos: [], error: 'Geçerli bir YouTube kanal bağlantısı girin.' });

    const channelQuery = idMatch ? `id=${encodeURIComponent(idMatch[1])}` : `forHandle=${encodeURIComponent(`@${handleMatch?.[1] || ''}`)}`;
    const channelRequest = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&${channelQuery}&key=${encodeURIComponent(apiKey)}`);
    const channelData = await channelRequest.json() as ChannelResponse;
    if (!channelRequest.ok) throw new Error(channelData.error?.message || 'YouTube kanalı alınamadı.');
    const uploadsPlaylist = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) return sendJson(response, 404, { videos: [], error: 'YouTube kanalı bulunamadı.' });

    const playlistRequest = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylist)}&maxResults=50&key=${encodeURIComponent(apiKey)}`);
    const playlistData = await playlistRequest.json() as PlaylistResponse;
    if (!playlistRequest.ok) throw new Error(playlistData.error?.message || 'YouTube videoları alınamadı.');

    const videos = (playlistData.items || []).flatMap((item) => {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!snippet || !videoId) return [];
      return [{ id: `youtube-channel-${videoId}`, source: 'youtube-channel', category: 'tv', url: `https://www.youtube.com/watch?v=${videoId}`, title: snippet.title || 'Realty Center® YouTube Videosu', thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, description: '', createdAt: snippet.publishedAt || new Date().toISOString() }];
    });
    return sendJson(response, 200, { videos, configured: true });
  } catch (error) {
    console.error('YouTube channel sync error:', error instanceof Error ? error.message : error);
    return sendJson(response, 502, { videos: [], error: 'YouTube kanal videoları şu anda alınamadı.' });
  }
}
