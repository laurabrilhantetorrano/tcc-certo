import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// Rotas de autenticação
router.post('/cadastro', authController.register);
router.post('/login', authController.login);

export default router;
