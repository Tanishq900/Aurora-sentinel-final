import apiClient from './client';
import { supabase } from '../config/supabase';
import * as SecureStore from 'expo-secure-store';

export interface LoginResponse {
  user: any;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // First authenticate with Supabase
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    if (!supabaseData.session) {
      throw new Error('No session returned from Supabase');
    }

    // Then authenticate with backend to get JWT token
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const { user, token } = response.data;

    // Store tokens
    await SecureStore.setItemAsync('accessToken', token);
    await SecureStore.setItemAsync('supabaseSession', JSON.stringify(supabaseData.session));

    return { user, token };
  },

  async logout(): Promise<void> {
    // Clear Supabase session
    await supabase.auth.signOut();

    // Clear stored tokens
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('supabaseSession');
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
