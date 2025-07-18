import useEquipo from "./UseEquipo";

const About = () => {
  const { equipo } = useEquipo();
  // console.log('Datos que llegan al componente:', equipo);
  // if (loading) return <p>Cargando equipo...</p>;
  // if (error) return <p>Error: {error}</p>;
  return (
    <div className="textalign">
      <h1 >Sobre nuestro equipo</h1>
      <br />
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        {equipo.map((member) => (
          <div
            key={member.nombre}
            style={{
              width: "300px",
              textAlign: "center",
            }}
            className="card"
          >
            <img
              src={member.imagen}
              alt={"Foto de perfil de " + member.nombre}
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "1rem",
              }}
            />
            <h3>{member.nombre}</h3>
            <p style={{ fontSize: "0.95rem", color: "" }}>
              {member.descripción}
            </p>
            <div className="contmini-icono">
              <a href={member.Github}>
                <img
                  src="/icons/github.png"
                  alt="Logo de Github"
                  style={{ height: "30px" }}
                />
              </a>
              <a href={member.Linkedin}>
                <img
                  src="/icons/linkedin.png"
                  alt="Logo de Linkedin"
                  style={{ height: "30px" }}
                />
              </a>
            </div>
          </div>
        ))}
      </div>
      <ul style={{ marginTop: "3rem", listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "1.5rem" }}>
          <h3>🚀 Misión</h3>
          <p>
            Crear una comunidad digital colaborativa que visibilice, reporte y mejore los espacios públicos para personas con discapacidad o movilidad reducida, facilitando el acceso a información útil, precisa y actualizada sobre zonas accesibles en tiempo real.
          </p>
        </li>
        <li style={{ marginBottom: "1.5rem" }}>
          <h3>🔭 Visión</h3>
          <p>
            Ser la plataforma líder en accesibilidad urbana, donde usuarios, entidades públicas y organizaciones trabajen juntos para construir ciudades más inclusivas, seguras y adaptadas para todos, sin importar sus capacidades físicas.
          </p>
        </li>
        <li>
          <h3>💖 Valores</h3>
          <p>
           Compromiso con la inclusión, respeto por la diversidad, colaboración entre ciudadanos y transparencia en la información. En KOMUNI creemos que el acceso equitativo al espacio público es un derecho, no un privilegio.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default About;
