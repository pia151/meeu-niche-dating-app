#!/bin/bash
# iOS 打包脚本 - 使用 EAS Build 云端打包

# 检查是否安装了 EAS CLI
if ! command -v eas &> /dev/null; then
    echo "错误: EAS CLI 未安装"
    echo "安装: npm install -g eas-cli"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")" || exit 1
cd app || exit 1

echo "========================================"
echo "  MeeU iOS 打包脚本"
echo "========================================"

# 步骤 1: 检查依赖
echo -e "\n🔍 检查依赖..."
npm list -g eas-cli || echo "EAS CLI 未全局安装"

# 步骤 2: 登录 Expo (如果使用)
# echo -e "\n🔐 登录 Expo..."
# eas login

# 步骤 3: 配置 iOS 构建凭据 (第一次运行需要)
# echo -e "\n⚙️ 配置 iOS 凭据..."
# eas credentials --platform ios

# 步骤 4: 开始构建
echo -e "\n🚀 开始构建 iOS 开发版..."
eas build --platform ios --profile development --non-interactive

echo -e "\n✅ 构建完成!"
echo "构建文件会在浏览器中下载，或者你可以使用:"
echo "  eas build:status 查看构建状态"
echo "  eas build:log <build-id> 查看构建日志"