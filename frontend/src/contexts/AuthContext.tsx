import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user has a specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.role || !Array.isArray(user.role.permissions)) return false;
    
    return user.role.permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  };

  // Check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.name === roleName;
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await apiService.login(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Fetch full user (including role permissions) and set user
      try {
        const current = await apiService.getCurrentUser();
        setUser(current.user);
      } catch (err) {
        // Fallback to response user if /me fails
        console.error('Failed to fetch current user after login:', err);
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const response = await apiService.register(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Fetch full user (including role permissions) and set user
      try {
        const current = await apiService.getCurrentUser();
        setUser(current.user);
      } catch (err) {
        console.error('Failed to fetch current user after register:', err);
        setUser(response.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear user
    setUser(null);
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await apiService.refreshToken();
      
      // Update tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      logout();
      throw error;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Try to get current user
          const response = await apiService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Token might be expired, try to refresh
          try {
            await refreshToken();
            const response = await apiService.getCurrentUser();
            setUser(response.user);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            logout();
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Setup token refresh interceptor
  useEffect(() => {
    const requestInterceptor = async (request: RequestInit): Promise<RequestInit> => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Check if token is about to expire (within 5 minutes)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiration = expirationTime - currentTime;
          
          // If token expires within 5 minutes, refresh it
          if (timeUntilExpiration < 5 * 60 * 1000) {
            await refreshToken();
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              request.headers = {
                ...request.headers,
                Authorization: `Bearer ${newToken}`,
              };
            }
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      
      return request;
    };

    // This is a simplified interceptor
    // In a real app, you might want to use axios or a more sophisticated solution
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init) {
        init = await requestInterceptor(init);
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};