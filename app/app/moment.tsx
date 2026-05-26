import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Button } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3003/api';

export default function MomentScreen() {
  const [moments, setMoments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMoments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/moment/list`);
      const data = await response.json();
      if (response.ok) {
        setMoments(data.moments || []);
      } else {
        Alert.alert('Error', data.message || '获取失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const postMoment = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入动态内容');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/moment/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token') || '',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', '动态发布成功！');
        setContent('');
        loadMoments();
      } else {
        Alert.alert('Error', data.message || '发布失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    }
  };

  useEffect(() => {
    loadMoments();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>动态</Text>
      <TextInput
        style={styles.input}
        placeholder="说说你现在的心情..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={3}
      />
      <Button title="发布" onPress={postMoment} />
      <FlatList
        data={moments}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={styles.momentCard}>
            <Text style={styles.momentName}>{item.nickname}</Text>
            <Text style={styles.momentContent}>{item.content}</Text>
            <Text style={styles.momentTime}>{new Date(item.createdAt).toLocaleString('en-US')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginBottom: 15, borderRadius: 8, maxHeight: 100 },
  momentCard: { backgroundColor: '#fff', padding: 15, marginVertical: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  momentName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  momentContent: { marginBottom: 5, color: '#333' },
  momentTime: { fontSize: 12, color: '#999' },
});