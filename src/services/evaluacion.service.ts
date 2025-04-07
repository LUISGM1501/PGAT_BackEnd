// services/evaluacion.service.ts
import { EvaluacionModel, IEvaluacion } from '../models/Evaluacion.model';

export class EvaluacionService {
  // Obtener todas las evaluaciones
  static async getAllEvaluaciones(): Promise<IEvaluacion[]> {
    return await EvaluacionModel.findAll();
  }

  // Obtener una evaluación por ID
  static async getEvaluacionById(id: number): Promise<IEvaluacion | null> {
    const evaluacion = await EvaluacionModel.findById(id);
    if (!evaluacion) {
      throw new Error('Evaluación no encontrada');
    }
    return evaluacion;
  }

  // Crear una nueva evaluación
  static async createEvaluacion(data: IEvaluacion): Promise<IEvaluacion> {
    if (!data.postulacion_id || !data.comentario || data.calificacion === undefined) {
      throw new Error(
        'Faltan datos obligatorios: postulacion_id, comentario y calificacion'
      );
    }
    return await EvaluacionModel.create(data);
  }
}