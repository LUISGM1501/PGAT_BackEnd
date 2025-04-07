// services/profesor.service.ts
import { ProfesorModel, IProfesor } from '../models/Profesor.model';

export class ProfesorService {
  // Obtener todos los profesores
  static async getAllProfesores(): Promise<IProfesor[]> {
    return await ProfesorModel.findAll();
  }

  // Obtener un profesor por ID
  static async getProfesorById(id: number): Promise<IProfesor | null> {
    const profesor = await ProfesorModel.findById(id);
    if (!profesor) {
      throw new Error('Profesor no encontrado'); // Puedes personalizar esto para manejar errores
    }
    return profesor;
  }

  // Crear un nuevo profesor
  static async createProfesor(data: IProfesor): Promise<IProfesor> {
    if (!data.usuario_id || !data.departamento) {
      throw new Error('Faltan datos obligatorios: usuario_id y departamento');
    }
    return await ProfesorModel.create(data);
  }

  // Actualizar un profesor
  static async updateProfesor(id: number, data: Partial<IProfesor>): Promise<IProfesor | null> {
    const profesorActualizado = await ProfesorModel.update(id, data);
    if (!profesorActualizado) {
      throw new Error('Profesor no encontrado');
    }
    return profesorActualizado;
  }

  // Eliminar un profesor
  static async deleteProfesor(id: number): Promise<void> {
    const eliminado = await ProfesorModel.delete(id);
    if (!eliminado) {
      throw new Error('Profesor no encontrado');
    }
  }
}