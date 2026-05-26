import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '..', 'meeu.db');

let db: SqlJsDatabase;

// Statement wrapper (mimics better-sqlite3 sync API)
class Statement {
  private sql: string;
  constructor(sql: string) {
    this.sql = sql;
  }
  run(...params: any[]): { lastInsertRowid: number; changes: number } {
    db.run(this.sql, params);
    saveDb();
    // 获取 lastInsertRowid
    const row = db.exec('SELECT last_insert_rowid() as id');
    const lastId = row.length > 0 && row[0].values.length > 0 ? Number(row[0].values[0][0]) : 0;
    return { lastInsertRowid: lastId, changes: 1 };
  }
  get(...params: any[]): any {
    const stmt = db.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return undefined;
  }
  all(...params: any[]): any[] {
    const stmt = db.prepare(this.sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

function saveDb(): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function prepare(sql: string): Statement {
  return new Statement(sql);
}

export function runSql(sql: string, params?: any[]): void {
  db.run(sql, params);
  saveDb();
}

export function execSql(sql: string): any[] {
  return db.exec(sql);
}

export async function initializeDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('📦 已加载现有数据库');
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      gender TEXT DEFAULT 'secret',
      age INTEGER DEFAULT 18,
      bio TEXT DEFAULT '',
      city TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      latitude REAL,
      longitude REAL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS verify_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(from_user_id, to_user_id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      sender_id TEXT NOT NULL,
      content_type TEXT DEFAULT 'text',
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      location TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS moment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moment_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(moment_id, user_id)
    )
  `);

  saveDb();
  console.log('📦 数据库表创建完成');
}

export function seedDatabase(): void {
  const count = prepare('SELECT COUNT(*) as cnt FROM users').get() as any;
  if (count && count.cnt > 0) return;

  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('123456', 10);

  const seedUsers = [
    { id: 'u1', phone: '13800000001', nickname: '小猫咪', gender: 'female', age: 22, bio: '喜欢画画和摄影 🎨📷', city: '北京', tags: '["艺术","摄影","旅行","美食","猫咪"]' },
    { id: 'u2', phone: '13800000002', nickname: '程序员小王', gender: 'male', age: 25, bio: '全栈开发，热爱开源 🚀', city: '上海', tags: '["编程","游戏","动漫","健身","音乐"]' },
    { id: 'u3', phone: '13800000003', nickname: '音乐控', gender: 'female', age: 24, bio: '弹吉他唱歌 🎵', city: '广州', tags: '["音乐","吉他","演唱会","咖啡","阅读"]' },
    { id: 'u4', phone: '13800000004', nickname: '运动达人', gender: 'male', age: 26, bio: '马拉松爱好者🏃', city: '深圳', tags: '["运动","跑步","篮球","户外","健身"]' },
    { id: 'u5', phone: '13800000005', nickname: '文艺青年', gender: 'female', age: 23, bio: '读书写字喝茶🍵', city: '杭州', tags: '["文学","茶道","电影","手作","瑜伽"]' },
    { id: 'u6', phone: '13800000006', nickname: '热爱旅行的喵', gender: 'female', age: 27, bio: '一年去了15个国家 ✈️', city: '成都', tags: '["旅行","摄影","美食","户外","阅读"]' },
    { id: 'u7', phone: '13800000007', nickname: '代码诗人', gender: 'male', age: 24, bio: '写代码也写诗 🖋️', city: '北京', tags: '["编程","文学","音乐","游戏","咖啡"]' },
    { id: 'u8', phone: '13800000008', nickname: '摄影大叔', gender: 'male', age: 28, bio: '人像摄影 📸 约拍滴滴', city: '上海', tags: '["摄影","旅行","电影","运动","咖啡"]' },
  ];

  const insertStmt = prepare(
    'INSERT OR IGNORE INTO users (id, phone, nickname, avatar, gender, age, bio, city, tags, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const u of seedUsers) {
    insertStmt.run(u.id, u.phone, u.nickname, '', u.gender, u.age, u.bio, u.city, u.tags, hash);
  }

  console.log('🌱 测试数据已插入 (' + seedUsers.length + ' 个用户)');
}

export default {
  prepare,
  run: runSql,
  exec: execSql,
  save: saveDb,
};