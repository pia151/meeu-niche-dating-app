#!/bin/bash
# 本地 iOS 构建脚本（需要 macOS + Xcode）

echo "========================================"
echo "  MeeU iOS 本地构建脚本"
echo "========================================"

# 检查是否在 macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 错误: 本地 iOS 构建需要 macOS 系统"
    echo "💡 建议: 使用 EAS 云端构建（无需 Mac）"
    echo "   eas build --platform ios"
    exit 1
fi

# 检查 Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ 错误: 未找到 Xcode，请从 App Store 安装"
    exit 1
fi

cd "$(dirname "$0")" || exit 1
cd app || exit 1

echo "📦 步骤 1: 安装依赖..."
npm install

echo "🔧 步骤 2: 生成 iOS 项目..."
npx expo prebuild --ios --clean

echo "🚀 步骤 3: 构建 iOS 项目..."
cd ios

# 安装 CocoaPods 依赖
if command -v pod &> /dev/null; then
    echo "📱 安装 CocoaPods 依赖..."
    pod install
fi

# 构建 Release 版本
echo "🏗️  开始构建 Release 版本..."
xcodebuild \
    -workspace Meeu.xcworkspace \
    -scheme Meeu \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath build/Meeu.xcarchive \
    archive

# 导出 IPA
echo "📦 导出 IPA 文件..."
xcodebuild \
    -exportArchive \
    -archivePath build/Meeu.xcarchive \
    -exportPath build/Output \
    -exportOptionsPlist exportOptions.plist

echo "✅ 构建完成!"
echo "📁 IPA 文件位置: $(pwd)/build/Output/Meeu.ipa"

# 可选：安装到连接的设备
# ios-deploy --bundle build/Output/Meeu.ipa