import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';

const router = Router();

router.post('/', contactController.submit);
router.get('/', contactController.list);

export default router;
