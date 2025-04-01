// models/BeneficiosEconomicos.model.ts
import pool from "../config/database";

export interface IBeneficioEconomico {
  id?: number;
  postulacion_id: number;
  tipo: 'exoneracion' | 'pago' | 'mixto';
  porcentaje_exoneracion?: number;
  monto_por_hora?: number;
  total_horas?: number;
  monto_total?: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'procesado';
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export class BeneficiosEconomicosModel {
  // Crear un nuevo registro de beneficio económico
  static async create(beneficio: IBeneficioEconomico): Promise<IBeneficioEconomico> {
    const query = `
      INSERT INTO beneficios_economicos (
        postulacion_id, tipo, porcentaje_exoneracion, monto_por_hora, total_horas, monto_total, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      beneficio.postulacion_id,
      beneficio.tipo,
      beneficio.porcentaje_exoneracion || null,
      beneficio.monto_por_hora || null,
      beneficio.total_horas || null,
      beneficio.monto_total || null,
      beneficio.estado || 'pendiente'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar un beneficio económico por su ID
  static async findById(id: number): Promise<IBeneficioEconomico | null> {
    const query = `SELECT * FROM beneficios_economicos WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Obtener todos los beneficios económicos
  static async findAll(): Promise<IBeneficioEconomico[]> {
    const query = `SELECT * FROM beneficios_economicos;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar un beneficio económico existente
  static async update(id: number, beneficio: Partial<IBeneficioEconomico>): Promise<IBeneficioEconomico | null> {
    const query = `
      UPDATE beneficios_economicos SET
        postulacion_id = COALESCE($2, postulacion_id),
        tipo = COALESCE($3, tipo),
        porcentaje_exoneracion = COALESCE($4, porcentaje_exoneracion),
        monto_por_hora = COALESCE($5, monto_por_hora),
        total_horas = COALESCE($6, total_horas),
        monto_total = COALESCE($7, monto_total),
        estado = COALESCE($8, estado),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      beneficio.postulacion_id,
      beneficio.tipo,
      beneficio.porcentaje_exoneracion,
      beneficio.monto_por_hora,
      beneficio.total_horas,
      beneficio.monto_total,
      beneficio.estado,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar un beneficio económico
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM beneficios_economicos WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0)> 0;
  }
}