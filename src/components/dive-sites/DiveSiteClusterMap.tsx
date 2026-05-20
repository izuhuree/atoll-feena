import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { DiveSite } from '../../types';
import { DiveSiteKind, getDiveSiteKind, KIND_META } from '../../lib/siteKindMeta';

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
 * Interactive Maldives dive-site map. Parent screens pass in the already
 * filtered site list, so the map and directory always describe the same set.
 */
export function DiveSiteClusterMap({ sites: visibleSites }: { sites: DiveSite[] }) {
  const sitesWithCoordinates = useMemo(
    () => visibleSites.filter((site): site is DiveSite & { coordinates: { lat: number; lng: number } } =>
      typeof site.coordinates?.lat === 'number' && typeof site.coordinates?.lng === 'number'
    ),
    [visibleSites]
  );

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
      <FitToSites sites={sitesWithCoordinates} />
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
        {sitesWithCoordinates.map((site) => (
          <Marker
            key={site.id}
            position={[site.coordinates.lat, site.coordinates.lng]}
            icon={getIcon(getDiveSiteKind(site.type))}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-display font-bold text-maldives-deep text-sm">
                  {site.name}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  {site.atoll} Atoll · {KIND_META[getDiveSiteKind(site.type)].label}
                </p>
                {site.depthMin !== undefined && site.depthMax !== undefined && (
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold">Depth:</span> {site.depthMin}-
                    {site.depthMax} m
                  </p>
                )}
                <p className="text-[11px] text-slate-600">
                  <span className="font-semibold">Look for:</span>{' '}
                  {site.marineLifeHighlights.slice(0, 3).join(', ') || 'Site conditions'}
                </p>
                <p className="text-[11px] text-maldives-lagoon font-semibold">
                  Citizen science: safety and reef observations
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

function FitToSites({
  sites,
}: {
  sites: Array<DiveSite & { coordinates: { lat: number; lng: number } }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (sites.length === 0) {
      map.setView([3.2, 73.2], 6);
      return;
    }

    const bounds = L.latLngBounds(sites.map((site) => [site.coordinates.lat, site.coordinates.lng]));
    if (sites.length === 1) {
      map.setView(bounds.getCenter(), 10);
      return;
    }

    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10 });
  }, [map, sites]);

  return null;
}
