import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

interface AuthContextType {
  user: any | null;
  userProfile: any;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, phone: string, role: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token: string) => {
    try {
      const profile = await apiGet<any>('/auth/profile', token);
      setUserProfile(profile);
      setUser(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (accessToken) {
      await fetchUserProfile(accessToken);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('auth_token');
    if (saved) {
      setAccessToken(saved);
      fetchUserProfile(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await apiPost<{ token: string; user: any }>(
      '/auth/login',
      { email, password }
    );
    localStorage.setItem('auth_token', result.token);
    setAccessToken(result.token);
    setUser(result.user);
    setUserProfile(result.user);
    return result;
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: string) => {
    const result = await apiPost<{ token: string; user: any }>(
      '/auth/signup',
      { email, password, name, phone, role }
    );
    localStorage.setItem('auth_token', result.token);
    setAccessToken(result.token);
    setUser(result.user);
    setUserProfile(result.user);
    return result;
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setAccessToken(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    accessToken,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}