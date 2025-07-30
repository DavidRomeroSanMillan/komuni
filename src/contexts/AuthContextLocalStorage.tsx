import React, { createContext, useContext, useEffect, useState } from 'react';
// import { auth } from '../firebaseConfig'; // Temporarily disabled to avoid config errors
// import { signInAnonymously, updateProfile } from 'firebase/auth'; // Commented out for now
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
      console.log('Simulando envío de email de verificación a:', currentUser.email);
      
      // Solo simular el envío del email, NO verificar automáticamente
      // El usuario debe hacer clic en un enlace simulado para verificar
      
      console.log('Email de verificación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      throw new Error('Error al enviar email de verificación');
    }
  };

  // Función para simular verificación manual
  const verifyEmail = async (): Promise<void> => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
      
      if (userIndex !== -1) {
        users[userIndex].emailVerified = true;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Actualizar el estado actual
        setCurrentUser((prev: any) => prev ? { ...prev, emailVerified: true } : null);
        setUserProfile((prev: any) => prev ? { ...prev, emailVerified: true } : null);
        
        console.log('Email verificado manualmente');
      }
    } catch (error: any) {
      console.error('Error al verificar email:', error);
      throw new Error('Error al verificar email');
    }
  };

  // Exponer verifyEmail globalmente para simulación
  useEffect(() => {
    (window as any).verifyEmail = verifyEmail;
    return () => {
      delete (window as any).verifyEmail;
    };
  }, [currentUser]);

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

  // Función para agregar un reporte al usuario
  const addReportToUser = async (reportId: string): Promise<void> => {
    console.log('🔵 addReportToUser llamada con reportId:', reportId);
    console.log('🔵 currentUser:', currentUser);
    console.log('🔵 userProfile antes:', userProfile);
    
    if (!currentUser || !userProfile) {
      console.log('❌ No hay currentUser o userProfile, abortando');
      return;
    }
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
      
      console.log('🔵 userIndex encontrado:', userIndex);
      
      if (userIndex !== -1) {
        if (!users[userIndex].reportes) {
          users[userIndex].reportes = [];
        }
        
        console.log('🔵 reportes actuales del usuario:', users[userIndex].reportes);
        
        // Agregar el ID del reporte si no existe ya
        if (!users[userIndex].reportes.includes(reportId)) {
          users[userIndex].reportes.push(reportId);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Actualizar estado local inmediatamente
          const updatedReports = [...(userProfile.reportes || []), reportId];
          setUserProfile({
            ...userProfile, 
            reportes: updatedReports
          });
          
          console.log('✅ Reporte agregado al usuario:', reportId);
          console.log('🔵 nuevos reportes en localStorage:', users[userIndex].reportes);
          console.log('🔵 nuevos reportes en estado:', updatedReports);
          
          // Forzar una actualización del perfil para que se recarguen los reportes
          setTimeout(() => {
            console.log('🔄 Forzando actualización del perfil...');
            setUserProfile(prev => prev ? {...prev, reportes: updatedReports} : null);
          }, 100);
          
        } else {
          console.log('⚠️ Reporte ya existe en la lista del usuario');
        }
      } else {
        console.log('❌ Usuario no encontrado en localStorage');
      }
    } catch (error: any) {
      console.error('❌ Error al agregar reporte al usuario:', error);
    }
  };

  // Sincronizar Firebase Auth cuando hay localStorage user
  useEffect(() => {
    // Commented out Firebase Auth sync to avoid authentication errors
    // const syncFirebaseAuth = async () => {
    //   if (currentUser && userProfile) {
    //     try {
    //       // Solo sincronizar si no hay usuario de Firebase Auth
    //       if (!auth.currentUser) {
    //         const userCredential = await signInAnonymously(auth);
    //         
    //         // Actualizar el perfil con información del localStorage
    //         await updateProfile(userCredential.user, {
    //           displayName: userProfile.nombre || 'Usuario'
    //         });
    //         
    //         console.log('Usuario Firebase Auth sincronizado para reportes');
    //       }
    //     } catch (error) {
    //       console.warn('Error al sincronizar con Firebase Auth:', error);
    //     }
    //   }
    // };

    // syncFirebaseAuth();
  }, [currentUser, userProfile]);

  // Limpiar Firebase Auth cuando se hace logout - Temporarily disabled
  // useEffect(() => {
  //   if (!currentUser && auth.currentUser) {
  //     auth.signOut().catch(console.warn);
  //   }
  // }, [currentUser]);

  // Exponer addReportToUser globalmente para que api.ts pueda usarlo
  useEffect(() => {
    (window as any).addReportToUser = addReportToUser;
    return () => {
      delete (window as any).addReportToUser;
    };
  }, [currentUser, userProfile]);

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
