import React from "react";
import { NavLink } from "react-router-dom";

const MVS: React.FC = () => {
  return (
    <section className="page-content-wrapper">
      <h1>Komuni: una comunidad unida</h1>
      <br />
      <ul className="mission-vision-values">
        <li className="mision-item">
          <h3 className="item-title">🚀 Misión</h3>
          <p className="item-description">
            Crear una <b>comunidad digital</b> colaborativa que visibilice,
            reporte y mejore los <b>espacios públicos</b> para personas con
            discapacidad o movilidad reducida, facilitando el acceso a
            <b>información útil, precisa y actualizada</b> sobre zonas
            accesibles en tiempo real.
          </p>
        </li>
        <li className="vision-item">
          <h3 className="item-title">🔭 Visión</h3>
          <p className="item-description">
            Ser la plataforma líder en <b>accesibilidad urbana</b>, donde
            usuarios, entidades públicas y organizaciones trabajen juntos para
            construir ciudades más <b>inclusivas, seguras y adaptadas</b> para
            todos, sin importar sus capacidades físicas.
          </p>
        </li>
        <li className="valores-item">
          <h3 className="item-title">💖 Valores</h3>
          <p className="item-description">
            Compromiso con la <b>inclusión</b>, respeto por la <b>diversidad</b>
            , colaboración entre ciudadanos y <b>transparencia</b> en la
            información. En <b>KOMUNI</b> creemos que el acceso equitativo al
            espacio público <b>es un derecho</b>, no un privilegio.
          </p>
        </li>
      </ul>
      <div className="komuni-quote-container">
        <span className="komuni-quote-text">
          ¿Tienes alguna sugerencia o comentario?
          <NavLink
            to="/contacto"
            className={({ isActive }: { isActive: boolean }) =>
              "menu_link" + (isActive ? " active" : "")
            }
          >
            {" "}
            ¡Haz clic aquí!
          </NavLink>
        </span>
      </div>
    </section>
  );
};

export default MVS;
