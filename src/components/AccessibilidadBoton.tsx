import React, { useState, useEffect, useRef } from 'react';

const AccessibilityButton: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const accessibilityRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const toggleLargeText = () => {
    document.body.classList.toggle('large-text');
  };

  const toggleHighContrast = () => {
    document.body.classList.toggle('high-contrast');
  };

  // Cierra el menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accessibilityRef.current && !accessibilityRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="accessibility-container" ref={accessibilityRef}>
      <button 
        id="accessibility-button"
        className="accessibility-button"
        aria-label="Menú de accesibilidad"
        onClick={toggleMenu}
      >
        <span ><img src="../public/icons/accesibilidad.png" className="acceso-icon" alt="Botón de opciones de accesibilidad" /></span>
      </button>
      <div id="accessibility-menu" className={`accessibility-menu ${isMenuOpen ? 'open' : ''}`}>
        <button id="increase-text" className="acceso-option" onClick={toggleLargeText}>
          Aumentar texto
        </button>
        <button id="high-contrast" className="acceso-option" onClick={toggleHighContrast}>
          Alto contraste
        </button>
      </div>
    </div>
  );
};

export default AccessibilityButton;