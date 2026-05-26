import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';

const API_URL = 'http://localhost:3003/api';

export default function LoginScreen() {
  const router = useRouter();
  const { mode = 'login' } = useLocalSearchParams();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '登录/注册成功！');
        router.push(`/discover`);
      } else {
        Alert.alert('Error', data.message || '操作失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? '登录' : '注册'}</Text>
      <TextInput
        style={styles.input}
        placeholder="手机号"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
        onPress={handleSubmit}
        disabled={loading}
      />
      <View style={styles.switch}>
        <Text
          style={styles.switchText}
          onPress={() => router.push(`/${mode === 'login' ? 'register' : 'login'}`)}
        >
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 20, borderRadius: 8 },
  switch: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#007AFF', fontSize: 16 },
});