// models/RegistroHoras.model.ts
import pool from "../config/database";

export interface IRegistroHoras {
  id?: number;
  postulacion_id: number;
  fecha: string;
  horas: number;
  descripcion: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_registro?: Date;
}

export class RegistroHorasModel {

    // Crear un nuevo registro de horas
  static async create(registro: IRegistroHoras): Promise<IRegistroHoras> {
    const query = `
      INSERT INTO registro_horas (postulacion_id, fecha, horas, descripcion, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      registro.postulacion_id,
      registro.fecha,
      registro.horas,
      registro.descripcion,
      registro.estado || 'pendiente',
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

    // Buscar un registro de horas por su ID
  static async findById(id: number): Promise<IRegistroHoras | null> {
    const query = `SELECT * FROM registro_horas WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

    // Obtener todos los registros de horas
  static async findAll(): Promise<IRegistroHoras[]> {
    const query = `SELECT * FROM registro_horas;`;
    const { rows } = await pool.query(query);
    return rows;
  }

    // Actualizar un registro de horas existente
  static async update(id: number, registro: Partial<IRegistroHoras>): Promise<IRegistroHoras | null> {
    const query = `
      UPDATE registro_horas SET
        estado = COALESCE($2, estado),
        descripcion = COALESCE($3, descripcion)
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id, registro.estado, registro.descripcion];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

    // Eliminar un registro de horas
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM registro_horas WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return ( result.rowCount ?? 0) > 0;
  }
}