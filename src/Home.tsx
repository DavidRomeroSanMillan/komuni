import { Link } from "react-router-dom";

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
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>🗺️ Mapa interactivo</h2>
          <p>Visualiza y reporta barreras urbanas en tiempo real. Ayuda a mejorar la accesibilidad de tu ciudad y otras ciudades del mundo.</p>
          <Link to="/mapa"><button style={{ marginTop: 12, width: '100%' }}>Ir al mapa</button></Link>
        </div>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>📚 Educación</h2>
          <p>Descubre recursos, buenas prácticas y experiencias sobre accesibilidad urbana e inclusión social.</p>
          <Link to="/educacion"><button style={{ marginTop: 12, width: '100%' }}>Ver recursos</button></Link>
        </div>
        <div className="card" style={{ minWidth: 260, flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>🤝 Comunidad</h2>
          <p>Comparte tu experiencia, ayuda a otras personas y forma parte de una red global comprometida con la accesibilidad.</p>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        padding: '1.5rem 0',
        background: 'linear-gradient(90deg, #2aa19811 0%, #3ecfcf11 100%)',
        borderRadius: 12
      }}>
        <span style={{ fontSize: '1.25rem', color: '#2aa198', fontWeight: 600 }}>
          Tu ciudad no es solo calles: es el reflejo de quién la habita.
        </span>
      </div>
    </section>
  );
}
export default Home;