import { BottomTabs, Tab } from 'expo-router/tab';
import { StyleSheet } from 'react-native';

export default function Tabs() {
  return (
    <BottomTabs>
      <Tab name="discover" options={{ tabBarLabel: '发现' }} />
      <Tab name="chat" options={{ tabBarLabel: '聊天' }} />
      <Tab name="moment" options={{ tabBarLabel: '动态' }} />
      <Tab name="profile" options={{ tabBarLabel: '我的' }} />
    </BottomTabs>
  );
}

const styles = StyleSheet.create({});