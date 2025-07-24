import { Link } from "react-router-dom";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 

const Home = () => {
  return (
    <section className="textalign">

      <h1>Bienvenido a Komuni</h1>
      <p style={{ fontSize: '1.2rem', color: '#20706e', marginBottom: 32 }}>
        Plataforma global para reportar barreras urbanas, mejorar la accesibilidad y construir una comunidad más inclusiva.
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        marginBottom: '2.5rem',
        justifyContent: 'center'
      }}>
        <div className="card" style={{ minWidth: 260, flex: '1 1 48%'}}>
          <h2 style={{ marginTop: 0 }}>🗺️ Mapa interactivo</h2>
          <p>Visualiza y reporta barreras urbanas en tiempo real. Ayuda a mejorar la accesibilidad de tu ciudad y otras ciudades del mundo.</p>
          <Link to="/mapa"><button style={{ marginTop: 12, width: '100%' }}>Ir al mapa</button></Link>
        </div><div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '1 1 48%' }}>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>📚 Educación</h2>
          <p>Descubre recursos, buenas prácticas y experiencias sobre accesibilidad urbana e inclusión social.</p>
          <Link to="/educacion"><button style={{ marginTop: 12, width: '100%' }}>Ver recursos</button></Link>
        </div>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>🤝 Comunidad</h2>
          <p>Comparte tu experiencia, ayuda a otras personas y forma parte de una red global comprometida con la accesibilidad.</p>
          <Link to="/blog"><button style={{ marginTop: 12, width: '100%' }}>Lee nuestro blog</button></Link>
        </div></div>
      </div>
       <Carousel
        showArrows={true} // Muestra flechas de navegación
        infiniteLoop={true} // Permite el bucle infinito del carrusel
        autoPlay={true} // Inicia la reproducción automática
        interval={5000} // Cambia de imagen cada 5 segundos
        showThumbs={false} // Oculta las miniaturas de las imágenes
      >
        <div>
          <img src="/images/Argentina.png" alt="Accesibilidad urbana" className="imgcarousel"/>
          <p className="legend">Mejora la accesibilidad en tu ciudad</p>
        </div>
        <div>
          <img src="/images/America.jpg" alt="Comunidad inclusiva" className="imgcarousel"/>
          <p className="legend">Construyamos una comunidad más inclusiva</p>
        </div>
        <div>
          <img src="/images/China.png" alt="Reporta barreras" className="imgcarousel"/>
          <p className="legend">Reporta barreras y haz la diferencia</p>
        </div>
      </Carousel>
      <div className="komuni-quote-container">
        <span className="komuni-quote-text">
          Tu ciudad no es solo calles: es el reflejo de quién la habita.
        </span>
      </div>
    </section>
  );
}
export default Home;