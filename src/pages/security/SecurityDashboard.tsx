import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  HeartPulse,
  RefreshCw,
  Shield,
  Stethoscope,
  X,
} from 'lucide-react';
import AuroraMap from '../../components/AuroraMap';
import { beaconService, BeaconStatus } from '../../services/beacon.service';
import { sosService, SOSEvent } from '../../services/sos.service';
import { useAuthStore } from '../../state/auth.store';
import { connectSocket } from '../../ws/client';

const HEARTBEAT_TIMEOUT_MS = 60000;
const ROLE_ORDER: Record<BeaconStatus['node_role'], number> = {
  main: 0,
  relay: 1,
  backup: 2,
  gateway: 3,
};

function isBeaconAlive(beacon: BeaconStatus, now: number): boolean {
  const referenceTime = beacon.last_heartbeat_at || beacon.last_seen_at;
  if (!referenceTime) return false;
  return now - new Date(referenceTime).getTime() <= HEARTBEAT_TIMEOUT_MS;
}

function formatLastSeen(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleTimeString();
}

function HeartbeatWave({ alive, lineId }: { alive: boolean; lineId: string }) {
  const lineColor = alive ? '#88ddff' : '#4f2d82';
  const coreColor = alive ? '#dff8ff' : '#7a4bb2';
  const points = alive
    ? '0,44 26,44 34,44 40,24 48,52 62,44 88,44 96,44 104,38 112,44 136,44 148,12 160,74 172,44 196,44 202,28 210,44 238,44 246,44 252,18 262,44 276,44 284,34 292,44 320,44'
    : '0,44 42,44 58,43 72,45 96,44 120,44 138,43 152,45 180,44 204,44 222,43 236,45 264,44 288,44 304,43 320,44';
  const pathD = alive
    ? 'M0,44 L26,44 L34,44 L40,24 L48,52 L62,44 L88,44 L96,44 L104,38 L112,44 L136,44 L148,12 L160,74 L172,44 L196,44 L202,28 L210,44 L238,44 L246,44 L252,18 L262,44 L276,44 L284,34 L292,44 L320,44'
    : 'M0,44 L42,44 L58,43 L72,45 L96,44 L120,44 L138,43 L152,45 L180,44 L204,44 L222,43 L236,45 L264,44 L288,44 L304,43 L320,44';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        alive ? 'border-sky-300/15 bg-[#071524]' : 'border-violet-500/10 bg-[#130d1f]'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 blur-2xl ${
          alive ? 'bg-sky-300/25' : 'bg-violet-500/10'
        }`}
        style={{ animation: `aurora-heartbeat-sweep ${alive ? '3.8s' : '6s'} linear infinite` }}
      />
      <svg viewBox="0 0 320 88" className="h-24 w-full" preserveAspectRatio="none" role="img">
        <defs>
          <filter id={`${lineId}-glow`} x="-40%" y="-160%" width="220%" height="420%">
            <feGaussianBlur stdDeviation={alive ? '4.4' : '2.2'} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -9"
            />
          </filter>
          <linearGradient id={`${lineId}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.55" />
            <stop offset="48%" stopColor={coreColor} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <polyline
          points={points}
          fill="none"
          stroke={alive ? 'rgba(136, 221, 255, 0.95)' : 'rgba(79, 45, 130, 0.9)'}
          strokeWidth={alive ? '4.2' : '3'}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${lineId}-glow)`}
          opacity={alive ? 0.95 : 0.82}
        >
          <animate attributeName="opacity" values={alive ? '0.72;1;0.72' : '0.68;0.82;0.68'} dur={alive ? '2.6s' : '5.4s'} repeatCount="indefinite" />
        </polyline>

        <polyline
          points={points}
          fill="none"
          stroke={`url(#${lineId}-gradient)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {alive ? (
          <circle r="4.4" fill="#dff8ff" filter={`url(#${lineId}-glow)`}>
            <animateMotion dur="3.8s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${lineId}-path`} />
            </animateMotion>
          </circle>
        ) : (
          <circle r="2.3" fill="#8d63c7" opacity="0.9">
            <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${lineId}-path`} />
            </animateMotion>
          </circle>
        )}

        <path id={`${lineId}-path`} d={pathD} fill="none" stroke="transparent" />
      </svg>
      <style>{`
        @keyframes aurora-heartbeat-sweep {
          0% { transform: translateX(0); opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translateX(520%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function AlertList({
  title,
  alerts,
  emptyText,
  getAlertLabel,
  getRiskColor,
  getRiskBadge,
  formatTriggerType,
}: {
  title: string;
  alerts: SOSEvent[];
  emptyText: string;
  getAlertLabel: (alert: SOSEvent) => string;
  getRiskColor: (risk: number) => string;
  getRiskBadge: (risk: number) => string;
  formatTriggerType: (triggerType: SOSEvent['trigger_type']) => string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-black/25 p-4">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      {alerts.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              to={`/security/alert/${alert.id}`}
              className="block rounded-lg border border-border/60 bg-black/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors hover:bg-black/55"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getRiskColor(alert.risk_score)}`}>{alert.risk_score.toFixed(1)}</span>
                    <span
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        alert.risk_score >= 50
                          ? 'bg-danger/20 text-danger'
                          : alert.risk_score >= 25
                            ? 'bg-warning/20 text-warning'
                            : 'bg-safe/20 text-safe'
                      }`}
                    >
                      {getRiskBadge(alert.risk_score)}
                    </span>
                    <span className="text-sm text-muted-foreground">{formatTriggerType(alert.trigger_type)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">User: {getAlertLabel(alert)}</p>
                </div>
                <span
                  className={`rounded px-3 py-1 text-xs font-semibold ${
                    alert.status === 'resolved'
                      ? 'bg-safe/20 text-safe'
                      : alert.status === 'acknowledged'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-danger/20 text-danger'
                  }`}
                >
                  {alert.status.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BeaconStatusModal({
  beacons,
  now,
  open,
  onClose,
  onRefresh,
  onManualCheck,
  isLoading,
  checkingBeaconId,
}: {
  beacons: BeaconStatus[];
  now: number;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onManualCheck: (beaconId: string) => void;
  isLoading: boolean;
  checkingBeaconId: string | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8">
        <div className="glass-panel w-full border border-border/60 bg-black/90 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Beacon Status Monitor</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/70"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/70"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading beacon status...</div>
          ) : beacons.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No beacons found</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {beacons.map((beacon) => {
                const alive = isBeaconAlive(beacon, now);

                return (
                  <div
                    key={beacon.id}
                    className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top,rgba(22,42,63,0.3),rgba(0,0,0,0.78))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-semibold text-foreground">{beacon.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                          {beacon.node_role}
                        </div>
                      </div>
                      <div
                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                          alive
                            ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                            : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                        }`}
                      >
                        {alive ? 'Alive' : 'Dead'}
                      </div>
                    </div>

                    <HeartbeatWave alive={alive} lineId={beacon.id.toLowerCase()} />

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-white/6 bg-secondary/15 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last seen</div>
                        <div className="mt-2 text-foreground">{formatLastSeen(beacon.last_heartbeat_at || beacon.last_seen_at)}</div>
                      </div>
                      <div className="rounded-xl border border-white/6 bg-secondary/15 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mode</div>
                        <div className="mt-2 text-foreground">{beacon.last_mode}</div>
                      </div>
                      <div className="rounded-xl border border-white/6 bg-secondary/15 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Temperature</div>
                        <div className="mt-2 text-foreground">
                          {typeof beacon.last_temperature_c === 'number' ? `${beacon.last_temperature_c.toFixed(1)} C` : 'N/A'}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/6 bg-secondary/15 p-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Smoke</div>
                        <div className="mt-2 text-foreground">
                          {typeof beacon.last_smoke_level === 'number' ? beacon.last_smoke_level.toFixed(0) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <span>{beacon.location?.address || beacon.location?.building || beacon.id}</span>
                        <button
                          type="button"
                          onClick={() => onManualCheck(beacon.id)}
                          disabled={checkingBeaconId === beacon.id}
                          className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs text-sky-300 transition-colors hover:bg-sky-400/15"
                        >
                          <HeartPulse className={`h-4 w-4 ${checkingBeaconId === beacon.id ? 'animate-pulse' : ''}`} />
                          {checkingBeaconId === beacon.id ? 'Checking...' : 'Manual Check'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SecurityDashboard() {
  const { user, logout } = useAuthStore();
  const [alerts, setAlerts] = useState<SOSEvent[]>([]);
  const [beacons, setBeacons] = useState<BeaconStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBeaconLoading, setIsBeaconLoading] = useState(true);
  const [showBeaconStatus, setShowBeaconStatus] = useState(false);
  const [checkingBeaconId, setCheckingBeaconId] = useState<string | null>(null);
  const [emergencyConfirm, setEmergencyConfirm] = useState<null | 'fire' | 'ambulance' | 'police'>(null);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  const sortedBeacons = useMemo(
    () =>
      [...beacons].sort((left, right) => {
        const orderDelta = ROLE_ORDER[left.node_role] - ROLE_ORDER[right.node_role];
        if (orderDelta !== 0) return orderDelta;
        return left.name.localeCompare(right.name);
      }),
    [beacons]
  );

  const sosAlerts = useMemo(() => alerts.filter((alert) => alert.trigger_type !== 'beacon'), [alerts]);
  const beaconAlerts = useMemo(() => alerts.filter((alert) => alert.trigger_type === 'beacon'), [alerts]);

  const getAlertLabel = (alert: SOSEvent) => {
    if ((alert as any).source === 'beacon' || (alert as any).beacon_name || (alert as any).beacon_id) {
      return (alert as any).beacon_name || 'Beacon';
    }

    return (alert as any).name || (alert as any).email || alert.user_id || 'Unknown sender';
  };

  const formatTriggerType = (triggerType: SOSEvent['trigger_type']) => {
    if (triggerType === 'ai') return 'AI';
    if (triggerType === 'beacon') return 'Beacon';
    return 'Manual';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 50) return 'text-danger';
    if (risk >= 25) return 'text-warning';
    return 'text-safe';
  };

  const getRiskBadge = (risk: number) => {
    if (risk >= 50) return 'HIGH';
    if (risk >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const upsertBeacon = (incoming: BeaconStatus) => {
    setBeacons((prev) => {
      const idx = prev.findIndex((beacon) => beacon.id === incoming.id);
      if (idx === -1) return [...prev, incoming];

      const next = prev.slice();
      next[idx] = { ...prev[idx], ...incoming };
      return next;
    });
  };

  const loadAlerts = async () => {
    try {
      const events = await sosService.getSOSEvents({ status: 'new', limit: 50 });
      setAlerts(events);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBeacons = async () => {
    setIsBeaconLoading(true);
    try {
      const statuses = await beaconService.getBeaconStatuses();
      setBeacons(statuses);
    } catch (error) {
      console.error('Failed to load beacons:', error);
    } finally {
      setIsBeaconLoading(false);
    }
  };

  const manualCheckBeaconById = async (_beaconId: string) => {
    setCheckingBeaconId(_beaconId);
    try {
      const requestSnapshot = await beaconService.requestManualCheck(_beaconId);
      upsertBeacon(requestSnapshot);
      const requestedAt = requestSnapshot.manual_check_requested_at || new Date().toISOString();
      const deadline = Date.now() + 15000;

      while (Date.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        const statuses = await beaconService.getBeaconStatuses();
        setBeacons(statuses);

        const refreshed = statuses.find((beacon) => beacon.id === _beaconId);
        if (
          refreshed &&
          refreshed.last_heartbeat_at &&
          new Date(refreshed.last_heartbeat_at).getTime() >= new Date(requestedAt).getTime() &&
          refreshed.is_online
        ) {
          break;
        }
      }
    } catch (error) {
      console.error('Failed manual beacon check:', error);
    } finally {
      setCheckingBeaconId(null);
    }
  };

  const playNotification = () => {
    const base = (import.meta as any)?.env?.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const candidates = [`${prefix}security-alert.mp3`, `${prefix}security-alert.wav`, `${prefix}security-alert.ogg`, `${prefix}no-test.mp3`];

    const tryPlay = (index: number) => {
      if (index >= candidates.length) {
        return;
      }

      const audio = new Audio(candidates[index]);
      audio.volume = 0.6;
      audio.play().catch(() => tryPlay(index + 1));
      audio.onerror = () => tryPlay(index + 1);
    };

    tryPlay(0);
  };

  useEffect(() => {
    if (user?.role !== 'security') {
      navigate('/dashboard');
      return;
    }

    loadAlerts();
    loadBeacons();

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = connectSocket(token);

    const upsertAlert = (event: SOSEvent) => {
      setAlerts((prev) => {
        const idx = prev.findIndex((a) => a.id === event.id);
        if (idx === -1) {
          return [event, ...prev];
        }

        const merged = {
          ...prev[idx],
          ...event,
          email: (event as any).email || (prev[idx] as any).email,
          attachment_urls: (event as any)?.attachment_urls ?? (prev[idx] as any)?.attachment_urls,
        } as any;

        const next = prev.slice();
        next.splice(idx, 1);
        return [merged, ...next];
      });
    };

    socket.on('new_sos_alert', (event: SOSEvent) => {
      upsertAlert(event);
      playNotification();
    });

    socket.on('sos:created', upsertAlert);
    socket.on('sos-updated', upsertAlert);
    socket.on('beacon:heartbeat', (status: BeaconStatus) => upsertBeacon(status));
    socket.on('beacon:status', (status: BeaconStatus) => upsertBeacon(status));

    return () => {
      socket.off('new_sos_alert');
      socket.off('sos:created');
      socket.off('sos-updated');
      socket.off('beacon:heartbeat');
      socket.off('beacon:status');
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const emergencyConfig = {
    fire: {
      label: 'Fire Brigade',
      description: 'Call Fire Brigade for fire-related emergencies.',
      tel: '101',
      buttonClass:
        'bg-danger hover:bg-red-600 text-white border border-danger/50 shadow-[0_14px_40px_rgba(0,0,0,0.55),0_0_40px_rgba(239,68,68,0.25)]',
      icon: <Flame className="h-4 w-4" />,
    },
    ambulance: {
      label: 'Ambulance',
      description: 'Call Ambulance for medical emergencies.',
      tel: '108',
      buttonClass:
        'bg-white/90 hover:bg-white text-black border border-white/60 shadow-[0_14px_40px_rgba(0,0,0,0.55)]',
      icon: <Stethoscope className="h-4 w-4" />,
    },
    police: {
      label: 'Police',
      description: 'Call Police for immediate security response.',
      tel: '100',
      buttonClass:
        'bg-aurora-blue/85 hover:bg-aurora-blue text-white border border-aurora-blue/40 shadow-[0_14px_40px_rgba(0,0,0,0.55),0_0_40px_rgba(59,130,246,0.2)]',
      icon: <Shield className="h-4 w-4" />,
    },
  } as const;

  const confirmService = emergencyConfirm ? emergencyConfig[emergencyConfirm] : null;

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="aurora-bg" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between border-b border-border/50 px-6 py-4 glass-panel">
          <div>
            <h1 className="text-2xl font-bold aurora-text">Security Command Center</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name || user?.email}</p>
          </div>
          <div className="flex gap-4">
            <Link to="/security/analytics" className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80">
              Analytics
            </Link>
            <Link to="/security/history" className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80">
              History
            </Link>
            <button onClick={logout} className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 border border-border/60 p-5 glass-panel">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/40 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Emergency Services</h2>
              <p className="text-sm text-muted-foreground">Quick-call external responders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button type="button" onClick={() => setEmergencyConfirm('fire')} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.fire.buttonClass}`}>
              {emergencyConfig.fire.icon}
              {emergencyConfig.fire.label}
            </button>
            <button type="button" onClick={() => setEmergencyConfirm('ambulance')} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.ambulance.buttonClass}`}>
              {emergencyConfig.ambulance.icon}
              {emergencyConfig.ambulance.label}
            </button>
            <button type="button" onClick={() => setEmergencyConfirm('police')} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.police.buttonClass}`}>
              {emergencyConfig.police.icon}
              {emergencyConfig.police.label}
            </button>
          </div>
        </div>

        <div className="map-container mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Live Map & SOS Locations</h2>
          <AuroraMap
            sosMarkers={alerts
              .filter((alert) => typeof alert.location?.lat === 'number' && typeof alert.location?.lng === 'number')
              .map((alert) => ({ id: alert.id, lat: alert.location!.lat!, lng: alert.location!.lng!, riskScore: alert.risk_score }))}
            height="400px"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="glass-panel border border-border/60 p-6">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/40 pb-3">
              <h2 className="text-xl font-semibold text-foreground">Live Alerts</h2>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading alerts...</div>
            ) : (
              <div className="max-h-[720px] space-y-4 overflow-y-auto pr-1">
                <AlertList
                  title="SOS Alerts"
                  alerts={sosAlerts}
                  emptyText="No active SOS alerts"
                  getAlertLabel={getAlertLabel}
                  getRiskColor={getRiskColor}
                  getRiskBadge={getRiskBadge}
                  formatTriggerType={formatTriggerType}
                />
              </div>
            )}
          </div>

          <div className="glass-panel border border-border/60 p-6">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/40 pb-3">
              <h2 className="text-xl font-semibold text-foreground">Beacons</h2>
              <div className="flex items-center gap-3">
                <button onClick={loadBeacons} className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80">
                  Refresh
                </button>
                <button onClick={() => setShowBeaconStatus(true)} className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sky-300 transition-colors hover:bg-sky-400/15">
                  Status
                </button>
              </div>
            </div>

            {isBeaconLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading beacons...</div>
            ) : beaconAlerts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No active beacon alerts</div>
            ) : (
              <div className="space-y-3">
                {beaconAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={`/security/alert/${alert.id}`}
                    className="block rounded-lg border border-border/60 bg-black/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors hover:bg-black/55"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getRiskColor(alert.risk_score)}`}>{alert.risk_score.toFixed(1)}</span>
                          <span
                            className={`rounded px-3 py-1 text-xs font-semibold ${
                              alert.risk_score >= 50
                                ? 'bg-danger/20 text-danger'
                                : alert.risk_score >= 25
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-safe/20 text-safe'
                            }`}
                          >
                            {getRiskBadge(alert.risk_score)}
                          </span>
                          <span className="text-sm text-muted-foreground">Beacon</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">User: {getAlertLabel(alert)}</p>
                      </div>
                      <span className="rounded bg-danger/20 px-3 py-1 text-xs font-semibold text-danger">
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BeaconStatusModal
        beacons={sortedBeacons}
        now={now}
        open={showBeaconStatus}
        onClose={() => setShowBeaconStatus(false)}
        onRefresh={loadBeacons}
        onManualCheck={manualCheckBeaconById}
        isLoading={isBeaconLoading}
        checkingBeaconId={checkingBeaconId}
      />

      {confirmService ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-[92%] max-w-md border border-border/60 p-6">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-border/40 pb-3">
              <div>
                <div className="text-lg font-semibold text-foreground">Confirm Call</div>
                <div className="text-sm text-muted-foreground">{confirmService.label}</div>
              </div>
              <button type="button" onClick={() => setEmergencyConfirm(null)} className="rounded-lg border border-border/50 bg-secondary/60 px-3 py-2 text-foreground hover:bg-secondary/80">
                Close
              </button>
            </div>

            <div className="text-sm text-muted-foreground">{confirmService.description}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Dial: <span className="font-semibold text-foreground">{confirmService.tel}</span>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEmergencyConfirm(null)} className="rounded-lg border border-border/50 bg-secondary/60 px-5 py-2 text-foreground hover:bg-secondary/80">
                Cancel
              </button>
              <button type="button" onClick={() => { if (confirmService) { window.location.href = `tel:${confirmService.tel}`; setEmergencyConfirm(null); } }} className="rounded-lg border border-primary/30 bg-primary/80 px-5 py-2 text-primary-foreground hover:bg-primary">
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
