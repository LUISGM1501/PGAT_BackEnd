import { Router } from 'express';
// Importaremos los controladores cuando los creemos
// import { login, register } from '../controllers/auth.controller';

const router = Router();

// Por ahora, creamos rutas temporales para verificar funcionamiento
router.post('/login', (req, res) => {
  res.json({ message: 'Ruta de login funcionando (pendiente implementación)' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Ruta de registro funcionando (pendiente implementación)' });
});

export default router;