import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextLocalStorage';
import { Navigate, useNavigate } from 'react-router-dom';
import { getReportes } from '../../services/api';
import './Perfil.css';

const Perfil: React.FC = () => {
  const { currentUser, userProfile, logout, updateUserProfile, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
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

  // Cargar reportes del usuario
  useEffect(() => {
    const loadUserReports = async () => {
      if (!userProfile) {
        setUserReports([]);
        return;
      }

      setLoadingReports(true);
      try {
        console.log('🔍 Cargando reportes para usuario:', userProfile.email);
        console.log('📋 IDs de reportes en perfil:', userProfile.reportes);
        
        // Obtener todos los reportes
        const allReports = await getReportes();
        console.log('📊 Total de reportes en sistema:', allReports.length);
        
        // Filtrar reportes del usuario de dos maneras:
        // 1. Por IDs en la lista del usuario (localStorage)
        const reportsByIds = allReports.filter(report => 
          userProfile.reportes && userProfile.reportes.includes(report.id)
        );
        
        // 2. Por email del usuario (Firebase)
        const reportsByEmail = allReports.filter(report => 
          report.userEmail === userProfile.email
        );
        
        console.log('📋 Reportes por IDs:', reportsByIds.length);
        console.log('📧 Reportes por email:', reportsByEmail.length);
        
        // Combinar ambas listas y eliminar duplicados
        const combinedReports = [...reportsByIds];
        reportsByEmail.forEach(report => {
          if (!combinedReports.find(r => r.id === report.id)) {
            combinedReports.push(report);
          }
        });
        
        console.log('🎯 Total reportes combinados:', combinedReports.length);
        setUserReports(combinedReports);
        
        // Si hay reportes por email que no están en localStorage, sincronizar
        if (reportsByEmail.length > reportsByIds.length) {
          console.log('🔄 Sincronizando reportes faltantes en localStorage...');
          const missingReportIds = reportsByEmail
            .filter(report => !userProfile.reportes?.includes(report.id))
            .map(report => report.id);
            
          if (missingReportIds.length > 0) {
            console.log('📝 IDs faltantes:', missingReportIds);
            // Actualizar localStorage
            try {
              const users = JSON.parse(localStorage.getItem('users') || '[]');
              const userIndex = users.findIndex((u: any) => u.email === userProfile.email);
              
              if (userIndex !== -1) {
                const currentReports = users[userIndex].reportes || [];
                const updatedReports = [...currentReports, ...missingReportIds];
                users[userIndex].reportes = updatedReports;
                localStorage.setItem('users', JSON.stringify(users));
                console.log('✅ localStorage sincronizado');
              }
            } catch (syncError) {
              console.error('❌ Error sincronizando localStorage:', syncError);
            }
          }
        }
        
      } catch (error) {
        console.error('Error al cargar reportes del usuario:', error);
        setUserReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    loadUserReports();
  }, [userProfile?.reportes, userProfile?.email]);

  const handleCreateReport = () => {
    navigate('/mapa');
  };

  // Función para ver un reporte específico en el mapa
  const handleViewOnMap = (reporte: any) => {
    if (reporte.latitud && reporte.longitud) {
      // Navegar al mapa con los parámetros de ubicación
      navigate(`/mapa?lat=${reporte.latitud}&lng=${reporte.longitud}&reportId=${reporte.id}`);
    } else {
      // Si no tiene coordenadas, simplemente ir al mapa
      navigate('/mapa');
      setMessage({ 
        type: 'error', 
        text: 'Este reporte no tiene ubicación específica registrada.' 
      });
    }
  };

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

  // Función para manejar la subida de foto de perfil
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido.' });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen debe ser menor a 5MB.' });
      return;
    }

    setUploadingPhoto(true);
    setMessage(null);

    try {
      // Convertir la imagen a base64 para guardarla en localStorage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        
        try {
          await updateUserProfile({
            ...userProfile,
            photoURL: imageDataUrl
          });
          setMessage({ type: 'success', text: 'Foto de perfil actualizada correctamente.' });
        } catch (error: any) {
          setMessage({ type: 'error', text: 'Error al actualizar la foto de perfil.' });
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Error al procesar la imagen.' });
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error al subir la imagen.' });
      setUploadingPhoto(false);
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
      setMessage({ 
        type: 'success', 
        text: 'Email de verificación enviado. Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.' 
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    if ((window as any).verifyEmail) {
      (window as any).verifyEmail();
      setMessage({ 
        type: 'success', 
        text: '¡Email verificado correctamente!' 
      });
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
          <div className="avatar-section">
            <div className="avatar">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {(userProfile.nombre || '').charAt(0)}{(userProfile.apellidos || '').charAt(0)}
                </div>
              )}
            </div>
            <div className="avatar-upload">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                disabled={uploadingPhoto}
              />
              <label htmlFor="photo-upload" className="upload-button">
                {uploadingPhoto ? (
                  <span>⏳ Subiendo...</span>
                ) : (
                  <span>📷 {userProfile.photoURL ? 'Cambiar foto' : 'Añadir foto'}</span>
                )}
              </label>
            </div>
          </div>
          <div className="user-info">
            <h1 className='nombre-principal'>{userProfile.nombre} {userProfile.apellidos}</h1>
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
            {message.type === 'success' && message.text.includes('Revisa tu bandeja') && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={handleVerifyEmail}
                  className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  🔗 Simular clic en enlace de verificación
                </button>
              </div>
            )}
          </div>
        )}

        <div className="perfil-body">
          <div className="section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Información Personal</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                  style={{ marginLeft: '20px' }}
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
                <div className="stat-number">{userReports.length}</div>
                <div className="stat-label">Reportes Realizados</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Mis Reportes</h2>
            {userReports.length === 0 ? (
              <div className="empty-state">
                {loadingReports ? (
                  <p>Cargando reportes...</p>
                ) : (
                  <>
                    <p>Aún no has realizado ningún reporte</p>
                    <button className="btn-primary" onClick={handleCreateReport}>Crear mi primer reporte</button>
                  </>
                )}
              </div>
            ) : (
              <div className="reportes-list">
                {userReports.map((reporte, index) => (
                  <div key={reporte.id || index} className="reporte-item">
                    <div className="reporte-content">
                      <h4>{reporte.calle || `Reporte #${index + 1}`}</h4>
                      <p><strong>Descripción:</strong> {reporte.descripción}</p>
                      {reporte.tipo && <p><strong>Tipo:</strong> {reporte.tipo}</p>}
                      {reporte.dificultad && <p><strong>Dificultad:</strong> {reporte.dificultad}</p>}
                      <p><strong>Fecha:</strong> {new Date(reporte.fecha).toLocaleDateString()}</p>
                      {reporte.imagen && (
                        <div style={{ marginTop: '10px' }}>
                          <img 
                            src={reporte.imagen} 
                            alt="Imagen del reporte" 
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="reporte-actions">
                      <button 
                        className="btn-link"
                        onClick={() => handleViewOnMap(reporte)}
                      >
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section danger-zone">
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