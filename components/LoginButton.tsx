import React, { useState, useRef, useEffect } from "react";

type LoginButtonProps = {
  onLogin?: () => void;
  onRegister?: () => void;
  label?: string;
};

const LoginButton: React.FC<LoginButtonProps> = ({
  onLogin,
  onRegister,
  label = "Iniciar sesión",
}) => {
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
        className="btn-primary"
        type="button"
        style={{
          transition: "background 0.2s",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 100,
            minWidth: 140,
          }}
        >
          <button
            className="btn-primary"
            style={{
              width: "100%",
              border: "none",
              background: "none",
              color: "#333",
              padding: "10px 16px",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => {
              setOpen(false);
              onLogin && onLogin();
            }}
          >
            Iniciar sesión
          </button>
          <button
            className="btn-primary"
            style={{
              width: "100%",
              border: "none",
              background: "none",
              color: "#333",
              padding: "10px 16px",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => {
              setOpen(false);
              onRegister && onRegister();
            }}
          >
            Registrarse
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginButton;