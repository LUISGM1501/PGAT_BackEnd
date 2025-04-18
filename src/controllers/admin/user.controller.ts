import { Request, Response } from 'express';
import { UsuarioModel, IUsuario } from '../../models/Usuario.model';
import { EstudianteModel } from '../../models/Estudiante.model';
import { ProfesorModel } from '../../models/Profesor.model';
import { EscuelaModel } from '../../models/Escuela.model';
import bcrypt from 'bcrypt';
import pool from '../../config/database';

/**
 * Obtiene la lista de usuarios con filtros y paginación
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extracting query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tipo = req.query.tipo as string;
    const estado = req.query.estado as string;
    const search = req.query.search as string;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build base query
    let query = `
      SELECT id, nombre, correo, tipo, estado, ultimo_acceso, fecha_creacion 
      FROM usuarios 
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let countQueryParams: any[] = [];
    
    // Add filters if provided
    if (tipo) {
      query += ` AND tipo = $${queryParams.length + 1}`;
      countQuery += ` AND tipo = $${countQueryParams.length + 1}`;
      queryParams.push(tipo);
      countQueryParams.push(tipo);
    }
    
    if (estado) {
      query += ` AND estado = $${queryParams.length + 1}`;
      countQuery += ` AND estado = $${countQueryParams.length + 1}`;
      queryParams.push(estado);
      countQueryParams.push(estado);
    }
    
    if (search) {
      query += ` AND (nombre ILIKE $${queryParams.length + 1} OR correo ILIKE $${queryParams.length + 1})`;
      countQuery += ` AND (nombre ILIKE $${countQueryParams.length + 1} OR correo ILIKE $${countQueryParams.length + 1})`;
      queryParams.push(`%${search}%`);
      countQueryParams.push(`%${search}%`);
    }
    
    // Add pagination
    query += ` ORDER BY fecha_creacion DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute queries
    const [usersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countQueryParams)
    ]);
    
    const users = usersResult.rows;
    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: 'Usuarios obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de usuarios'
    });
  }
};

/**
 * Obtiene detalles completos de un usuario
 */
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
      return;
    }
    
    // Obtener información básica del usuario
    const user = await UsuarioModel.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Obtener información específica según el tipo de usuario
    let specificData = null;
    
    switch (user.tipo) {
      case 'estudiante':
        specificData = await EstudianteModel.findByUsuarioId(userId);
        break;
      case 'profesor':
        specificData = await ProfesorModel.findByUsuarioId(userId);
        break;
      case 'escuela':
        specificData = await pool.query(
          'SELECT * FROM escuelas WHERE usuario_id = $1',
          [userId]
        );
        specificData = specificData.rows[0];
        break;
    }
    
    // Eliminar información sensible
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profileData: specificData
      },
      message: 'Detalles de usuario obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo detalles de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del usuario'
    });
  }
};

/**
 * Crea un nuevo usuario
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, correo, password, tipo, ...profileData } = req.body;
    
    // Validar correo institucional
    const emailRegex = /@(estudiante\.tec\.ac\.cr|itcr\.ac\.cr)$/;
    if (!emailRegex.test(correo)) {
      res.status(400).json({
        success: false,
        message: 'Debe utilizar un correo institucional válido'
      });
      return;
    }
    
    // Verificar si el correo ya existe
    const existingUser = await UsuarioModel.findByEmail(correo);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
      return;
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear usuario base
    const newUser = await UsuarioModel.create({
      nombre,
      correo,
      password: hashedPassword,
      tipo,
      estado: 'activo'
    });
    
    // Crear perfil específico según el tipo
    let specificProfile = null;
    
    switch (tipo) {
      case 'estudiante':
        specificProfile = await EstudianteModel.create({
          usuario_id: newUser.id as number,
          carnet: profileData.carnet,
          carrera: profileData.carrera,
          nivel: profileData.nivel,
          promedio: profileData.promedio || 0,
          cursosAprobados: profileData.cursosAprobados || [],
          habilidades: profileData.habilidades || []
        });
        break;
      case 'profesor':
        specificProfile = await ProfesorModel.create({
          usuario_id: newUser.id as number,
          departamento: profileData.departamento,
          especialidad: profileData.especialidad,
          telefono: profileData.telefono
        });
        break;
      case 'escuela':
        specificProfile = await EscuelaModel.create({
          usuario_id: newUser.id as number,
          facultad: profileData.facultad,
          responsable: profileData.responsable,
          telefono: profileData.telefono,
          descripcion: profileData.descripcion
        });
        break;
    }
    
    // Eliminar contraseña de la respuesta
    const { password: pwd, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profileData: specificProfile
      },
      message: 'Usuario creado correctamente'
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
};

/**
 * Actualiza un usuario existente
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    
    const { nombre, estado, password, ...profileData } = req.body;
    
    // Verificar si el usuario existe
    const existingUser = await UsuarioModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Preparar datos para actualizar
    let updateData: Partial<IUsuario> = {};
    
    if (nombre) updateData.nombre = nombre;
    if (estado) updateData.estado = estado;
    
    // Si hay una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Actualizar usuario base
    const updatedUser = await UsuarioModel.update(userId, updateData);
    
    // Actualizar perfil específico según tipo
    let specificProfile = null;
    
    switch (existingUser.tipo) {
      case 'estudiante': {
        const estudiante = await EstudianteModel.findByUsuarioId(userId);
        if (estudiante && Object.keys(profileData).length > 0) {
          specificProfile = await EstudianteModel.update(estudiante.id as number, profileData);
        }
        break;
      }
      case 'profesor': {
        const profesor = await pool.query(
          'SELECT * FROM profesores WHERE usuario_id = $1',
          [userId]
        );
        if (profesor.rows.length > 0 && Object.keys(profileData).length > 0) {
          specificProfile = await ProfesorModel.update(profesor.rows[0].id, profileData);
        }
        break;
      }
      case 'escuela': {
        const escuela = await pool.query(
          'SELECT * FROM escuelas WHERE usuario_id = $1',
          [userId]
        );
        if (escuela.rows.length > 0 && Object.keys(profileData).length > 0) {
          specificProfile = await EscuelaModel.update(escuela.rows[0].id, profileData);
        }
        break;
      }
    }
    
    // Eliminar contraseña de la respuesta
    const { password: pwd, ...userWithoutPassword } = updatedUser as IUsuario;
    
    return res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profileData: specificProfile
      },
      message: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
};

/**
 * Cambia el estado de un usuario (activar/desactivar)
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    
    // Verificar si el usuario existe
    const user = await UsuarioModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Cambiar estado
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
    const updatedUser = await UsuarioModel.update(userId, { estado: newStatus });
    
    return res.status(200).json({
      success: true,
      data: {
        id: userId,
        estado: newStatus
      },
      message: `Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error cambiando estado de usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario'
    });
  }
};

/**
 * Elimina un usuario
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    
    // Verificar si el usuario existe
    const user = await UsuarioModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si tiene dependencias antes de eliminar
    // Por ejemplo, verificar si un profesor tiene ofertas activas
    if (user.tipo === 'profesor') {
      const activeOffers = await pool.query(
        'SELECT COUNT(*) FROM ofertas WHERE profesor_id = $1 AND estado != $2',
        [userId, 'cancelada']
      );
      
      if (parseInt(activeOffers.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el usuario porque tiene ofertas activas'
        });
      }
    }
    
    // Eliminar el usuario
    const deleted = await UsuarioModel.delete(userId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el usuario'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: userId
      },
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
};