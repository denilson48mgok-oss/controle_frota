import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireMasterOrAdmin } from '../../middlewares/role.middleware';
import { usuarioController } from './usuario.controller';

export const authRoutes = Router();
authRoutes.post('/login', (req, res) => usuarioController.login(req, res));

export const usuarioRoutes = Router();
usuarioRoutes.use(authMiddleware);

usuarioRoutes.get('/', (req, res) => usuarioController.findAll(req, res));
usuarioRoutes.get('/:id', (req, res) => usuarioController.findById(req, res));
usuarioRoutes.post('/', requireMasterOrAdmin, (req, res) => usuarioController.create(req, res));
usuarioRoutes.put('/:id', requireMasterOrAdmin, (req, res) => usuarioController.update(req, res));
usuarioRoutes.patch('/:id/baixa', requireMasterOrAdmin, (req, res) => usuarioController.baixa(req, res));

export default usuarioRoutes;
