import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Home = () => {
  return (
    <section className="page-content-wrapper">
      <h1>Bienvenido a Komuni</h1>
      <p style={{ fontSize: "1.2rem", color: "#20706e", marginBottom: 32 }}>
        Plataforma global para reportar barreras urbanas, mejorar la
        accesibilidad y construir una comunidad más inclusiva.
      </p>

      {/* Added class for styling, removed inline flex properties */}
      <div className="home-cards-container">
        {/* Removed inline minWidth and flex styles */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>🗺️ Mapa interactivo</h2>
          <p>
            Visualiza y reporta barreras urbanas en tiempo real. Ayuda a mejorar
            la accesibilidad de tu ciudad y otras ciudades del mundo.
          </p>
          <img src="/images/captura-mapa.png " alt="" className="img-card" />
          <Link to="/mapa">
            <button style={{ marginTop: 12, width: "100%" }}>Ir al mapa</button>
          </Link>
        </div>

        {/* Removed inline minWidth and flex styles */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>🗣️ Comunidad activa</h2>
          <p>
            Únete a nuestra red de usuarios, comparte experiencias y participa
            en la mejora continua de la accesibilidad.
          </p>
          <img
            src="/images/captura-comunidad.png"
            alt=""
            className="img-card"
          />
          <Link to="/comunidad">
            <button style={{ marginTop: 12, width: "100%" }}>
              Únete a la comunidad
            </button>
          </Link>
        </div>

        {/* Removed inline minWidth and flex styles */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>✨ Proyectos y soluciones</h2>
          <p>
            Descubre proyectos innovadores y soluciones prácticas para hacer de
            tu entorno un lugar más accesible.
          </p>
          <img
            src="/images/captura-soluciones.png"
            alt=""
            className="img-card"
          />
          <Link to="/proyectos">
            <button style={{ marginTop: 12, width: "100%" }}>
              Explora proyectos
            </button>
          </Link>
        </div>

        {/* Removed inline minWidth and flex styles */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>💡 Soporte y recursos</h2>
          <p>
            Accede a guías, normativas y soporte especializado para tus
            iniciativas de accesibilidad. Komuni está a disposición de la
            comunidad para seguir mejorando día a día.
          </p>
          <Link to="/contacto">
            <button style={{ marginTop: 12, width: "100%" }}>
              Contacta con Komuni
            </button>
          </Link>
        </div>
      </div>
      <Carousel
        showArrows={true}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        showThumbs={false}
      >
        <div>
          <img
            src="/images/baix-mise.jpg"
            alt="Accesibilidad urbana"
            className="imgcarousel"
          />
          <p className="legend">Construyamos una comunidad más inclusiva</p>
        </div>
        <div>
          <img
            src="/images/escalestgn.jpg"
            alt="Comunidad inclusiva"
            className="imgcarousel"
          />
          <p className="legend">Reporta barreras y haz la diferencia</p>
        </div>
        <div>
          <img
            src="/images/rambla-nova.jpg"
            alt="Reporta barreras"
            className="imgcarousel"
          />
          <p className="legend">Mejora la accesibilidad en tu ciudad</p>
        </div>
      </Carousel>
      <div className="komuni-quote-container">
        <span className="komuni-quote-text">
          Tu ciudad no es solo calles y edificios, es el hogar de tu comunidad.
          En Komuni, creemos que cada rincón de ese hogar debe ser accesible
          para todos.
        </span>
      </div>
    </section>
  );
};

export default Home;