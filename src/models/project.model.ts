// models/Project.model.ts
import pool from '../config/database';

export interface IProyectoInvestigacion {
  id?: number;
  oferta_id: number;
  area_investigacion: string;
  objetivos: string;
  resultados_esperados: string;
}

export class ProjectModel {
  // Crear un nuevo proyecto de investigación
  static async create(proyecto: IProyectoInvestigacion): Promise<IProyectoInvestigacion> {
    const query = `
      INSERT INTO proyectos_investigacion (
        oferta_id, area_investigacion, objetivos, resultados_esperados
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      proyecto.oferta_id,
      proyecto.area_investigacion,
      proyecto.objetivos,
      proyecto.resultados_esperados,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar un proyecto por su ID
  static async findById(id: number): Promise<IProyectoInvestigacion | null> {
    const query = `SELECT * FROM proyectos_investigacion WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener todos los proyectos
  static async findAll(): Promise<IProyectoInvestigacion[]> {
    const query = 'SELECT * FROM proyectos_investigacion;';
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar un proyecto existente de forma parcial
  static async update(
    id: number,
    proyecto: Partial<IProyectoInvestigacion>
  ): Promise<IProyectoInvestigacion | null> {
    const query = `
      UPDATE proyectos_investigacion SET
        oferta_id = COALESCE($2, oferta_id),
        area_investigacion = COALESCE($3, area_investigacion),
        objetivos = COALESCE($4, objetivos),
        resultados_esperados = COALESCE($5, resultados_esperados)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      proyecto.oferta_id,
      proyecto.area_investigacion,
      proyecto.objetivos,
      proyecto.resultados_esperados,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar un proyecto
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM proyectos_investigacion WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0)> 0;
  }
}