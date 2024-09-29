import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useSession } from '../context';
import { router } from 'expo-router';

import {Text} from "tamagui";
import { Colors } from '@/constants/Colors';
import  ButtonA  from './../../components/ButtonA'

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
        <Text color={Colors.light.grey4}>Pizza Studio</Text>
      ) : (
        <Text>Welcome!</Text>
      )}
      <ButtonA buttonType="text"> x </ButtonA>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
  },
});

