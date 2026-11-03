import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { motoristaController } from './motorista.controller';

export const motoristaRoutes = Router();
motoristaRoutes.use(authMiddleware);

motoristaRoutes.get('/', (req, res) => motoristaController.findAll(req, res));
motoristaRoutes.get('/:id', (req, res) => motoristaController.findById(req, res));
motoristaRoutes.post('/', (req, res) => motoristaController.create(req, res));
motoristaRoutes.put('/:id', (req, res) => motoristaController.update(req, res));
motoristaRoutes.patch('/:id/baixa', (req, res) => motoristaController.baixa(req, res));

export default motoristaRoutes;
