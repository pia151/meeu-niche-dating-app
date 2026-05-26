# MeeU iOS 打包完整指南

## 📋 前置准备

### 1. 注册 Expo 账号
访问 https://expo.dev/signup 免费注册

### 2. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 3. 登录 Expo
```bash
eas login
# 输入邮箱和密码
```

---

## 🚀 iOS 打包步骤

### 步骤 1: 进入项目目录
```bash
cd niche-dating-app/app
```

### 步骤 2: 初始化 EAS 项目（第一次）
```bash
eas init
# 按提示选择项目 slug: meeu
```

### 步骤 3: 配置 iOS 构建凭据（第一次）
```bash
eas credentials --platform ios
```

**选项说明：**
- **Generate a new Apple Developer Program membership?** → 选 `No`（免费账号）
- **Which team would you like to use?** → 选择你的 Apple ID
- **Would you like to set up push notifications?** → 选 `No`（可选）

### 步骤 4: 开始构建

**开发版（推荐测试）**
```bash
eas build --platform ios --profile development
```

**生产版（上架 App Store）**
```bash
eas build --platform ios --profile production
```

---

## 📱 安装到设备

### 方式 1: 直接安装（开发版）
构建完成后，EAS 会提供二维码或下载链接：
1. 在 iPhone 上打开 Safari
2. 访问提供的链接
3. 下载并安装 `.ipa` 文件
4. 设置 → 通用 → VPN与设备管理 → 信任开发者

### 方式 2: TestFlight（推荐）
```bash
# 上传到 TestFlight
eas submit --platform ios
```

### 方式 3: 本地运行（无需打包）
```bash
# 手机安装 Expo Go App，扫描二维码
npx expo start
```

---

## 🔧 配置文件说明

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

### app.json
```json
{
  "expo": {
    "name": "觅友 MeeU",
    "slug": "meeu",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.meeu.app"
    }
  }
}
```

---

## 🐛 常见问题

### 1. 构建失败：找不到 Apple Developer 账号
```bash
# 重新配置凭据
eas credentials --platform ios
```

### 2. 证书过期
```bash
# 清除旧证书，重新生成
eas credentials:remove --platform ios
eas credentials --platform ios
```

### 3. 查看构建日志
```bash
eas build:list
eas build:log <build-id>
```

### 4. 重新构建
```bash
eas build --platform ios --profile development --force
```

---

## 📊 构建状态查询

```bash
# 查看所有构建
eas build:list

# 查看特定构建详情
eas build:view <build-id>
```

---

## 🎯 下一步

构建完成后，你会收到邮件通知，包含：
- **下载链接**（直接安装 IPA）
- **二维码**（扫码安装）
- **TestFlight 链接**（上传到 App Store Connect）

**建议流程：**
1. 先构建 `development` 版测试
2. 确认功能正常后，构建 `production` 版
3. 上传到 App Store Connect
4. 提交审核上架

---

## 🔗 相关链接

- Expo 文档: https://docs.expo.dev/build/setup/
- EAS Build: https://docs.expo.dev/build/introduction/
- iOS 打包: https://docs.expo.dev/build-reference/ios-builds/

---

**现在执行：`eas login` 开始登录吧！**