import { Router, Response } from 'express';
import db from '../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'meeu_jwt_secret_key_2024';

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

router.post('/send-code', (req, res: Response) => {
  const { phone } = req.body;
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    res.status(400).json({ error: '请输入正确的手机号' });
    return;
  }
  const code = generateVerifyCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO verify_codes (phone, code, expires_at) VALUES (?, ?, ?)').run(phone, code, expiresAt);
  console.log('📱 验证码:', code);
  res.json({ message: '验证码已发送', code });
});

router.post('/register', (req, res: Response) => {
  const { phone, code, password, nickname } = req.body;
  if (!phone || !code || !password || !nickname) {
    res.status(400).json({ error: '请填写所有必填字段' });
    return;
  }
  const verifyRecord = db.prepare('SELECT * FROM verify_codes WHERE phone=? AND code=? AND expires_at > datetime("now") AND used=0 ORDER BY id DESC LIMIT 1').get(phone, code) as any;
  if (!verifyRecord) {
    res.status(400).json({ error: '验证码错误或已过期' });
    return;
  }
  db.prepare('UPDATE verify_codes SET used=1 WHERE id=?').run(verifyRecord.id);
  const existing = db.prepare('SELECT id FROM users WHERE phone=?').get(phone) as any;
  if (existing) {
    res.status(400).json({ error: '该手机号已注册' });
    return;
  }
  const userId = uuidv4();
  const passwordHash = hashPassword(password);
  db.prepare('INSERT INTO users (id, phone, nickname, password_hash) VALUES (?, ?, ?, ?)').run(userId, phone, nickname, passwordHash);
  const token = generateToken(userId);
  res.json({ token, user: { id: userId, phone, nickname, avatar: '', gender: 'secret' } });
});

router.post('/login', (req, res: Response) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400).json({ error: '请输入手机号和密码' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE phone=?').get(phone) as any;
  if (!user) {
    res.status(400).json({ error: '账号不存在' });
    return;
  }
  if (!comparePassword(password, user.password_hash)) {
    res.status(400).json({ error: '密码错误' });
    return;
  }
  db.prepare('UPDATE users SET last_active=CURRENT_TIMESTAMP WHERE id=?').run(user.id);
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, gender: user.gender, age: user.age, bio: user.bio, city: user.city, tags: JSON.parse(user.tags || '[]') } });
});

router.get('/me', (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string };
    const user = db.prepare('SELECT id, phone, nickname, avatar, gender, age, bio, city, tags, created_at FROM users WHERE id=?').get(decoded.userId) as any;
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json({ ...user, tags: JSON.parse(user.tags || '[]') });
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
});

export default router;
