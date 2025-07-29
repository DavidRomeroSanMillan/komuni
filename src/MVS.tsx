import React from 'react';

const MVS: React.FC = () => {
  return (
    <section className="page-content-wrapper"> 
      <h1>Nuestra Misión, Visión y Valores</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Misión</h2>
        <p>Nuestra misión es empoderar a las personas para que reporten y visualicen las barreras de accesibilidad en sus ciudades, fomentando la colaboración para crear entornos más inclusivos para todos.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Visión</h2>
        <p>Nos vemos como la plataforma líder global en la mejora de la accesibilidad urbana, donde cada reporte contribuye a una red de ciudades más accesibles y equitativas.</p>
      </div>

      <div>
        <h2>Valores</h2>
        <ul>
          <li><strong>Inclusión:</strong> Creemos en un mundo donde todos tienen el derecho a moverse libremente y participar plenamente en la sociedad.</li>
          <li><strong>Colaboración:</strong> Fomentamos la participación activa de la comunidad y las autoridades para lograr un cambio significativo.</li>
          <li><strong>Transparencia:</strong> Operamos con honestidad y claridad en la recopilación y presentación de datos.</li>
          <li><strong>Innovación:</strong> Buscamos constantemente nuevas formas de utilizar la tecnología para resolver desafíos de accesibilidad.</li>
        </ul>
      </div>

    </section>
  );
};

export default MVS;