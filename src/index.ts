import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Rutas (las crearemos más adelante)
import authRoutes from './routes/auth.routes';
import estudianteRoutes from './routes/estudiante.routes';
import evaluacionRoutes from './routes/evaluacion.routes';
import postulacionRoutes from './routes/postulacion.routes';
import ofertaRoutes from './routes/oferta.routes';
import usuarioRoutes from './routes/usuario.routes';
import projectRoutes from './routes/project.routes';
import profesorRoutes from './routes/profesor.routes';

// Inicialización
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/estudiantes', estudianteRoutes);
app.use('/evaluaciones', evaluacionRoutes);
app.use('/postulaciones', postulacionRoutes);
app.use('/ofertas', ofertaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/projects', projectRoutes);
app.use('/profesores', profesorRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de PGAT-TEC funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});


