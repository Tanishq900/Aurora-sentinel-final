import api from './api';

export interface BeaconStatus {
  id: string;
  name: string;
  node_role: 'main' | 'relay' | 'backup' | 'gateway';
  mac_address: string | null;
  forward_target_id: string | null;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
    building?: string;
    floor?: string;
    room?: string;
  } | null;
  wifi_connected: boolean;
  last_mode: 'wifi' | 'esp_now_fallback' | 'offline';
  last_seen_at: string | null;
  last_heartbeat_at: string | null;
  last_temperature_c: number | null;
  last_smoke_level: number | null;
  is_online: boolean;
}

export const beaconService = {
  async getBeaconStatuses(): Promise<BeaconStatus[]> {
    const response = await api.get('/beacon/status');
    return response.data;
  },
};
