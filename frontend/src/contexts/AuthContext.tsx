import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if we have userData from the LoginForm component
        if (credentials.userData) {
          const user: User = {
            id: credentials.userData.role === 'Admin' ? 'admin-1' : 'user-1',
            name: credentials.userData.name,
            email: credentials.email,
            role: credentials.userData.role,
            avatar: `https://i.pravatar.cc/150?u=${credentials.email}`,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          resolve(true);
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
