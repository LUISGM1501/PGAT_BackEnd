// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Verificar conexión al iniciar
pool.connect()
  .then(client => {
    console.log('Conexión a la base de datos exitosa');
    client.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err.message);
  });

export default pool;