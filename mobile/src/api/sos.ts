import apiClient from './client';

export interface SOSEvent {
  id: string;
  userId: string;
  status: string;
  riskScore: number;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const sosApi = {
  async triggerSOS(location: { latitude: number; longitude: number }): Promise<SOSEvent> {
    const response = await apiClient.post('/sos/trigger', {
      location,
    });
    return response.data;
  },

  async getSOSHistory(limit: number = 10): Promise<SOSEvent[]> {
    const response = await apiClient.get('/sos', {
      params: { limit },
    });
    return response.data;
  },
};
