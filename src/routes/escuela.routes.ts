// routes/escuela.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { IEscuela, EscuelaModel } from '../models/Escuela.model'; // Adjust the path as needed

const router = Router();

router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validación del ID
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ mensaje: 'ID inválido' });
        return;
      }
  
      // Validación de los datos del cuerpo
      const escuelaData: Partial<IEscuela> = req.body;
      if (Object.keys(escuelaData).length === 0) {
        res.status(400).json({ mensaje: 'No se proporcionaron datos para actualizar' });
        return;
      }
  
      // Verificar que la escuela existe antes de actualizar
      const escuelaExistente = await EscuelaModel.findById(id);
      if (!escuelaExistente) {
        res.status(404).json({ mensaje: 'Escuela no encontrada' });
        return;
      }
  
      // Actualizar la escuela
      const escuelaActualizada = await EscuelaModel.update(id, escuelaData);
      
      // Devolver la escuela actualizada
      res.status(200).json(escuelaActualizada);
      
    } catch (error) {
      // Manejo de errores
      console.error('Error al actualizar escuela:', error);
      next(error); // Pasa el error al middleware de manejo de errores
    }
});