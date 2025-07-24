import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={toggleOpen} aria-expanded={isOpen}>
        {question}
        <span className={`faq-icon ${isOpen ? 'open' : ''}`}>&#x25BC;</span> {/* Flecha hacia abajo */}
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqData = [
    {
      question: "¿Qué es Komuni?",
      answer: "Komuni es una plataforma global diseñada para reportar barreras urbanas, mejorar la accesibilidad y construir una comunidad más inclusiva. Nuestro objetivo es conectar a las personas para que puedan identificar y solucionar problemas de accesibilidad en sus ciudades y en todo el mundo."
    },
    {
      question: "¿Cómo puedo reportar una barrera?",
      answer: "Puedes reportar una barrera utilizando nuestro mapa interactivo. Simplemente ve a la sección 'Mapa', busca la ubicación de la barrera, y utiliza la herramienta de reporte para añadir detalles, fotos y la categoría de la barrera. Es un proceso sencillo y rápido."
    },
    {
      question: "¿Qué tipo de barreras se pueden reportar?",
      answer: "Puedes reportar una amplia variedad de barreras, incluyendo aceras en mal estado, rampas inaccesibles, falta de señalización adecuada, obstáculos en vías públicas, transporte público no adaptado, y cualquier otra cosa que impida la libre movilidad o el acceso a personas con diversidad funcional."
    },
    {
      question: "¿Es necesario registrarse para usar Komuni?",
      answer: "No es necesario registrarse para ver el mapa o leer nuestro blog y recursos educativos. Sin embargo, para reportar barreras, participar en el foro o contribuir activamente a la comunidad, sí necesitarás crear una cuenta gratuita."
    },
    {
      question: "¿Cómo puedo colaborar con Komuni?",
      answer: "Hay muchas formas de colaborar: reportando barreras, compartiendo tus experiencias en el foro, difundiendo información sobre accesibilidad en tus redes sociales, o incluso ofreciéndote como voluntario para eventos o proyectos locales. ¡Tu participación es clave!"
    },
    {
      question: "¿Komuni está disponible en mi ciudad?",
      answer: "Komuni es una plataforma global, lo que significa que puedes usarla en cualquier ciudad del mundo. Cuantos más usuarios se unan y reporten, más completa y útil será la información disponible para todos."
    },
    {
      question: "¿Cómo se utilizan los datos de las barreras reportadas?",
      answer: "Los datos de las barreras reportadas se utilizan para crear un mapa interactivo de accesibilidad. Esta información puede ser consultada por usuarios, organizaciones y autoridades locales para identificar áreas problemáticas y priorizar mejoras. No compartimos información personal sin tu consentimiento."
    }
  ];

  return (
    <section className="faq-section">
      <h1>Preguntas Frecuentes</h1>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;