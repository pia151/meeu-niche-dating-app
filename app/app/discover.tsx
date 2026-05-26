import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3003/api';

export default function DiscoverScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/discover/discover?page=${page}&limit=5`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        Alert.alert('Error', data.message || '获取失败');
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers(1);
  };

  const handleSwipe = async (userId, direction) => {
    try {
      const response = await fetch(`${API_URL}/discover/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId, direction }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', direction === 'like' ? '点赞成功' : '划过');
        loadUsers();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', '网络错误');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>推荐用户</Text>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.nickname}</Text>
              <Text style={styles.info}>{item.city} · {item.age}岁</Text>
              <Text style={styles.tags}>{item.tags.join('、')}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.nay]}
                onPress={() => handleSwipe(item.id, 'pass')}
              >
                <Text style={styles.buttonText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yay]}
                onPress={() => handleSwipe(item.id, 'like')}
              >
                <Text style={styles.buttonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  userCard: { backgroundColor: '#fff', padding: 15, marginVertical: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  userInfo: { marginBottom: 15 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  info: { color: '#666', marginBottom: 5 },
  tags: { color: '#007AFF' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  nay: { backgroundColor: '#ff6b6b' },
  yay: { backgroundColor: '#51cf66' },
  buttonText: { fontSize: 28, color: 'white', fontWeight: 'bold' },
});