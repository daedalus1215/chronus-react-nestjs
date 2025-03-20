import { createContext, useContext, useCallback } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthProvider = () => {
  const getStoredToken = () => localStorage.getItem('jwt_token');
  const isAuthenticated = !!getStoredToken();

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<{ access_token: string }>('http://localhost:3000/auth/login', {
        username,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('jwt_token', access_token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 