// models/Postulacion.model.ts
import pool from "../config/database";

export interface IPostulacion {
  id?: number;
  estudiante_id: number;
  oferta_id: number;
  fecha_postulacion?: Date;
  estado?: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  comentario?: string;
  motivacion?: string;
  fecha_actualizacion?: Date;
}

export class PostulacionModel {

    // Crear una nueva postulacion
  static async create(postulacion: IPostulacion): Promise<IPostulacion> {
    const query = `
      INSERT INTO postulaciones (estudiante_id, oferta_id, estado, comentario, motivacion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      postulacion.estudiante_id,
      postulacion.oferta_id,
      postulacion.estado || 'pendiente',
      postulacion.comentario || null,
      postulacion.motivacion || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar una postulacion por su ID
  static async findById(id: number): Promise<IPostulacion | null> {
    const query = `SELECT * FROM postulaciones WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

    // Obener todas las postulaciones
  static async findAll(): Promise<IPostulacion[]> {
    const query = `SELECT * FROM postulaciones;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar una postulacion existente
  static async update(id: number, postulacion: Partial<IPostulacion>): Promise<IPostulacion | null> {
    const query = `
      UPDATE postulaciones SET
        estado = COALESCE($2, estado),
        comentario = COALESCE($3, comentario),
        motivacion = COALESCE($4, motivacion),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id, postulacion.estado, postulacion.comentario, postulacion.motivacion];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

    // Eliminar una postulacion
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM postulaciones WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}