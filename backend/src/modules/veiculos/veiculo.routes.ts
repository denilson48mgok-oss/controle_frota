import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { veiculoController } from './veiculo.controller';

export const veiculoRoutes = Router();
veiculoRoutes.use(authMiddleware);

veiculoRoutes.get('/', (req, res) => veiculoController.findAll(req, res));
veiculoRoutes.get('/:id', (req, res) => veiculoController.findById(req, res));
veiculoRoutes.post('/', (req, res) => veiculoController.create(req, res));
veiculoRoutes.put('/:id', (req, res) => veiculoController.update(req, res));
veiculoRoutes.patch('/:id/baixa', (req, res) => veiculoController.baixa(req, res));

export default veiculoRoutes;
