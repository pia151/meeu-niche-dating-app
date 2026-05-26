import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#007AFF' }, headerTintColor: 'white' }}>
      <Stack.Screen name="login" options={{ title: '登录' }} />
      <Stack.Screen name="discover" options={{ title: '发现' }} />
      <Stack.Screen name="chat" options={{ title: '聊天' }} />
      <Stack.Screen name="moment" options={{ title: '动态' }} />
      <Stack.Screen name="profile" options={{ title: '我的' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({});