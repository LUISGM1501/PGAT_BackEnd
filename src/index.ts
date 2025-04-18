import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Rutas
import authRoutes from './routes/auth.routes';
import estudianteRoutes from './routes/estudiante.routes';
import evaluacionRoutes from './routes/evaluacion.routes';
import postulacionRoutes from './routes/postulacion.routes';
import ofertaRoutes from './routes/oferta.routes';
import usuarioRoutes from './routes/usuario.routes';
import projectRoutes from './routes/project.routes';
import profesorRoutes from './routes/profesor.routes';
import adminRoutes from './routes/admin.routes'; 

// Inicialización
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware simulado para autenticación (temporal para desarrollo)
// En un entorno de producción, esto sería reemplazado por un middleware real de autenticación
app.use((req, res, next) => {
  // Solo para desarrollo - añade información de usuario ficticia para pruebas
  // Esto permite que los middleware de verificación de roles funcionen durante desarrollo
  req.user = {
    id: 1,
    nombre: 'Administrador',
    correo: 'admin@itcr.ac.cr',
    tipo: 'admin'
  };
  req.userId = 1;
  req.userRole = 'admin';
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/estudiantes', estudianteRoutes);
app.use('/evaluaciones', evaluacionRoutes);
app.use('/postulaciones', postulacionRoutes);
app.use('/ofertas', ofertaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/projects', projectRoutes);
app.use('/profesores', profesorRoutes);
app.use('/admin', adminRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de PGAT-TEC funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});