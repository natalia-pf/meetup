import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { initDb } from './database/db.js';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/auth.js';
import rolesRoutes from './routes/roles.js';
import usuariosRoutes from './routes/usuarios.js';
import estabelecimentosRoutes from './routes/estabelecimentos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Init DB
initDb();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/estabelecimentos', estabelecimentosRoutes);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🚀 MeetUp API rodando em http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/api/docs`);
});
