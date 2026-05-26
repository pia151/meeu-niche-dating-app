import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3003/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat/messages`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        Alert.alert('Error', data.message || '获取失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
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
      <Text style={styles.title}>聊天记录</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.message, styles[item.sender === 'me' ? 'my' : 'other']]}>
            <Text style={styles.name}>{item.nickname}</Text>
            <Text style={styles.text}>{item.content}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  message: { maxWidth: '80%', padding: 10, borderRadius: 10, marginBottom: 10 },
  my: { alignSelf: 'flex-end', backgroundColor: '#51cf66', alignItems: 'flex-end' },
  other: { alignSelf: 'flex-start', backgroundColor: '#e9ecef', alignItems: 'flex-start' },
  name: { fontWeight: 'bold', marginBottom: 2 },
  text: { marginBottom: 2 },
  time: { fontSize: 12, color: '#666' },
});