// services/project.service.ts
import { ProjectModel, IProyectoInvestigacion } from '../models/project.model';

export class ProjectService {
  // Obtener todos los proyectos de investigación
  static async getAllProjects(): Promise<IProyectoInvestigacion[]> {
    return await ProjectModel.findAll();
  }

  // Obtener un proyecto de investigación por ID
  static async getProjectById(id: number): Promise<IProyectoInvestigacion | null> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error('Proyecto de investigación no encontrado');
    }
    return project;
  }

  // Crear un nuevo proyecto de investigación
  static async createProject(data: IProyectoInvestigacion): Promise<IProyectoInvestigacion> {
    const requiredFields = [
      data.oferta_id,
      data.area_investigacion,
      data.objetivos,
      data.resultados_esperados,
    ];
    if (requiredFields.some((field) => field === undefined || field === null)) {
      throw new Error('Faltan datos obligatorios para crear el proyecto');
    }
    return await ProjectModel.create(data);
  }

  // Actualizar un proyecto existente
  static async updateProject(
    id: number,
    data: Partial<IProyectoInvestigacion>
  ): Promise<IProyectoInvestigacion | null> {
    const updatedProject = await ProjectModel.update(id, data);
    if (!updatedProject) {
      throw new Error('Proyecto de investigación no encontrado');
    }
    return updatedProject;
  }

  // Eliminar un proyecto
  static async deleteProject(id: number): Promise<void> {
    const eliminado = await ProjectModel.delete(id);
    if (!eliminado) {
      throw new Error('Proyecto de investigación no encontrado');
    }
  }
}