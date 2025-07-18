import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface ReportPayload {
  id?: string; 
  calle: string;
  descripción: string;
  informaciónExtra?: string;
  imagen?: string | null; 
  latitud: number | null;
  longitud: number | null;
  fecha: string;
  tipo?: 'escalera' | 'rampa' | 'bache' | 'acera' | 'calle' | 'obstaculo' | 'cruce' | 'señal';
  dificultad?: 'baja' | 'media' | 'alta';
  comentarios?: string[];
}

interface Reporte extends ReportPayload {
  id: string; 
}

const API = axios.create({
  baseURL: 'http://localhost:4000' // 
});


export function sendReporte(data: ReportPayload): Promise<AxiosResponse<Reporte>> {
  return API.post<Reporte>('/reportes', data);
}


export function getReportes(): Promise<AxiosResponse<Reporte[]>> {
  return API.get<Reporte[]>('/reportes');
}


export function updateReporte(id: string, data: Partial<Reporte>): Promise<AxiosResponse<Reporte>> {
  return API.patch<Reporte>(`/reportes/${id}`, data);
}


export function deleteReporte(id: string): Promise<AxiosResponse<void>> {
  return API.delete<void>(`/reportes/${id}`);
}
