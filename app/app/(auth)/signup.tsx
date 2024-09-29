import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import validator from 'validator';
import { l } from 'vite/dist/node/types.d-aGj9QkWt';

export default function SignIn() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [badEmail, setBadEmail] = useState(false);
  const [noEmail, setNoEmail] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [noName, setNoName] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true); 
    const validEmail = validator.isEmail(email);
    let hasError = false; 
  
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
      <View>
        <Text>Sign Up Form</Text>
        <Text>Name:</Text>
        <TextInput 
          value={name}
          onChangeText={setName}
          placeholder='name'
        />
        {noName && 
          <Text>
            Please enter your name.
          </Text>
        }
        <Text>Email:</Text>
        <TextInput 
          value={email}
          onChangeText={setEmail}
          placeholder='email'
        />
        {badEmail && 
          <Text>
            This email already exists. Please try another one.
          </Text>}
        {noEmail && 
        <Text>
          Email is invalid. Please try again.
        </Text>}
        <Text>Password:</Text>
        <TextInput 
          value={password}
          onChangeText={setPassword}
          placeholder='password'
          secureTextEntry={true}
        />
        {badPassword && 
          <Text>
            Password must be at least 8 characters long. Try again.
          </Text>
        }
        <Button title={loading ? 'loading' : 'submit'} onPress={handleSignup}/>
      </View>
  );
}