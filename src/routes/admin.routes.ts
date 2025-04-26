// src/routes/admin.routes.ts
import { Router, RequestHandler } from 'express';
import { isAdmin } from '../middleware/role.middleware';
import * as dashboardController from '../controllers/admin/dashboard.controller';
import * as userController from '../controllers/admin/user.controller';
import * as contentController from '../controllers/admin/content.controller';
import * as reportsController from '../controllers/admin/reports.controller';

const router = Router();

// Middleware para proteger todas las rutas de administrador
router.use(isAdmin as RequestHandler);

// Rutas para el Dashboard
router.get('/dashboard/stats', (dashboardController.getDashboardStats as unknown) as RequestHandler);
router.get('/dashboard/activity', (dashboardController.getRecentActivity as unknown) as RequestHandler);

// Rutas para Gestión de Usuarios
router.get('/users', (userController.getUsers as unknown) as RequestHandler);
router.get('/users/:id', (userController.getUserDetails as unknown) as RequestHandler);
router.post('/users', (userController.createUser as unknown) as RequestHandler);
router.put('/users/:id', (userController.updateUser as unknown) as RequestHandler);
router.patch('/users/:id/status', (userController.toggleUserStatus as unknown) as RequestHandler);
router.delete('/users/:id', (userController.deleteUser as unknown) as RequestHandler);

// Rutas para Supervisión de Contenido
router.get('/content/pending', (contentController.getPendingContent as unknown) as RequestHandler);
router.get('/content', (contentController.getAllContent as unknown) as RequestHandler);
router.get('/content/:id', (contentController.getContentDetails as unknown) as RequestHandler);
router.patch('/content/:id/approve', (contentController.approveContent as unknown) as RequestHandler);
router.patch('/content/:id/reject', (contentController.rejectContent as unknown) as RequestHandler);

// Rutas para Reportes
router.get('/reports/users', (reportsController.generateUsersReport as unknown) as RequestHandler);
router.get('/reports/offers', (reportsController.generateOffersReport as unknown) as RequestHandler);
router.get('/reports/applications', (reportsController.generateApplicationsReport as unknown) as RequestHandler);
router.get('/reports/benefits', (reportsController.generateBenefitsReport as unknown) as RequestHandler);
router.get('/reports/activity', (reportsController.generateActivityReport as unknown) as RequestHandler);

export default router;