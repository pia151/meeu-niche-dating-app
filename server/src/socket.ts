import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { prepare, runSql } from './database';

const secretKey: string = process.env.JWT_SECRET || 'meeu_jwt_secret_key_2024';

interface AuthSocket extends Socket {
  userId?: string;
}

export function setupSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('未授权'));
    }
    try {
      const decoded = jwt.verify(token as string, secretKey) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Token 无效'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`🔗 用户 [${userId}] 已连接`);

    socket.join(`user:${userId}`);

    runSql('UPDATE users SET last_active=CURRENT_TIMESTAMP WHERE id=?', [userId]);

    const matches = prepare(
      'SELECT id FROM matches WHERE user1_id=? OR user2_id=?'
    ).all(userId, userId) as any[];
    matches.forEach(m => {
      socket.join(`match:${m.id}`);
    });

    // 发送消息
    socket.on('send_message', (data: { matchId: number; content: string; contentType?: string }) => {
      const { matchId, content, contentType = 'text' } = data;

      const match = prepare(
        'SELECT * FROM matches WHERE id=? AND (user1_id=? OR user2_id=?)'
      ).get(matchId, userId, userId) as any;

      if (!match) return;

      const result = prepare(
        'INSERT INTO messages (match_id, sender_id, content_type, content) VALUES (?, ?, ?, ?)'
      ).run(matchId, userId, contentType, content);

      const message = {
        id: result.lastInsertRowid,
        match_id: matchId,
        sender_id: userId,
        content,
        content_type: contentType,
        created_at: new Date().toISOString(),
        read_at: null,
      };

      io.to(`match:${matchId}`).emit('new_message', message);

      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      io.to(`user:${otherUserId}`).emit('message_notification', {
        matchId,
        sender_id: userId,
        preview: content.substring(0, 50),
      });
    });

    // 消息已读
    socket.on('mark_read', (data: { matchId: number }) => {
      runSql(
        'UPDATE messages SET read_at=CURRENT_TIMESTAMP WHERE match_id=? AND sender_id!=? AND read_at IS NULL',
        [data.matchId, userId]
      );

      io.to(`match:${data.matchId}`).emit('messages_read', {
        matchId: data.matchId,
        userId,
        readAt: new Date().toISOString(),
      });
    });

    // 正在输入
    socket.on('typing', (data: { matchId: number; isTyping: boolean }) => {
      socket.to(`match:${data.matchId}`).emit('user_typing', {
        matchId: data.matchId,
        userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 用户 [${userId}] 已断开`);
    });
  });

  console.log('⚡ WebSocket 服务器已配置');
  return io;
}
