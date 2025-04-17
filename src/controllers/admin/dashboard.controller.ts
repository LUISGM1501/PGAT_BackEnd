import { Request, Response } from 'express';
import pool from '../../config/database';
import { UsuarioModel } from '../../models/Usuario.model';
import { OfertaModel } from '../../models/Oferta.model';
import { PostulacionModel } from '../../models/Postulacion.model';

/**
 * Obtiene estadísticas generales para el dashboard de administrador
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Consultas para estadísticas
    const usersCountQuery = `
      SELECT tipo, COUNT(*) as total 
      FROM usuarios 
      GROUP BY tipo
    `;
    
    const offersStatusQuery = `
      SELECT estado, COUNT(*) as total 
      FROM ofertas 
      GROUP BY estado
    `;
    
    const applicationsStatusQuery = `
      SELECT estado, COUNT(*) as total 
      FROM postulaciones 
      GROUP BY estado
    `;
    
    const recentActivityQuery = `
      SELECT 'usuario' as tipo, id, nombre as detalle, fecha_creacion as fecha
      FROM usuarios
      WHERE fecha_creacion > NOW() - INTERVAL '30 days'
      UNION
      SELECT 'oferta' as tipo, id, nombre as detalle, fecha_creacion as fecha
      FROM ofertas
      WHERE fecha_creacion > NOW() - INTERVAL '30 days'
      UNION
      SELECT 'postulacion' as tipo, id, 'Nueva postulación' as detalle, fecha_postulacion as fecha
      FROM postulaciones
      WHERE fecha_postulacion > NOW() - INTERVAL '30 days'
      ORDER BY fecha DESC
      LIMIT 10
    `;
    
    // Ejecutar consultas en paralelo
    const [usersCount, offersStatus, applicationsStatus, recentActivity] = await Promise.all([
      pool.query(usersCountQuery),
      pool.query(offersStatusQuery),
      pool.query(applicationsStatusQuery),
      pool.query(recentActivityQuery)
    ]);
    
    // Contar total de usuarios, ofertas y postulaciones
    const totalUsers = await UsuarioModel.findAll();
    const totalOffers = await OfertaModel.findAll();
    const totalApplications = await PostulacionModel.findAll();
    
    // Preparar resultado
    const result = {
      stats: {
        totalUsers: totalUsers.length,
        totalOffers: totalOffers.length,
        totalApplications: totalApplications.length,
        usersByType: usersCount.rows,
        offersByStatus: offersStatus.rows,
        applicationsByStatus: applicationsStatus.rows
      },
      recentActivity: recentActivity.rows
    };
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Estadísticas del dashboard obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
};

/**
 * Obtiene actividad reciente para el dashboard de administrador
 */
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parámetros opcionales para filtrar
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;
    
    // Consulta para obtener actividad reciente
    const query = `
      SELECT 'usuario' as tipo, id, nombre as detalle, fecha_creacion as fecha 
      FROM usuarios 
      WHERE fecha_creacion > NOW() - INTERVAL '${days} days'
      UNION
      SELECT 'oferta' as tipo, id, nombre as detalle, fecha_creacion as fecha 
      FROM ofertas 
      WHERE fecha_creacion > NOW() - INTERVAL '${days} days'
      UNION
      SELECT 'postulacion' as tipo, id, 'Nueva postulación' as detalle, fecha_postulacion as fecha 
      FROM postulaciones 
      WHERE fecha_postulacion > NOW() - INTERVAL '${days} days'
      ORDER BY fecha DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Actividad reciente obtenida correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente'
    });
  }
};