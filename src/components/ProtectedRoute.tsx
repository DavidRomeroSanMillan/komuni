import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextLocalStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailVerification = false 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirigir al login, guardando la página que intentaba acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !currentUser.emailVerified) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '50px auto'
      }}>
        <h2>Verificación requerida</h2>
        <p>
          Para acceder a esta sección, necesitas verificar tu correo electrónico.
          Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Ya verifiqué mi email
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
