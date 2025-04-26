import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Genera reporte de usuarios
 */
export const generateUsersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener parámetros
    const { period, tipo, estado } = req.query;
    let startDate, endDate;
    
    // Calcular fechas según el período
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'semester':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      // Si es 'all' o no hay período, no ponemos filtro de fechas
    }
    
    // Construir consulta
    let query = `
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.tipo,
        u.estado,
        u.fecha_creacion,
        u.ultimo_acceso,
        CASE
          WHEN u.tipo = 'estudiante' THEN e.carnet
          ELSE NULL
        END as carnet,
        CASE
          WHEN u.tipo = 'estudiante' THEN e.carrera
          ELSE NULL
        END as carrera,
        CASE
          WHEN u.tipo = 'profesor' THEN p.departamento
          ELSE NULL
        END as departamento,
        CASE
          WHEN u.tipo = 'escuela' THEN esc.facultad
          ELSE NULL
        END as facultad
      FROM usuarios u
      LEFT JOIN estudiantes e ON u.id = e.usuario_id AND u.tipo = 'estudiante'
      LEFT JOIN profesores p ON u.id = p.usuario_id AND u.tipo = 'profesor'
      LEFT JOIN escuelas esc ON u.id = esc.usuario_id AND u.tipo = 'escuela'
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros de fechas si los hay
    if (startDate) {
      query += ` AND u.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate.toISOString());
    }
    
    if (endDate) {
      query += ` AND u.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate.toISOString());
    }
    
    if (tipo) {
      query += ` AND u.tipo = $${queryParams.length + 1}`;
      queryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND u.estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    // Ordenar por fecha de creación
    query += ` ORDER BY u.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Estadísticas adicionales para el reporte
    const countByTypeQuery = `
      SELECT tipo, COUNT(*) as total
      FROM usuarios
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= $1` : ''}
      ${endDate ? ` AND fecha_creacion <= $2` : ''}
      ${estado ? ` AND estado = '${estado}'` : ''}
      GROUP BY tipo
    `;
    
    const countByStatusQuery = `
      SELECT estado, COUNT(*) as total
      FROM usuarios
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= $1` : ''}
      ${endDate ? ` AND fecha_creacion <= $2` : ''}
      ${tipo ? ` AND tipo = '${tipo}'` : ''}
      GROUP BY estado
    `;
    
    const typeStatsParams = [];
    if (startDate) typeStatsParams.push(startDate.toISOString());
    if (endDate) typeStatsParams.push(endDate.toISOString());
    
    const [typeStats, statusStats] = await Promise.all([
      pool.query(countByTypeQuery, typeStatsParams),
      pool.query(countByStatusQuery, typeStatsParams)
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          period: period || 'all',
          startDate: startDate ? startDate.toISOString().split('T')[0] : null,
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
          tipo: tipo || 'Todos',
          estado: estado || 'Todos'
        },
        totalRecords: result.rows.length
      },
      statistics: {
        byType: typeStats.rows,
        byStatus: statusStats.rows
      },
      data: result.rows
    };
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Reporte de usuarios generado correctamente'
    });
  } catch (error) {
    console.error('Error generando reporte de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de usuarios'
    });
  }
};

/**
 * Genera reporte de ofertas académicas
 */
export const generateOffersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parámetros para filtrar el reporte
    const { period } = req.query;
    let startDate, endDate;
    
    // Calcular fechas según el período
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'semester':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      // Si es 'all' o no hay período, no ponemos filtro de fechas
    }
    
    // Construir consulta (corregida para evitar el error con e.nombre)
    let query = `
      SELECT 
        o.*,
        (SELECT nombre FROM escuelas WHERE id = o.escuela_id) as escuela_nombre,
        (SELECT nombre FROM profesores WHERE id = o.profesor_id) as profesor_nombre,
        (SELECT COUNT(*) FROM postulaciones WHERE oferta_id = o.id) as total_postulaciones
      FROM ofertas o
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros de fechas si los hay
    if (startDate) {
      query += ` AND o.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate.toISOString());
    }
    
    if (endDate) {
      query += ` AND o.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate.toISOString());
    }
    
    // Ordenar por fecha de creación
    query += ` ORDER BY o.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Estadísticas adicionales para el reporte - Contar por tipo
    const countByTypeQuery = `
      SELECT tipo, COUNT(*) as total
      FROM ofertas
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= $1` : ''}
      ${endDate ? ` AND fecha_creacion <= $2` : ''}
      GROUP BY tipo
    `;
    
    const typeStatsParams = [];
    if (startDate) typeStatsParams.push(startDate.toISOString());
    if (endDate) typeStatsParams.push(endDate.toISOString());
    
    const typeStats = await pool.query(countByTypeQuery, typeStatsParams);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          period: period || 'all',
          startDate: startDate ? startDate.toISOString().split('T')[0] : null,
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        },
        totalRecords: result.rows.length
      },
      statistics: {
        byType: typeStats.rows
      },
      data: result.rows
    };
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Reporte de ofertas generado correctamente'
    });
  } catch (error) {
    console.error('Error generando reporte de ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ofertas'
    });
  }
};

/**
 * Genera reporte de postulaciones
 */
export const generateApplicationsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parámetros para filtrar el reporte
    console.log(req.query); 
    const { period } = req.query;
    let startDate, endDate;
    
    // Calcular fechas según el período
    console.log(period);
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'semester':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      // Si es 'all' o no hay período, no ponemos filtro de fechas
    }
    
    // Construir consulta (corregida para evitar el error con esc.nombre)
    let query = `
    SELECT 
      p.*,
      o.nombre as oferta_nombre,
      o.tipo as oferta_tipo,
      o.escuela_id,
      e.carnet as estudiante_carnet,
      u.nombre as estudiante_nombre
    FROM postulaciones p
    JOIN ofertas o ON p.oferta_id = o.id
    JOIN estudiantes e ON p.estudiante_id = e.id
    JOIN usuarios u ON e.usuario_id = u.id
    WHERE 1=1
  `;
    
    const queryParams: any[] = [];
    console.log(queryParams);
    
    // Añadir filtros de fechas si los hay
    if (startDate) {
      query += ` AND p.fecha_postulacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate.toISOString());
    }
    
    if (endDate) {
      query += ` AND p.fecha_postulacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate.toISOString());
    }
    
    // Ordenar por fecha de postulación
    query += ` ORDER BY p.fecha_postulacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Estadísticas adicionales para el reporte
    const countByStatusQuery = `
      SELECT estado, COUNT(*) as total
      FROM postulaciones
      WHERE 1=1
      ${startDate ? ` AND fecha_postulacion >= $1` : ''}
      ${endDate ? ` AND fecha_postulacion <= $2` : ''}
      GROUP BY estado
    `;
    
    const statusStatsParams = [];
    if (startDate) statusStatsParams.push(startDate.toISOString());
    if (endDate) statusStatsParams.push(endDate.toISOString());
    
    const statusStats = await pool.query(countByStatusQuery, statusStatsParams);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          period: period || 'all',
          startDate: startDate ? startDate.toISOString().split('T')[0] : null,
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        },
        totalRecords: result.rows.length
      },
      statistics: {
        byStatus: statusStats.rows
      },
      data: result.rows
    };
    console.log(report);
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Reporte de postulaciones generado correctamente'
    });
  } catch (error) {
    console.error('Error generando reporte de postulaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de postulaciones'
    });
  }
};

/**
 * Genera reporte de beneficios económicos
 */
export const generateBenefitsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parámetros para filtrar el reporte
    const { period } = req.query;
    let startDate, endDate;
    
    // Calcular fechas según el período
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'semester':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      // Si es 'all' o no hay período, no ponemos filtro de fechas
    }
    
    // En este caso, para evitar errores de columnas inexistentes, simplificaremos la consulta
    let query = `
      SELECT 
        be.*,
        o.nombre as oferta_nombre,
        o.tipo as oferta_tipo,
        p.estado as postulacion_estado,
        u.nombre as estudiante_nombre
      FROM beneficios_economicos be
      JOIN postulaciones p ON be.postulacion_id = p.id
      JOIN ofertas o ON p.oferta_id = o.id
      JOIN estudiantes e ON p.estudiante_id = e.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros de fechas si los hay
    if (startDate) {
      query += ` AND be.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate.toISOString());
    }
    
    if (endDate) {
      query += ` AND be.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate.toISOString());
    }
    
    // Ordenar por fecha de creación
    query += ` ORDER BY be.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Estadísticas adicionales para el reporte
    const countByTypeQuery = `
      SELECT tipo, COUNT(*) as total, SUM(COALESCE(monto_total, 0)) as suma_total
      FROM beneficios_economicos
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= $1` : ''}
      ${endDate ? ` AND fecha_creacion <= $2` : ''}
      GROUP BY tipo
    `;
    
    const typeStatsParams = [];
    if (startDate) typeStatsParams.push(startDate.toISOString());
    if (endDate) typeStatsParams.push(endDate.toISOString());
    
    const typeStats = await pool.query(countByTypeQuery, typeStatsParams);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          period: period || 'all',
          startDate: startDate ? startDate.toISOString().split('T')[0] : null,
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        },
        totalRecords: result.rows.length
      },
      statistics: {
        byType: typeStats.rows
      },
      data: result.rows
    };
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Reporte de beneficios económicos generado correctamente'
    });
  } catch (error) {
    console.error('Error generando reporte de beneficios económicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de beneficios económicos'
    });
  }
};

/**
 * Genera reporte de actividad del sistema
 */
export const generateActivityReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener parámetros
    const { period } = req.query;
    let startDate, endDate;
    console.log(period);
    
    // Si period es 'all' o no está definido, buscar en todo el historial
    if (!period || period === 'all') {
      // Buscar desde una fecha muy antigua para incluir todo
      startDate = new Date('2000-01-01'); // Una fecha suficientemente antigua
      endDate = new Date(); // Hasta hoy
    } else {
      // Aplicar filtros normales para otros períodos
      switch(period) {
        case 'week':
          console.log('week');
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          endDate = new Date();
          break;
        case 'month':
          console.log('month');
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = new Date();
          break;
        case 'semester':
          console.log('semester');
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
          endDate = new Date();
          break;
        case 'year':
          console.log('year');
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate = new Date();
          break;
        default:
          console.log('default');
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Último mes por defecto
          endDate = new Date(); // Hoy por defecto
      }
    }
    
    // Estadísticas de nuevos usuarios por día
    const newUsersQuery = `
      SELECT 
        DATE(fecha_creacion) as fecha, 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN tipo = 'estudiante' THEN 1 ELSE 0 END) as estudiantes,
        SUM(CASE WHEN tipo = 'profesor' THEN 1 ELSE 0 END) as profesores,
        SUM(CASE WHEN tipo = 'escuela' THEN 1 ELSE 0 END) as escuelas,
        SUM(CASE WHEN tipo = 'admin' THEN 1 ELSE 0 END) as administradores
      FROM usuarios
      WHERE fecha_creacion BETWEEN $1 AND $2
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha
    `;
    console.log(newUsersQuery);
    
    // Estadísticas de nuevas ofertas por día
    const newOffersQuery = `
      SELECT 
        DATE(fecha_creacion) as fecha, 
        COUNT(*) as total_ofertas,
        SUM(CASE WHEN tipo = 'Asistencia' THEN 1 ELSE 0 END) as asistencias,
        SUM(CASE WHEN tipo = 'Tutoría' THEN 1 ELSE 0 END) as tutorias,
        SUM(CASE WHEN tipo = 'Proyecto' THEN 1 ELSE 0 END) as proyectos
      FROM ofertas
      WHERE fecha_creacion BETWEEN $1 AND $2
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha
    `;
    console.log(newOffersQuery);
    
    // Estadísticas de nuevas postulaciones por día
    const newApplicationsQuery = `
      SELECT 
        DATE(fecha_postulacion) as fecha, 
        COUNT(*) as total_postulaciones,
        SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM postulaciones
      WHERE fecha_postulacion BETWEEN $1 AND $2
      GROUP BY DATE(fecha_postulacion)
      ORDER BY fecha
    `;
    console.log(newApplicationsQuery);

    // Obtener estadísticas de accesos por hora del día
    const accessByHourQuery = `
      SELECT 
        EXTRACT(HOUR FROM ultimo_acceso) as hora,
        COUNT(*) as total_accesos
      FROM usuarios
      WHERE ultimo_acceso BETWEEN $1 AND $2
      GROUP BY hora
      ORDER BY hora
    `;
    console.log(accessByHourQuery);

    // Ejecutar consultas en paralelo
    const [newUsers, newOffers, newApplications, accessByHour] = await Promise.all([
      pool.query(newUsersQuery, [startDate.toISOString(), endDate.toISOString()]),
      pool.query(newOffersQuery, [startDate.toISOString(), endDate.toISOString()]),
      pool.query(newApplicationsQuery, [startDate.toISOString(), endDate.toISOString()]),
      pool.query(accessByHourQuery, [startDate.toISOString(), endDate.toISOString()])
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      },
      dailyActivity: {
        users: newUsers.rows,
        offers: newOffers.rows,
        applications: newApplications.rows
      },
      accessPatterns: {
        byHour: accessByHour.rows
      },
      summary: {
        totalNewUsers: newUsers.rows.reduce((sum, day) => sum + parseInt(day.total_usuarios), 0),
        totalNewOffers: newOffers.rows.reduce((sum, day) => sum + parseInt(day.total_ofertas), 0),
        totalNewApplications: newApplications.rows.reduce((sum, day) => sum + parseInt(day.total_postulaciones), 0)
      }
    };
    console.log(report);
    

    res.status(200).json({
      success: true,
      data: report,
      message: 'Reporte de actividad del sistema generado correctamente'
    });
  } catch (error) {
    console.error('Error generando reporte de actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de actividad del sistema'
    });
  }
};