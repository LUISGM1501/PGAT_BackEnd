// routes/estudiante.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EstudianteModel, IEstudiante } from '../models/Estudiante.model';

const router = Router();

/**
 * GET /estudiantes
 * Obtener todos los estudiantes
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const estudiantes = await EstudianteModel.findAll();
    res.json(estudiantes);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /estudiantes/:id
 * Obtener un estudiante por su ID (ID de la tabla estudiantes)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const estudiante = await EstudianteModel.findById(id);
    if (!estudiante) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
      return;
    }
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /estudiantes
 * Crear un nuevo estudiante
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const estudianteData: IEstudiante = req.body;
    // Validamos los campos obligatorios: usuario_id, carnet, carrera, nivel y promedio
    if (
      !estudianteData.usuario_id ||
      !estudianteData.carnet ||
      !estudianteData.carrera ||
      !estudianteData.nivel ||
      estudianteData.promedio === undefined
    ) {
      res.status(400).json({
        mensaje: 'Faltan datos obligatorios: usuario_id, carnet, carrera, nivel y promedio',
      });
      return;
    }
    const nuevoEstudiante = await EstudianteModel.create(estudianteData);
    res.status(201).json(nuevoEstudiante);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /estudiantes/:id
 * Actualizar un estudiante existente
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const estudianteData: Partial<IEstudiante> = req.body;
    const estudianteActualizado = await EstudianteModel.update(id, estudianteData);
    if (!estudianteActualizado) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
      return;
    }
    res.json(estudianteActualizado);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /estudiantes/:id
 * Eliminar un estudiante
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await EstudianteModel.delete(id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
      return;
    }
    res.json({ mensaje: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;