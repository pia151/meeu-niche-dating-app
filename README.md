# meeu-niche-dating-app
觅友 MeeU - 小众交友APP，类似NICO/喜弟的社交匹配平台

## 🚀 快速开始

### 环境准备

```bash
# 安装 Node.js (v18+)
# 安装 Expo CLI
npm install -g expo-cli eas-cli

# 克隆仓库
git clone https://github.com/pia151/meeu-niche-dating-app.git
cd meeu-niche-dating-app
```

### 本地运行

**后端 (端口 3003)**
```bash
cd server
npx tsx src/index.ts
```

**前端**
```bash
cd app
npx expo start
```

### 打包 iOS 客户端

#### 方案 A: EAS 云端打包（推荐，无需 macOS）

```bash
# 登录 Expo
eas login

# 配置 iOS 构建凭据（第一次需要）
eas credentials --platform ios

# 构建开发版
eas build --platform ios --profile development

# 构建生产版（需要 Apple Developer 账号）
eas build --platform ios --profile production
```

#### 方案 B: 本地打包（需要 macOS + Xcode）

```bash
# 安装依赖
cd app
npx expo prebuild --ios

# 在 Xcode 中打开项目并打包
npx expo run:ios
```

### 打包 Android 客户端

```bash
# Android 开发版
eas build --platform android --profile development

# Android 生产版
eas build --platform android --profile production
```

## 📁 项目结构

```
meeu-niche-dating-app/
├── app/                  # React Native 前端 (Expo)
│   ├── app/              # Expo Router 页面
│   │   ├── index.tsx     # 启动页
│   │   ├── login.tsx     # 注册/登录
│   │   ├── discover.tsx  # 发现匹配 + 滑动
│   │   ├── chat.tsx      # 聊天列表
│   │   ├── moment.tsx    # 动态发布
│   │   ├── profile.tsx   # 个人资料
│   │   ├── _layout.tsx   # 导航布局
│   │   └── _tabs.tsx     # 底部标签栏
│   ├── app.json          # Expo 配置
│   ├── App.tsx           # 应用入口
│   └── package.json      # 前端依赖
├── server/               # Express 后端
│   ├── src/
│   │   ├── database.ts   # SQL.js 数据库
│   │   ├── index.ts      # 入口 + Socket.io
│   │   ├── socket.ts     # 实时聊天
│   │   ├── middleware/   # JWT 认证
│   │   └── routes/       # API 路由
│   ├── .env              # 环境变量
│   └── package.json      # 后端依赖
├── eas.json              # EAS 构建配置
├── .gitignore            # Git 忽略配置
└── README.md             # 项目说明
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React Native (Expo 51) + TypeScript |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite (sql.js) |
| 实时通信 | Socket.io |
| 认证 | JWT + bcrypt |
| 构建 | EAS Build (Expo Application Services) |

## 📱 测试账号

- 手机号: `13800000001`
- 密码: `123456`

## 📝 API 文档

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户 |
| PUT | `/api/auth/update` | 更新资料 |
| GET | `/api/discover/discover` | 发现推荐用户 |
| POST | `/api/discover/swipe` | 滑动点赞 |
| GET | `/api/matches` | 获取匹配列表 |
| GET | `/api/chat/messages` | 获取消息列表 |
| POST | `/api/moment/post` | 发布动态 |
| GET | `/api/moment/list` | 获取动态列表 |

## 🚩 常见问题

**Q: 打包 iOS 需要 Mac 吗？**
A: 使用 EAS Build 云端打包不需要 Mac，任何系统都可以构建 iOS 应用。

**Q: 需要 Apple Developer 账号吗？**
A: 开发版测试不需要。生产版上架需要 Apple Developer 账号 ($99/年)。

**Q: 如何配置推送通知？**
A: 需要在 Expo Dashboard 配置 APNs 证书，并在 `eas.json` 中配置。