import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
    
    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('supabaseSession');
      } else if (event === 'SIGNED_IN' && session) {
        await SecureStore.setItemAsync('supabaseSession', JSON.stringify(session));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      const storedSession = await SecureStore.getItemAsync('supabaseSession');

      if (storedToken && storedSession) {
        setToken(storedToken);
        // Verify Supabase session is still valid
        const session = JSON.parse(storedSession);
        const { data: { user: supabaseUser } } = await supabase.auth.getUser(session.access_token);
        
        if (supabaseUser) {
          // Get user profile from backend
          try {
            const profile = await authApi.getProfile();
            setUser(profile);
          } catch (error) {
            console.error('Error loading profile:', error);
            // Session might be invalid, clear it
            await logout();
          }
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, token: newToken } = await authApi.login(email, password);
      setUser(loggedInUser);
      setToken(newToken);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
