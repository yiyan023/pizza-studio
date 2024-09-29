import { View, StyleSheet, TextInput, Button, Alert, Pressable, Image } from 'react-native';
import {Text, Input, TextArea, XStack, YStack} from 'tamagui';
import { useState } from 'react';
import { router } from 'expo-router';
import validator from 'validator';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native'; // Import hook for navigation
import Header from '../../components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import { l } from 'vite/dist/node/types.d-aGj9QkWt';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [badEmail, setBadEmail] = useState(false);
  const [noEmail, setNoEmail] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [noName, setNoName] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true); // Start loading as soon as the function is called
    const validEmail = validator.isEmail(email);
    let hasError = false; // Track if there are validation errors
  
    if (!validEmail || email === '') {
      console.log("email is empty");
      setNoEmail(true);
      hasError = true;
    } else {
      setNoEmail(false);
    }
  
    if (password === '' || password.length < 8) {
      setBadPassword(true);
      hasError = true;
    } else {
      setBadPassword(false);
    }
  
    if (name === '') {
      setNoName(true);
      hasError = true;
    } else {
      setNoName(false);
    }
  
    if (hasError) {
      setLoading(false); 
      return; 
    }
  
    try {
      const response = await fetch('http://127.0.0.1:5000/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (result.message === "Signup successful") {
          router.navigate('/signin');
          setBadEmail(false);
        } else if (result.message === "Email exists") {
          setBadEmail(true);
        }
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  

  return (
      <YStack gap={0}>
        <Header/>
        <Image 
          source={require('../../assets/images/signin-pizza.png')}
          style={{ width: 390, height: 200, borderRadius: 0 }} // Add styling here
        />
        <YStack gap={20} padding={20}>
        <Text
        fontSize={"$heading1"} 
        color={Colors.light.black} 
        fontWeight={"$bold"}>
          Create an account</Text>
        <YStack gap={10}>
        <Text
        fontSize={"$normal"} 
        color={Colors.light.black}>
          Name</Text>
        <Input 
          value={name}
          onChangeText={setName}
          placeholder='Enter name'
          size="$4"
          borderWidth={1}
          borderRadius={50}
          backgroundColor={Colors.light.white}
          borderColor={Colors.light.grey2}
        />
        {noName && 
          <Text
          fontSize={"$normal"} 
          color={Colors.light.black}>
            Please enter your name.
          </Text>
        }
        </YStack>
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
        {badEmail && 
          <Text
          fontSize={"$normal"} 
          color={Colors.light.black}>
            This email already exists. Please try another one.
          </Text>}
        {noEmail && 
        <Text
        fontSize={"$normal"} 
          color={Colors.light.black}>
          Email is invalid. Please try again.
        </Text>}
        </YStack>
        <YStack gap={10}>
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
        {badPassword && 
          <Text
          fontSize={"$normal"} 
          color={Colors.light.black}>
            Password must be at least 8 characters long. Try again.
          </Text>
        }
        </YStack>
        <Button 
        title={loading ? 'loading' : 'submit'} 
        onPress={handleSignup} 
        color={Colors.light.red}/>
        <Text 
          fontSize={"$normal"} 
          color={Colors.light.black}>
          Already have an account?{' '}
          <Text 
            style={{ color: Colors.light.red }} 
            onPress={() => router.navigate('/signup')}
            cursor='pointer'>
              Sign in</Text>
          </Text>
        </YStack>
      </YStack>
  );
}