import { Router } from 'express';
import productRoutes from './productRoutes.js';
import authRoutes from './authRoutes.js';
import orderRoutes from './orderRoutes.js';
import contactRoutes from './contactRoutes.js';
import { getConnectionStatus } from '../config/database.js';

const router = Router();

// Endpoint de verificação de integridade e status da conexão com MongoDB
router.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  const isHealthy = dbStatus === 'Conectado';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'online' : 'degradado',
    timestamp: new Date().toISOString(),
    bancoDeDados: {
      tipo: 'MongoDB',
      estado: dbStatus,
    },
    versao: '1.0.0',
  });
});

// Registra as rotas da aplicação
router.use('/produtos', productRoutes);
router.use('/auth', authRoutes);
router.use('/pedidos', orderRoutes);
router.use('/contato', contactRoutes);

export default router;
