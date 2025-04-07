// routes/project.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ProjectModel, IProyectoInvestigacion } from '../models/project.model';

const router = Router();

/**
 * GET /projects
 * Obtener todos los proyectos de investigación
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await ProjectModel.findAll();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /projects/:id
 * Obtener un proyecto de investigación por su ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const project = await ProjectModel.findById(id);
    if (!project) {
      res.status(404).json({ mensaje: 'Proyecto de investigación no encontrado' });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /projects
 * Crear un nuevo proyecto de investigación
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectData: IProyectoInvestigacion = req.body;
    // Validamos los campos obligatorios: oferta_id, area_investigacion, objetivos y resultados_esperados
    if (
      !projectData.oferta_id ||
      !projectData.area_investigacion ||
      !projectData.objetivos ||
      !projectData.resultados_esperados
    ) {
      res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
      return;
    }
    const newProject = await ProjectModel.create(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /projects/:id
 * Actualizar un proyecto de investigación existente
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const projectData: Partial<IProyectoInvestigacion> = req.body;
    const updatedProject = await ProjectModel.update(id, projectData);
    if (!updatedProject) {
      res.status(404).json({ mensaje: 'Proyecto no encontrado' });
      return;
    }
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /projects/:id
 * Eliminar un proyecto de investigación
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await ProjectModel.delete(id);
    if (!deleted) {
      res.status(404).json({ mensaje: 'Proyecto no encontrado' });
      return;
    }
    res.json({ mensaje: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;