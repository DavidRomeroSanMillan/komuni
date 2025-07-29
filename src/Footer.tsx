import { NavLink } from "react-router-dom";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <div className="footer_content">
        {/* Sección de enlaces de navegación */}
        <div className="footer_section footer_links">
          <h4>Explora</h4> {/* Título para la sección de enlaces */}
          <ul className="menu">
            <li className="menu_item">
              <NavLink
                to="/privacidad"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link" + (isActive ? " active" : "")
                }
              >
                Política de privacidad
              </NavLink>
            </li>
            <li className="menu_item">
              <NavLink
                to="/about"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link" + (isActive ? " active" : "")
                }
              >
                Sobre KOMUNI
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
            <li className="menu_item">
              <NavLink
                to="/faq"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link" + (isActive ? " active" : "")
                }
              >
                Preguntas frecuentes
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sección de contacto y redes sociales (puedes añadir si tienes) */}
        <div className="footer_section footer_contact">
          <h4>Contáctanos</h4> {/* Título para la sección de contacto */}
          <p className="email_info">
            <span>Email: </span>
            <span>
              <a href="mailto:komunitgn@gmail.com" className="email_link">
                komunitgn@gmail.com{" "}
              </a>
            </span>
          </p>
           <div className="social_links">
            <a href="#facebook" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#twitter" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#instagram" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div> 
        </div>

        <div className="footer_section footer_bottom_area">
          <p className="copyright">
            <small>
              &copy; {new Date().getFullYear()} Komuni. Plataforma colaborativa
              de accesibilidad.
            </small>
          </p>
          <button
            onClick={scrollToTop}
            className="scroll_to_top_button"
            aria-label="Volver arriba de la página"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24" // Tamaño ligeramente más pequeño para el botón
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 12a.5.5 0 0 0 .5-.5V3.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 3.707V11.5a.5.5 0 0 0 .5.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;