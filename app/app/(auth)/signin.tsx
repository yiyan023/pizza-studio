import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
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

      if (response.ok && result.message == "Signin successful") {
        router.navigate("/")
      } else {
        console.log("Error")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
      <View>
        <Text>Login Form</Text>
        <Text>Email:</Text>
        <TextInput 
          value={email}
          onChangeText={setEmail}
          placeholder='email'
        />
        <Text>Password:</Text>
        <TextInput 
          value={password}
          onChangeText={setPassword}
          placeholder='password'
        />
        <Button title='submit' onPress={handleLogin}/>
      </View>
  );
}