import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireMasterOrAdmin } from '../../middlewares/role.middleware';
import { reativacaoController } from './reativacao.controller';

export const reativacaoRoutes = Router();
reativacaoRoutes.use(authMiddleware);

reativacaoRoutes.get('/', (req, res) => reativacaoController.findAll(req, res));
reativacaoRoutes.post('/', (req, res) => reativacaoController.solicitar(req, res));
reativacaoRoutes.patch('/:id/aprovar', requireMasterOrAdmin, (req, res) => reativacaoController.aprovar(req, res));
reativacaoRoutes.patch('/:id/rejeitar', requireMasterOrAdmin, (req, res) => reativacaoController.rejeitar(req, res));

export const reativacaoDiretaRoutes = Router();
reativacaoDiretaRoutes.patch(
  '/:entidade/:id/reativar',
  authMiddleware,
  requireMasterOrAdmin,
  (req, res) => reativacaoController.reativarDireto(req, res),
);

export default reativacaoRoutes;
