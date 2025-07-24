// api.ts

import { db, storage } from '../src/firebaseConfig';
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
      imagen: imageUrl
    };

    const newReportRef = push(dbRef(db, "reportes"));
    await set(newReportRef, docData);
    console.log("Reporte añadido con ID: ", newReportRef.key);

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