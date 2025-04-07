// routes/postulacion.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PostulacionModel, IPostulacion } from '../models/Postulacion.model';

const router = Router();

/**
 * GET /postulaciones
 * Obtener todas las postulaciones
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postulaciones = await PostulacionModel.findAll();
    res.json(postulaciones);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /postulaciones/:id
 * Obtener una postulación por su ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const postulacion = await PostulacionModel.findById(id);
    if (!postulacion) {
      res.status(404).json({ mensaje: 'Postulación no encontrada' });
      return;
    }
    res.json(postulacion);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /postulaciones
 * Crear una nueva postulación
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postulacionData: IPostulacion = req.body;
    // Validamos que se envíen los datos obligatorios (estudiante_id y oferta_id)
    if (!postulacionData.estudiante_id || !postulacionData.oferta_id) {
      res.status(400).json({ mensaje: 'Faltan datos obligatorios: estudiante_id y oferta_id' });
      return;
    }
    const nuevaPostulacion = await PostulacionModel.create(postulacionData);
    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /postulaciones/:id
 * Actualizar una postulación existente
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const postulacionData: Partial<IPostulacion> = req.body;
    const postulacionActualizada = await PostulacionModel.update(id, postulacionData);
    if (!postulacionActualizada) {
      res.status(404).json({ mensaje: 'Postulación no encontrada' });
      return;
    }
    res.json(postulacionActualizada);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /postulaciones/:id
 * Eliminar una postulación por su ID
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await PostulacionModel.delete(id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Postulación no encontrada' });
      return;
    }
    res.json({ mensaje: 'Postulación eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;