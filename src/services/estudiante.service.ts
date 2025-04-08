// services/estudiante.service.ts
import { EstudianteModel, IEstudiante } from '../models/Estudiante.model';

export class EstudianteService {
  // Obtener todos los estudiantes
  static async getAllEstudiantes(): Promise<IEstudiante[]> {
    return await EstudianteModel.findAll();
  }

  // Obtener un estudiante por ID (ID propio de la tabla estudiantes)
  static async getEstudianteById(id: number): Promise<IEstudiante> {
    const estudiante = await EstudianteModel.findById(id);
    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }
    return estudiante;
  }

  // Crear un nuevo estudiante
  static async createEstudiante(data: IEstudiante): Promise<IEstudiante> {
    // Validamos que los campos obligatorios estén presentes
    if (
      !data.usuario_id ||
      !data.carnet ||
      !data.carrera ||
      !data.nivel ||
      data.promedio === undefined
    ) {
      throw new Error('Faltan datos obligatorios: usuario_id, carnet, carrera, nivel y promedio');
    }
    return await EstudianteModel.create(data);
  }

  // Actualizar un estudiante existente (actualización parcial)
  static async updateEstudiante(id: number, data: Partial<IEstudiante>): Promise<IEstudiante> {
    const estudianteActualizado = await EstudianteModel.update(id, data);
    if (!estudianteActualizado) {
      throw new Error('Estudiante no encontrado');
    }
    return estudianteActualizado;
  }

  // Eliminar un estudiante
  static async deleteEstudiante(id: number): Promise<void> {
    const eliminado = await EstudianteModel.delete(id);
    if (!eliminado) {
      throw new Error('Estudiante no encontrado');
    }
  }
}