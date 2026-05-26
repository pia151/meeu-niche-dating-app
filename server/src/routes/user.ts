import { Router, Response } from 'express';
import db from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// 更新用户资料
router.put('/profile', authMiddleware, upload.single('avatar'), (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { nickname, gender, age, bio, city, tags } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (nickname) { updates.push('nickname=?'); params.push(nickname); }
  if (gender) { updates.push('gender=?'); params.push(gender); }
  if (age) { updates.push('age=?'); params.push(parseInt(age)); }
  if (bio !== undefined) { updates.push('bio=?'); params.push(bio); }
  if (city) { updates.push('city=?'); params.push(city); }
  if (tags) { updates.push('tags=?'); params.push(typeof tags === 'string' ? tags : JSON.stringify(tags)); }

  if (req.file) {
    updates.push('avatar=?');
    params.push(`/uploads/${req.file.filename}`);
  }

  if (updates.length > 0) {
    updates.push('updated_at=CURRENT_TIMESTAMP');
    params.push(userId);
    db.prepare(`UPDATE users SET ${updates.join(',')} WHERE id=?`).run(...params);
  }

  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, gender, age, bio, city, tags FROM users WHERE id=?'
  ).get(userId) as any;

  res.json({ ...user, tags: JSON.parse(user.tags || '[]') });
});

// 获取用户详情
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    'SELECT id, nickname, avatar, gender, age, bio, city, tags, last_active FROM users WHERE id=?'
  ).get(req.params.id) as any;

  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  res.json({ ...user, tags: JSON.parse(user.tags || '[]') });
});

export default router;