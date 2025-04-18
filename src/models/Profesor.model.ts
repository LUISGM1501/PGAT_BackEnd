// models/Profesor.model.ts
import pool from "../config/database";

export interface IProfesor {
  id?: number;
  usuario_id: number;
  departamento: string;
  especialidad?: string;
  telefono?: string;
}

export class ProfesorModel {
  // Crear un nuevo profesor
  static async create(profesor: IProfesor): Promise<IProfesor> {
    const query = `
      INSERT INTO profesores (usuario_id, departamento, especialidad, telefono)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      profesor.usuario_id,
      profesor.departamento,
      profesor.especialidad || null,
      profesor.telefono || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar un profesor por su ID
  static async findById(id: number): Promise<IProfesor | null> {
    const query = `SELECT * FROM profesores WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener todos los profesores
  static async findAll(): Promise<IProfesor[]> {
    const query = `SELECT * FROM profesores;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar un profesor existente
  static async update(id: number, profesor: Partial<IProfesor>): Promise<IProfesor | null> {
    const query = `
      UPDATE profesores SET
        usuario_id = COALESCE($2, usuario_id),
        departamento = COALESCE($3, departamento),
        especialidad = COALESCE($4, especialidad),
        telefono = COALESCE($5, telefono)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      profesor.usuario_id,
      profesor.departamento,
      profesor.especialidad,
      profesor.telefono,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar un profesor
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM profesores WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findByUsuarioId(usuario_id: number): Promise<IProfesor | null> {
    const query = `SELECT * FROM profesores WHERE usuario_id = $1;`;
    const { rows } = await pool.query(query, [usuario_id]);
    return rows[0] || null;
  }
  
}