// routes/evaluacion.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { EvaluacionModel, IEvaluacion } from '../models/Evaluacion.model';

const router = Router();

/**
 * GET /evaluaciones
 * Obtener todas las evaluaciones
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const evaluaciones = await EvaluacionModel.findAll();
    res.json(evaluaciones);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /evaluaciones/:id
 * Obtener una evaluación por su ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const evaluacion = await EvaluacionModel.findById(id);
    if (!evaluacion) {
      res.status(404).json({ mensaje: 'Evaluación no encontrada' });
      return;
    }
    res.json(evaluacion);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /evaluaciones
 * Crear una nueva evaluación
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const evaluacionData: IEvaluacion = req.body;
    // Validar que se envíen los campos obligatorios, por ejemplo: postulacion_id, comentario y calificacion
    if (!evaluacionData.postulacion_id || !evaluacionData.comentario || evaluacionData.calificacion === undefined) {
      res.status(400).json({ mensaje: 'Faltan datos obligatorios: postulacion_id, comentario y calificacion.' });
      return;
    }
    const nuevaEvaluacion = await EvaluacionModel.create(evaluacionData);
    res.status(201).json(nuevaEvaluacion);
  } catch (error) {
    next(error);
  }
});

export default router;