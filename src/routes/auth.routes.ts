// src/routes/auth.routes.ts
import { RequestHandler, Router } from 'express';
import { login, logout } from '../controllers/auth/authController';

const router = Router();

router.post('/login', (login as unknown) as RequestHandler);
router.post('/logout', logout);

export default router;

