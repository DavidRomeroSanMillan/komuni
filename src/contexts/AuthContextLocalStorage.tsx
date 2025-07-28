import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
  reportes: string[];
  emailVerified: boolean;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  currentUser: any;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
}

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const loggedEmail = localStorage.getItem('loggedUser');
        if (loggedEmail) {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const foundUser = users.find((u: any) => u.email === loggedEmail);
          
          if (foundUser) {
            // Simular estructura de Firebase User
            const mockUser = {
              uid: foundUser.uid || `uid_${Date.now()}`,
              email: foundUser.email,
              emailVerified: foundUser.emailVerified || false,
              photoURL: foundUser.photoURL
            };
            
            setCurrentUser(mockUser);
            setUserProfile({
              ...foundUser,
              uid: mockUser.uid,
              emailVerified: mockUser.emailVerified,
              createdAt: foundUser.createdAt ? new Date(foundUser.createdAt) : new Date(),
              lastLogin: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Registrar nuevo usuario
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Verificar si el email ya existe
      if (users.find((u: any) => u.email === userData.email)) {
        throw new Error('Ya existe una cuenta con este correo electrónico');
      }

      // Crear nuevo usuario
      const newUser = {
        uid: `uid_${Date.now()}`,
        email: userData.email,
        password: userData.password, // En producción esto debería estar hasheado
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        fechaNacimiento: userData.fechaNacimiento,
        genero: userData.genero,
        reportes: [],
        emailVerified: false, // Simular email no verificado
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedUser', newUser.email);

      // Actualizar estado
      const mockUser = {
        uid: newUser.uid,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        photoURL: undefined
      };
      
      setCurrentUser(mockUser);
      setUserProfile({
        ...newUser,
        createdAt: new Date(newUser.createdAt),
        lastLogin: new Date(newUser.lastLogin)
      });

      console.log('Usuario registrado exitosamente (localStorage)');
    } catch (error: any) {
      console.error('Error in registration:', error);
      throw error;
    }
  };

  // Iniciar sesión
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña');
      }

      // Actualizar último login
      foundUser.lastLogin = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedUser', email);

      // Actualizar estado
      const mockUser = {
        uid: foundUser.uid,
        email: foundUser.email,
        emailVerified: foundUser.emailVerified,
        photoURL: foundUser.photoURL
      };
      
      setCurrentUser(mockUser);
      setUserProfile({
        ...foundUser,
        createdAt: new Date(foundUser.createdAt),
        lastLogin: new Date(foundUser.lastLogin)
      });

      console.log('Login exitoso (localStorage)');
    } catch (error: any) {
      console.error('Error in login:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('loggedUser');
      setCurrentUser(null);
      setUserProfile(null);
      console.log('Logout exitoso');
    } catch (error: any) {
      console.error('Error in logout:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  // Resetear contraseña (simulado)
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error('No existe una cuenta con este correo electrónico');
      }
      
      console.log('Se ha enviado un correo para resetear tu contraseña (simulado)');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Reenviar verificación (simulado)
  const resendVerification = async (): Promise<void> => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      console.log('Email de verificación enviado (simulado)');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      throw new Error('Error al enviar email de verificación');
    }
  };

  // Actualizar perfil de usuario
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Actualizar estado local
        if (userProfile) {
          setUserProfile({ ...userProfile, ...updates });
        }
      }
      
      console.log('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error('Error al actualizar perfil');
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    resendVerification,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
