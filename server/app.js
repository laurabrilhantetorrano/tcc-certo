import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { sanitizeNoSql } from './middlewares/sanitize.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Configurações de segurança e parsing
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Proteção ativa contra NoSQL Injection
app.use(sanitizeNoSql);

// Rotas da API
app.use('/api', routes);

// Rota raiz informativa
app.get('/', (req, res) => {
  res.json({
    projeto: 'Nana & Mimi E-commerce API',
    descricao: 'API REST com persistência de dados em MongoDB',
    status: 'operacional',
    endpoints: {
      health: '/api/health',
      produtos: '/api/produtos',
      autenticacao: '/api/auth',
      pedidos: '/api/pedidos',
      contato: '/api/contato',
    },
  });
});

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'erro',
    mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware centralizado de tratamento de erros
app.use(errorHandler);

export default app;
