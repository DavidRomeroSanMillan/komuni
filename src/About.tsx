import useEquipo from "./UseEquipo";

const About = () => {
  const { equipo } = useEquipo();

  return (
    <div className="page-content-wrapper"> {/* Add a class for overall styling */}
      <h1 className="about-title">Sobre nuestro equipo</h1> {/* Add a class for the title */}
      <br />
      <div className="team-cards-container"> {/* Add a class for the team cards container */}
        {equipo.map((member) => (
          <div
            key={member.nombre}
            className="team-member-card" // Use a class for the card
          >
            <img
              src={member.imagen}
              alt={"Foto de perfil de " + member.nombre}
              className="member-profile-pic" // Use a class for the image
            />
            <h3 className="member-name">{member.nombre}</h3> {/* Add a class for the name */}
            <p className="member-description"> {/* Add a class for the description */}
              {member.descripción}
            </p>
            <div className="social-icons-container"> {/* Add a class for the social icons */}
              <a href={member.Github} target="_blank" rel="noopener noreferrer"> {/* Add target and rel for external links */}
                <img
                  src="/icons/github.png"
                  alt="Logo de Github"
                  className="social-icon" // Use a class for the social icons
                />
              </a>
              <a href={member.Linkedin} target="_blank" rel="noopener noreferrer"> {/* Add target and rel for external links */}
                <img
                  src="/icons/linkedin.png"
                  alt="Logo de Linkedin"
                  className="social-icon" // Use a class for the social icons
                />
              </a>
            </div>
          </div>
        ))}
      </div>
      <ul className="mission-vision-values"> {/* Add a class for the list */}
        <li className="mision-item"> {/* Add a class for list items */}
          <h3 className="item-title">🚀 Misión</h3> {/* Add a class for item titles */}
          <p className="item-description"> {/* Add a class for item descriptions */}
            Crear una comunidad digital colaborativa que visibilice, reporte y
            mejore los espacios públicos para personas con discapacidad o
            movilidad reducida, facilitando el acceso a información útil,
            precisa y actualizada sobre zonas accesibles en tiempo real.
          </p>
        </li>
        <li className="vision-item"> {/* Add a class for list items */}
          <h3 className="item-title">🔭 Visión</h3> {/* Add a class for item titles */}
          <p className="item-description"> {/* Add a class for item descriptions */}
            Ser la plataforma líder en accesibilidad urbana, donde usuarios,
            entidades públicas y organizaciones trabajen juntos para construir
            ciudades más inclusivas, seguras y adaptadas para todos, sin
            importar sus capacidades físicas.
          </p>
        </li>
        <li className="valores-item"> {/* Add a class for list items */}
          <h3 className="item-title">💖 Valores</h3> {/* Add a class for item titles */}
          <p className="item-description"> {/* Add a class for item descriptions */}
            Compromiso con la inclusión, respeto por la diversidad, colaboración
            entre ciudadanos y transparencia en la información. En KOMUNI
            creemos que el acceso equitativo al espacio público es un derecho,
            no un privilegio.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default About;