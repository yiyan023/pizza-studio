import { View, StyleSheet, TextInput, Button, Alert, Pressable, Image } from 'react-native';
import {Text, Input, TextArea, XStack, YStack} from 'tamagui';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSession } from '../context';
import { Colors } from '@/constants/Colors';
import { Bold } from '@tamagui/lucide-icons';
import Header from '../../components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import ButtonA from '@/components/ButtonA';
// import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native'; // Import hook for navigation


export default function SignIn() {

  const colorScheme = useColorScheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { session, setSession } = useSession();

  const handleLogin = async () => {
    setLoginError(false);
    setLoading(true);

    if (email == "" || password == "") {
      setLoginError(true);
      setLoading(false);
    } else {
      try {
        const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            "email": email, 
            "password": password, 
          }),
        })
  
        const result = await response.json()
  
        if (response.ok) {
          if (result.message == "Signin successful") {
            setSession(result.user)
            router.navigate("/")
          } else {
            setLoginError(true);
          }
        } else {
          console.log("Error")
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (session) {
      router.navigate('/')
    }
  }, [session])

  return (
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <YStack 
      gap={0}
      // alignItems='center'
      // justifyContent='center'
      flex={1}
      >
        <Header/>
        <Image 
          source={require('../../assets/images/signin-pizza.png')}
          style={{ width: 390, height: 200, borderRadius: 0 }} // Add styling here
        />
        <YStack
          gap={20}
          padding={20}
          >
        
        <Text 
          fontSize={"$heading1"} 
          color={Colors.light.black} 
          fontWeight={"$bold"}>
            Login</Text>

        <YStack gap={10}>
        <Text 
          fontSize={"$normal"} 
          color={Colors.light.black}>
            Email</Text>
        <Input 
          value={email}
          onChangeText={setEmail}
          placeholder='Enter email'
          size="$4"
          borderWidth={1}
          borderRadius={50}
          backgroundColor={Colors.light.white}
          borderColor={Colors.light.grey2}
        />
        </YStack>
        <YStack gap={20}>
        <Text 
          fontSize={"$normal"} 
          color={Colors.light.black}>
            Password</Text>
            
        <Input 
          value={password}
          onChangeText={setPassword}
          placeholder='Enter password'
          secureTextEntry={true}
          size="$4"
          borderWidth={1}
          borderRadius={50}
          backgroundColor={Colors.light.white}
          borderColor={Colors.light.grey2}
        />
        {loginError && 
          <Text 
          fontSize={"$normal"} 
          color={Colors.light.black}
          >
            Login failed. Please try again.
          </Text>
        }
        </YStack>
        <ButtonA 
          buttonType="fill"
          title={loading ? 'loading' : 'submit'} 
          color={Colors.light.red} 
          onPress={handleLogin}/>
        <Text 
          fontSize={"$normal"} 
          color={Colors.light.black}>
          Don't have an account yet?{' '}
          <Text 
            style={{ color: Colors.light.red }} 
            onPress={() => router.navigate('/signup')}
            cursor='pointer'>
              Sign up</Text>
          </Text>
          </YStack>
      </YStack>
    // </ThemeProvider>
  );
}