import React from "react";

const MVS: React.FC = () => {
  return (
    <section className="page-content-wrapper">
      <ul className="mission-vision-values">
        {" "}
        {/* Add a class for the list */}
        <li className="mision-item">
          {" "}
          {/* Add a class for list items */}
          <h3 className="item-title">🚀 Misión</h3>{" "}
          {/* Add a class for item titles */}
          <p className="item-description">
            {" "}
            {/* Add a class for item descriptions */}
            Crear una comunidad digital colaborativa que visibilice, reporte y
            mejore los espacios públicos para personas con discapacidad o
            movilidad reducida, facilitando el acceso a información útil,
            precisa y actualizada sobre zonas accesibles en tiempo real.
          </p>
        </li>
        <li className="vision-item">
          {" "}
          {/* Add a class for list items */}
          <h3 className="item-title">🔭 Visión</h3>{" "}
          {/* Add a class for item titles */}
          <p className="item-description">
            {" "}
            {/* Add a class for item descriptions */}
            Ser la plataforma líder en accesibilidad urbana, donde usuarios,
            entidades públicas y organizaciones trabajen juntos para construir
            ciudades más inclusivas, seguras y adaptadas para todos, sin
            importar sus capacidades físicas.
          </p>
        </li>
        <li className="valores-item">
          {" "}
          {/* Add a class for list items */}
          <h3 className="item-title">💖 Valores</h3>{" "}
          {/* Add a class for item titles */}
          <p className="item-description">
            {" "}
            {/* Add a class for item descriptions */}
            Compromiso con la inclusión, respeto por la diversidad, colaboración
            entre ciudadanos y transparencia en la información. En KOMUNI
            creemos que el acceso equitativo al espacio público es un derecho,
            no un privilegio.
          </p>
        </li>
      </ul>
    </section>
  );
};

export default MVS;
