// models/Estudiante.model.ts
import pool from "../config/database";

export interface IEstudiante {
  id?: number;
  usuario_id: number;
  carnet: string;
  carrera: string;
  nivel: string;
  promedio: number;
  cursosAprobados?: string[];
  habilidades?: string[];
}

export class EstudianteModel {
  // Crear un nuevo estudiante
  static async create(estudiante: IEstudiante): Promise<IEstudiante> {
    const query = `
      INSERT INTO estudiantes (usuario_id, carnet, carrera, nivel, promedio, cursosAprobados, habilidades)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      estudiante.usuario_id,
      estudiante.carnet,
      estudiante.carrera,
      estudiante.nivel,
      estudiante.promedio,
      estudiante.cursosAprobados || null,
      estudiante.habilidades || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar un estudiante por su ID
  static async findById(id: number): Promise<IEstudiante | null> {
    const query = `SELECT * FROM estudiantes WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Buscar un estudiante por su usuario_id
  static async findByUsuarioId(usuarioId: number): Promise<IEstudiante | null> {
    const query = `SELECT * FROM estudiantes WHERE usuario_id = $1;`;
    const { rows } = await pool.query(query, [usuarioId]);
    return rows[0] || null;
  }

  // Obtener todos los estudiantes
  static async findAll(): Promise<IEstudiante[]> {
    const query = `SELECT * FROM estudiantes;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar un estudiante existente
  static async update(id: number, data: Partial<IEstudiante>): Promise<IEstudiante | null> {
    const query = `
      UPDATE estudiantes SET
        usuario_id = COALESCE($2, usuario_id),
        carnet = COALESCE($3, carnet),
        carrera = COALESCE($4, carrera),
        nivel = COALESCE($5, nivel),
        promedio = COALESCE($6, promedio),
        cursosAprobados = COALESCE($7, cursosAprobados),
        habilidades = COALESCE($8, habilidades)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      data.usuario_id,
      data.carnet,
      data.carrera,
      data.nivel,
      data.promedio,
      data.cursosAprobados || null,
      data.habilidades || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar un estudiante
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM estudiantes WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}