// models/Escuela.model.ts
import pool from "../config/database";

export interface IEscuela {
  id?: number;
  usuario_id: number;
  facultad: string;
  telefono?: string;
  responsable: string;
  descripcion?: string;
}

export class EscuelaModel {
  // Crear una nueva escuela/departamento
  static async create(escuela: IEscuela): Promise<IEscuela> {
    const query = `
      INSERT INTO escuelas (usuario_id, facultad, telefono, responsable, descripcion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      escuela.usuario_id,
      escuela.facultad,
      escuela.telefono || null,
      escuela.responsable,
      escuela.descripcion || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar una escuela por su ID
  static async findById(id: number): Promise<IEscuela | null> {
    const query = `SELECT * FROM escuelas WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener todas las escuelas
  static async findAll(): Promise<IEscuela[]> {
    const query = `SELECT * FROM escuelas;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar una escuela existente
  static async update(id: number, escuela: Partial<IEscuela>): Promise<IEscuela | null> {
    const query = `
      UPDATE escuelas SET
        usuario_id = COALESCE($2, usuario_id),
        facultad = COALESCE($3, facultad),
        telefono = COALESCE($4, telefono),
        responsable = COALESCE($5, responsable),
        descripcion = COALESCE($6, descripcion)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      escuela.usuario_id,
      escuela.facultad,
      escuela.telefono,
      escuela.responsable,
      escuela.descripcion,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar una escuela
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM escuelas WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}