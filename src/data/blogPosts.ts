// src/data/blogPosts.ts

export interface BlogPost {
  id: string;
  title: string;
  slug: string; // Para URLs amigables (ej: /blog/primer-post-de-komuni)
  date: string; // Formato legible o ISO (ej: "2025-07-24" o "24 de julio de 2025")
  author: string;
  excerpt: string; // Un resumen corto para la lista de posts
  content: string; // El contenido completo del post (puede ser HTML o Markdown)
  imageUrl?: string; // Opcional: URL de una imagen destacada
  tags: string[]; // Opcional: Para categorizar los posts
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Primer Post de Komuni: Un Paso Hacia la Accesibilidad Universal',
    slug: 'primer-post-de-komuni',
    date: '24 de julio de 2025',
    author: 'Equipo Komuni',
    excerpt: 'Descubre cómo Komuni está revolucionando la forma en que reportamos y abordamos las barreras de accesibilidad en nuestras ciudades. Un futuro más inclusivo comienza hoy.',
    content: `
      <p>Bienvenidos al blog de Komuni, el espacio donde compartiremos nuestras ideas, avances y noticias más relevantes sobre la accesibilidad y la construcción de comunidades inclusivas.</p>
      <p>En este primer post, queremos reiterar nuestra misión: empoderar a los ciudadanos para que sean agentes de cambio. Cada barrera reportada en nuestro mapa no es solo un punto en una pantalla, es un paso hacia la eliminación de obstáculos físicos y la creación de entornos donde todos puedan participar plenamente.</p>
      <h2>¿Qué nos impulsa?</h2>
      <p>La visión de un mundo sin barreras. Creemos firmemente que la tecnología puede ser una herramienta poderosa para la inclusión. Nuestra plataforma no solo facilita el reporte de problemas, sino que también fomenta la colaboración entre usuarios, organizaciones y autoridades locales.</p>
      <p>Gracias por unirte a esta causa. Juntos, haremos una diferencia real.</p>
      <h3>Próximos Pasos</h3>
      <ul>
        <li>Explora nuestro mapa interactivo.</li>
        <li>Colabora con la comunidad realizando reportes.</li>
        <li>Comparte tus experiencias y sugerencias.</li>
      </ul>
    `,
    imageUrl: '../src/assets/img/barrier-icon.png', // Ejemplo de ruta de imagen
    tags: ['accesibilidad', 'comunidad', 'lanzamiento', 'inclusión'],
  },
  {
    id: '2',
    title: 'Guía Rápida: Cómo Reportar una Barrera en Komuni',
    slug: 'guia-reportar-barrera',
    date: '15 de julio de 2025',
    author: 'Soporte Komuni',
    excerpt: 'Aprende los sencillos pasos para identificar y reportar barreras de accesibilidad en nuestro mapa. Tu contribución es vital para nuestra comunidad.',
    content: `
      <p>Reportar una barrera en Komuni es un proceso intuitivo diseñado para ser rápido y eficiente. Sigue esta guía paso a paso para hacer tu primera contribución:</p>
      <ol>
        <li><strong>Accede al Mapa:</strong> Navega a la sección 'Mapa' de nuestra web.</li>
        <li><strong>Localiza la Barrera:</strong> Usa el buscador o navega manualmente hasta la ubicación exacta de la barrera.</li>
        <li><strong>Haz Clic en "Reportar":</strong> Verás un botón o icono para iniciar el proceso de reporte.</li>
        <li><strong>Añade Detalles:</strong> Describe la barrera, selecciona su categoría (ej. rampa inaccesible, acera rota), y si es posible, sube una o varias fotos.</li>
        <li><strong>Envía el Reporte:</strong> Confirma la información y envía. ¡Tu reporte ya está en el mapa!</li>
      </ol>
      <p>Cada reporte ayuda a construir una base de datos más completa y a concienciar sobre los desafíos de accesibilidad en nuestras ciudades.</p>
    `,
    imageUrl: '/images/blog/post2-featured.png',
    tags: ['guía', 'reporte', 'mapa', 'tutorial'],
  },
  {
    id: '3',
    title: 'La Importancia de la Inclusión Digital en la Accesibilidad Urbana',
    slug: 'inclusion-digital-accesibilidad-urbana',
    date: '01 de julio de 2025',
    author: 'Equipo Komuni',
    excerpt: 'Exploramos cómo la tecnología y el diseño digital accesible son fundamentales para complementar los esfuerzos de accesibilidad física en las ciudades modernas.',
    content: `
      <p>La accesibilidad no se limita solo al entorno físico. En la era digital, la inclusión digital juega un papel crucial en cómo las personas interactúan con su ciudad y sus servicios.</p>
      <p>Un sitio web municipal inaccesible, una aplicación de transporte público que no cumple con los estándares, o incluso la falta de información accesible sobre rutas peatonales, pueden ser tan restrictivos como una rampa mal diseñada.</p>
      <p>En Komuni, entendemos esta interconexión. Nuestra plataforma está diseñada para ser accesible desde el primer día, y abogamos por la implementación de soluciones digitales inclusivas que complementen la infraestructura física.</p>
      <p>La verdadera accesibilidad es un ecosistema donde lo físico y lo digital se unen para crear una experiencia fluida y equitativa para todos.</p>
    `,
    imageUrl: '/images/blog/post3-featured.jpeg',
    tags: ['inclusión digital', 'tecnología', 'accesibilidad'],
  },
];

export default blogPosts;