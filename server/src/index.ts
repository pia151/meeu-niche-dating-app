import express from 'express';
import cors from 'cors';
import http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase, seedDatabase } from './database';
import { setupSocket } from './socket';

dotenv.config();

async function main() {
  const app = express();
  const server = http.createServer(app);
  const PORT = parseInt(process.env.PORT || '3001');

  await initializeDatabase();
  seedDatabase();

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(uploadsDir));

  const authRoutes = require('./routes/auth').default;
  const userRoutes = require('./routes/user').default;
  const discoverRoutes = require('./routes/discover').default;
  const chatRoutes = require('./routes/chat').default;
  const momentRoutes = require('./routes/moment').default;

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/discover', discoverRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/moments', momentRoutes);

  app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const io = setupSocket(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔══════════════════════════════════╗
  ║    觅友 MeeU 后端服务器已启动     ║
  ║  地址: http://localhost:${PORT}    ║
  ║  API:  http://localhost:${PORT}/api  ║
  ╚══════════════════════════════════╝
    `);
  });
}

main().catch(err => {
  console.error('❌ 启动失败:', err);
  process.exit(1);
});