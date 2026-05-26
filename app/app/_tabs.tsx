import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: '#1e293b' },
        headerTitleStyle: { color: '#fff', fontWeight: '600' },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen 
        name="discover" 
        options={{ 
          title: '发现',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ) 
        }}
      />
      <Tabs.Screen 
        name="chat" 
        options={{ 
          title: '聊天',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ) 
        }}
      />
      <Tabs.Screen 
        name="moment" 
        options={{ 
          title: '动态',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ) 
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: '我的',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ) 
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
