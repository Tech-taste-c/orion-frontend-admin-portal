import { useState, useEffect } from 'react';
import { apiService, SignInRequest } from '@/services/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = async (credentials: SignInRequest) => {
    console.log('SignIn called with credentials:', credentials);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await apiService.signIn(credentials);
      console.log('API response:', response);
      
      if (response.success && response.data) {
        const { access_token, user } = response.data;
        
        const userData: User = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          type: user.type,
        };

        console.log('Setting auth state:', { user: userData, token: access_token });

        // Store auth state
        localStorage.setItem('auth_token', access_token);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        setAuthState({
          user: userData,
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, message: 'Login successful' };
      } else {
        console.log('Login failed:', response.error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: response.error || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('SignIn error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const signOut = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear any other potential auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    
    // Reset auth state to initial values
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Clear any cached data or session storage
    sessionStorage.clear();
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
};
