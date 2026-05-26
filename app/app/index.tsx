import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1517604931442-710e8edec9ee?w=800',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
];

export default function IndexScreen() {
  const router = useRouter();
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % BACKGROUNDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      router.replace('/discover');
    } else {
      router.push('/login');
    }
  };

  return (
    <ImageBackground 
      source={{ uri: BACKGROUNDS[currentBg] }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.logo}>觅友</Text>
          <Text style={styles.tagline}>遇见有趣的人，探索小众世界</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>开始探索</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.secondaryButtonText}>已有账号？立即登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    marginTop: 16,
    padding: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
});
