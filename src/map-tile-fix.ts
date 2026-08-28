import L from 'leaflet';

/*
 * CARTO light_nolabels katmanı şehir/il adlarını özellikle gizliyordu ve
 * bazı isteklerde API KEY REQUIRED filigranı göstermeye başladı.
 * Uygulamadaki mevcut Leaflet haritalarını bozmadan, bu eski katman
 * isteklerini etiketli OpenStreetMap standart katmanına yönlendiriyoruz.
 */
const originalGetTileUrl = L.TileLayer.prototype.getTileUrl;

L.TileLayer.prototype.getTileUrl = function patchedGetTileUrl(coords: L.Coords) {
  const configuredUrl = (this as unknown as { _url?: string })._url || '';
  if (configuredUrl.includes('basemaps.cartocdn.com/light_nolabels')) {
    const zoom = this._tileZoom ?? this._map?.getZoom() ?? 0;
    return `https://tile.openstreetmap.org/${zoom}/${coords.x}/${coords.y}.png`;
  }
  return originalGetTileUrl.call(this, coords);
};
