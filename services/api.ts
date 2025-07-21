// api.ts

import { db, storage } from '../src/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  type DocumentData,
  QueryDocumentSnapshot,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Define una interfaz base para los campos comunes del reporte que se almacenan en Firestore.
// Excluimos 'imagen' de aquí porque su tipo varía según la operación (subida vs. almacenamiento).
interface BaseReportFields {
  calle: string;
  descripción: string;
  informaciónExtra?: string;
  latitud: number | null;
  longitud: number | null;
  fecha: string;
  tipo?: 'escalera' | 'rampa' | 'bache' | 'acera' | 'calle' | 'obstaculo' | 'cruce' | 'señal';
  dificultad?: 'baja' | 'media' | 'alta';
  comentarios?: string[];
}

// Esta interfaz define la estructura de un reporte tal como se ALMACENA en Firestore.
// 'imagen' será siempre una URL (string) o null.
interface FirestoreReportPayload extends BaseReportFields {
  imagen?: string | null; // Almacena la URL de la imagen en Firebase Storage
}

// Esta interfaz define la estructura completa de un reporte incluyendo el ID del documento de Firestore.
export interface Reporte extends FirestoreReportPayload {
  id: string; // Este será el ID del documento de Firestore
}

// Esta interfaz define la estructura de los datos que la función sendReporte ACEPTA.
// Permite que 'imagen' sea un objeto File para subirlo.
export interface SendReportData extends BaseReportFields {
  id?: string; // Opcional, ya que Firestore genera su propio ID
  imagen?: File | null; // Permite un objeto File para la entrada
}

// Esta interfaz define la estructura de los datos que la función updateReporte ACEPTA.
// Permite que 'imagen' sea un objeto File para subirlo, una URL string existente, o null para eliminarlo.
export interface UpdateReportData extends Partial<BaseReportFields> {
  imagen?: File | string | null;
}

// Función para enviar un nuevo reporte (incluyendo la subida de imagen)
export async function sendReporte(data: SendReportData): Promise<Reporte> {
  try {
    let imageUrl: string | null = null;

    if (data.imagen instanceof File) {
      const storageRef = ref(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(storageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Prepara los datos para Firestore, donde 'imagen' es una URL string o null.
    const docData: FirestoreReportPayload = {
      calle: data.calle,
      descripción: data.descripción,
      informaciónExtra: data.informaciónExtra,
      latitud: data.latitud,
      longitud: data.longitud,
      fecha: data.fecha,
      tipo: data.tipo,
      dificultad: data.dificultad,
      comentarios: data.comentarios,
      imagen: imageUrl // Almacena la URL o null
    };

    const docRef = await addDoc(collection(db, "reportes"), docData);
    console.log("Reporte añadido con ID: ", docRef.id);

    return { id: docRef.id, ...docData };

  } catch (error) {
    console.error("Error al añadir el reporte: ", error);
    throw error;
  }
}

// Función para obtener todos los reportes
export async function getReportes(): Promise<Reporte[]> {
  try {
    const reportsCollection = collection(db, "reportes");
    const q = query(reportsCollection);
    const querySnapshot = await getDocs(q);

    const reportes: Reporte[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      reportes.push({
        id: doc.id,
        ...(doc.data() as FirestoreReportPayload)
      });
    });
    return reportes;
  } catch (error) {
      console.error("Error al obtener los reportes: ", error);
      throw error;
  }
}

// Función para actualizar un reporte existente
export async function updateReporte(id: string, data: UpdateReportData): Promise<Reporte> {
  try {
    const reportRef = doc(db, "reportes", id);
    let imageUrl: string | null | undefined = undefined; // Será URL, null, o undefined (si no se tocó)

    // 1. Procesa la 'imagen' de entrada de 'data' para obtener una URL o null
    if (data.imagen instanceof File) {
      const storageRef = ref(storage, `report_images/${Date.now()}_${data.imagen.name}`);
      const snapshot = await uploadBytes(storageRef, data.imagen);
      imageUrl = await getDownloadURL(snapshot.ref);
    } else if (data.imagen === null || typeof data.imagen === 'string') {
      imageUrl = data.imagen; // Usa la URL existente o null si se está eliminando
    }

    // 2. Desestructura 'data' para separar 'imagen' del resto de propiedades
    const { imagen: inputImage, ...restOfData } = data;

    // 3. Construye el payload para la actualización de Firestore
    // Asegúrate de que todas las propiedades restantes estén correctamente tipadas
    const updatePayload: Partial<FirestoreReportPayload> = {
        ...restOfData // Esto contendrá todas las demás propiedades, correctamente tipadas
    };

    // 4. Añade condicionalmente la 'imagen' procesada (imageUrl) a updatePayload
    // Esto asegura que 'imagen' solo se establezca si se proporcionó en la entrada 'data'
    // o si se subió un nuevo archivo (es decir, imageUrl no es undefined).
    if (data.hasOwnProperty('imagen')) {
      updatePayload.imagen = imageUrl;
    } else if (imageUrl !== undefined) {
      updatePayload.imagen = imageUrl;
    }

    await updateDoc(reportRef, updatePayload); // Usa updatePayload aquí
    console.log("Reporte actualizado con ID: ", id);

    const updatedDoc = await getDoc(reportRef);
    if (updatedDoc.exists()) {
        return { id: updatedDoc.id, ...(updatedDoc.data() as FirestoreReportPayload) };
    } else {
        throw new Error("Reporte no encontrado después de actualizar.");
    }

  } catch (error) {
    console.error("Error al actualizar el reporte: ", error);
    throw error;
  }
}

// Función para eliminar un reporte
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