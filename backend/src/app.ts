import express from 'express';
import cors from 'cors';
import { authRoutes, usuarioRoutes } from './modules/usuarios/usuario.routes';
import { motoristaRoutes } from './modules/motoristas/motorista.routes';
import { veiculoRoutes } from './modules/veiculos/veiculo.routes';
import { reativacaoDiretaRoutes, reativacaoRoutes } from './modules/reativacoes/reativacao.routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/motoristas', motoristaRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/reativacoes', reativacaoRoutes);
app.use('/', reativacaoDiretaRoutes);

export default app;
