// Mapa.tsx
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import L, { Map, Marker, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
// Importa tu nuevo archivo CSS
import "./Mapa.css"; // Asegúrate de que la ruta sea correcta

// Import all necessary types and functions from your Firebase-integrated API
import {
  sendReporte,
  getReportes,
  updateReporte as apiUpdateReporte, // Alias to avoid name clash
  deleteReporte as apiDeleteReporte, // Alias to avoid name clash
  type Reporte, // Import the Reporte interface from api.ts
  type SendReportData, // Import the input type for sending new reports
  type UpdateReportData, // Import the input type for updating reports
} from "../services/api.ts";

// Interfaz para el estado de la barra lateral
interface SidebarState {
  open: boolean;
  lat: number | null;
  lng: number | null;
  calle: string;
  modo: "nuevo" | "editar";
  reporte: Reporte | null; // Use the imported Reporte interface
}

function getIconByDificultad(
  nivel: "permanente" | "temporal" | "solucionado" | string
): Icon {
  const color =
    nivel === "permanente"
      ? "red"
      : nivel === "temporal"
      ? "orange"
      : nivel === "solucionado"
      ? "green"
      : "blue"; // Default to blue for the temporary marker

  return L.icon({
    iconUrl: `/icons/marker-${color}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

function getEmojiByDificultad(
  nivel: "permanente" | "temporal" | "solucionado" | string
): string {
  if (nivel === "permanente") return "🔴";
  if (nivel === "temporal") return "🟡";
  if (nivel === "solucionado") return "🟢";
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
  const [reportes, setReportes] = useState<Reporte[]>([]); // Use the imported Reporte
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
  // tempMarker will now only manage the NEW report marker
  const [tempNewReportMarker, setTempNewReportMarker] = useState<Marker | null>(
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

        const userLocationMarker = L.circleMarker([latitude, longitude], {
          radius: 10,
          color: "#2aa198",
          fillColor: "#2aa198",
          fillOpacity: 0.5,
        }).addTo(mapRef.current as Map);

        // Set a timeout to remove *this specific* marker
        setTimeout(() => {
          mapRef.current?.removeLayer(userLocationMarker);
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
      modo: "nuevo", // Ensure it's 'nuevo' for new reports
      reporte: null,
    });
  },
  []);

  // Consolidated useEffect for handling the temporary marker for NEW reports
  useEffect(() => {
    // If there's a previous temporary marker, remove it first
    if (tempNewReportMarker) {
      mapRef.current?.removeLayer(tempNewReportMarker);
      setTempNewReportMarker(null);
    }

    // If the sidebar is open in 'nuevo' mode and has coordinates, create a new temporary marker
    if (
      sidebar.open &&
      sidebar.modo === "nuevo" &&
      sidebar.lat !== null &&
      sidebar.lng !== null &&
      mapRef.current
    ) {
      const newMarker = L.marker([sidebar.lat, sidebar.lng], {
        icon: getIconByDificultad("blue"), // Use a blue icon for the temporary marker
        interactive: false, // The marker should not be clickable
        zIndexOffset: 2000, // Ensure it's above other markers
      }).addTo(mapRef.current as Map);

      setTempNewReportMarker(newMarker);
    }

    // Cleanup function: This will remove the marker when component unmounts
    // or when dependencies change and the condition for creation is no longer met.
    return () => {
      if (tempNewReportMarker && mapRef.current) {
        mapRef.current.removeLayer(tempNewReportMarker);
        setTempNewReportMarker(null); // Clear state on cleanup
      }
    };
  }, [sidebar.open, sidebar.lat, sidebar.lng, sidebar.modo, mapRef.current]);

  function openEditSidebar(rep: Reporte): void {
    // Use imported Reporte
    setSidebar({
      open: true,
      lat: rep.latitud,
      lng: rep.longitud,
      calle: rep.calle || "",
      modo: "editar",
      reporte: rep,
    });
  }

  // Use the aliased updateReporte from api.ts
  const updateReporte = useCallback(
    async (
      id: string,
      data: UpdateReportData // Use the correct type for update input
    ): Promise<void> => {
      try {
        const updated = await apiUpdateReporte(id, data); // Call the Firebase-integrated function
        setReportes(
          (reps) => reps.map((r) => (r.id === id ? updated : r)) // Update state with the returned updated report
        );
      } catch (error) {
        console.error("Error updating report:", error);
        alert("No se pudo actualizar el reporte.");
      }
    },
    []
  ); // Dependencies can be empty if apiUpdateReporte is stable

  // Use the aliased deleteReporte from api.ts
  const deleteReporte = useCallback(async (id: string): Promise<void> => {
    try {
      await apiDeleteReporte(id); // Call the Firebase-integrated function
      setReportes((reps) => reps.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("No se pudo borrar el reporte.");
    }
  }, []); // Dependencies can be empty if apiDeleteReporte is stable

  useEffect(() => {
    const map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    }).setView([41.1189, 1.2459], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Call the Firebase-integrated getReportes
    getReportes()
      .then((res: Reporte[]) => setReportes(res)) // getReportes now returns Reporte[] directly, no .data
      .catch((error: any) => console.error("Error loading reports:", error))
      .finally(() => setLoading(false));

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
    };
  }, [onMapClick]); // Added onMapClick as a dependency

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
    markersRef.current = [];

    reportes.forEach((rep) => {
      if (
        rep.latitud !== null &&
        typeof rep.latitud === "number" &&
        !isNaN(rep.latitud) &&
        rep.longitud !== null &&
        typeof rep.longitud === "number" &&
        !isNaN(rep.longitud)
      ) {
        if (mapRef.current) {
          const icono = getIconByDificultad(rep.dificultad || "temporal");
          const emoji = getEmojiByDificultad(rep.dificultad || "temporal");
          const incidenciaEmoji = getIncidenciaEmoji(rep.descripción || "");
          let imagenHtml = "";
          if (rep.imagen) {
            let imgSrc = rep.imagen;
            imagenHtml = `<div class="popup-image-container"><img src='${imgSrc}' alt="Imagen de la incidencia" class="popup-image" /></div>`;
          }

          const comentarios = Array.isArray(rep.comentarios)
            ? rep.comentarios
            : [];
          const popupId = `popup-${rep.id}`;
          const popupHtml = `
            <div class="custom-popup-content">
              <button id="${popupId}-close" class="popup-close-btn">❌</button>
              <div class="popup-title-section">
                ${emoji} ${incidenciaEmoji}
              </div>
              <strong class="popup-street-name">${
                rep.calle || "Ubicación sin calle"
              }</strong><br/>
              <span class="popup-details">
                📝 ${rep.descripción}<br/>
                Estado: ${rep.dificultad?.toUpperCase() || "TEMPORAL"}<br/>
                ${
                  rep.informaciónExtra
                    ? "📌 " + rep.informaciónExtra + "<br/>"
                    : ""
                }
                ${imagenHtml}
              </span>
              <hr style="margin:0.3em 0"/>
              <div id="${popupId}-comentarios" class="popup-comments">
                <strong>Comentarios:</strong>
                <ul>
                  ${
                    comentarios.map((c) => `<li>${c}</li>`).join("") ||
                    "<li style='color:#888'>Sin comentarios</li>"
                  }
                </ul>
              </div>
              <form id="${popupId}-form" class="popup-comment-form">
                <input type="text" name="comentario" placeholder="Agregar comentario..." class="popup-comment-input" />
                <button type="submit" class="popup-comment-submit-btn">Enviar</button>
              </form>
              <div class="popup-actions">
                <button id="${popupId}-edit" class="popup-edit-btn">Editar</button>
                <button id="${popupId}-delete" class="popup-delete-btn">Borrar</button>
              </div>
            </div>
          `;

          const marker = L.marker([rep.latitud, rep.longitud], { icon: icono })
            .addTo(mapRef.current)
            .bindPopup(popupHtml, {
              maxWidth: 400,
              minWidth: 140,
              closeButton: false,
              className: 'custom-leaflet-popup' // Clase para el popup de Leaflet
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
                // Use the imported updateReporte for comments
                await updateReporte(rep.id, {
                  comentarios: nuevosComentarios,
                });
                input.value = "";
              };
            }
            const delBtn = document.getElementById(`${popupId}-delete`);
            if (delBtn) {
              delBtn.onclick = async () => {
                if (
                  window.confirm("¿Seguro que quieres borrar este reporte?")
                ) {
                  await deleteReporte(rep.id);
                  mapRef.current?.closePopup();
                }
              };
            }
          });

          markersRef.current.push(marker);
        }
      } else {
        console.warn(
          `Reporte con ID ${rep.id || "N/A"} tiene coordenadas inválidas: ` +
            `Latitud: ${rep.latitud}, Longitud: ${rep.longitud}. No se añadirá marcador.`
        );
      }
    });
  }, [reportes, updateReporte, deleteReporte, openEditSidebar]);

  function ReportSidebar() {
    const editando = sidebar.modo === "editar";
    const rep = sidebar.reporte; // This is of type Reporte (imagen is string | null)
    const [tipo, setTipo] = useState<Reporte["tipo"]>(
      editando ? rep?.tipo || "escalera" : "escalera"
    );
    const [dificultad, setDificultad] = useState<Reporte["dificultad"]>(
      editando ? rep?.dificultad || "temporal" : "temporal"
    );
    const [desc, setDesc] = useState<string>(
      editando ? rep?.descripción || "" : ""
    );
    const [foto, setFoto] = useState<File | null | undefined>(undefined); // This holds the File object
    const [sending, setSending] = useState<boolean>(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
      e.preventDefault();

      if (sidebar.lat === null || sidebar.lng === null) {
        console.error("Intento de enviar un reporte sin coordenadas.");
        alert("❌ Error: No se ha podido determinar la ubicación del reporte.");
        return;
      }

      setSending(true);

      if (editando && rep) {
        const updatePayload: UpdateReportData = {
          calle: sidebar.calle,
          descripción: desc.trim() || `Incidencia de tipo ${tipo}`,
          tipo,
          dificultad,
          comentarios: rep.comentarios || [],
        };

        if (foto) {
          updatePayload.imagen = foto;
        } else if (foto === null) {
          updatePayload.imagen = null;
        }

        try {
          await updateReporte(rep.id, updatePayload);
        } catch (error) {
          console.error("Error updating report:", error);
          alert("❌ No se pudo actualizar el reporte.");
        }
      } else {
        const newReportPayload: SendReportData = {
          calle: sidebar.calle,
          descripción: desc.trim() || `Incidencia de tipo ${tipo}`,
          informaciónExtra: "",
          latitud: sidebar.lat,
          longitud: sidebar.lng,
          fecha: new Date().toISOString(),
          tipo,
          dificultad,
          comentarios: [],
          imagen: foto || null,
        };

        try {
          const addedReport = await sendReporte(newReportPayload);
          setReportes((prev) => [...prev, addedReport]);
        } catch (error) {
          console.error("Error saving new report:", error);
          alert("❌ No se pudo guardar el reporte.");
        }
      }

      setSending(false);
      setSidebar({
        open: false,
        lat: null,
        lng: null,
        calle: "",
        modo: "nuevo",
        reporte: null,
      });
    }

    return (
      <aside
        className={`report-sidebar ${sidebar.open ? "sidebar-open" : "sidebar-closed"}`}
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
          className="sidebar-close-btn"
          aria-label="Cerrar formulario"
        >
          ✖️
        </button>
        <h3 className="sidebar-title">
          {editando ? "Editar reporte" : "Nuevo reporte"}
        </h3>
        <form onSubmit={handleSubmit} className="report-form">
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
            Estado:
            <select
              value={dificultad}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setDificultad(e.target.value as Reporte["dificultad"])
              }
              required
            >
              <option value="solucionado">🟢 Solucionado</option>
              <option value="temporal">🟡 Temporal</option>
              <option value="permanente">🔴 Permanente</option>
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
              className="report-form-file-input"
            />
          </label>
          <button type="submit" disabled={sending} className="report-form-submit-btn">
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
      <div className="textalign" >
        <h1>Mapa de accesibilidad</h1>
        <div className="juntar">
          <div className="search-controls">
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
              <p>Usa el buscador para localizar una dirección.</p>
              <input
                type="text"
                placeholder="Buscar dirección o ciudad..."
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                className="search-input"
                aria-label="Buscar localización"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="search-btn"
              >
                {searchLoading ? "Buscando..." : "Buscar"}
              </button>
              <button
                type="button"
                onClick={centerOnUser}
                className="location-btn"
              >
                📍 Mi ubicación
              </button>
            </form>
          </div>
          <div className="card map-info-card">
            <strong>Guía de usuario:</strong>
            <ul>
              🖱️ Haz clic en el mapa para añadir un nuevo reporte. <br />
              📝 Haz clic en un marcador para ver detalles o comentar. <br />❌
              Pulsa la equis en el popup para cerrarlo.
            </ul>
          </div>
        </div>
        {loading && <p className="loading-message">Cargando reportes...</p>}
      </div>
      <div className="map-wrapper">
        <div
          id="map"
          className="map-container"
          aria-label="Mapa de reportes"
        />
        {sidebar.open && <ReportSidebar />}
      </div>
    </section>
  );
}