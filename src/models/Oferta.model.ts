// models/Oferta.model.ts

//TODO: Ver si se cambia la referencia de proyecto a oferta.

import pool from "../config/database";

export interface IOferta {
  id?: number;
  nombre: string;
  tipo: 'Asistencia' | 'Tutoría' | 'Proyecto';
  descripcion: string;
  vacantes: number;
  horas_semana: number;
  fecha_inicio: string; // Se puede cambiar a Date si se prefiere.
  fecha_fin: string;
  estado?: 'pendiente' | 'activa' | 'finalizada' | 'cancelada';
  escuela_id?: number;
  profesor_id?: number;
  promedio_minimo?: number;
  cursos_requeridos?: string;
  beneficio: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export class OfertaModel {
  // Crear una nueva oferta
  static async create(oferta: IOferta): Promise<IOferta> {
    const query = `
      INSERT INTO ofertas (
        nombre, tipo, descripcion, vacantes, horas_semana, fecha_inicio, fecha_fin,
        estado, escuela_id, profesor_id, promedio_minimo, cursos_requeridos, beneficio
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING *;
    `;
    const values = [
      oferta.nombre,
      oferta.tipo,
      oferta.descripcion,
      oferta.vacantes,
      oferta.horas_semana,
      oferta.fecha_inicio,
      oferta.fecha_fin,
      oferta.estado || 'pendiente',
      oferta.escuela_id || null,
      oferta.profesor_id || null,
      oferta.promedio_minimo || 70.0,
      oferta.cursos_requeridos || null,
      oferta.beneficio,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar una oferta por su ID
  static async findById(id: number): Promise<IOferta | null> {
    const query = `SELECT * FROM ofertas WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener todas las ofertas
  static async findAll(): Promise<IOferta[]> {
    const query = `SELECT * FROM ofertas;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar una oferta existente
  static async update(id: number, oferta: Partial<IOferta>): Promise<IOferta | null> {
    const query = `
      UPDATE ofertas SET
        nombre = COALESCE($2, nombre),
        tipo = COALESCE($3, tipo),
        descripcion = COALESCE($4, descripcion),
        vacantes = COALESCE($5, vacantes),
        horas_semana = COALESCE($6, horas_semana),
        fecha_inicio = COALESCE($7, fecha_inicio),
        fecha_fin = COALESCE($8, fecha_fin),
        estado = COALESCE($9, estado),
        escuela_id = COALESCE($10, escuela_id),
        profesor_id = COALESCE($11, profesor_id),
        promedio_minimo = COALESCE($12, promedio_minimo),
        cursos_requeridos = COALESCE($13, cursos_requeridos),
        beneficio = COALESCE($14, beneficio),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      oferta.nombre,
      oferta.tipo,
      oferta.descripcion,
      oferta.vacantes,
      oferta.horas_semana,
      oferta.fecha_inicio,
      oferta.fecha_fin,
      oferta.estado,
      oferta.escuela_id,
      oferta.profesor_id,
      oferta.promedio_minimo,
      oferta.cursos_requeridos,
      oferta.beneficio,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar una oferta
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ofertas WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0)> 0;
  }
}