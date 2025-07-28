// api.ts

import { db, storage, auth } from '../src/firebaseConfig';
import {
  ref as dbRef,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  DataSnapshot
} from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface BaseReportFields {
  calle: string;
  descripción: string;
  informaciónExtra?: string;
  latitud: number | null;
  longitud: number | null;
  fecha: string;
  tipo?: 'escalera' | 'rampa' | 'bache' | 'acera' | 'calle' | 'obstaculo' | 'cruce' | 'señal';
  dificultad?: 'solucionado' | 'temporal' | 'permanente';
  comentarios?: string[];
}

interface RealtimeReportPayload extends BaseReportFields {
  imagen?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
}

export interface Reporte extends RealtimeReportPayload {
  id: string;
}

export interface SendReportData extends BaseReportFields {
  id?: string;
  imagen?: File | null;
}

export interface UpdateReportData extends Partial<BaseReportFields> {
  imagen?: File | string | null;
}

export async function sendReporte(data: SendReportData): Promise<Reporte> {
  try {
    let imageUrl: string | null = null;

    if (data.imagen instanceof File) {
      const imageStorageRef = storageRef(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(imageStorageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Obtener información del usuario autenticado
    const currentUser = auth.currentUser;
    
    // Si no hay usuario de Firebase Auth, intentar obtener desde localStorage
    let userInfo = {
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || null
    };

    // Si no hay datos de Firebase Auth, obtener desde localStorage
    if (!currentUser) {
      const loggedEmail = localStorage.getItem('loggedUser');
      if (loggedEmail) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find((u: any) => u.email === loggedEmail);
        if (foundUser) {
          userInfo = {
            uid: foundUser.uid,
            email: foundUser.email,
            displayName: foundUser.nombre
          };
        }
      }
    }

    const docData: RealtimeReportPayload = {
      calle: data.calle,
      descripción: data.descripción,
      informaciónExtra: data.informaciónExtra,
      latitud: data.latitud,
      longitud: data.longitud,
      fecha: data.fecha,
      tipo: data.tipo,
      dificultad: data.dificultad,
      comentarios: data.comentarios,
      imagen: imageUrl,
      userId: userInfo.uid,
      userEmail: userInfo.email,
      userName: userInfo.displayName
    };

    const newReportRef = push(dbRef(db, "reportes"));
    await set(newReportRef, docData);
    console.log("Reporte añadido con ID: ", newReportRef.key);

    // Si hay usuario autenticado, agregar el reporte a su lista en Firebase
    if (userInfo.uid) {
      console.log('🔵 Guardando reporte para usuario:', userInfo);
      const userReportsRef = dbRef(db, `usuarios/${userInfo.uid}/reportes`);
      const userReportsSnapshot = await get(userReportsRef);
      const currentReports = userReportsSnapshot.exists() ? userReportsSnapshot.val() : [];
      const updatedReports = [...(Array.isArray(currentReports) ? currentReports : []), newReportRef.key];
      
      await set(userReportsRef, updatedReports);
      console.log('✅ Reporte guardado en Firebase para usuario');
      
      // También actualizar el localStorage si está disponible la función global
      if ((window as any).addReportToUser && typeof (window as any).addReportToUser === 'function') {
        console.log('🔵 Llamando a addReportToUser con ID:', newReportRef.key);
        try {
          (window as any).addReportToUser(newReportRef.key);
          console.log('✅ addReportToUser ejecutada correctamente');
        } catch (error) {
          console.warn('❌ Error al actualizar localStorage:', error);
        }
      } else {
        console.warn('⚠️ addReportToUser no está disponible en window');
      }
    } else {
      console.log('⚠️ No hay userInfo.uid, no se guardará en perfil de usuario');
    }

    return { id: newReportRef.key!, ...docData };

  } catch (error) {
    console.error("Error al añadir el reporte: ", error);
    throw error;
  }
}

export async function getReportes(): Promise<Reporte[]> {
  try {
    const reportsRef = dbRef(db, "reportes");
    const snapshot: DataSnapshot = await get(reportsRef);

    const reportes: Reporte[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        reportes.push({
          id: childSnapshot.key!,
          ...(childSnapshot.val() as RealtimeReportPayload)
        });
      });
    }
    return reportes;
  } catch (error) {
      console.error("Error al obtener los reportes: ", error);
      throw error;
  }
}

export async function updateReporte(id: string, data: UpdateReportData): Promise<Reporte> {
  try {
    const reportRef = dbRef(db, `reportes/${id}`);
    let imageUrl: string | null | undefined;

    if (data.imagen instanceof File) {
      const imageStorageRef = storageRef(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(imageStorageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    } else if (typeof data.imagen === 'string' || data.imagen === null) {
      imageUrl = data.imagen;
    }

    const { imagen: inputImage, ...restOfData } = data;

    const updatePayload: Partial<RealtimeReportPayload> = {
      ...restOfData
    };

    if (data.hasOwnProperty('imagen')) {
      updatePayload.imagen = imageUrl;
    }

    await update(reportRef, updatePayload);
    console.log("Reporte actualizado con ID: ", id);

    const updatedSnapshot = await get(reportRef);
    if (updatedSnapshot.exists()) {
        return { id: updatedSnapshot.key!, ...(updatedSnapshot.val() as RealtimeReportPayload) };
    } else {
        throw new Error("Reporte no encontrado después de actualizar.");
    }

  } catch (error) {
    console.error("Error al actualizar el reporte: ", error);
    throw error;
  }
}

export async function deleteReporte(id: string): Promise<void> {
  try {
    const reportRef = dbRef(db, `reportes/${id}`);
    await remove(reportRef);
    console.log("Reporte eliminado con ID: ", id);
  } catch (error) {
    console.error("Error al eliminar el reporte: ", error);
    throw error;
  }
}

export function observeReports(callback: (reports: Reporte[]) => void): () => void {
  const reportsRef = dbRef(db, "reportes");
  const unsubscribe = onValue(reportsRef, (snapshot) => {
    const reportes: Reporte[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        reportes.push({
          id: childSnapshot.key!,
          ...(childSnapshot.val() as RealtimeReportPayload)
        });
      });
    }
    callback(reportes);
  });
  return unsubscribe;
}