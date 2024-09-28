import { View, Text, TamaguiProvider, Input, Button } from 'tamagui';
import { StyleSheet, Alert } from 'react-native';
import config from './../../tamagui.config';
import { useState } from 'react';

export default function HomeScreen() {
  return (
    <TamaguiProvider config={config}>
      <View style={styles.container}>
        <Text fontSize={'$heading1'} fontWeight={'$bold'} color={'green'}>Hello yay!</Text>
      </View>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
