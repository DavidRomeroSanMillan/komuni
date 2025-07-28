import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, db } from '../firebaseConfig';

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
  createdAt: Date | string;
  lastLogin: Date | string;
}

interface AuthContextType {
  currentUser: User | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener perfil de usuario desde Firebase Realtime Database
  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const userRef = ref(db, `usuarios/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          uid: user.uid,
          email: user.email!,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || undefined,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastLogin: data.lastLogin ? new Date(data.lastLogin) : new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Registrar nuevo usuario
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Actualizar el perfil de Firebase Auth
      await updateProfile(user, {
        displayName: `${userData.nombre} ${userData.apellidos}`
      });

      // Crear documento en Firebase Realtime Database
      const userProfile: Omit<UserProfile, 'uid' | 'emailVerified' | 'photoURL'> = {
        email: userData.email,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        fechaNacimiento: userData.fechaNacimiento,
        genero: userData.genero,
        reportes: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const userRef = ref(db, `usuarios/${user.uid}`);
      await set(userRef, userProfile);

      // Enviar email de verificación
      await sendEmailVerification(user);
      
    } catch (error: any) {
      console.error('Error in registration:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Iniciar sesión
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Actualizar último login
      if (auth.currentUser) {
        const userRef = ref(db, `usuarios/${auth.currentUser.uid}`);
        await update(userRef, {
          lastLogin: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Error in login:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Error in logout:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  // Resetear contraseña
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Reenviar verificación de email
  const resendVerification = async (): Promise<void> => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      console.error('Error resending verification:', error);
      throw new Error('Error al enviar email de verificación');
    }
  };

  // Actualizar perfil de usuario
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      const userRef = ref(db, `usuarios/${currentUser.uid}`);
      await update(userRef, updates);
      
      // Actualizar estado local
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error('Error al actualizar perfil');
    }
  };

  // Obtener mensaje de error en español
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Inténtalo más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Verifica tu email y contraseña';
      default:
        return 'Ha ocurrido un error. Inténtalo de nuevo';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = await fetchUserProfile(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
