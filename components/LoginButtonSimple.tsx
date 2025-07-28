import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';

// Versión simplificada sin contexto para debuggear
const LoginButtonSimple: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el menú si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}
        type="button"
      >
        Iniciar sesión
      </button>
      
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "white",
            border: "1px solid #e1e5e9",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: "280px",
            padding: "20px"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>¡Únete a Komuni!</h4>
            <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
              Inicia sesión para reportar barreras y mejorar la accesibilidad
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link 
              to="/login" 
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "500",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white"
              }}
              onClick={() => setOpen(false)}
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "500",
                background: "#f8f9fa",
                color: "#333",
                border: "1px solid #e1e5e9"
              }}
              onClick={() => setOpen(false)}
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginButtonSimple;
