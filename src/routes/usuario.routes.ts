// routes/usuario.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { UsuarioModel, IUsuario } from '../models/Usuario.model';

const router = Router();

/**
 * GET /usuarios
 * Obtener todos los usuarios
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarios = await UsuarioModel.findAll();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /usuarios/:id
 * Obtener un usuario por su ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /usuarios
 * Crear un nuevo usuario
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarioData: IUsuario = req.body;
    // Validación de campos obligatorios
    if (!usuarioData.nombre || !usuarioData.correo || !usuarioData.password || !usuarioData.tipo) {
      res.status(400).json({ mensaje: 'Faltan datos obligatorios: nombre, correo, password y tipo' });
      return;
    }
    const nuevoUsuario = await UsuarioModel.create(usuarioData);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /usuarios/:id
 * Actualizar un usuario existente
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const usuarioData: Partial<IUsuario> = req.body;
    const usuarioActualizado = await UsuarioModel.update(id, usuarioData);
    if (!usuarioActualizado) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /usuarios/:id
 * Eliminar un usuario
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await UsuarioModel.delete(id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;