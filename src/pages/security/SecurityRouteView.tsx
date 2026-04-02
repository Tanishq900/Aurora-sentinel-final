import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowLeft, ExternalLink, LocateFixed, Route, ShieldAlert } from 'lucide-react';
import { sosService, SOSEvent } from '../../services/sos.service';

type RouteGeometry = GeoJSON.Feature<GeoJSON.LineString>;
const LAST_RESPONDER_LOCATION_KEY = 'aurora:lastResponderLocation';

type RouteLocationState = {
  alert?: SOSEvent;
} | null;

function getAlertLabel(alert: SOSEvent) {
  if ((alert as any).source === 'beacon' || (alert as any).beacon_name || (alert as any).beacon_id) {
    return (alert as any).beacon_name || 'Beacon';
  }

  return (alert as any).name || (alert as any).email || alert.user_id;
}

function formatDistance(meters: number | null) {
  if (!meters || !Number.isFinite(meters)) return 'Route unavailable';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return 'Estimating...';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

function getArrowBearing(geometry: RouteGeometry | null): number {
  const coordinates = geometry?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) return 0;

  const [startLng, startLat] = coordinates[0];
  const [nextLng, nextLat] = coordinates[1];
  const angleRadians = Math.atan2(nextLat - startLat, nextLng - startLng);
  return (angleRadians * 180) / Math.PI + 90;
}

export default function SecurityRouteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as RouteLocationState;

  const [alert, setAlert] = useState<SOSEvent | null>(routeState?.alert ?? null);
  const [isLoadingAlert, setIsLoadingAlert] = useState(!routeState?.alert);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const destination = useMemo(() => {
    const lat = alert?.location?.lat;
    const lng = alert?.location?.lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
    return null;
  }, [alert]);

  useEffect(() => {
    if (alert || !id) return;

    const loadAlert = async () => {
      try {
        const event = await sosService.getSOSById(id);
        setAlert(event);
      } catch (error) {
        console.error('Failed to load SOS route alert:', error);
      } finally {
        setIsLoadingAlert(false);
      }
    };

    loadAlert();
  }, [alert, id]);

  useEffect(() => {
    const cachedLocation = window.sessionStorage.getItem(LAST_RESPONDER_LOCATION_KEY);
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          setOrigin({ lat: parsed.lat, lng: parsed.lng });
        }
      } catch {
        // Ignore malformed cache
      }
    }

    if (!('geolocation' in navigator)) {
      setRouteError('Live location is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextOrigin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOrigin(nextOrigin);
        window.sessionStorage.setItem(LAST_RESPONDER_LOCATION_KEY, JSON.stringify(nextOrigin));
      },
      () => {
        setRouteError('Unable to access your current location for routing.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 12000,
      }
    );
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = ((import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined);
    if (!token) {
      setRouteError('Mapbox is not configured. Set VITE_MAPBOX_TOKEN.');
      return;
    }

    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: destination ? [destination.lng, destination.lat] : [77.5946, 12.9716],
      zoom: destination ? 14 : 11,
      pitch: 58,
      bearing: -22,
      antialias: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [destination]);

  useEffect(() => {
    if (!origin || !destination) return;

    const token = ((import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined);
    if (!token) return;

    const controller = new AbortController();

    const loadRoute = async () => {
      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?alternatives=false&continue_straight=true&geometries=geojson&overview=full&steps=true&access_token=${token}`;

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Directions failed (${response.status})`);
        }

        const payload = await response.json();
        const route = payload?.routes?.[0];
        if (!route?.geometry?.coordinates?.length) {
          throw new Error('No route found');
        }

        setRouteGeometry({
          type: 'Feature',
          geometry: route.geometry,
          properties: {},
        });
        setDistanceMeters(route.distance ?? null);
        setDurationSeconds(route.duration ?? null);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        console.error('Failed to load route:', error);
        setRouteGeometry({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [origin.lng, origin.lat],
              [destination.lng, destination.lat],
            ],
          },
          properties: {},
        });
        setDistanceMeters(null);
        setDurationSeconds(null);
        setRouteError('Showing direct line fallback because live routing could not be loaded.');
      } finally {
        setIsLoadingRoute(false);
      }
    };

    loadRoute();
    return () => controller.abort();
  }, [destination, origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !routeGeometry || !origin || !destination) return;

    const sourceId = 'aurora-route';
    const haloLayerId = 'aurora-route-halo';
    const lineLayerId = 'aurora-route-line';
    const arrowBearing = getArrowBearing(routeGeometry);

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(routeGeometry);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: routeGeometry,
      });
    }

    if (!map.getLayer(haloLayerId)) {
      map.addLayer({
        id: haloLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#80e3ff',
          'line-width': 14,
          'line-opacity': 0.34,
          'line-blur': 2.4,
        },
      });
    }

    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#e8fbff',
          'line-width': 7,
          'line-opacity': 0.98,
        },
      });
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const makeArrowMarker = (bearing: number) => {
      const el = document.createElement('div');
      el.className = 'relative h-14 w-14';
      el.innerHTML = `
        <div style="position:absolute;inset:0;border-radius:9999px;background:radial-gradient(circle, rgba(125,227,255,0.35), rgba(14,165,233,0.05));filter:blur(1px);"></div>
        <div style="position:absolute;left:50%;top:50%;width:0;height:0;transform:translate(-50%,-50%) rotate(${bearing}deg);">
          <div style="width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:26px solid #e6fbff;filter:drop-shadow(0 0 12px rgba(136,221,255,0.85));"></div>
          <div style="position:absolute;left:-4px;top:18px;width:8px;height:8px;border-radius:9999px;background:#0ea5e9;"></div>
        </div>
      `;
      return el;
    };

    const makeSosMarker = () => {
      const el = document.createElement('div');
      el.className = 'relative flex h-14 w-14 items-center justify-center';
      el.innerHTML = `
        <div style="position:absolute;inset:6px;border-radius:9999px;background:rgba(239,68,68,0.18);box-shadow:0 0 0 10px rgba(239,68,68,0.08), 0 0 26px rgba(251,113,133,0.45);"></div>
        <div style="position:absolute;inset:13px;border-radius:9999px;background:linear-gradient(135deg,#ef4444,#fb7185);border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;">SOS</div>
      `;
      return el;
    };

    markersRef.current.push(
      new mapboxgl.Marker({ element: makeArrowMarker(arrowBearing), rotationAlignment: 'map' })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map)
    );

    markersRef.current.push(
      new mapboxgl.Marker({ element: makeSosMarker() })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map)
    );

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([origin.lng, origin.lat]);
    bounds.extend([destination.lng, destination.lat]);
    map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1200 });
  }, [destination, origin, routeGeometry]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onLoad = () => {
      if (!routeGeometry || !origin || !destination) return;
      map.resize();
    };

    map.on('load', onLoad);
    return () => {
      map.off('load', onLoad);
    };
  }, [destination, origin, routeGeometry]);

  if (isLoadingAlert) {
    return (
      <div className="relative min-h-screen bg-black p-6">
        <div className="aurora-bg" />
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="glass-panel px-6 py-5 text-muted-foreground">Loading route view...</div>
        </div>
      </div>
    );
  }

  if (!alert || !destination) {
    return (
      <div className="relative min-h-screen bg-black p-6">
        <div className="aurora-bg" />
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="glass-panel space-y-4 px-8 py-6 text-center">
            <div className="text-xl font-semibold text-foreground">Route unavailable</div>
            <div className="text-sm text-muted-foreground">This alert does not include usable location coordinates.</div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openGoogleMapsHref = origin
    ? `https://www.google.com/maps/dir/${origin.lat},${origin.lng}/${destination.lat},${destination.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="aurora-bg" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="glass-panel mb-6 flex flex-wrap items-center justify-between gap-4 border border-border/60 px-6 py-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-sky-300">Rapid Locate</div>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">Responder Route Guidance</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/security/alert/${alert.id}`}
              state={{ alert }}
              className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Alert
            </Link>
            <a
              href={openGoogleMapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/12 px-4 py-2 text-sky-200 transition-colors hover:bg-sky-400/18"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="glass-panel border border-border/60 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Route className="h-5 w-5 text-sky-300" />
              <div className="text-lg font-semibold text-foreground">Route Snapshot</div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Alert Source</div>
                <div className="mt-2 text-lg font-semibold text-foreground">{getAlertLabel(alert)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {alert.location?.address || `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Responder Status</div>
                <div className="mt-2 flex items-center gap-2 text-foreground">
                  <LocateFixed className="h-4 w-4 text-sky-300" />
                  {origin ? 'Live location locked' : 'Locating responder...'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {origin ? `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}` : 'Allow browser location for turn guidance.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/50 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Distance</div>
                  <div className="mt-2 text-xl font-semibold text-foreground">{formatDistance(distanceMeters)}</div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ETA</div>
                  <div className="mt-2 text-xl font-semibold text-foreground">{formatDuration(durationSeconds)}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/6 p-4 text-sm text-sky-100">
                {routeError ? routeError : isLoadingRoute ? 'Calculating the fastest available road path...' : 'Using the quickest currently available road path to the SOS location.'}
              </div>

              <div className="rounded-2xl border border-border/50 bg-black/30 p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 text-foreground">
                  <ShieldAlert className="h-4 w-4 text-danger" />
                  Incident
                </div>
                <div>Risk Score: {alert.risk_score.toFixed(1)}</div>
                <div>Triggered: {new Date(alert.created_at).toLocaleString()}</div>
                <div>Status: {alert.status.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden border border-border/60 p-3">
            <div className="h-[76vh] overflow-hidden rounded-3xl border border-border/40">
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
