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
                Estado: ${rep.dificultad?.toUpperCase() || "TEMPORAL"}<br/>
                ${
                  rep.informaciónExtra
                    ? "📌 " + rep.informaciónExtra + "<br/>"
                    : ""
                }
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
          transform: sidebar.open ? "translateX(0)" : "translateX(100%)",
          // NUEVAS PROPIEDADES AÑADIDAS:
          maxHeight: "calc(100vh - 90px - 1.5rem - 10px)", // Altura del viewport - top - padding inferior - margen de seguridad
          overflowY: "auto",
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
              style={{
                width: "100%", 
                boxSizing: "border-box", 
                overflow: "hidden", 
                textOverflow: "ellipsis",
              }}
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
                // style={{
                //   padding: "0.5em 1em",
                //   borderRadius: 8,
                //   background: "#2aa198",
                //   color: "#fff",
                //   border: "none",
                //   fontWeight: 600,
                //   cursor: "pointer",
                // }}
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
          style={{ height: "calc(100vh - 100px)", width: "100vw", borderRadius: 10, overflow: "hidden" }}
          aria-label="Mapa de reportes"
        />
        {sidebar.open && <ReportSidebar />}
      </div>
    </section>
  );
}
