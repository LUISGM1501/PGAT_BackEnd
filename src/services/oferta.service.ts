// services/oferta.service.ts
import { OfertaModel, IOferta } from '../models/Oferta.model';

export class OfertaService {
  // Obtener todas las ofertas
  static async getAllOfertas(): Promise<IOferta[]> {
    return await OfertaModel.findAll();
  }

  // Obtener una oferta por ID
  static async getOfertaById(id: number): Promise<IOferta | null> {
    const oferta = await OfertaModel.findById(id);
    if (!oferta) {
      throw new Error('Oferta no encontrada');
    }
    return oferta;
  }

  // Crear una nueva oferta
  static async createOferta(data: IOferta): Promise<IOferta> {
    const requiredFields = [
      data.nombre,
      data.tipo,
      data.descripcion,
      data.vacantes,
      data.horas_semana,
      data.fecha_inicio,
      data.fecha_fin,
      data.beneficio,
    ];
    if (requiredFields.some((field) => field === undefined || field === null)) {
      throw new Error('Faltan datos obligatorios para crear la oferta');
    }
    return await OfertaModel.create(data);
  }

  // Actualizar una oferta existente
  static async updateOferta(id: number, data: Partial<IOferta>): Promise<IOferta | null> {
    const ofertaActualizada = await OfertaModel.update(id, data);
    if (!ofertaActualizada) {
      throw new Error('Oferta no encontrada');
    }
    return ofertaActualizada;
  }

  // Eliminar una oferta
  static async deleteOferta(id: number): Promise<void> {
    const eliminado = await OfertaModel.delete(id);
    if (!eliminado) {
      throw new Error('Oferta no encontrada');
    }
  }
}