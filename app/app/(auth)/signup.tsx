import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function SignIn() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          "email": email, 
          "password": password, 
          "name": name
        }),
      })

      const result = await response.json();

      if (response.ok && result.message == "Signup successful") {
        router.navigate('/signin')
      } else {
        console.log("error")
      }

    } catch (error) {
      console.log(error)
    }
  }

  return (
      <View>
        <Text>Sign Up Form</Text>
        <Text>Name:</Text>
        <TextInput 
          value={name}
          onChangeText={setName}
          placeholder='name'
        />
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
        <Button title='submit' onPress={handleSignup}/>
      </View>
  );
}