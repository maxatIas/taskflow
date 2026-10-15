import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { AuthState, LoginFormData, RegisterFormData } from '../types';
import { AuthApi } from '../services/api';

// Create Auth Context
interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Check authentication on initial load
  const checkAuth = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
        return;
      }

      // Set token in state
      setState(prev => ({ ...prev, token }));
      
      // Get current user
      const response = await AuthApi.getMe();
      
      if (response.status === 'success' && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setState({
          user: response.data.user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      } else {
        // Clear token if invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      }
    } catch (err) {
      // Clear token on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to authenticate. Please login again.'
      });
    }
  };

  // Login function
  const login = async (data: LoginFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthApi.login(data);
      
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data;
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw err;
    }
  };

  // Register function
  const register = async (data: RegisterFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthApi.register(data);
      
      if (response.status === 'success' && response.data) {
        const { user, token } = response.data;
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await AuthApi.logout();
    } catch (err) {
      // Ignore error, still logout locally
      console.error('Logout error:', err);
    } finally {
      // Clear token and user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    }
  };

  // Check auth on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
