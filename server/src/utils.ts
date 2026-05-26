import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'meeu_jwt_secret_key_2024';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 计算标签匹配度 (Jaccard 相似系数)
export function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  let intersection = 0;
  for (const tag of set1) {
    if (set2.has(tag)) intersection++;
  }
  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
