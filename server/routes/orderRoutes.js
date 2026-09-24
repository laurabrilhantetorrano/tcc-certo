import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';

const router = Router();

router.post('/', orderController.create);
router.get('/usuario/:usuarioId', orderController.getByUser);
router.get('/:id', orderController.getById);

export default router;
