// services/postulacion.service.ts
import { PostulacionModel, IPostulacion } from '../models/Postulacion.model';

export class PostulacionService {
  // Obtener todas las postulaciones
  static async getAllPostulaciones(): Promise<IPostulacion[]> {
    return await PostulacionModel.findAll();
  }

  // Obtener una postulación por ID
  static async getPostulacionById(id: number): Promise<IPostulacion | null> {
    const postulacion = await PostulacionModel.findById(id);
    if (!postulacion) {
      throw new Error('Postulación no encontrada');
    }
    return postulacion;
  }

  // Crear una nueva postulación
  static async createPostulacion(data: IPostulacion): Promise<IPostulacion> {
    if (!data.estudiante_id || !data.oferta_id) {
      throw new Error('Faltan datos obligatorios: estudiante_id y oferta_id');
    }
    return await PostulacionModel.create(data);
  }

  // Actualizar una postulación existente
  static async updatePostulacion(
    id: number,
    data: Partial<IPostulacion>
  ): Promise<IPostulacion | null> {
    const postulacionActualizada = await PostulacionModel.update(id, data);
    if (!postulacionActualizada) {
      throw new Error('Postulación no encontrada');
    }
    return postulacionActualizada;
  }

  // Eliminar una postulación
  static async deletePostulacion(id: number): Promise<void> {
    const eliminado = await PostulacionModel.delete(id);
    if (!eliminado) {
      throw new Error('Postulación no encontrada');
    }
  }
}