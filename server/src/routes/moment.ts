import { Router, Response } from 'express';
import db from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// 动态图片上传
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `moment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// 发布动态
router.post('/', authMiddleware, upload.array('images', 9), (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { content, location } = req.body;
  const images = (req.files as Express.Multer.File[] || []).map(f => `/uploads/${f.filename}`);

  const result = db.prepare(
    'INSERT INTO moments (user_id, content, images, location) VALUES (?, ?, ?, ?)'
  ).run(userId, content || '', JSON.stringify(images), location || '');

  res.json({
    id: result.lastInsertRowid,
    content: content || '',
    images,
    location,
    created_at: new Date().toISOString(),
  });
});

// 获取动态列表（时间线）
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // 获取自己和匹配好友的动态
  const matchedUserIds = db.prepare(
    `SELECT DISTINCT CASE WHEN user1_id=? THEN user2_id ELSE user1_id END as uid FROM matches WHERE user1_id=? OR user2_id=?`
  ).all(userId, userId, userId).map((r: any) => r.uid);
  matchedUserIds.push(userId);

  const placeholders = matchedUserIds.map(() => '?').join(',');
  const moments = db.prepare(
    `SELECT m.*, u.nickname, u.avatar
     FROM moments m
     JOIN users u ON u.id = m.user_id
     WHERE m.user_id IN (${placeholders})
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(...matchedUserIds, limit, offset) as any[];

  // 附上点赞状态
  const momentIds = moments.map(m => m.id);
  let likes: any[] = [];
  if (momentIds.length > 0) {
    likes = db.prepare(
      `SELECT moment_id FROM moment_likes WHERE moment_id IN (${momentIds.map(() => '?').join(',')}) AND user_id=?`
    ).all(...momentIds, userId) as any[];
  }
  const likedSet = new Set(likes.map((l: any) => l.moment_id));

  res.json(moments.map(m => ({
    ...m,
    images: JSON.parse(m.images || '[]'),
    liked: likedSet.has(m.id),
  })));
});

// 点赞/取消点赞
router.post('/:id/like', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const momentId = parseInt(req.params.id);

  const existing = db.prepare(
    'SELECT id FROM moment_likes WHERE moment_id=? AND user_id=?'
  ).get(momentId, userId) as any;

  if (existing) {
    db.prepare('DELETE FROM moment_likes WHERE id=?').run(existing.id);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO moment_likes (moment_id, user_id) VALUES (?, ?)').run(momentId, userId);
    res.json({ liked: true });
  }
});

export default router;