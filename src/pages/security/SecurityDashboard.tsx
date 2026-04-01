import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../state/auth.store';
import { sosService, SOSEvent } from '../../services/sos.service';
import { beaconService, BeaconStatus } from '../../services/beacon.service';
import { connectSocket } from '../../ws/client';
import AuroraMap from '../../components/AuroraMap';
import { Activity, Flame, HeartPulse, Shield, Stethoscope, Thermometer, Wind } from 'lucide-react';

export default function SecurityDashboard() {
  const HEARTBEAT_TIMEOUT_MS = 60000;
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
  const { user, logout } = useAuthStore();
  const [alerts, setAlerts] = useState<SOSEvent[]>([]);
  const [beacons, setBeacons] = useState<BeaconStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBeaconLoading, setIsBeaconLoading] = useState(true);
  const [emergencyConfirm, setEmergencyConfirm] = useState<null | 'fire' | 'ambulance' | 'police'>(null);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'security') {
      navigate('/dashboard');
      return;
    }

    loadAlerts();
    loadBeacons();

    // Connect WebSocket
    const token = localStorage.getItem('accessToken');
    if (token) {
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

      // Listen for new SOS alerts
      socket.on('new_sos_alert', (event: SOSEvent) => {
        upsertAlert(event);
        // Play notification sound
        playNotification();
      });

      socket.on('sos:created', (event: SOSEvent) => {
        upsertAlert(event);
      });

      socket.on('sos-updated', (event: SOSEvent) => {
        upsertAlert(event);
      });

      socket.on('beacon:heartbeat', (status: BeaconStatus) => {
        upsertBeacon(status);
      });

      socket.on('beacon:status', (status: BeaconStatus) => {
        upsertBeacon(status);
      });

      // Listen for status updates
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
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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
    try {
      const statuses = await beaconService.getBeaconStatuses();
      setBeacons(statuses);
    } catch (error) {
      console.error('Failed to load beacons:', error);
    } finally {
      setIsBeaconLoading(false);
    }
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
        // Autoplay blocked or failed; try next or fallback
        tryPlay(index + 1);
      });
      audio.onerror = () => tryPlay(index + 1);
    };

    tryPlay(0);
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

  const isBeaconAlive = (beacon: BeaconStatus) => {
    const referenceTime = beacon.last_heartbeat_at || beacon.last_seen_at;
    if (!referenceTime) return false;
    return now - new Date(referenceTime).getTime() <= HEARTBEAT_TIMEOUT_MS;
  };

  const formatLastSeen = (value: string | null) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleTimeString();
  };

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
    <div className="min-h-screen bg-black p-6 relative">
      <div className="aurora-bg" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-panel border-b border-border/50 px-6 py-4 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold aurora-text">Security Command Center</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name || user?.email}</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/security/analytics"
              className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
            >
              Analytics
            </Link>
            <Link
              to="/security/history"
              className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
            >
              History
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="glass-panel p-5 mb-6 border border-border/60">
          <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-border/40">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Emergency Services</h2>
              <p className="text-sm text-muted-foreground">Quick-call external responders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setEmergencyConfirm('fire')}
              className={`px-5 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                emergencyConfig.fire.buttonClass
              }`}
            >
              {emergencyConfig.fire.icon}
              {emergencyConfig.fire.label}
            </button>
            <button
              type="button"
              onClick={() => setEmergencyConfirm('ambulance')}
              className={`px-5 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                emergencyConfig.ambulance.buttonClass
              }`}
            >
              {emergencyConfig.ambulance.icon}
              {emergencyConfig.ambulance.label}
            </button>
            <button
              type="button"
              onClick={() => setEmergencyConfirm('police')}
              className={`px-5 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                emergencyConfig.police.buttonClass
              }`}
            >
              {emergencyConfig.police.icon}
              {emergencyConfig.police.label}
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-6 map-container p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Live Map & SOS Locations</h2>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-panel p-6 border border-border/60">
            <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-border/40">
              <h2 className="text-xl font-semibold text-foreground">Live Alerts</h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active alerts</div>
            ) : (
              <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={`/security/alert/${alert.id}`}
                    className="block bg-black/40 hover:bg-black/55 rounded-lg p-4 transition-colors border border-border/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-2xl font-bold ${getRiskColor(alert.risk_score)}`}>
                            {alert.risk_score.toFixed(1)}
                          </span>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            alert.risk_score >= 50 ? 'bg-danger/20 text-danger' :
                            alert.risk_score >= 25 ? 'bg-warning/20 text-warning' :
                            'bg-safe/20 text-safe'
                          }`}>
                            {getRiskBadge(alert.risk_score)}
                          </span>
                          {Array.isArray((alert as any).attachments) && (alert as any).attachments.length > 0 ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30">
                              MEDIA
                            </span>
                          ) : null}
                          <span className="text-muted-foreground text-sm">
                            {formatTriggerType(alert.trigger_type)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          User: {getAlertLabel(alert)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          alert.status === 'resolved' ? 'bg-safe/20 text-safe' :
                          alert.status === 'acknowledged' ? 'bg-warning/20 text-warning' :
                          'bg-danger/20 text-danger'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 border border-border/60">
            <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-border/40">
              <h2 className="text-xl font-semibold text-foreground">Beacons</h2>
              <button
                onClick={loadBeacons}
                className="px-4 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border/50"
              >
                Refresh
              </button>
            </div>

            {isBeaconLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading beacons...</div>
            ) : beacons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No beacons found</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[720px] overflow-y-auto pr-1">
                {beacons.map((beacon) => {
                  const alive = isBeaconAlive(beacon);
                  const heartbeatColor = alive ? 'text-sky-400' : 'text-violet-500';
                  const heartbeatBg = alive ? 'bg-sky-400/15 border-sky-400/30' : 'bg-violet-500/15 border-violet-500/30';

                  return (
                    <div
                      key={beacon.id}
                      className="rounded-xl border border-border/60 bg-black/40 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-foreground">{beacon.name}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {beacon.node_role}
                          </div>
                        </div>
                        <button
                          onClick={loadBeacons}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${heartbeatBg}`}
                        >
                          <HeartPulse className={`h-4 w-4 ${heartbeatColor} ${alive ? 'animate-pulse' : ''}`} />
                          <span className={heartbeatColor}>{alive ? 'Alive' : 'Dead'}</span>
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-secondary/20 p-3 border border-border/40">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            Mode
                          </div>
                          <div className="mt-1 text-foreground">{beacon.last_mode}</div>
                        </div>
                        <div className="rounded-lg bg-secondary/20 p-3 border border-border/40">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HeartPulse className="h-4 w-4" />
                            Last Seen
                          </div>
                          <div className="mt-1 text-foreground">{formatLastSeen(beacon.last_heartbeat_at || beacon.last_seen_at)}</div>
                        </div>
                        <div className="rounded-lg bg-secondary/20 p-3 border border-border/40">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Thermometer className="h-4 w-4" />
                            Temperature
                          </div>
                          <div className="mt-1 text-foreground">
                            {typeof beacon.last_temperature_c === 'number' ? `${beacon.last_temperature_c.toFixed(1)} C` : 'N/A'}
                          </div>
                        </div>
                        <div className="rounded-lg bg-secondary/20 p-3 border border-border/40">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Wind className="h-4 w-4" />
                            Smoke
                          </div>
                          <div className="mt-1 text-foreground">
                            {typeof beacon.last_smoke_level === 'number' ? beacon.last_smoke_level.toFixed(0) : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{beacon.location?.address || beacon.location?.building || beacon.id}</span>
                        <button
                          onClick={loadBeacons}
                          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-3 py-2 text-foreground hover:bg-secondary/60"
                        >
                          <HeartPulse className="h-4 w-4" />
                          Manual Check
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmService ? (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="glass-panel p-6 w-[92%] max-w-md border border-border/60">
            <div className="flex items-start justify-between gap-4 pb-3 mb-4 border-b border-border/40">
              <div>
                <div className="text-lg font-semibold text-foreground">Confirm Call</div>
                <div className="text-sm text-muted-foreground">{confirmService.label}</div>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyConfirm(null)}
                className="px-3 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg border border-border/50"
              >
                Close
              </button>
            </div>

            <div className="text-sm text-muted-foreground">{confirmService.description}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Dial: <span className="text-foreground font-semibold">{confirmService.tel}</span>
            </div>

            <div className="mt-5 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEmergencyConfirm(null)}
                className="px-5 py-2 bg-secondary/60 hover:bg-secondary/80 text-foreground rounded-lg border border-border/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergency}
                className="px-5 py-2 bg-primary/80 hover:bg-primary text-primary-foreground rounded-lg border border-primary/30"
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
