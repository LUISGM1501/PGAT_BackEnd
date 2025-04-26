import { Request, Response } from 'express';
import pool from '../../config/database';

/**
 * Obtiene las ofertas pendientes de aprobación con filtros
 */
export const getPendingContent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraer parámetros de consulta
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tipo = req.query.tipo as string;
    const escuelaId = req.query.escuela_id as string;
    const profesorId = req.query.profesor_id as string;
    const search = req.query.search as string;
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Construir consulta base
    let query = `
      SELECT o.*, 
             e.nombre as escuela_nombre, 
             COALESCE(p.nombre, 'N/A') as profesor_nombre
      FROM ofertas o
      LEFT JOIN escuelas e ON o.escuela_id = e.id
      LEFT JOIN profesores p ON o.profesor_id = p.id
      WHERE o.estado = 'pendiente'
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM ofertas o
      LEFT JOIN escuelas e ON o.escuela_id = e.id
      LEFT JOIN profesores p ON o.profesor_id = p.id
      WHERE o.estado = 'pendiente'
    `;
    
    const queryParams: any[] = [];
    let countQueryParams: any[] = [];
    
    // Añadir filtros si se proporcionan
    if (tipo) {
      query += ` AND o.tipo = $${queryParams.length + 1}`;
      countQuery += ` AND o.tipo = $${countQueryParams.length + 1}`;
      queryParams.push(tipo);
      countQueryParams.push(tipo);
    }
    
    if (escuelaId) {
      query += ` AND o.escuela_id = $${queryParams.length + 1}`;
      countQuery += ` AND o.escuela_id = $${countQueryParams.length + 1}`;
      queryParams.push(parseInt(escuelaId));
      countQueryParams.push(parseInt(escuelaId));
    }
    
    if (profesorId) {
      query += ` AND o.profesor_id = $${queryParams.length + 1}`;
      countQuery += ` AND o.profesor_id = $${countQueryParams.length + 1}`;
      queryParams.push(parseInt(profesorId));
      countQueryParams.push(parseInt(profesorId));
    }
    
    if (search) {
      query += ` AND o.nombre ILIKE $${queryParams.length + 1}`;
      countQuery += ` AND o.nombre ILIKE $${countQueryParams.length + 1}`;
      queryParams.push(`%${search}%`);
      countQueryParams.push(`%${search}%`);
    }
    
    // Añadir paginación
    query += ` ORDER BY o.fecha_creacion DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Ejecutar consultas
    const [offersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countQueryParams)
    ]);
    
    const offers = offersResult.rows;
    const totalOffers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOffers / limit);
    
    res.status(200).json({
      success: true,
      data: {
        offers,
        pagination: {
          total: totalOffers,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: 'Ofertas pendientes obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo ofertas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas pendientes'
    });
  }
};

/**
 * Obtiene detalles de una oferta específica
 */
export const getContentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const contentId = parseInt(req.params.id);
    console.log(`Obteniendo detalles para la oferta con ID: ${contentId}`);
    
    if (isNaN(contentId)) {
      res.status(400).json({
        success: false,
        message: 'ID de oferta inválido'
      });
      return;
    }
    
    // Consulta modificada con nombres de alias correctos
    const query = `
      SELECT 
        o.*,
        e.nombre as escuela_nombre,
        p.nombre as profesor_nombre
      FROM ofertas o
      LEFT JOIN escuelas e ON o.escuela_id = e.id
      LEFT JOIN profesores p ON o.profesor_id = p.id
      WHERE o.id = $1
    `;
    
    try {
      const result = await pool.query(query, [contentId]);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Oferta no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Detalles de oferta obtenidos correctamente'
      });
    } catch (error) {
      console.error(`Error obteniendo detalles de oferta para ID: ${contentId}`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalles de la oferta'
      });
    }
  } catch (error) {
    console.error('Error general en getContentDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Aprueba una oferta pendiente
 */
export const approveContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const contentId = parseInt(req.params.id);
    
    if (isNaN(contentId)) {
      res.status(400).json({
        success: false,
        message: 'ID de oferta inválido'
      });
      return;
    }
    
    // Ejecutar SQL directo en lugar de usar el modelo
    const query = `
      UPDATE ofertas
      SET estado = 'activa'
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await pool.query(query, [contentId]);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Oferta no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Oferta aprobada correctamente'
      });
    } catch (updateError) {
      console.error('Error en actualización de oferta:', updateError);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la oferta'
      });
    }
  } catch (error) {
    console.error('Error aprobando oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar la oferta'
    });
  }
};

/**
 * Rechaza una oferta pendiente
 */
export const rejectContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const contentId = parseInt(req.params.id);
    
    if (isNaN(contentId)) {
      res.status(400).json({
        success: false,
        message: 'ID de oferta inválido'
      });
      return;
    }
    
    // Ejecutar SQL directo en lugar de usar el modelo, evitando la columna motivo_rechazo
    const query = `
      UPDATE ofertas
      SET estado = 'cancelada'
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await pool.query(query, [contentId]);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Oferta no encontrada'
        });
        return;
      }
      
      // Solo loguear el motivo, no intentar guardarlo
      if (req.body.motivo) {
        console.log(`Oferta ${contentId} rechazada. Motivo: ${req.body.motivo}`);
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Oferta rechazada correctamente'
      });
    } catch (updateError) {
      console.error('Error en actualización de oferta:', updateError);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la oferta'
      });
    }
  } catch (error) {
    console.error('Error rechazando oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar la oferta'
    });
  }
};

/**
 * Obtiene todas las ofertas (para supervisión general)
 */
export const getAllContent = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando obtención de todas las ofertas');
    
    // Extraer parámetros de consulta
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;
    const escuelaId = req.query.escuela_id as string;
    const profesorId = req.query.profesor_id as string;
    const search = req.query.search as string;
    
    console.log(`Parámetros de consulta recibidos: page=${page}, limit=${limit}, tipo=${tipo}, estado=${estado}, escuelaId=${escuelaId}, profesorId=${profesorId}, search=${search}`);
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    console.log(`Offset calculado para paginación: ${offset}`);
    
    // Construir consulta base - Corrige los alias de tabla
    let query = `
      SELECT o.*, 
             COALESCE((SELECT nombre FROM escuelas WHERE id = o.escuela_id), 'N/A') as escuela_nombre, 
             COALESCE((SELECT nombre FROM profesores WHERE id = o.profesor_id), 'N/A') as profesor_nombre
      FROM ofertas o
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM ofertas o
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let countQueryParams: any[] = [];
    
    // Añadir filtros si se proporcionan
    if (tipo) {
      query += ` AND o.tipo = $${queryParams.length + 1}`;
      countQuery += ` AND o.tipo = $${countQueryParams.length + 1}`;
      queryParams.push(tipo);
      countQueryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND o.estado = $${queryParams.length + 1}`;
      countQuery += ` AND o.estado = $${countQueryParams.length + 1}`;
      queryParams.push(estado);
      countQueryParams.push(estado);
    }
    
    if (escuelaId) {
      query += ` AND o.escuela_id = $${queryParams.length + 1}`;
      countQuery += ` AND o.escuela_id = $${countQueryParams.length + 1}`;
      queryParams.push(parseInt(escuelaId));
      countQueryParams.push(parseInt(escuelaId));
    }
    
    if (profesorId) {
      query += ` AND o.profesor_id = $${queryParams.length + 1}`;
      countQuery += ` AND o.profesor_id = $${countQueryParams.length + 1}`;
      queryParams.push(parseInt(profesorId));
      countQueryParams.push(parseInt(profesorId));
    }
    
    if (search) {
      query += ` AND o.nombre ILIKE $${queryParams.length + 1}`;
      countQuery += ` AND o.nombre ILIKE $${countQueryParams.length + 1}`;
      queryParams.push(`%${search}%`);
      countQueryParams.push(`%${search}%`);
    }
    
    // Añadir paginación
    query += ` ORDER BY o.fecha_creacion DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    console.log('Ejecutando consultas de base de datos');
    
    // Ejecutar consultas
    const [offersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countQueryParams)
    ]);
    
    const offers = offersResult.rows;
    const totalOffers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOffers / limit);
    
    console.log(`Ofertas obtenidas: ${offers.length}, Total de ofertas: ${totalOffers}, Total de páginas: ${totalPages}`);
    
    return res.status(200).json({
      success: true,
      data: {
        offers,
        pagination: {
          total: totalOffers,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: 'Ofertas obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo ofertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas'
    });
  }
};