import React, { useState, useRef, useEffect } from "react";

type User = {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
  email: string;
  password: string;
  reportes: string[];
};

const getEdad = (fechaNacimiento: string) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

const LoginButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState<any>({});
  const [user, setUser] = useState<User | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el menú si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setShowRegister(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar usuario logueado
  useEffect(() => {
    const email = localStorage.getItem("loggedUser");
    if (email) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const found = users.find((u: User) => u.email === email);
      if (found) setUser(found);
    }
  }, []);

  // Maneja cambios en los formularios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Registro
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u: User) => u.email === form.email)) {
      alert("Ya existe un usuario con ese correo.");
      return;
    }
    const nuevoUsuario = { ...form, reportes: [] };
    users.push(nuevoUsuario);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedUser", form.email);
    setUser(nuevoUsuario);
    setOpen(false);
    setShowRegister(false);
  };

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u: User) => u.email === form.email && u.password === form.password);
    if (found) {
      localStorage.setItem("loggedUser", found.email);
      setUser(found);
      setOpen(false);
    } else {
      alert("Correo o contraseña incorrectos.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    setForm({});
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn-primary"
        type="button"
      >
        {user ? user.nombre : "Iniciar sesión"}
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
            minWidth: 220,
            padding: 12,
          }}
        >
          {user ? (
            <div>
              <div style={{ marginBottom: 8 }}>
                <b>{user.nombre} {user.apellidos}</b><br />
                Edad: {getEdad(user.fechaNacimiento)}<br />
                Género: {user.genero}<br />
                Email: {user.email}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Mis reportes:</b>
                <ul>
                  {user.reportes.length === 0 && <li>No hay reportes.</li>}
                  {user.reportes.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogout}>Cerrar sesión</button>
            </div>
          ) : showRegister ? (
            <form onSubmit={handleRegister}>
              <input name="nombre" placeholder="Nombre" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <input name="apellidos" placeholder="Apellidos" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <input name="fechaNacimiento" type="date" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <select name="genero" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }}>
                <option value="">Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <input name="email" type="email" placeholder="Correo electrónico" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <input name="password" type="password" placeholder="Contraseña" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <button className="btn-primary" type="submit" style={{ width: "100%", marginBottom: 6 }}>Registrarse</button>
              <button type="button" style={{ width: "100%" }} onClick={() => setShowRegister(false)}>Ya tengo cuenta</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <input name="email" type="email" placeholder="Correo electrónico" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <input name="password" type="password" placeholder="Contraseña" required onChange={handleChange} style={{ width: "100%", marginBottom: 6 }} />
              <button className="btn-primary" type="submit" style={{ width: "100%", marginBottom: 6 }}>Iniciar sesión</button>
              <button type="button" style={{ width: "100%" }} onClick={() => setShowRegister(true)}>Registrarse</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;