import { NavLink } from "react-router-dom";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <footer className="footer ">
      <div>
        <div>
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

        <div className="" style={{ position: "relative" }}>
          <p className="">
            <span>Email: </span>
            <span>
              <a href="#0" className="">
                komunitgn@gmail.com{" "}
              </a>
            </span>
          </p>
          <p className="">
            <small>
              &copy; {new Date().getFullYear()} Komuni. Plataforma colaborativa
              de accesibilidad.
            </small>
          </p>
          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              // NUEVAS PROPIEDADES DE POSICIONAMIENTO:
              position: 'absolute', // Posiciona el botón de forma absoluta
              bottom: '1rem',      // 1 rem desde la parte inferior de su contenedor relativo
              right: '1rem',       // 1 rem desde la parte derecha de su contenedor relativo
              // ELIMINA O COMENTA esta línea que lo centraba:
              // margin: '1.5rem auto 0.5rem auto',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            aria-label="Volver arriba de la página"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32" // Puedes ajustar el tamaño aquí
              height="32" // Puedes ajustar el tamaño aquí
              fill="currentColor" // Usará el color definido en el estilo del botón (white)
              viewBox="0 0 16 16"
              style={{ display: "block" }} // Asegura que el SVG se comporte como bloque
            >
              {/* ESTE ES EL PATH DONDE DEBES PONER EL CÓDIGO DE TU SVG */}
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
