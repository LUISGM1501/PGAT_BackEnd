// routes/oferta.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { OfertaModel, IOferta } from '../models/Oferta.model';

const router = Router();

// GET /ofertas - Obtener todas las ofertas
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ofertas = await OfertaModel.findAll();
    res.json(ofertas);
  } catch (error) {
    next(error);
  }
});

// GET /ofertas/:id - Obtener una oferta por su ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const oferta = await OfertaModel.findById(id);
    if (!oferta) {
      res.status(404).json({ mensaje: 'Oferta no encontrada' });
      return;
    }
    res.json(oferta);
  } catch (error) {
    next(error);
  }
});

// POST /ofertas - Crear una nueva oferta
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nuevaOferta: IOferta = req.body as IOferta;
    // Validamos campos obligatorios para la creación
    if (
      !nuevaOferta.nombre ||
      !nuevaOferta.tipo ||
      !nuevaOferta.descripcion ||
      nuevaOferta.vacantes === undefined ||
      nuevaOferta.horas_semana === undefined ||
      !nuevaOferta.fecha_inicio ||
      !nuevaOferta.fecha_fin ||
      !nuevaOferta.beneficio
    ) {
      res.status(400).json({ mensaje: 'Faltan datos obligatorios para crear la oferta' });
      return;
    }

    const ofertaCreada = await OfertaModel.create(nuevaOferta);
    res.status(201).json(ofertaCreada);
  } catch (error) {
    next(error);
  }
});

// PUT /ofertas/:id - Actualizar una oferta existente
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const ofertaData: Partial<IOferta> = req.body;
    const ofertaActualizada = await OfertaModel.update(id, ofertaData);
    if (!ofertaActualizada) {
      res.status(404).json({ mensaje: 'Oferta no encontrada' });
      return;
    }
    res.json(ofertaActualizada);
  } catch (error) {
    next(error);
  }
});

// DELETE /ofertas/:id - Eliminar una oferta
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await OfertaModel.delete(id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Oferta no encontrada' });
      return;
    }
    res.json({ mensaje: 'Oferta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;