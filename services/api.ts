// services/api.ts
import { db, storage } from '../src/firebaseConfig'; // Adjust path as needed
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  type DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// This interface represents the data structure as it will be stored in Firestore
// The `id` property won't be explicitly stored within the document, as Firestore generates its own document ID.
// However, when we retrieve data, we'll often attach the Firestore document ID to this object.
interface ReportPayload {
  calle: string;
  descripción: string;
  informaciónExtra?: string;
  imagen?: string | null | File; // This will store the URL of the image in Firebase Storage
  latitud: number | null;
  longitud: number | null;
  fecha: string;
  tipo?: 'escalera' | 'rampa' | 'bache' | 'acera' | 'calle' | 'obstaculo' | 'cruce' | 'señal';
  dificultad?: 'baja' | 'media' | 'alta';
  comentarios?: string[];
}

// This interface represents a full report including the Firestore document ID
export interface Reporte extends ReportPayload {
  id: string; // This will be the Firestore document ID
}

// Function to send a new report (including image upload)
// The `data` here expects the File object for `imagen`
export async function sendReporte(data: Omit<ReportPayload, 'imagen'> & { imagen?: File | null }): Promise<Reporte> {
  try {
    let imageUrl: string | null = null;

    if (data.imagen instanceof File) {
      const storageRef = ref(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(storageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const docData: ReportPayload = {
      ...data,
      imagen: imageUrl // Store the URL or null
    };

    const docRef = await addDoc(collection(db, "reportes"), docData);
    console.log("Reporte añadido con ID: ", docRef.id);

    return { id: docRef.id, ...docData };

  } catch (error) {
    console.error("Error al añadir el reporte: ", error);
    throw error;
  }
}

// Function to get all reports
export async function getReportes(): Promise<Reporte[]> {
  try {
    const reportsCollection = collection(db, "reportes");
    const q = query(reportsCollection);
    const querySnapshot = await getDocs(q);

    const reportes: Reporte[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      reportes.push({
        id: doc.id,
        ...(doc.data() as ReportPayload) // Cast to ReportPayload
      });
    });
    return reportes;
  } catch (error) {
    console.error("Error al obtener los reportes: ", error);
    throw error;
  }
}

// Function to update an existing report
export async function updateReporte(id: string, data: Partial<ReportPayload> & { imagen?: File | string | null }): Promise<Reporte> {
  try {
    const reportRef = doc(db, "reportes", id);
    let imageUrl: string | null | undefined = undefined; // Use undefined to not update if not provided

    // Check if a new File is provided for the image
    if (data.imagen instanceof File) {
      const storageRef = ref(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(storageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    } else if (data.imagen === null || typeof data.imagen === 'string') {
      imageUrl = data.imagen; // If null or a string (existing URL), use that
    }

    const updateData: Partial<ReportPayload> = { ...data };
    if (imageUrl !== undefined) {
      updateData.imagen = imageUrl;
    } else {
      delete updateData.imagen; // Do not update imagen if it's not provided or undefined
    }


    await updateDoc(reportRef, updateData);
    console.log("Reporte actualizado con ID: ", id);

    // To return the updated report, you might need to fetch it again or reconstruct it
    // For simplicity, let's assume the update was successful and return a partial object
    // In a real app, you might fetch the full updated document.
    const updatedDoc = await getDoc(reportRef);
    if (updatedDoc.exists()) {
        return { id: updatedDoc.id, ...(updatedDoc.data() as ReportPayload) };
    } else {
        throw new Error("Reporte no encontrado después de actualizar.");
    }

  } catch (error) {
    console.error("Error al actualizar el reporte: ", error);
    throw error;
  }
}

// Function to delete a report
export async function deleteReporte(id: string): Promise<void> {
  try {
    const reportRef = doc(db, "reportes", id);
    await deleteDoc(reportRef);
    console.log("Reporte eliminado con ID: ", id);
  } catch (error) {
    console.error("Error al eliminar el reporte: ", error);
    throw error;
  }
}

