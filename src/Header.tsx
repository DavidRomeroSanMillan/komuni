import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginButton from "../components/LoginButtonLocalStorage"; // Importa el LoginButton con localStorage


// Asegúrate de que tu App.css esté importado en algún lugar de tu proyecto
// que afecte a este componente, por ejemplo, en tu archivo principal index.tsx o App.tsx.

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Nuevo estado para el menú móvil

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2); // Ajusta el umbral según sea necesario
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Efecto para controlar el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    } else {
      document.body.style.overflow = 'unset'; // Permite el scroll del fondo
    }
  }, [isMenuOpen]);

  return (
    <>
      <div
        className={`header${scrolled ? " header--scrolled" : ""}`}
        style={{ padding: 1 }}
      >
        <div className="topbar">
          <h1 className="logo">
            <Link to="/" onClick={() => setIsMenuOpen(false)}> {/* Cierra el menú al hacer clic en el logo */}
              <img
                className="logo-komuni"
                src="/icons/barrier-icon.png"
                alt="Logo de KOMUNI, con una imagen de una chincheta de mapa con una silla de ruedas en azul."
              />
            </Link>
          </h1>

          {/* Botón de menú de hamburguesa para móvil */}
          <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle navigation menu">
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          </button>

          {/* La navegación principal. Se le añade una clase condicional para el estado del menú móvil */}
          <nav className={`navi ${isMenuOpen ? 'navi--open' : ''}`}>
            <ul className={`menu ${isMenuOpen ? 'menu--open' : ''}`}> {/* Se le añade una clase condicional para el estado del menú móvil */}
              <li className="menu_item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el enlace
                >
                  Home
                </NavLink>
              </li>
              <li className="menu_item">
                <NavLink
                  to="/mapa"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el enlace
                >
                  Mapa
                </NavLink>
              </li>
              <li className="menu_item">
                <NavLink
                  to="/about"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el enlace
                >
                  Sobre nosotros
                </NavLink>
              </li>

              <li className="menu_item">
                <NavLink
                  to="/blog"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en el enlace
                >
                  Blog
                </NavLink>
              </li>
              <li className="menu_item">
                <NavLink
                  to="/contacto"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </NavLink>
              </li>
              <li className="menu_item">
                <LoginButton />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Header;