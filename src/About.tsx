import useEquipo from "./UseEquipo";

const About = () => {
  const { equipo } = useEquipo();

  return (
    <div className="page-content-wrapper"> {/* Add a class for overall styling */}
      <h1>Sobre nuestro equipo</h1> {/* Add a class for the title */}
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
     
    </div>
  );
};

export default About;