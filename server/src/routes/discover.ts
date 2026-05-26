import { Router, Response } from 'express';
import db from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { calculateTagSimilarity } from '../utils';

const router = Router();

// 获取推荐用户（发现页）
router.get('/discover', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // 获取当前用户的标签
  const currentUser = db.prepare('SELECT tags, gender, age, city FROM users WHERE id=?').get(userId) as any;
  if (!currentUser) { res.status(404).json({ error: '未找到用户' }); return; }

  const myTags = JSON.parse(currentUser.tags || '[]');
  const myCity = currentUser.city;

  // 获取已滑过的用户ID列表（排除）
  const swipedIds = db.prepare(
    'SELECT to_user_id FROM swipes WHERE from_user_id=?'
  ).all(userId).map((r: any) => r.to_user_id);
  swipedIds.push(userId); // 排除自己

  // 获取匹配过的用户
  const matchedIds = db.prepare(
    `SELECT CASE WHEN user1_id=? THEN user2_id ELSE user1_id END as uid FROM matches WHERE user1_id=? OR user2_id=?`
  ).all(userId, userId, userId).map((r: any) => r.uid);
  swipedIds.push(...matchedIds);

  // 查询推荐用户
  const placeholders = swipedIds.map(() => '?').join(',');
  const candidates = db.prepare(
    `SELECT id, nickname, avatar, gender, age, bio, city, tags FROM users
     WHERE id NOT IN (${placeholders})
     ORDER BY last_active DESC
     LIMIT ? OFFSET ?`
  ).all(...swipedIds, limit, offset) as any[];

  // 计算标签匹配度并排序
  const scored = candidates.map(user => ({
    ...user,
    tags: JSON.parse(user.tags || '[]'),
    matchScore: calculateTagSimilarity(myTags, JSON.parse(user.tags || '[]')),
  })).sort((a, b) => b.matchScore - a.matchScore);

  const totalRemaining = db.prepare(
    `SELECT COUNT(*) as cnt FROM users WHERE id NOT IN (${placeholders})`
  ).get(...swipedIds) as any;

  res.json({
    users: scored,
    page,
    hasMore: offset + limit < totalRemaining.cnt,
    total: totalRemaining.cnt,
  });
});

// 左滑/右滑
router.post('/swipe', authMiddleware, (req: AuthRequest, res: Response) => {
  const fromUserId = req.userId!;
  const { toUserId, direction } = req.body;

  if (!toUserId || !['like', 'pass'].includes(direction)) {
    res.status(400).json({ error: '参数错误' });
    return;
  }

  // 检查是否已划过
  const existing = db.prepare(
    'SELECT id FROM swipes WHERE from_user_id=? AND to_user_id=?'
  ).get(fromUserId, toUserId) as any;
  if (existing) {
    res.status(400).json({ error: '已经划过该用户了' });
    return;
  }

  db.prepare(
    'INSERT INTO swipes (from_user_id, to_user_id, direction) VALUES (?, ?, ?)'
  ).run(fromUserId, toUserId, direction);

  // 更新活跃时间
  db.prepare('UPDATE users SET last_active=CURRENT_TIMESTAMP WHERE id=?').run(fromUserId);

  let isMatch = false;

  // 如果是like，检查对方是否也like了你
  if (direction === 'like') {
    const mutual = db.prepare(
      'SELECT id FROM swipes WHERE from_user_id=? AND to_user_id=? AND direction="like"'
    ).get(toUserId, fromUserId) as any;

    if (mutual) {
      // 创建匹配
      const ids = [fromUserId, toUserId].sort();
      db.prepare(
        'INSERT OR IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)'
      ).run(ids[0], ids[1]);
      isMatch = true;
    }
  }

  res.json({ direction, isMatch });
});

// 获取匹配列表
router.get('/matches', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const matches = db.prepare(
    `SELECT m.id as matchId,
            CASE WHEN m.user1_id=? THEN m.user2_id ELSE m.user1_id END as otherUserId,
            u.nickname, u.avatar, u.bio, u.city, u.tags,
            m.created_at as matchedAt
     FROM matches m
     JOIN users u ON u.id = CASE WHEN m.user1_id=? THEN m.user2_id ELSE m.user1_id END
     WHERE m.user1_id=? OR m.user2_id=?
     ORDER BY m.created_at DESC`
  ).all(userId, userId, userId, userId) as any[];

  res.json(matches.map(m => ({
    ...m,
    tags: JSON.parse(m.tags || '[]'),
  })));
});

// 最近划过我的人
router.get('/who-liked-me', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const likers = db.prepare(
    `SELECT s.created_at as swipeTime, u.id, u.nickname, u.avatar, u.age, u.bio, u.city, u.tags
     FROM swipes s
     JOIN users u ON u.id = s.from_user_id
     WHERE s.to_user_id=? AND s.direction='like'
     ORDER BY s.created_at DESC
     LIMIT 50`
  ).all(userId) as any[];

  res.json(likers.map(l => ({
    ...l,
    tags: JSON.parse(l.tags || '[]'),
  })));
});

export default router;