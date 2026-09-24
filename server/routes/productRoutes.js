import { Router } from 'express';
import { productController } from '../controllers/productController.js';

const router = Router();

// Rotas públicas de produtos
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rotas administrativas (criação, edição e exclusão)
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
