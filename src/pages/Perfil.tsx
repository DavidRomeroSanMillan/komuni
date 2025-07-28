import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextLocalStorage';
import { Navigate } from 'react-router-dom';
import './Perfil.css';

const Perfil: React.FC = () => {
  const { currentUser, userProfile, logout, updateUserProfile, resendVerification } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nombre: userProfile.nombre,
        apellidos: userProfile.apellidos,
        fechaNacimiento: userProfile.fechaNacimiento,
        genero: userProfile.genero,
      });
    }
  }, [userProfile]);

  // Redirigir si no está autenticado
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateUserProfile({
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
      });

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        nombre: userProfile.nombre,
        apellidos: userProfile.apellidos,
        fechaNacimiento: userProfile.fechaNacimiento,
        genero: userProfile.genero,
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await resendVerification();
      setMessage({ type: 'success', text: 'Email de verificación enviado' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="perfil-container">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-header">
          <div className="avatar">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {userProfile.nombre.charAt(0)}{userProfile.apellidos.charAt(0)}
              </div>
            )}
          </div>
          <div className="user-info">
            <h1>{userProfile.nombre} {userProfile.apellidos}</h1>
            <p className="email">{userProfile.email}</p>
            {!currentUser.emailVerified && (
              <div className="verification-warning">
                <span>⚠️ Email no verificado</span>
                <button 
                  onClick={handleResendVerification}
                  className="link-button"
                  disabled={loading}
                >
                  Reenviar verificación
                </button>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="perfil-body">
          <div className="section">
            <div className="section-header">
              <h2>Información Personal</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Editar
                </button>
              ) : (
                <div className="edit-buttons">
                  <button 
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={loading}
                  >
                    Guardar
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={loading}
                  />
                ) : (
                  <span>{userProfile.nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label>Apellidos</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    disabled={loading}
                  />
                ) : (
                  <span>{userProfile.apellidos}</span>
                )}
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    disabled={loading}
                  />
                ) : (
                  <span>
                    {new Date(userProfile.fechaNacimiento).toLocaleDateString('es-ES')} 
                    ({calculateAge(userProfile.fechaNacimiento)} años)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Género</label>
                {isEditing ? (
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="No binario">No binario</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : (
                  <span>{userProfile.genero}</span>
                )}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Estadísticas</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{userProfile.reportes.length}</div>
                <div className="stat-label">Reportes Realizados</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {userProfile.createdAt ? 
                    Math.floor((new Date().getTime() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="stat-label">Días en Komuni</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Mis Reportes</h2>
            {userProfile.reportes.length === 0 ? (
              <div className="empty-state">
                <p>Aún no has realizado ningún reporte</p>
                <button className="btn-primary">Crear mi primer reporte</button>
              </div>
            ) : (
              <div className="reportes-list">
                {userProfile.reportes.map((reporte, index) => (
                  <div key={index} className="reporte-item">
                    <div className="reporte-content">
                      <h4>Reporte #{index + 1}</h4>
                      <p>{reporte}</p>
                    </div>
                    <div className="reporte-actions">
                      <button className="btn-link">Ver detalles</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section danger-zone">
            <h2>Zona de Peligro</h2>
            <button 
              onClick={handleLogout}
              className="btn-danger"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
