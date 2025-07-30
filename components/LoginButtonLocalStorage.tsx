import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContextLocalStorage';
import { useUserReportsCount } from '../src/hooks/useUserReportsCount';
import './LoginButton.css';

const LoginButtonLocalStorage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const { currentUser, userProfile, logout } = useAuth();
  const reportsCount = useUserReportsCount(userProfile);

  // Cierra el menú si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div ref={ref} className="login-button-container">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="login-button"
        type="button"
      >
        {currentUser ? (
          <div className="user-avatar">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
            ) : (
              userProfile?.nombre?.charAt(0) || currentUser.email?.charAt(0) || '?'
            )}
          </div>
        ) : (
          "Iniciar sesión"
        )}
      </button>
      
      {open && (
        <div className="login-dropdown">
          {currentUser && userProfile ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar large">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    `${(userProfile.nombre || '').charAt(0)}${(userProfile.apellidos || '').charAt(0)}`
                  )}
                </div>
                <div className="user-details">
                  <h4>{userProfile.nombre} {userProfile.apellidos}</h4>
                  <p className="email">{userProfile.email}</p>
                  <p className="age">
                    {calculateAge(userProfile.fechaNacimiento)} años • {userProfile.genero}
                  </p>
                  {!currentUser.emailVerified && (
                    <span className="unverified">
                      ⚠️ Email no verificado
                    </span>
                  )}
                </div>
              </div>
              
              <div className="user-stats">
                <div className="stat">
                  <span className="stat-number">{reportsCount}</span>
                  <span className="stat-label">Reportes</span>
                </div>
              </div>

              <div className="menu-actions">
                <Link to="/perfil" className="menu-item" onClick={() => setOpen(false)}>
                  <span>👤</span>
                  Ver Perfil
                </Link>
                <Link to="/mapa" className="menu-item" onClick={() => setOpen(false)}>
                  <span>📝</span>
                  Nuevo Reporte
                </Link>
                <button onClick={handleLogout} className="menu-item logout">
                  <span>🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-menu">
              <div className="welcome-message">
                <h4>¡Únete a Komuni!</h4>
                <p>Inicia sesión para reportar barreras y mejorar la accesibilidad</p>
              </div>
              
              <div className="auth-actions">
                <Link to="/login" className="auth-button primary" onClick={() => setOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="auth-button secondary" onClick={() => setOpen(false)}>
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButtonLocalStorage;
