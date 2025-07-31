import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextLocalStorage';
import './Auth.css';

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
    genero: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const age = calculateAge(formData.fechaNacimiento);
      if (age < 13) {
        newErrors.fechaNacimiento = 'Debes ser mayor de 13 años para registrarte';
      } else if (age > 120) {
        newErrors.fechaNacimiento = 'Por favor, verifica tu fecha de nacimiento';
      }
    }

    // Validar género
    if (!formData.genero) {
      newErrors.genero = 'Selecciona tu género';
    }

    // Validar términos y condiciones
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
      });
      
      // Mostrar mensaje de éxito y redirigir
      alert('Registro exitoso! Se ha enviado un correo de verificación a tu email.');
      navigate('/login');
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register">
        <div className="auth-header">
          <img src="/icons/logo-solo.png" alt="Komuni Logo" className="auth-logo" />
          <h1>Crear Cuenta</h1>
          <p>Únete a la comunidad Komuni</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className={errors.nombre ? 'error' : ''}
                disabled={loading}
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Tus apellidos"
                className={errors.apellidos ? 'error' : ''}
                disabled={loading}
              />
              {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@ejemplo.com"
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={errors.fechaNacimiento ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
              {errors.fechaNacimiento && <span className="error-message">{errors.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género *</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={errors.genero ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No binario">No binario</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && <span className="error-message">{errors.genero}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            <div className="password-requirements">
              <small>
                La contraseña debe contener al menos una mayúscula, una minúscula y un número
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Acepto la{' '}
              <Link to="/privacidad" target="_blank" className="auth-link">
                política de privacidad.
              </Link>
            </label>
            {errors.terms && <span className="error-message">{errors.terms}</span>}
          </div>

          {errors.submit && (
            <div className="alert alert-error">
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading || !acceptTerms}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
