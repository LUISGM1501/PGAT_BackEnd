// models/Usuario.model.ts
import pool from "../config/database";

export interface IUsuario {
  id?: number;
  nombre: string;
  correo: string;
  password: string;
  tipo: 'estudiante' | 'profesor' | 'escuela' | 'admin';
  estado?: 'activo' | 'inactivo';
  ultimo_acceso?: Date;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export class UsuarioModel {
  // Crear un nuevo usuario
  static async create(usuario: IUsuario): Promise<IUsuario> {
    const query = `
      INSERT INTO usuarios (nombre, correo, password, tipo, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      usuario.nombre,
      usuario.correo,
      usuario.password,
      usuario.tipo,
      usuario.estado || 'activo',
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Buscar un usuario por su ID
  static async findById(id: number): Promise<IUsuario | null> {
    const query = `SELECT * FROM usuarios WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Buscar un usuario por su correo (útil para autenticación)
  static async findByEmail(correo: string): Promise<IUsuario | null> {
    const query = `SELECT * FROM usuarios WHERE correo = $1;`;
    const { rows } = await pool.query(query, [correo]);
    return rows[0] || null;
  }

  // Obtener todos los usuarios
  static async findAll(): Promise<IUsuario[]> {
    const query = `SELECT * FROM usuarios;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar un usuario existente
  static async update(id: number, data: Partial<IUsuario>): Promise<IUsuario | null> {
    const query = `
      UPDATE usuarios SET
        nombre = COALESCE($2, nombre),
        correo = COALESCE($3, correo),
        password = COALESCE($4, password),
        tipo = COALESCE($5, tipo),
        estado = COALESCE($6, estado),
        ultimo_acceso = COALESCE($7, ultimo_acceso),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const values = [
      id,
      data.nombre,
      data.correo,
      data.password,
      data.tipo,
      data.estado,
      data.ultimo_acceso,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Eliminar un usuario
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM usuarios WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}