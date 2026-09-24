import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Inicializa conexão centralizada com o MongoDB
    console.log('[Servidor] Estabelecendo conexão com o MongoDB...');
    await connectDB();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Servidor Nana & Mimi rodando na porta ${PORT}`);
      console.log(`📡 URL da API: http://localhost:${PORT}/api`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('❌ Falha fatal ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

bootstrap();
