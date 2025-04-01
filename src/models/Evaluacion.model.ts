// models/Evaluacion.model.ts
import pool from "../config/database";

export interface IEvaluacion {
  id?: number;
  postulacion_id: number;
  fecha?: Date;
  comentario: string;
  calificacion: number;
}

export class EvaluacionModel {
    // Crear una nueva evaluación
  static async create(evaluacion: IEvaluacion): Promise<IEvaluacion> {
    const query = `
      INSERT INTO evaluaciones (postulacion_id, comentario, calificacion)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [
      evaluacion.postulacion_id,
      evaluacion.comentario,
      evaluacion.calificacion,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

    // Buscar una evaluación por su ID
  static async findById(id: number): Promise<IEvaluacion | null> {
    const query = `SELECT * FROM evaluaciones WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

    // Obtener todas las evaluaciones
  static async findAll(): Promise<IEvaluacion[]> {
    const query = `SELECT * FROM evaluaciones;`;
    const { rows } = await pool.query(query);
    return rows;
  }
}