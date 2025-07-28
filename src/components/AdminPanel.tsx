import { useEffect, useState } from 'react';
import { getStats, getContactMessages, type ContactMessage } from '../../services/firebaseService';
import { getReportes } from '../../services/api';

interface Stats {
  totalUsers: number;
  totalReports: number;
  totalContacts: number;
  totalAdmins: number;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalReports: 0,
    totalContacts: 0,
    totalAdmins: 0
  });
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener estadísticas
        const statsData = await getStats();
        setStats(statsData);

        // Obtener mensajes de contacto
        const contactsData = await getContactMessages();
        setContacts(contactsData.slice(0, 5)); // Solo los últimos 5

        // Obtener reportes
        const reportsData = await getReportes();
        setReports(reportsData.slice(0, 5)); // Solo los últimos 5

      } catch (err) {
        console.error('Error al cargar datos del panel:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Panel de Administración</h1>
      
      {/* Estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3>Usuarios</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalUsers}
          </p>
        </div>
        
        <div style={{ 
          background: '#f3e5f5', 
          padding: '1rem', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3>Reportes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>
            {stats.totalReports}
          </p>
        </div>
        
        <div style={{ 
          background: '#e8f5e8', 
          padding: '1rem', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3>Contactos</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.totalContacts}
          </p>
        </div>
        
        <div style={{ 
          background: '#fff3e0', 
          padding: '1rem', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3>Administradores</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.totalAdmins}
          </p>
        </div>
      </div>

      {/* Mensajes de contacto recientes */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Mensajes de Contacto Recientes</h2>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          {contacts.length === 0 ? (
            <p>No hay mensajes de contacto</p>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  marginBottom: '0.5rem', 
                  borderRadius: '4px',
                  border: contact.leido ? '1px solid #e0e0e0' : '1px solid #2196f3'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{contact.nombre}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(contact.fecha).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{contact.email}</p>
                <p>{contact.mensaje}</p>
                {!contact.leido && (
                  <span style={{ 
                    background: '#2196f3', 
                    color: 'white', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem' 
                  }}>
                    Nuevo
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reportes recientes */}
      <div>
        <h2>Reportes Recientes</h2>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          {reports.length === 0 ? (
            <p>No hay reportes</p>
          ) : (
            reports.map((report) => (
              <div 
                key={report.id} 
                style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  marginBottom: '0.5rem', 
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{report.direccion}</h4>
                  <span style={{ 
                    background: report.estado === 'pendiente' ? '#ff9800' : 
                              report.estado === 'en_proceso' ? '#2196f3' : '#4caf50',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {report.estado || 'pendiente'}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {report.tipoObstaculo} - {report.nivelBarrera}
                </p>
                <p>{report.descripcion}</p>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                  <span>Fecha: {new Date(report.fecha).toLocaleDateString()}</span>
                  {report.usuario && (
                    <span style={{ marginLeft: '1rem' }}>
                      Reportado por: {report.usuario.nombre}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
