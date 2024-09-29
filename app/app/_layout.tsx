import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { TamaguiProvider} from 'tamagui';

import { useColorScheme } from '@/hooks/useColorScheme';
import SignIn from './(auth)/signin';
import { SessionProvider } from './context';

import config from './../tamagui.config';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    "OpenSans-Regular": require('../assets/fonts/OpenSans-Regular.ttf'),
    "OpenSans-Italic": require('../assets/fonts/OpenSans-Italic.ttf'),
    "OpenSans-Bold": require('../assets/fonts/OpenSans-Bold.ttf'),
    "OpenSans-BoldItalic": require('../assets/fonts/OpenSans-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <SessionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </SessionProvider>
    </TamaguiProvider>
  );
}
