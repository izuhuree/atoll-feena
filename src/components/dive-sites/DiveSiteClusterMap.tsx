import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MAP_DIVE_SITES, KIND_META, DiveSiteKind } from '../../data/mapDiveSites';

/**
 * Builds a small coloured DivIcon for each dive-site kind. We render a real
 * <div> instead of an <img> so the marker stays crisp on retina, can be
 * themed with CSS variables, and never has to load a binary asset.
 *
 * Icons are memoised per-kind (see `iconCache` below) so we never recreate
 * twelve identical DivIcons on every render — Leaflet's L.DivIcon is heavy
 * enough to matter inside a cluster group of ~hundreds of sites later.
 */
const buildIcon = (kind: DiveSiteKind): L.DivIcon =>
  L.divIcon({
    className: 'atoll-marker',
    html: `<span style="
      display:block;
      width:14px;
      height:14px;
      border-radius:9999px;
      background:${KIND_META[kind].color};
    "></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10],
  });

const iconCache: Partial<Record<DiveSiteKind, L.DivIcon>> = {};
const getIcon = (kind: DiveSiteKind): L.DivIcon => {
  if (!iconCache[kind]) iconCache[kind] = buildIcon(kind);
  return iconCache[kind]!;
};

/**
 * Interactive Maldives dive-site map. Uses Leaflet via react-leaflet so that
 * lifecycle, cleanup and HMR are handled by React; clustering is delegated
 * to leaflet.markercluster (industry-standard plugin) through
 * react-leaflet-cluster.
 */
export function DiveSiteClusterMap() {
  // Memoise so the marker array isn't recreated on every parent render.
  const sites = useMemo(() => MAP_DIVE_SITES, []);

  return (
    <MapContainer
      center={[3.2, 73.2]}
      zoom={6}
      minZoom={5}
      maxZoom={12}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      // Worldwide tile copies look weird around the Maldives; keep things tidy.
      worldCopyJump={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        maxClusterRadius={50}
      >
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={getIcon(site.kind)}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-display font-bold text-maldives-deep text-sm">
                  {site.name}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  {site.atoll} Atoll · {KIND_META[site.kind].label}
                </p>
                <p className="text-[11px] text-slate-600">
                  <span className="font-semibold">Depth:</span> {site.depthMin}–
                  {site.depthMax} m
                </p>
                <p className="text-[11px] text-slate-600">
                  <span className="font-semibold">Best for:</span> {site.bestFor}
                </p>
                <p className="text-[11px] text-maldives-lagoon font-semibold">
                  Citizen science: {site.citizenScienceApp}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
