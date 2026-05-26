import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3003/api';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') || '' },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setNickname(data.user.nickname);
        setAge(data.user.age.toString());
        setCity(data.user.city);
        setTags(data.user.tags.join(','));
      } else {
        Alert.alert('Error', data.message || '获取失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token') || '',
        },
        body: JSON.stringify({ nickname, age: parseInt(age), city, tags: tags.split(',') }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '资料更新成功！');
        loadUser();
      } else {
        Alert.alert('Error', data.message || '更新失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>个人资料</Text>
      <TextInput
        style={styles.input}
        placeholder="昵称"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="年龄"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="城市"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="标签（用逗号分隔）"
        value={tags}
        onChangeText={setTags}
      />
      <Button title="保存资料" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 15, borderRadius: 8 },
});