// Reporte.tsx
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { sendReporte, type SendReportData } from '../services/api.ts'; // Import SendReportData

function generateId(): string {
  
  return Math.random().toString(16).slice(2, 6);
}

export default function ReportPage() {
  const [calle, setCalle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [extra, setExtra] = useState<string>('');
  const [foto, setFoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ latitud: number; longitud: number } | null>(null);
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Añadir función para obtener la calle por lat/lng usando Nominatim
  async function getStreetName(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`
      );
      const data = await res.json();
      return (
        data.address?.road ||
        data.address?.pedestrian ||
        data.address?.footway ||
        data.address?.path ||
        data.address?.cycleway ||
        data.address?.neighbourhood ||
        data.address?.suburb ||
        ""
      );
    } catch (error) {
      console.error("Error fetching street name:", error);
      return "";
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos: GeolocationPosition) => {
          const latitud = pos.coords.latitude;
          const longitud = pos.coords.longitude;
          setCoords({ latitud, longitud });
          // Autocompletar calle usando reverse geocoding
          const nombreCalle = await getStreetName(latitud, longitud);
          if (nombreCalle) setCalle(nombreCalle);
        },
        (err: GeolocationPositionError) => setMsg('⚠️ No se pudo obtener ubicación automáticamente' + err)
      );
    } else {
      setMsg('⚠️ Geolocalización no soportada por el navegador.');
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    if (!calle.trim() || !desc.trim()) {
      setMsg('❌ Todos los campos obligatorios deben estar completos.');
      setLoading(false);
      return;
    }

    const payload: SendReportData = { // Use SendReportData interface
      id: generateId(), 
      calle: calle.trim(),
      descripción: desc.trim(),
      informaciónExtra: extra.trim(),
      imagen: foto, // Pass the File object directly
      latitud: coords?.latitud || null,
      longitud: coords?.longitud || null,
      fecha: new Date().toISOString()
    };

    try {
      await sendReporte(payload);
      setMsg('✅ Reporte enviado correctamente');
      setCalle('');
      setDesc('');
      setExtra('');
      setFoto(null); // Clear the file input
    } catch (err) {
      console.error("Error sending report:", err);
      setMsg('❌ Ocurrió un error al enviar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Reportar barrera urbana</h2>
      {msg && <p aria-live="polite" style={{ color: msg.startsWith('✅') ? 'green' : 'crimson', marginTop: 8 }}>{msg}</p>}
      <form onSubmit={handleSubmit} aria-label="Formulario de reporte">
        <label>
          Calle*:
          <input
            type="text"
            placeholder="Calle"
            value={calle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCalle(e.target.value)}
            required
            aria-required="true"
          />
        </label>

        <label>
          Descripción*:
          <textarea
            placeholder="Descripción"
            value={desc}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            required
            rows={2}
            aria-required="true"
          />
        </label>

        <label>
          Información extra:
          <textarea
            placeholder="Información extra"
            value={extra}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExtra(e.target.value)}
            rows={1}
          />
        </label>

        <label>
          Imagen:
          <input
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFoto(e.target.files ? e.target.files[0] : null)}
          />
        </label>

        <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Enviando...' : 'Reportar'}
        </button>
      </form>
    </section>
  );
}