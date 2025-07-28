import { useEffect, useState } from "react";
import { getAdmins, type AdminProfile } from "../services/firebaseService";

export interface Equipo {
  id: number;
  nombre: string;
  imagen: string;
  Linkedin: string;
  Github: string;
  descripción: string;
}

// Mantener interfaz original para compatibilidad
export type { AdminProfile };

export const useEquipo = () => {
  const [equipo, setEquipo] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const equipoData = await getAdmins();
        setEquipo(equipoData);
      } catch (err) {
        console.error("Error al cargar el equipo:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { equipo, loading, error };
};

export default useEquipo;
