// routes/profesor.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ProfesorModel, IProfesor } from '../models/Profesor.model';
import { promises } from 'dns';

const router = Router();

// GET /profesores - Obtener todos los profesores
router.get('/', async (req: Request, res: Response) => {
  try {
    const profesores = await ProfesorModel.findAll();
    res.json(profesores);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// GET /profesores/:id - Obtener un profesor por su ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const profesor = await ProfesorModel.findById(id);
    if (!profesor) {
      res.status(404).json({ mensaje: 'Profesor no encontrado' });
      return;
    }
    res.json(profesor);
  } catch (error) {
    console.error('Error al obtener profesor:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /profesores - Crear un nuevo profesor
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profesorData: IProfesor = req.body;
    // Validamos que se envíen los campos obligatorios
    if (!profesorData.usuario_id || !profesorData.departamento) {
      res.status(400).json({ mensaje: 'Faltan datos obligatorios: usuario_id y departamento' });
      return;
    }
    const nuevoProfesor = await ProfesorModel.create(profesorData);
    res.status(201).json(nuevoProfesor);
  } catch (error) {
    console.error('Error al crear profesor:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// PUT /profesores/:id - Actualizar un profesor existente
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const profesorData: Partial<IProfesor> = req.body;
    const profesorActualizado = await ProfesorModel.update(id, profesorData);
    if (!profesorActualizado) {
      res.status(404).json({ mensaje: 'Profesor no encontrado' });
      return;
    }
    res.json(profesorActualizado);
  } catch (error) {
    console.error('Error al actualizar profesor:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// DELETE /profesores/:id - Eliminar un profesor
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await ProfesorModel.delete(id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Profesor no encontrado' });
      return;
    }
    res.json({ mensaje: 'Profesor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar profesor:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

export default router;