import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

// Web 版 API 地址（使用本地后端）
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3003/api' 
  : 'https://your-api-server.com/api';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '登录成功！');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/discover';
      } else {
        Alert.alert('Error', data.message || '登录失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误，请确保后端服务已启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>觅友 MeeU</Text>
      <Text style={styles.subtitle}>小众交友，遇见有趣的人</Text>
      
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
        title={loading ? '登录中...' : '登录'}
        onPress={handleSubmit}
        disabled={loading}
      />
      <View style={styles.hint}>
        <Text style={styles.hintText}>测试账号: 13800000001 / 123456</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#6366F1' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#666' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff' },
  hint: { marginTop: 20, alignItems: 'center' },
  hintText: { color: '#999', fontSize: 12 },
});