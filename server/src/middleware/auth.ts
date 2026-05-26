import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey: string = process.env.JWT_SECRET || 'meeu_jwt_secret_key_2024';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录或登录已过期' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secretKey) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, secretKey, { expiresIn: '30d' });
}
