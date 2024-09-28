import { View, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useSession } from '../context';
import { router } from 'expo-router';

export default function LoadScreen() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!session) {
        router.navigate('/signin'); 
      }
    }, 2000);

    if (session) {
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [session]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Pizza Studio</Text>
      ) : (
        <Text>Welcome!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
