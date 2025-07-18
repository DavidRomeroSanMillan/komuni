import { useEffect, useState } from "react";

export interface Equipo {
  id: number;
  nombre: string;
  imagen: string;
  Linkedin: string;
  Github: string;
  descripción: string;
}

export const useEquipo = () => {
  const [equipo, setEquipo] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://komuni-app-default-rtdb.europe-west1.firebasedatabase.app/admins.json"
        );

        if (!response.ok) {
          throw new Error("Error al conectar con la base de datos.");
        }

        const data = await response.json();


        const perfilesArray: Equipo[] = Object.values(data);

        setEquipo(perfilesArray);
      } catch (err) {
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
