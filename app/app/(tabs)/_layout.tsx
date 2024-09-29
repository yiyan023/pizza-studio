import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Home, CreditCard, History, SlidersHorizontal } from '@tamagui/lucide-icons'
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import Header from "../../components/Header";
import config from './../../tamagui.config';
import { TamaguiProvider} from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userAddress = "123 Main St, Cityville";

  return (
    <TamaguiProvider config={config}>
      <Header address={userAddress}></Header>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].red,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent', // This makes the background clear
            elevation: 0, // Removes shadow on Android
            borderTopWidth: 1, // Removes the border at the top of the tab bar
            borderTopColor: Colors[colorScheme ?? 'light'].grey2,
            padding: 10,
            height: 60
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Home color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ color }) => (
              <CreditCard color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color}) => (
              <History color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => (
              <SlidersHorizontal color={color} />
            ),
          }}
        />
      </Tabs>
    </TamaguiProvider>
  );
}
