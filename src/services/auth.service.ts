// src/services/auth.service.ts
import { Pool } from 'pg';
import { User } from '../types/user.types';

const pool = new Pool(); // o usa tu configuración específica

export const loginUser = async (
  username: string,
  password: string,
  userType: string
): Promise<Omit<User, 'password'> | null> => {
  const query = `
    SELECT id, username, tipo, estado, correo, nombre
    FROM usuarios
    WHERE username = $1 AND password = $2 AND tipo = $3
  `;

  const values = [username, password, userType];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error('Error en loginUser:', err);
    throw err;
  }
};
