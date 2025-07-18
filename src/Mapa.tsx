import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import L, { Map, Marker, CircleMarker, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { sendReporte, getReportes } from "../services/api.ts"; // Asegúrate de que 'api.ts' maneje las llamadas correctamente
import axios from "axios";

// Interfaz para un reporte
interface Reporte {
  id: string;
  calle: string;
  descripción: string;
  informaciónExtra?: string;
  imagen?: string;
  latitud: number;
  longitud: number;
  fecha: string;
  tipo?:
    | "escalera"
    | "rampa"
    | "bache"
    | "acera"
    | "calle"
    | "obstaculo"
    | "cruce"
    | "señal";
  dificultad?: "baja" | "media" | "alta";
  comentarios?: string[];
}

// Interfaz para el estado de la barra lateral
interface SidebarState {
  open: boolean;
  lat: number | null;
  lng: number | null;
  calle: string;
  modo: "nuevo" | "editar";
  reporte: Reporte | null;
}

function getIconByDificultad(nivel: "alta" | "media" | "baja" | string): Icon {
  const color =
    nivel === "alta"
      ? "red"
      : nivel === "media"
      ? "orange"
      : nivel === "baja"
      ? "green"
      : "blue";

  return L.icon({
    iconUrl: `/icons/marker-${color}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

function getEmojiByDificultad(
  nivel: "alta" | "media" | "baja" | string
): string {
  if (nivel === "alta") return "🔴";
  if (nivel === "media") return "🟡";
  if (nivel === "baja") return "🟢";
  return "🔵";
}

function getIncidenciaEmoji(descripcion: string = ""): string {
  const desc = descripcion.toLowerCase();
  if (
    desc.includes("escalera") ||
    desc.includes("escalón") ||
    desc.includes("escalon")
  )
    return "🪜";
  if (desc.includes("rampa")) return "♿";
  if (
    desc.includes("bache") ||
    desc.includes("agujero") ||
    desc.includes("socavón") ||
    desc.includes("socavon")
  )
    return "🕳️";
  if (
    desc.includes("acera rota") ||
    desc.includes("acera") ||
    desc.includes("vereda")
  )
    return "🧱";
  if (
    desc.includes("calle rota") ||
    desc.includes("calle") ||
    desc.includes("pavimento")
  )
    return "🛣️";
  if (
    desc.includes("obstáculo") ||
    desc.includes("obstaculo") ||
    desc.includes("barrera")
  )
    return "🚧";
  if (desc.includes("paso de peatones") || desc.includes("cruce")) return "🚸";
  if (
    desc.includes("señal") ||
    desc.includes("señalización") ||
    desc.includes("señalizacion")
  )
    return "🚦";
  return "";
}

function generateId(): string {
  return Math.random().toString(16).slice(2, 6);
}

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

export default function Mapa() {
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [sidebar, setSidebar] = useState<SidebarState>({
    open: false,
    lat: null,
    lng: null,
    calle: "",
    modo: "nuevo",
    reporte: null,
  });
  const [tempMarker, setTempMarker] = useState<Marker | CircleMarker | null>(
    null
  );

  function centerOnUser(): void {
    if (!mapRef.current) return;
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.setView([latitude, longitude], 16, { animate: true });
        const marker = L.circleMarker([latitude, longitude], {
          radius: 10,
          color: "#2aa198",
          fillColor: "#2aa198",
          fillOpacity: 0.5,
        }).addTo(mapRef.current as Map);
        setTempMarker(marker); // Guardar el marcador temporal
        setTimeout(() => {
          mapRef.current?.removeLayer(marker);
          setTempMarker(null);
        }, 3000);
      },
      () => alert("No se pudo obtener tu ubicación")
    );
  }

  async function handleSearch(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          search
        )}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 16, {
          animate: true,
        });
      } else {
        alert("No se encontró la localización.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("Error buscando la localización.");
    }
    setSearchLoading(false);
  }

  const onMapClick = useCallback(async function (
    e: L.LeafletMouseEvent
  ): Promise<void> {
    const { lat, lng } = e.latlng;
    let calleDetectada = "";
    try {
      calleDetectada = await getStreetName(lat, lng);
    } catch (error) {
      console.error("Error getting street name on map click:", error);
      calleDetectada = "";
    }
    setSidebar({
      open: true,
      lat,
      lng,
      calle: calleDetectada,
      modo: "nuevo",
      reporte: null,
    });
  },
  []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (tempMarker) {
      mapRef.current.removeLayer(tempMarker);
      setTempMarker(null);
    }

    if (sidebar.open && sidebar.lat && sidebar.lng) {
      const marker = L.marker([sidebar.lat, sidebar.lng], {
        icon: L.icon({
          iconUrl: "/icons/marker-blue.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
          iconRetinaUrl: "/icons/marker-blue.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        }),
        interactive: false,
      }).addTo(mapRef.current);
      setTempMarker(marker);
    }
    return () => {
      if (tempMarker && mapRef.current) {
        mapRef.current.removeLayer(tempMarker);
        setTempMarker(null);
      }
    };
  }, [sidebar.open, sidebar.lat, sidebar.lng]);

  function openEditSidebar(rep: Reporte): void {
    setSidebar({
      open: true,
      lat: rep.latitud,
      lng: rep.longitud,
      calle: rep.calle || "",
      modo: "editar",
      reporte: rep,
    });
    if (mapRef.current) {
      if (tempMarker) {
        mapRef.current.removeLayer(tempMarker);
      }
      const marker = L.marker([rep.latitud, rep.longitud], {
        icon: L.icon({
          iconUrl: "/icons/marker-blue.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
          iconRetinaUrl: "/icons/marker-blue.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        }),
        interactive: false,
      }).addTo(mapRef.current);
      setTempMarker(marker);
    }
  }

  useEffect(() => {
    if (!sidebar.open && tempMarker && mapRef.current) {
      mapRef.current.removeLayer(tempMarker);
      setTempMarker(null);
    }
  }, [sidebar.open, tempMarker]);

  async function updateReporte(
    id: string,
    data: Partial<Reporte>
  ): Promise<void> {
    try {
      await axios.patch(`http://localhost:4000/reportes/${id}`, data);
      setReportes((reps) =>
        reps.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
    } catch (error) {
      console.error("Error updating report:", error);
      alert("No se pudo actualizar el reporte.");
    }
  }

  async function deleteReporte(id: string): Promise<void> {
    try {
      await axios.delete(`http://localhost:4000/reportes/${id}`);
      setReportes((reps) => reps.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("No se pudo borrar el reporte.");
    }
  }

  useEffect(() => {
    const map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    }).setView([41.1189, 1.2459], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    getReportes()
      .then((res: any) => setReportes(res.data))
      .catch((error: any) => console.error("Error loading reports:", error))
      .finally(() => setLoading(false));

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
    markersRef.current = [];

    reportes.forEach((rep) => {
      if (!rep.latitud || !rep.longitud) return;

      if (mapRef.current) {
        const icono = getIconByDificultad(rep.dificultad || "media");
        const emoji = getEmojiByDificultad(rep.dificultad || "media");
        const incidenciaEmoji = getIncidenciaEmoji(rep.descripción || "");
        let imagenHtml = "";
        if (rep.imagen) {
          let imgSrc = rep.imagen;
          if (rep.imagen.startsWith("data:image/")) {
            imgSrc = rep.imagen;
          } else if (rep.imagen.startsWith("http")) {
            imgSrc = rep.imagen;
          } else {
            imgSrc = `/uploads/${rep.imagen}`;
          }
          imagenHtml = `<div style="margin:6px 0; text-align:center;"><img src='${imgSrc}' alt="Imagen de la incidencia" style="max-width:100%;max-height:60px;border-radius:6px;box-shadow:0 1px 4px #0002;object-fit:contain;background:#eee;display:block;margin:0 auto;" /></div>`;
        }

        const comentarios = Array.isArray(rep.comentarios)
          ? rep.comentarios
          : [];
        const popupId = `popup-${rep.id}`;
        const popupHtml = `
      <div style="position:relative;width:auto;max-width:98vw;min-width:140px;min-height:80px;padding-bottom:8px;">
        <button id="${popupId}-close" style="position:absolute;top:2px;right:2px;background:none;border:none;font-size:1rem;cursor:pointer;color:#888;">❌</button>
        <div style="font-size:1.1rem;line-height:1.1;margin-bottom:0.15em;">
          ${emoji} ${incidenciaEmoji}
        </div>
        <strong style="font-size:0.98rem;">${
          rep.calle || "Ubicación sin calle"
        }</strong><br/>
        <span style="font-size:0.91rem;">
          📝 ${rep.descripción}<br/>
          Nivel: ${rep.dificultad?.toUpperCase() || "MEDIA"}<br/>
          ${rep.informaciónExtra ? "📌 " + rep.informaciónExtra + "<br/>" : ""}
          ${imagenHtml}
        </span>
        <hr style="margin:0.3em 0"/>
        <div id="${popupId}-comentarios" style="font-size:0.88em;">
          <strong>Comentarios:</strong>
          <ul style="padding-left:1em;margin:0;">
            ${
              comentarios.map((c) => `<li>${c}</li>`).join("") ||
              "<li style='color:#888'>Sin comentarios</li>"
            }
          </ul>
        </div>
        <form id="${popupId}-form" style="margin-top:0.2em;display:flex;gap:0.2em;">
          <input type="text" name="comentario" placeholder="Agregar comentario..." style="flex:1;padding:0.15em;border-radius:5px;border:1px solid #ccc;font-size:0.88em;" />
          <button type="submit" style="padding:0.15em 0.5em;border-radius:5px;background:#2aa198;color:#fff;border:none;cursor:pointer;">Enviar</button>
        </form>
        <div style="margin-top:0.3em;display:flex;gap:0.3em;">
          <button id="${popupId}-edit" style="padding:0.15em 0.5em;border-radius:5px;background:#ffb300;color:#fff;border:none;cursor:pointer;">Editar</button>
          <button id="${popupId}-delete" style="padding:0.15em 0.5em;border-radius:5px;background:#e53935;color:#fff;border:none;cursor:pointer;">Borrar</button>
        </div>
      </div>
    `;

        const marker = L.marker([rep.latitud, rep.longitud], { icon: icono })
          .addTo(mapRef.current)
          .bindPopup(popupHtml, {
            maxWidth: 400,
            minWidth: 140,
            closeButton: false,
          } as L.PopupOptions);

        marker.on("popupopen", () => {
          const closeBtn = document.getElementById(`${popupId}-close`);
          if (closeBtn) {
            closeBtn.onclick = () => {
              mapRef.current?.closePopup();
            };
          }
          const editBtn = document.getElementById(`${popupId}-edit`);
          if (editBtn) {
            editBtn.onclick = () => {
              mapRef.current?.closePopup();
              openEditSidebar(rep);
            };
          }
          const form = document.getElementById(
            `${popupId}-form`
          ) as HTMLFormElement;
          if (form) {
            form.onsubmit = async (evt) => {
              evt.preventDefault();
              const input = form.comentario as HTMLInputElement;
              const comentario = input.value.trim();
              if (!comentario) return;
              const nuevosComentarios = [
                ...(rep.comentarios || []),
                comentario,
              ];
              await updateReporte(rep.id, { comentarios: nuevosComentarios });
              input.value = "";
            };
          }
          const delBtn = document.getElementById(`${popupId}-delete`);
          if (delBtn) {
            delBtn.onclick = async () => {
              if (window.confirm("¿Seguro que quieres borrar este reporte?")) {
                await deleteReporte(rep.id);
                mapRef.current?.closePopup();
              }
            };
          }
        });

        markersRef.current.push(marker);
      }
    });
  }, [reportes, updateReporte, deleteReporte, openEditSidebar]);

  function ReportSidebar() {
    const editando = sidebar.modo === "editar";
    const rep = sidebar.reporte;
    const [tipo, setTipo] = useState<Reporte["tipo"]>(
      editando ? rep?.tipo || "escalera" : "escalera"
    );
    const [dificultad, setDificultad] = useState<Reporte["dificultad"]>(
      editando ? rep?.dificultad || "media" : "media"
    );
    const [desc, setDesc] = useState<string>(
      editando ? rep?.descripción || "" : ""
    );
    const [foto, setFoto] = useState<File | null>(null);
    const [sending, setSending] = useState<boolean>(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
      e.preventDefault();
      setSending(true);
      let imagenBase64: string | undefined = editando ? rep?.imagen : undefined;
      if (foto) {
        imagenBase64 = await new Promise<string | undefined>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt: ProgressEvent<FileReader>) =>
            resolve(evt.target?.result as string);
          reader.onerror = () => {
            console.error("Error reading file.");
            resolve(undefined);
          };
          reader.readAsDataURL(foto);
        });
      }
      if (editando && rep) {
        await updateReporte(rep.id, {
          tipo,
          dificultad,
          descripción: desc.trim() || `Incidencia de tipo ${tipo}`,
          imagen: imagenBase64,
          calle: sidebar.calle,
        });
      } else {
        const nuevoReporte: Reporte = {
          id: generateId(),
          calle: sidebar.calle,
          descripción: desc.trim() || `Incidencia de tipo ${tipo}`,
          informaciónExtra: "",
          tipo,
          dificultad,
          imagen: imagenBase64,
          latitud: sidebar.lat as number,
          longitud: sidebar.lng as number,
          fecha: new Date().toISOString(),
          comentarios: [],
        };
        try {
          await sendReporte(nuevoReporte);
          setReportes((prev) => [...prev, nuevoReporte]);
        } catch (error) {
          console.error("Error saving new report:", error);
          alert("❌ No se pudo guardar el reporte.");
        }
      }
      setSidebar({
        open: false,
        lat: null,
        lng: null,
        calle: "",
        modo: "nuevo",
        reporte: null,
      });
      setSending(false);
    }

    return (
      <aside
        style={{
          position: "fixed",
          top: 90,
          right: 0,
          width: 320,
          maxWidth: "98vw",
          background: "#fff",
          boxShadow: "0 2px 16px #0002",
          borderLeft: "2px solid #2aa198",
          zIndex: 2000,
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          borderRadius: "12px 0 0 12px",
          minHeight: 320,
          transition: "transform 0.2s",
        }}
      >
        <button
          onClick={() =>
            setSidebar({
              open: false,
              lat: null,
              lng: null,
              calle: "",
              modo: "nuevo",
              reporte: null,
            })
          }
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#888",
            cursor: "pointer",
          }}
          aria-label="Cerrar formulario"
        >
          ✖️
        </button>
        <h3 style={{ marginTop: 0, color: "#2aa198" }}>
          {editando ? "Editar reporte" : "Nuevo reporte"}
        </h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label>
            Tipo de barrera:
            <select
              value={tipo}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setTipo(e.target.value as Reporte["tipo"])
              }
              required
            >
              <option value="escalera">🪜 Escalera</option>
              <option value="rampa">♿ Rampa</option>
              <option value="bache">🕳️ Bache</option>
              <option value="acera">🧱 Acera rota</option>
              <option value="calle">🛣️ Calle rota</option>
              <option value="obstaculo">🚧 Obstáculo</option>
              <option value="cruce">🚸 Paso de peatones</option>
              <option value="señal">🚦 Señalización</option>
            </select>
          </label>
          <label>
            Nivel:
            <select
              value={dificultad}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setDificultad(e.target.value as Reporte["dificultad"])
              }
              required
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </label>
          <label>
            Descripción:
            <input
              type="text"
              value={desc}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDesc(e.target.value)
              }
              placeholder="¿Qué ocurre?"
              required
            />
          </label>
          <label>
            Calle detectada:
            <input type="text" value={sidebar.calle || ""} readOnly />
          </label>
          <label>
            Imagen (opcional):
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFoto(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>
          <button type="submit" disabled={sending} style={{ marginTop: 10 }}>
            {sending
              ? editando
                ? "Guardando..."
                : "Enviando..."
              : editando
              ? "Guardar cambios"
              : "Reportar"}
          </button>
        </form>
      </aside>
    );
  }

  return (
    <section>
      <div className="textalign">
        <h1>Mapa de accesibilidad</h1>
        <div className="juntar">
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
            <p>Usa el buscador para localizar una dirección.</p>

            <input
              type="text"
              placeholder="Buscar dirección o ciudad..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              style={{
                padding: "0.5em 0.8em",
                borderRadius: 8,
                border: "1.5px solid #e0e0e0",
                fontSize: "1rem",
                minWidth: 180,
              }}
              aria-label="Buscar localización"
            />
            <button
              type="submit"
              disabled={searchLoading}
              style={{ padding: "0.5em 1em", borderRadius: 8 }}
            >
              {searchLoading ? "Buscando..." : "Buscar"}
            </button>
            <button
              type="button"
              onClick={centerOnUser}
              style={{
                padding: "0.5em 1em",
                borderRadius: 8,
                background: "#2aa198",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📍 Mi ubicación
            </button>
          </form>
        </div>
        <div
          className="card"
          style={{
            marginBottom: 18,
            background: "#fafdff",
            border: "1.5px solid #e0e0e0",
            fontSize: "1.04rem",
            lineHeight: 1.7,
            color: "#20706e",
          }}
        >
          <strong>Guía de usuario:</strong>
          <ul style={{ margin: "0.7em 0 0 1.2em", padding: 0 }}>
            🖱️ Haz clic en el mapa para añadir un nuevo reporte. <br />
            📝 Haz clic en un marcador para ver detalles o comentar. <br />❌
            Pulsa la equis en el popup para cerrarlo.
          </ul>
        </div>
</div>
        {loading && <p style={{ color: "#888" }}>Cargando reportes...</p>}
      </div>
      <div style={{ position: "relative" }}>
        <div
          id="map"
          style={{ height: "60vh", borderRadius: 10, overflow: "hidden" }}
          aria-label="Mapa de reportes"
        />
        {sidebar.open && <ReportSidebar />}
      </div>
    </section>
  );
}
