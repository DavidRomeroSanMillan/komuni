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
        {/* Sección de enlaces de navegación (ESTA YA ESTÁ BIEN) */}
        <div className="footer_section footer_links">
          <h4>Explora</h4>
          <ul className="menu-foot">
            <li className="menu_item_foot">
              <NavLink
                to="/privacidad"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link_foot" + (isActive ? " active" : "")
                }
              >
                Política de privacidad
              </NavLink>
            </li>
            <li className="menu_item_foot">
              <NavLink
                to="/about"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link_foot" + (isActive ? " active" : "")
                }
              >
                Sobre KOMUNI
              </NavLink>
            </li>
            <li className="menu_item_foot">
              <NavLink
                to="/contacto"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link_foot" + (isActive ? " active" : "")
                }
              >
                Contacto
              </NavLink>
            </li>
            <li className="menu_item_foot">
              <NavLink
                to="/faq"
                className={({ isActive }: { isActive: boolean }) =>
                  "menu_link_foot" + (isActive ? " active" : "")
                }
              >
                Preguntas Frecuentes
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="footer_section footer_links">
          <h4>Contacto</h4>
<<<<<<< Updated upstream
          <ul className="menu-foot"> {/* Nueva UL para los elementos de contacto */}
            <li>Email: komunitgn@gmail.com</li> 

=======
          <ul className="contact_list"> {/* Nueva UL para los elementos de contacto */}
            <li>Email: komunitgn@gmail.com</li> {/* De <p> a <li> */}
            <li>Teléfono: +34 123 456 789</li> {/* De <p> a <li> */}
            <li>Dirección: Calle Falsa 123, Ciudad, País</li> {/* De <address> a <li> */}
>>>>>>> Stashed changes
          </ul>
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
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 12a.5.5 0 0 0 .5-.5V3.707l3.146 3.147a.5.5 0 0 0 .708-.708l-3.5-3.5a.5.5 0 0 0-.708 0l-3.5 3.5a.5.5 0 0 0 .708.708L7.5 3.707V11.5a.5.5 0 0 0 .5.5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;