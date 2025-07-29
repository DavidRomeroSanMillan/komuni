import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginButton from "../components/LoginButtonLocalStorage";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
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
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/icons/barrier-icon.png"
                alt="Logo Komuni"
                className="logo-komuni"
              />
            </Link>
          </h1>
          {/* Hamburger menu button */}
          <button
            className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
            <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
            <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
          </button>
          <nav className={`navi${isMenuOpen ? " navi--open" : ""}`}> {/* Changed 'active' to 'navi--open' for clarity with CSS */}
            <ul className="menu">
              <li className="menu_item">
                <NavLink
                  to="/"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mapa
                </NavLink>
              </li>
              <li className="menu_item">
                <NavLink
                  to="/blog"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </NavLink>
              </li>

              <li className="menu_item has-submenu">
                <NavLink
                  to="/about"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre nosotros <span className="submenu-arrow">▼</span>
                </NavLink>
                <ul className="submenu">
                  <li className="submenu_item">
                    <NavLink
                      to="/about"
                      className={({ isActive }: { isActive: boolean }) =>
                        "menu_link" + (isActive ? " active" : "")
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sobre el equipo Komuni
                    </NavLink>
                  </li>
                  <li className="submenu_item">
                    <NavLink
                      to="/about/mision-vision-valores"
                      className={({ isActive }: { isActive: boolean }) =>
                        "menu_link" + (isActive ? " active" : "")
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Misión, Visión y Valores
                    </NavLink>
                  </li>
                </ul>
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