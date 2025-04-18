import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Obtiene estadísticas generales para el dashboard de administrador
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Obteniendo estadísticas del dashboard...');
    
    // Consultas para estadísticas
    const usersQuery = `SELECT COUNT(*) as total FROM usuarios`;
    const activeUsersQuery = `SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'`;
    const pendingUsersQuery = `SELECT COUNT(*) as total FROM usuarios WHERE estado = 'inactivo'`;
    const offersQuery = `SELECT COUNT(*) as total FROM ofertas`;
    const activeOffersQuery = `SELECT COUNT(*) as total FROM ofertas WHERE estado = 'activa'`;
    const pendingOffersQuery = `SELECT COUNT(*) as total FROM ofertas WHERE estado = 'pendiente'`;
    
    // Ejecutar consultas en paralelo
    console.log('Ejecutando consultas para estadísticas...');
    const [
      usersResult, 
      activeUsersResult, 
      pendingUsersResult, 
      offersResult,
      activeOffersResult,
      pendingOffersResult
    ] = await Promise.all([
      pool.query(usersQuery),
      pool.query(activeUsersQuery),
      pool.query(pendingUsersQuery),
      pool.query(offersQuery),
      pool.query(activeOffersQuery),
      pool.query(pendingOffersQuery)
    ]);
    console.log('Consultas para estadísticas ejecutadas con éxito.');
    
    // Consulta para actividad reciente
    console.log('Ejecutando consulta para actividad reciente...');
    const recentActivityQuery = `
      (SELECT 'usuario' as tipo, id, nombre as detalle, fecha_creacion as fecha
       FROM usuarios
       ORDER BY fecha_creacion DESC
       LIMIT 5)
      UNION ALL
      (SELECT 'oferta' as tipo, id, nombre as detalle, fecha_creacion as fecha
       FROM ofertas
       ORDER BY fecha_creacion DESC
       LIMIT 5)
      ORDER BY fecha DESC
      LIMIT 10
    `;
    
    const recentActivityResult = await pool.query(recentActivityQuery);
    console.log('Consulta para actividad reciente ejecutada con éxito.');
    
    // Mapear la actividad reciente al formato esperado
    console.log('Mapeando actividad reciente...');
    const recentActivity = recentActivityResult.rows.map(item => {
      let type = '';
      let user = '';
      let title = '';
      
      if (item.tipo === 'usuario') {
        type = 'new_user';
        user = item.detalle;
      } else if (item.tipo === 'oferta') {
        type = 'new_offer';
        title = item.detalle;
      }
      
      return {
        id: item.id,
        type,
        user,
        title,
        timestamp: item.fecha
      };
    });
    console.log('Actividad reciente mapeada con éxito.');
    
    // Construir la respuesta
    console.log('Construyendo la respuesta...');
    const result = {
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total) || 0,
        activeUsers: parseInt(activeUsersResult.rows[0].total) || 0,
        pendingApproval: parseInt(pendingUsersResult.rows[0].total) || 0,
        totalOffers: parseInt(offersResult.rows[0].total) || 0,
        activePosts: parseInt(activeOffersResult.rows[0].total) || 0,
        pendingPosts: parseInt(pendingOffersResult.rows[0].total) || 0
      },
      recentActivity: recentActivity || []
    };
    
    console.log('Estadísticas del dashboard obtenidas:', result);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Estadísticas del dashboard obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    
    // Devuelve una estructura consistente incluso en caso de error
    res.status(500).json({
      success: false,
      data: {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          pendingApproval: 0,
          totalOffers: 0,
          activePosts: 0,
          pendingPosts: 0
        },
        recentActivity: []
      },
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
};

/**
 * Obtiene actividad reciente para el dashboard de administrador
 */
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Obteniendo actividad reciente...');
    // Parámetros opcionales para filtrar
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;
    
    // Consulta para obtener actividad reciente
    console.log(`Ejecutando consulta para actividad reciente con límite de ${limit} y días ${days}...`);
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
    console.log('Consulta para actividad reciente ejecutada con éxito.');
    
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