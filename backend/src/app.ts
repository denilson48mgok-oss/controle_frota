import express from 'express';
import cors from 'cors';
import { authRoutes, usuarioRoutes } from './modules/usuarios/usuario.routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

export default app;
