import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { DiveSite } from '../../types';

interface SiteLocatorMapProps {
  site: DiveSite;
}

// Approximate atoll centroids — used when a custom site has no coordinates
// so the marker still lands somewhere sensible on the country map.
const ATOLL_CENTROIDS: Record<string, [number, number]> = {
  'North Malé': [4.2, 73.55],
  'South Malé': [3.95, 73.45],
  'North Ari': [4.0, 72.9],
  'South Ari': [3.5, 72.85],
  Baa: [5.2, 73.1],
  Lhaviyani: [5.55, 73.48],
  Vaavu: [3.4, 73.5],
  Meemu: [3.0, 73.5],
  Faafu: [3.25, 72.95],
  Dhaalu: [2.85, 72.95],
  Laamu: [1.85, 73.35],
  'Haa Alifu': [6.95, 72.95],
  'Haa Dhaalu': [6.65, 73.05],
  Raa: [5.6, 72.9],
  Noonu: [5.85, 73.3],
  Shaviyani: [6.3, 72.95],
  Thaa: [2.4, 73.05],
  Kaafu: [4.1, 73.5],
  'Gaafu Alifu': [0.5, 73.3],
  'Gaafu Dhaalu': [0.25, 73.25],
  Fuvahmulah: [-0.3, 73.4],
  Addu: [-0.65, 73.15],
};

const pinIcon = L.divIcon({
  className: 'atoll-marker',
  html: `<span style="
    display:block;
    width:14px;
    height:14px;
    border-radius:9999px;
    background:#ea580c;
    box-shadow:0 0 0 4px rgba(234,88,12,0.18);
  "></span>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * Small per-site Maldives locator map. Used inside the expanded dive-site card
 * to show "where in the country" the site is. We deliberately keep the controls
 * minimal (no zoom buttons, no scroll wheel) because this is a glance-info
 * widget, not the full clustered explorer.
 */
export function SiteLocatorMap({ site }: SiteLocatorMapProps) {
  const fallback = ATOLL_CENTROIDS[site.atoll] ?? [3.2, 73.2];
  const position: [number, number] = site.coordinates
    ? [site.coordinates.lat, site.coordinates.lng]
    : fallback;

  return (
    <MapContainer
      center={[3.2, 73.2]}
      zoom={6}
      minZoom={5}
      maxZoom={9}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging
      zoomControl={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Soft halo around the pin so the eye finds it before the basemap */}
      <CircleMarker
        center={position}
        radius={18}
        pathOptions={{
          color: '#ea580c',
          fillColor: '#ea580c',
          fillOpacity: 0.12,
          weight: 0,
        }}
      />
      <Marker position={position} icon={pinIcon}>
        <Tooltip direction="top" offset={[0, -10]} permanent>
          <span className="text-[10px] font-semibold text-maldives-deep">
            {site.name}
          </span>
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
