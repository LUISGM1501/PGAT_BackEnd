import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Genera reporte de usuarios
 */
export const generateUsersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parámetros para filtrar el reporte
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;
    
    // Construir consulta base
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
    
    // Añadir filtros si se proporcionan
    if (startDate) {
      query += ` AND u.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND u.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }
    
    if (tipo) {
      query += ` AND u.tipo = $${queryParams.length + 1}`;
      queryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND u.estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    // Ordenar resultados
    query += ` ORDER BY u.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Preparar estadísticas adicionales para el reporte
    const countByTypeQuery = `
      SELECT tipo, COUNT(*) as total
      FROM usuarios
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND fecha_creacion <= '${endDate}'` : ''}
      ${estado ? ` AND estado = '${estado}'` : ''}
      GROUP BY tipo
    `;
    
    const countByStatusQuery = `
      SELECT estado, COUNT(*) as total
      FROM usuarios
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND fecha_creacion <= '${endDate}'` : ''}
      ${tipo ? ` AND tipo = '${tipo}'` : ''}
      GROUP BY estado
    `;
    
    const [typeStats, statusStats] = await Promise.all([
      pool.query(countByTypeQuery),
      pool.query(countByStatusQuery)
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          startDate: startDate || 'No especificada',
          endDate: endDate || 'No especificada',
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
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;
    const escuelaId = req.query.escuela_id as string;
    
    // Construir consulta base
    let query = `
      SELECT 
        o.id,
        o.nombre,
        o.tipo,
        o.descripcion,
        o.vacantes,
        o.horas_semana,
        o.fecha_inicio,
        o.fecha_fin,
        o.estado,
        o.fecha_creacion,
        e.nombre as escuela_nombre,
        p.nombre as profesor_nombre,
        o.promedio_minimo,
        o.cursos_requeridos,
        o.beneficio,
        (SELECT COUNT(*) FROM postulaciones WHERE oferta_id = o.id) as total_postulaciones,
        (SELECT COUNT(*) FROM postulaciones WHERE oferta_id = o.id AND estado = 'aprobada') as postulaciones_aprobadas
      FROM ofertas o
      LEFT JOIN escuelas e ON o.escuela_id = e.id
      LEFT JOIN profesores p ON o.profesor_id = p.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros si se proporcionan
    if (startDate) {
      query += ` AND o.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND o.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }
    
    if (tipo) {
      query += ` AND o.tipo = $${queryParams.length + 1}`;
      queryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND o.estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    if (escuelaId) {
      query += ` AND o.escuela_id = $${queryParams.length + 1}`;
      queryParams.push(parseInt(escuelaId));
    }
    
    // Ordenar resultados
    query += ` ORDER BY o.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Preparar estadísticas adicionales para el reporte
    const countByTypeQuery = `
      SELECT tipo, COUNT(*) as total
      FROM ofertas
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND fecha_creacion <= '${endDate}'` : ''}
      ${estado ? ` AND estado = '${estado}'` : ''}
      ${escuelaId ? ` AND escuela_id = ${escuelaId}` : ''}
      GROUP BY tipo
    `;
    
    const countByStatusQuery = `
      SELECT estado, COUNT(*) as total
      FROM ofertas
      WHERE 1=1
      ${startDate ? ` AND fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND fecha_creacion <= '${endDate}'` : ''}
      ${tipo ? ` AND tipo = '${tipo}'` : ''}
      ${escuelaId ? ` AND escuela_id = ${escuelaId}` : ''}
      GROUP BY estado
    `;
    
    const [typeStats, statusStats] = await Promise.all([
      pool.query(countByTypeQuery),
      pool.query(countByStatusQuery)
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          startDate: startDate || 'No especificada',
          endDate: endDate || 'No especificada',
          tipo: tipo || 'Todos',
          estado: estado || 'Todos',
          escuela: escuelaId || 'Todas'
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
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const estado = req.query.estado as string;
    const escuelaId = req.query.escuela_id as string;
    const tipoOferta = req.query.tipo_oferta as string;
    
    // Construir consulta base
    let query = `
      SELECT 
        p.id,
        p.estudiante_id,
        p.oferta_id,
        p.fecha_postulacion,
        p.estado,
        p.fecha_actualizacion,
        e.carnet as estudiante_carnet,
        ue.nombre as estudiante_nombre,
        e.carrera as estudiante_carrera,
        o.nombre as oferta_nombre,
        o.tipo as oferta_tipo,
        o.fecha_inicio as oferta_inicio,
        o.fecha_fin as oferta_fin,
        esc.nombre as escuela_nombre,
        prof.nombre as profesor_nombre,
        be.tipo as tipo_beneficio,
        be.monto_total as monto_beneficio,
        be.porcentaje_exoneracion
      FROM postulaciones p
      JOIN estudiantes e ON p.estudiante_id = e.id
      JOIN usuarios ue ON e.usuario_id = ue.id
      JOIN ofertas o ON p.oferta_id = o.id
      LEFT JOIN escuelas esc ON o.escuela_id = esc.id
      LEFT JOIN profesores prof ON o.profesor_id = prof.id
      LEFT JOIN beneficios_economicos be ON p.id = be.postulacion_id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros si se proporcionan
    if (startDate) {
      query += ` AND p.fecha_postulacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND p.fecha_postulacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }
    
    if (estado) {
      query += ` AND p.estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    if (escuelaId) {
      query += ` AND o.escuela_id = $${queryParams.length + 1}`;
      queryParams.push(parseInt(escuelaId));
    }
    
    if (tipoOferta) {
      query += ` AND o.tipo = $${queryParams.length + 1}`;
      queryParams.push(tipoOferta);
    }
    
    // Ordenar resultados
    query += ` ORDER BY p.fecha_postulacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Preparar estadísticas adicionales para el reporte
    const countByStatusQuery = `
      SELECT p.estado, COUNT(*) as total
      FROM postulaciones p
      JOIN ofertas o ON p.oferta_id = o.id
      WHERE 1=1
      ${startDate ? ` AND p.fecha_postulacion >= '${startDate}'` : ''}
      ${endDate ? ` AND p.fecha_postulacion <= '${endDate}'` : ''}
      ${escuelaId ? ` AND o.escuela_id = ${escuelaId}` : ''}
      ${tipoOferta ? ` AND o.tipo = '${tipoOferta}'` : ''}
      GROUP BY p.estado
    `;
    
    const countByOfferTypeQuery = `
      SELECT o.tipo, COUNT(*) as total
      FROM postulaciones p
      JOIN ofertas o ON p.oferta_id = o.id
      WHERE 1=1
      ${startDate ? ` AND p.fecha_postulacion >= '${startDate}'` : ''}
      ${endDate ? ` AND p.fecha_postulacion <= '${endDate}'` : ''}
      ${estado ? ` AND p.estado = '${estado}'` : ''}
      ${escuelaId ? ` AND o.escuela_id = ${escuelaId}` : ''}
      GROUP BY o.tipo
    `;
    
    const [statusStats, offerTypeStats] = await Promise.all([
      pool.query(countByStatusQuery),
      pool.query(countByOfferTypeQuery)
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          startDate: startDate || 'No especificada',
          endDate: endDate || 'No especificada',
          estado: estado || 'Todos',
          escuela: escuelaId || 'Todas',
          tipoOferta: tipoOferta || 'Todos'
        },
        totalRecords: result.rows.length
      },
      statistics: {
        byStatus: statusStats.rows,
        byOfferType: offerTypeStats.rows
      },
      data: result.rows
    };
    
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
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;
    const escuelaId = req.query.escuela_id as string;
    
    // Construir consulta base
    let query = `
      SELECT 
        be.id,
        be.postulacion_id,
        be.tipo,
        be.porcentaje_exoneracion,
        be.monto_por_hora,
        be.total_horas,
        be.monto_total,
        be.estado,
        be.fecha_creacion,
        p.estado as estado_postulacion,
        e.carnet as estudiante_carnet,
        ue.nombre as estudiante_nombre,
        o.nombre as oferta_nombre,
        o.tipo as oferta_tipo,
        esc.nombre as escuela_nombre
      FROM beneficios_economicos be
      JOIN postulaciones p ON be.postulacion_id = p.id
      JOIN estudiantes e ON p.estudiante_id = e.id
      JOIN usuarios ue ON e.usuario_id = ue.id
      JOIN ofertas o ON p.oferta_id = o.id
      LEFT JOIN escuelas esc ON o.escuela_id = esc.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Añadir filtros si se proporcionan
    if (startDate) {
      query += ` AND be.fecha_creacion >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND be.fecha_creacion <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }
    
    if (tipo) {
      query += ` AND be.tipo = $${queryParams.length + 1}`;
      queryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND be.estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    if (escuelaId) {
      query += ` AND o.escuela_id = $${queryParams.length + 1}`;
      queryParams.push(parseInt(escuelaId));
    }
    
    // Ordenar resultados
    query += ` ORDER BY be.fecha_creacion DESC`;
    
    // Ejecutar consulta
    const result = await pool.query(query, queryParams);
    
    // Preparar estadísticas adicionales para el reporte
    const countByTypeQuery = `
      SELECT be.tipo, COUNT(*) as total, SUM(COALESCE(be.monto_total, 0)) as suma_total
      FROM beneficios_economicos be
      JOIN postulaciones p ON be.postulacion_id = p.id
      JOIN ofertas o ON p.oferta_id = o.id
      WHERE 1=1
      ${startDate ? ` AND be.fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND be.fecha_creacion <= '${endDate}'` : ''}
      ${estado ? ` AND be.estado = '${estado}'` : ''}
      ${escuelaId ? ` AND o.escuela_id = ${escuelaId}` : ''}
      GROUP BY be.tipo
    `;
    
    const countByStatusQuery = `
      SELECT be.estado, COUNT(*) as total, SUM(COALESCE(be.monto_total, 0)) as suma_total
      FROM beneficios_economicos be
      JOIN postulaciones p ON be.postulacion_id = p.id
      JOIN ofertas o ON p.oferta_id = o.id
      WHERE 1=1
      ${startDate ? ` AND be.fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND be.fecha_creacion <= '${endDate}'` : ''}
      ${tipo ? ` AND be.tipo = '${tipo}'` : ''}
      ${escuelaId ? ` AND o.escuela_id = ${escuelaId}` : ''}
      GROUP BY be.estado
    `;
    
    // Calcular totales por escuela
    const totalsBySchoolQuery = `
      SELECT 
        esc.nombre as escuela, 
        COUNT(*) as total_beneficios, 
        SUM(COALESCE(be.monto_total, 0)) as suma_total
      FROM beneficios_economicos be
      JOIN postulaciones p ON be.postulacion_id = p.id
      JOIN ofertas o ON p.oferta_id = o.id
      JOIN escuelas esc ON o.escuela_id = esc.id
      WHERE 1=1
      ${startDate ? ` AND be.fecha_creacion >= '${startDate}'` : ''}
      ${endDate ? ` AND be.fecha_creacion <= '${endDate}'` : ''}
      ${tipo ? ` AND be.tipo = '${tipo}'` : ''}
      ${estado ? ` AND be.estado = '${estado}'` : ''}
      GROUP BY esc.nombre
      ORDER BY suma_total DESC
    `;
    
    const [typeStats, statusStats, schoolStats] = await Promise.all([
      pool.query(countByTypeQuery),
      pool.query(countByStatusQuery),
      pool.query(totalsBySchoolQuery)
    ]);
    
    // Calcular totales generales
    const totalAmount = result.rows.reduce((sum, item) => sum + (parseFloat(item.monto_total) || 0), 0);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        filters: {
          startDate: startDate || 'No especificada',
          endDate: endDate || 'No especificada',
          tipo: tipo || 'Todos',
          estado: estado || 'Todos',
          escuela: escuelaId || 'Todas'
        },
        totalRecords: result.rows.length,
        totalAmount: totalAmount
      },
      statistics: {
        byType: typeStats.rows,
        byStatus: statusStats.rows,
        bySchool: schoolStats.rows
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
    // Parámetros para filtrar el reporte
    const startDate = req.query.start_date as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Último mes por defecto
    const endDate = req.query.end_date as string || new Date().toISOString().split('T')[0]; // Hoy por defecto
    
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
    
    // Ejecutar consultas en paralelo
    const [newUsers, newOffers, newApplications, accessByHour] = await Promise.all([
      pool.query(newUsersQuery, [startDate, endDate]),
      pool.query(newOffersQuery, [startDate, endDate]),
      pool.query(newApplicationsQuery, [startDate, endDate]),
      pool.query(accessByHourQuery, [startDate, endDate])
    ]);
    
    // Construir respuesta
    const report = {
      metadata: {
        generatedAt: new Date(),
        period: {
          startDate,
          endDate
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