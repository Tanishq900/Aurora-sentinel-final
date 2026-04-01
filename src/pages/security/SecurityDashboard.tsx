import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Flame,
  HeartPulse,
  RefreshCw,
  Shield,
  Stethoscope,
  Thermometer,
  Wind,
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
  const lineColor = alive ? '#6bc7ff' : '#4d2c7f';
  const glowColor = alive ? 'rgba(107, 199, 255, 0.95)' : 'rgba(77, 44, 127, 0.72)';
  const backgroundColor = alive ? 'rgba(22, 34, 54, 0.88)' : 'rgba(34, 21, 43, 0.92)';
  const points = alive
    ? '0,44 18,44 24,44 28,28 34,44 48,44 54,18 62,70 74,44 98,44 106,44 110,36 118,44 136,44 146,14 156,72 170,44 188,44 194,30 202,44 220,44 232,44 238,22 246,44 258,44 264,32 272,44 300,44'
    : '0,44 300,44';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8" style={{ background: backgroundColor }}>
      <svg
        viewBox="0 0 300 88"
        className="h-24 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={alive ? 'Alive heartbeat line' : 'Dead heartbeat line'}
      >
        <defs>
          <filter id={`${lineId}-glow`} x="-40%" y="-100%" width="180%" height="300%">
            <feGaussianBlur stdDeviation="3.4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -8"
            />
          </filter>
          <linearGradient id={`${lineId}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.72" />
            <stop offset="50%" stopColor={alive ? '#d8f6ff' : '#7d4bb8'} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <polyline
          points={points}
          fill="none"
          stroke={glowColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${lineId}-glow)`}
          opacity={alive ? 0.95 : 0.78}
        >
          {alive ? (
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3.6s" repeatCount="indefinite" />
          ) : null}
        </polyline>

        <polyline
          points={points}
          fill="none"
          stroke={`url(#${lineId}-gradient)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={alive ? '210 70' : undefined}
        >
          {alive ? (
            <>
              <animate attributeName="stroke-dashoffset" values="0;-280" dur="5.2s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="2;2.5;2" dur="3.6s" repeatCount="indefinite" />
            </>
          ) : null}
        </polyline>
      </svg>
    </div>
  );
}

function BeaconStatusModal({
  beacons,
  now,
  open,
  onClose,
  onRefresh,
  isLoading,
}: {
  beacons: BeaconStatus[];
  now: number;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/78 backdrop-blur-md">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8">
        <div className="glass-panel w-full border border-border/60 bg-black/90 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Beacon Status</h2>
              <p className="text-sm text-muted-foreground">
                Smooth live heartbeat view. Blue means alive, deep purple means dead.
              </p>
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
                    className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_top,rgba(29,41,64,0.35),rgba(0,0,0,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
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
                      {beacon.location?.address || beacon.location?.building || beacon.id}
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
      if (idx === -1) {
        return [...prev, incoming];
      }

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

  const openBeaconStatus = async () => {
    setShowBeaconStatus(true);
    await loadBeacons();
  };

  const playNotification = () => {
    const base = (import.meta as any)?.env?.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const candidates = [
      `${prefix}security-alert.mp3`,
      `${prefix}security-alert.wav`,
      `${prefix}security-alert.ogg`,
      `${prefix}no-test.mp3`,
    ];

    const tryPlay = (index: number) => {
      if (index >= candidates.length) {
        const fallback = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURAJR6Tg8sBtJAU0h9Hz04IzBh5uwO/jmVEQCUek4PLAbSQFNIbR89OCMwYebsDv45lREAlHpODywG0kBTSG0fPTgjMGHm7A7+OZURAJR6Tg8sBtJAU0htHz04IzBh5uwO/jmVEQCUek4PLAbSQFNIbR89OCMwYebsDv45lREAlHpODywG0kBTQ='
        );
        fallback.volume = 0.5;
        fallback.play().catch(() => {});
        return;
      }

      const audio = new Audio(candidates[index]);
      audio.volume = 0.6;
      audio.play().catch(() => {
        tryPlay(index + 1);
      });
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
    if (!token) {
      return;
    }

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
    socket.on('sos_status_update', (event: SOSEvent) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === event.id
            ? ({
                ...alert,
                ...event,
                email: (event as any).email || (alert as any).email,
              } as any)
            : alert
        )
      );
    });

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

  const handleConfirmEmergency = () => {
    if (!confirmService) return;
    try {
      window.location.href = `tel:${confirmService.tel}`;
    } finally {
      setEmergencyConfirm(null);
    }
  };

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
            <Link
              to="/security/analytics"
              className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
            >
              Analytics
            </Link>
            <Link
              to="/security/history"
              className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
            >
              History
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
            >
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
            <button
              type="button"
              onClick={() => setEmergencyConfirm('fire')}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.fire.buttonClass}`}
            >
              {emergencyConfig.fire.icon}
              {emergencyConfig.fire.label}
            </button>
            <button
              type="button"
              onClick={() => setEmergencyConfirm('ambulance')}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.ambulance.buttonClass}`}
            >
              {emergencyConfig.ambulance.icon}
              {emergencyConfig.ambulance.label}
            </button>
            <button
              type="button"
              onClick={() => setEmergencyConfirm('police')}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold transition-colors ${emergencyConfig.police.buttonClass}`}
            >
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
              .map((alert) => ({
                id: alert.id,
                lat: alert.location!.lat!,
                lng: alert.location!.lng!,
                riskScore: alert.risk_score,
              }))}
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
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No active alerts</div>
            ) : (
              <div className="max-h-[720px] space-y-4 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={`/security/alert/${alert.id}`}
                    className="block rounded-lg border border-border/60 bg-black/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors hover:bg-black/55"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getRiskColor(alert.risk_score)}`}>
                            {alert.risk_score.toFixed(1)}
                          </span>
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
                          {Array.isArray((alert as any).attachments) && (alert as any).attachments.length > 0 ? (
                            <span className="rounded border border-aurora-cyan/30 bg-aurora-cyan/15 px-2 py-1 text-xs font-semibold text-aurora-cyan">
                              MEDIA
                            </span>
                          ) : null}
                          <span className="text-sm text-muted-foreground">{formatTriggerType(alert.trigger_type)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">User: {getAlertLabel(alert)}</p>
                      </div>
                      <div className="text-right">
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
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel border border-border/60 p-6">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/40 pb-3">
              <h2 className="text-xl font-semibold text-foreground">Beacons</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadBeacons}
                  className="rounded-lg border border-border/50 bg-secondary/60 px-4 py-2 text-foreground transition-colors hover:bg-secondary/80"
                >
                  Refresh
                </button>
                <button
                  onClick={openBeaconStatus}
                  className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sky-300 transition-colors hover:bg-sky-400/15"
                >
                  Status
                </button>
              </div>
            </div>

            {isBeaconLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading beacons...</div>
            ) : sortedBeacons.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No beacons found</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {sortedBeacons.map((beacon) => {
                  const alive = isBeaconAlive(beacon, now);

                  return (
                    <div
                      key={beacon.id}
                      className="rounded-2xl border border-border/60 bg-black/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-foreground">{beacon.name}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{beacon.node_role}</div>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                            alive
                              ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                              : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                          }`}
                        >
                          {alive ? 'Alive' : 'Dead'}
                        </div>
                      </div>

                      <HeartbeatWave alive={alive} lineId={`${beacon.id.toLowerCase()}-preview`} />

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            Mode
                          </div>
                          <div className="mt-1 text-foreground">{beacon.last_mode}</div>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HeartPulse className="h-4 w-4" />
                            Last Seen
                          </div>
                          <div className="mt-1 text-foreground">{formatLastSeen(beacon.last_heartbeat_at || beacon.last_seen_at)}</div>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Thermometer className="h-4 w-4" />
                            Temperature
                          </div>
                          <div className="mt-1 text-foreground">
                            {typeof beacon.last_temperature_c === 'number' ? `${beacon.last_temperature_c.toFixed(1)} C` : 'N/A'}
                          </div>
                        </div>
                        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Wind className="h-4 w-4" />
                            Smoke
                          </div>
                          <div className="mt-1 text-foreground">
                            {typeof beacon.last_smoke_level === 'number' ? beacon.last_smoke_level.toFixed(0) : 'N/A'}
                          </div>
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

      <BeaconStatusModal
        beacons={sortedBeacons}
        now={now}
        open={showBeaconStatus}
        onClose={() => setShowBeaconStatus(false)}
        onRefresh={loadBeacons}
        isLoading={isBeaconLoading}
      />

      {confirmService ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-[92%] max-w-md border border-border/60 p-6">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-border/40 pb-3">
              <div>
                <div className="text-lg font-semibold text-foreground">Confirm Call</div>
                <div className="text-sm text-muted-foreground">{confirmService.label}</div>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyConfirm(null)}
                className="rounded-lg border border-border/50 bg-secondary/60 px-3 py-2 text-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </div>

            <div className="text-sm text-muted-foreground">{confirmService.description}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Dial: <span className="font-semibold text-foreground">{confirmService.tel}</span>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmergencyConfirm(null)}
                className="rounded-lg border border-border/50 bg-secondary/60 px-5 py-2 text-foreground hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergency}
                className="rounded-lg border border-primary/30 bg-primary/80 px-5 py-2 text-primary-foreground hover:bg-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
