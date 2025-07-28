// services/firebaseService.ts
import { db } from '../src/firebaseConfig';
import { ref, get, set, push, update, remove } from 'firebase/database';

// URLs base para cada endpoint
const BASE_URL = 'https://komuni-app-default-rtdb.europe-west1.firebasedatabase.app';

export interface ContactMessage {
  id?: string;
  nombre: string;
  email: string;
  mensaje: string;
  fecha: string;
  leido?: boolean;
}

export interface AdminProfile {
  id: number;
  nombre: string;
  imagen: string;
  Linkedin: string;
  Github: string;
  descripción: string;
}

export interface UserData {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
  reportes: string[];
  emailVerified: boolean;
  photoURL?: string;
  createdAt: string;
  lastLogin: string;
}

// === CONTACTOS ===
export async function sendContactMessage(contactData: Omit<ContactMessage, 'id' | 'fecha' | 'leido'>): Promise<string> {
  try {
    const messageData: ContactMessage = {
      ...contactData,
      fecha: new Date().toISOString(),
      leido: false
    };

    const contactRef = push(ref(db, 'contactpage'));
    await set(contactRef, messageData);
    
    console.log('Mensaje de contacto enviado con ID:', contactRef.key);
    return contactRef.key!;
  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);
    throw error;
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const contactRef = ref(db, 'contactpage');
    const snapshot = await get(contactRef);
    
    const messages: ContactMessage[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
    }
    
    return messages.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    throw error;
  }
}

export async function markContactMessageAsRead(messageId: string): Promise<void> {
  try {
    const messageRef = ref(db, `contactpage/${messageId}`);
    await update(messageRef, { leido: true });
    console.log('Mensaje marcado como leído:', messageId);
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    throw error;
  }
}

// === ADMINISTRADORES ===
export async function getAdmins(): Promise<AdminProfile[]> {
  try {
    const adminsRef = ref(db, 'admins');
    const snapshot = await get(adminsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as AdminProfile[];
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    throw error;
  }
}

export async function addAdmin(adminData: Omit<AdminProfile, 'id'>): Promise<string> {
  try {
    const adminRef = push(ref(db, 'admins'));
    const adminWithId = {
      ...adminData,
      id: Date.now() // Generar ID único
    };
    
    await set(adminRef, adminWithId);
    console.log('Administrador agregado con ID:', adminRef.key);
    return adminRef.key!;
  } catch (error) {
    console.error('Error al agregar administrador:', error);
    throw error;
  }
}

// === USUARIOS ===
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = ref(db, 'usuarios');
    const snapshot = await get(usersRef);
    
    const users: UserData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        users.push({
          uid: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

export async function getUserById(uid: string): Promise<UserData | null> {
  try {
    const userRef = ref(db, `usuarios/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return {
        uid,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

export async function updateUser(uid: string, updates: Partial<UserData>): Promise<void> {
  try {
    const userRef = ref(db, `usuarios/${uid}`);
    await update(userRef, updates);
    console.log('Usuario actualizado:', uid);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

export async function deleteUser(uid: string): Promise<void> {
  try {
    const userRef = ref(db, `usuarios/${uid}`);
    await remove(userRef);
    console.log('Usuario eliminado:', uid);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}

// === REPORTES (complemento a api.ts) ===
export async function getReportsByUser(uid: string): Promise<any[]> {
  try {
    const userRef = ref(db, `usuarios/${uid}/reportes`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const reportIds = snapshot.val();
      if (Array.isArray(reportIds)) {
        // Obtener detalles de cada reporte
        const reportDetails = await Promise.all(
          reportIds.map(async (reportId) => {
            const reportRef = ref(db, `reportes/${reportId}`);
            const reportSnapshot = await get(reportRef);
            if (reportSnapshot.exists()) {
              return {
                id: reportId,
                ...reportSnapshot.val()
              };
            }
            return null;
          })
        );
        
        return reportDetails.filter(report => report !== null);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener reportes del usuario:', error);
    throw error;
  }
}

// === FUNCIONES DE UTILIDAD ===
export async function testConnection(): Promise<boolean> {
  try {
    const testRef = ref(db, '.info/connected');
    const snapshot = await get(testRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error al probar conexión:', error);
    return false;
  }
}

export async function getStats(): Promise<{
  totalUsers: number;
  totalReports: number;
  totalContacts: number;
  totalAdmins: number;
}> {
  try {
    const [users, reports, contacts, admins] = await Promise.all([
      getAllUsers(),
      get(ref(db, 'reportes')),
      getContactMessages(),
      getAdmins()
    ]);

    const reportsCount = reports.exists() ? Object.keys(reports.val()).length : 0;

    return {
      totalUsers: users.length,
      totalReports: reportsCount,
      totalContacts: contacts.length,
      totalAdmins: admins.length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      totalUsers: 0,
      totalReports: 0,
      totalContacts: 0,
      totalAdmins: 0
    };
  }
}
