import { useRef, useState, type FormEvent } from "react";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<string>("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setMsg("");
    const data = new FormData(formRef.current!);
    const nombre = data.get("nombre");
    const email = data.get("email");
    const asunto = data.get("asunto") || "Contacto Komuni";
    const mensaje = data.get("mensaje");

    // Aquí hemos de poner la url de nuestra base de datos en Firebase
    try {
      const res = await fetch("https://komuni-app-default-rtdb.europe-west1.firebasedatabase.app/contactpage.json", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          asunto,
          mensaje,
        }),
      });
      if (res.ok) {
        setMsg("¡Mensaje enviado correctamente! Te responderemos pronto.");
        formRef.current?.reset();
      } else {
        setMsg("No se pudo enviar el mensaje. Inténtalo más tarde.");
      }
    } catch {
      setMsg("No se pudo enviar el mensaje. Inténtalo más tarde.");
    }
    setSending(false);
  }

  return (
    <section style={{ maxWidth: 600, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <div
        style={{
          background: "linear-gradient(90deg, #e0f7fa 0%, #fafdff 100%)",
          borderRadius: 20,
          boxShadow: "0 8px 32px #2aa19822",
          padding: "2.5rem 2rem 2rem 2rem",
          marginBottom: 36,
          textAlign: "center",
          position: "relative"
        }}
      >
        <img
          src="/icons/logo-solo.png"
          alt="Komuni"
          style={{
            width: 70,
            marginBottom: 12,
            filter: "drop-shadow(0 2px 8px #2aa19833)"
          }}
        />
        <h2 style={{
          color: "#2aa198",
          margin: "0 0 0.5em 0",
          fontWeight: 900,
          fontSize: "2.2rem",
          letterSpacing: "0.03em"
        }}>
          Contacto
        </h2>
        <p style={{
          color: "#20706e",
          fontSize: "1.18rem",
          marginBottom: 0,
          fontWeight: 500,
          lineHeight: 1.6
        }}>
          ¿Tienes dudas, sugerencias o quieres colaborar?<br />
          Escríbenos y te responderemos lo antes posible.
        </p>
      </div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px #2aa19822",
          padding: "2.2rem 2rem 2rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxWidth: 440,
          margin: "0 auto"
        }}
      >
        <label style={{ fontWeight: 700, color: "#2aa198", fontSize: "1.07rem" }}>
          Nombre:
          <input
            type="text"
            name="nombre"
            required
             placeholder="Introduce tu nombre"
            style={{
              width: "100%",
              marginTop: 7,
              padding: "0.85em",
              borderRadius: 10,
              border: "1.5px solid #e0e0e0",
              fontSize: "1.08rem",
              background: "#fafdff",
              boxShadow: "0 1px 2px #2aa19811"
            }}
          />
        </label>
        <label style={{ fontWeight: 700, color: "#2aa198", fontSize: "1.07rem" }}>
          Email:
          <input
            type="email"
            name="email"
            required
             placeholder="Introduce tu correo elecrónico"
            style={{
              width: "100%",
              marginTop: 7,
              padding: "0.85em",
              borderRadius: 10,
              border: "1.5px solid #e0e0e0",
              fontSize: "1.08rem",
              background: "#fafdff",
              boxShadow: "0 1px 2px #2aa19811"
            }}
          />
        </label>
        <label style={{ fontWeight: 700, color: "#2aa198", fontSize: "1.07rem" }}>
          Asunto:
          <input
            type="text"
            name="asunto"
            placeholder="Motivo del mensaje"
            style={{
              width: "100%",
              marginTop: 7,
              padding: "0.85em",
              borderRadius: 10,
              border: "1.5px solid #e0e0e0",
              fontSize: "1.08rem",
              background: "#fafdff",
              boxShadow: "0 1px 2px #2aa19811"
            }}
          />
        </label>
        <label style={{ fontWeight: 700, color: "#2aa198", fontSize: "1.07rem" }}>
          Mensaje:
          <textarea
            name="mensaje"
            rows={5}
            required
             placeholder="Escribe tu mensaje aquí..."
            style={{
              width: "100%",
              marginTop: 7,
              padding: "0.85em",
              borderRadius: 10,
              border: "1.5px solid #e0e0e0",
              fontSize: "1.08rem",
              background: "#fafdff",
              resize: "vertical",
              boxShadow: "0 1px 2px #2aa19811"
            }}
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          style={{
            background: "linear-gradient(90deg, #2aa198, #3ecfcf)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "1rem 2.2rem",
            fontSize: "1.18rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 12px #2aa19822",
            letterSpacing: "0.04em",
            marginTop: 12,
            transition: "background 0.2s"
          }}
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
        {msg && <p style={{ color: msg.startsWith("¡Mensaje") ? "#2aa198" : "#e53935", marginTop: 8, textAlign: "center", fontWeight: 600 }}>{msg}</p>}
      </form>
      <div style={{
        marginTop: 38,
        textAlign: "center",
        color: "#888",
        fontSize: "1.09em",
        fontWeight: 500
      }}>
        O escríbenos directamente a{" "}
        <a href="mailto:komunitgn@gmail.com" style={{
          color: "#2aa198",
          fontWeight: 700,
          textDecoration: "underline"
        }}>
          komunitgn@gmail.com
        </a>
      </div>
    </section>
  );
}
