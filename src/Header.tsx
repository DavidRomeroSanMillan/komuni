import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

Object.values(import.meta.glob("./assets/css/*", { eager: true }));


function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2); // Adjust threshold as needed
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div
        className={` header${scrolled ? " header--scrolled" : ""}`}
        style={{ padding: 1 }}
      >
        <div className="topbar">
          <h1 className="logo">
            <Link to="/">
              <img
                className="logo-komuni"
                src="/icons/barrier-icon.png"
                alt="Logo de KOMUNI, con una imagen de una chincheta de mapa con una silla de ruedas en azul."
              />
            </Link>
          </h1>
          <nav className="navi">
            <ul className="menu">
              <li className="menu_item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
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
                >
                  Sobre nosotros
                </NavLink>
              </li>

              <li className="menu_item">
                <NavLink
                  to="/foro"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                >
                  Foro/Comunidad
                </NavLink>
              </li>
              <li className="menu_item">
                <NavLink
                  to="/contacto"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                >
                  Contacto
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Header;
