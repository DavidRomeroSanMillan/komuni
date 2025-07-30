// Hook personalizado para obtener el contador real de reportes del usuario
import { useState, useEffect } from 'react';
import { getReportes } from '../../services/api';
import type { UserProfile } from '../contexts/AuthContextLocalStorage';

export function useUserReportsCount(userProfile: UserProfile | null): number {
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    const fetchReportsCount = async () => {
      if (!userProfile) {
        setReportsCount(0);
        return;
      }

      try {
        console.log('🔍 [useUserReportsCount] Calculando reportes para:', userProfile.email);
        
        // Obtener todos los reportes
        const allReports = await getReportes();
        
        // Filtrar reportes del usuario de dos maneras:
        // 1. Por IDs en la lista del usuario (localStorage)
        const reportsByIds = allReports.filter(report => 
          userProfile.reportes && userProfile.reportes.includes(report.id)
        );
        
        // 2. Por email del usuario (Firebase)
        const reportsByEmail = allReports.filter(report => 
          report.userEmail === userProfile.email
        );
        
        // Combinar ambas listas y eliminar duplicados
        const combinedReports = [...reportsByIds];
        reportsByEmail.forEach(report => {
          if (!combinedReports.find(r => r.id === report.id)) {
            combinedReports.push(report);
          }
        });
        
        const count = combinedReports.length;
        console.log('📊 [useUserReportsCount] Total reportes encontrados:', count);
        setReportsCount(count);
        
      } catch (error) {
        console.error('❌ [useUserReportsCount] Error al obtener reportes:', error);
        setReportsCount(0);
      }
    };

    fetchReportsCount();
  }, [userProfile?.email, userProfile?.reportes]);

  return reportsCount;
}
