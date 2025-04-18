import { Request, Response, NextFunction } from 'express';

// Extender la interfaz Request para incluir información del usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
      userRole?: string;
    }
  }
}

/**
 * Middleware para verificar roles de usuario
 * @param roles Array de roles permitidos para acceder a una ruta
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar que existe información de usuario en el request
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    // Si el rol es válido, continuar con la siguiente función
    next();
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido solo para administradores'
    });
  }
  next();
};

/**
 * Middleware para verificar si el usuario es profesor
 */
export const isProfesor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.userRole !== 'profesor') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido solo para profesores'
    });
  }
  next();
};

/**
 * Middleware para verificar si el usuario es estudiante
 */
export const isEstudiante = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.userRole !== 'estudiante') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido solo para estudiantes'
    });
  }
  next();
};

/**
 * Middleware para verificar si el usuario es escuela/departamento
 */
export const isEscuela = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.userRole !== 'escuela') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido solo para escuelas/departamentos'
    });
  }
  next();
};

/**
 * Middleware para proteger rutas que solo el propio usuario puede acceder
 * Verifica si el ID en la URL pertenece al usuario autenticado o si es admin
 */
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const paramId = parseInt(req.params.id);
  
  if (isNaN(paramId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido'
    });
  }

  // Permitir acceso si es el propio usuario o si es administrador
  if (req.userId === paramId || req.userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'No tiene permisos para acceder a este recurso'
    });
  }
};