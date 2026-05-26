import { Router, Response } from 'express';
import db from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取聊天列表
router.get('/conversations', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  // 获取所有匹配的最新消息
  const conversations = db.prepare(
    `SELECT
       m.id as matchId,
       CASE WHEN m.user1_id=? THEN m.user2_id ELSE m.user1_id END as otherUserId,
       u.nickname, u.avatar,
       (SELECT content FROM messages WHERE match_id=m.matchId ORDER BY id DESC LIMIT 1) as lastMessage,
       (SELECT content_type FROM messages WHERE match_id=m.matchId ORDER BY id DESC LIMIT 1) as lastMessageType,
       (SELECT created_at FROM messages WHERE match_id=m.matchId ORDER BY id DESC LIMIT 1) as lastMessageTime,
       (SELECT COUNT(*) FROM messages WHERE match_id=m.matchId AND sender_id!=? AND read_at IS NULL) as unreadCount
     FROM matches m
     LEFT JOIN users u ON u.id = CASE WHEN m.user1_id=? THEN m.user2_id ELSE m.user1_id END
     WHERE m.user1_id=? OR m.user2_id=?
     ORDER BY lastMessageTime DESC`
  ).all(userId, userId, userId, userId, userId) as any[];

  res.json(conversations);
});

// 获取聊天消息
router.get('/messages/:matchId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const matchId = parseInt(req.params.matchId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = (page - 1) * limit;

  // 验证是否属于该匹配
  const match = db.prepare(
    'SELECT * FROM matches WHERE id=? AND (user1_id=? OR user2_id=?)'
  ).get(matchId, userId, userId) as any;

  if (!match) {
    res.status(403).json({ error: '无权查看该对话' });
    return;
  }

  // 标记消息为已读
  db.prepare(
    'UPDATE messages SET read_at=CURRENT_TIMESTAMP WHERE match_id=? AND sender_id!=? AND read_at IS NULL'
  ).run(matchId, userId);

  // 获取消息（时间倒序）
  const messages = db.prepare(
    `SELECT * FROM messages WHERE match_id=? ORDER BY id DESC LIMIT ? OFFSET ?`
  ).all(matchId, limit, offset) as any[];

  res.json({
    messages: messages.reverse().map(m => ({
      ...m,
      isMe: m.sender_id === userId,
    })),
    page,
    hasMore: messages.length === limit,
  });
});

// 发送消息（通过REST，备用）
router.post('/messages/:matchId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const matchId = parseInt(req.params.matchId);
  const { content, contentType = 'text' } = req.body;

  if (!content) {
    res.status(400).json({ error: '消息内容不能为空' }); return;
  }

  const match = db.prepare(
    'SELECT * FROM matches WHERE id=? AND (user1_id=? OR user2_id=?)'
  ).get(matchId, userId, userId) as any;

  if (!match) {
    res.status(403).json({ error: '无权发送消息' }); return;
  }

  const result = db.prepare(
    'INSERT INTO messages (match_id, sender_id, content_type, content) VALUES (?, ?, ?, ?)'
  ).run(matchId, userId, contentType, content);

  res.json({ id: result.lastInsertRowid, matchId, sender_id: userId, content, contentType, created_at: new Date().toISOString() });
});

export default router;