import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ title: '登录/注册' }} />
      <Stack.Screen name="discover" options={{ title: '发现' }} />
      <Stack.Screen name="chat" options={{ title: '聊天' }} />
      <Stack.Screen name="moment" options={{ title: '动态' }} />
      <Stack.Screen name="profile" options={{ title: '我的' }} />
    </Stack>
  );
}
