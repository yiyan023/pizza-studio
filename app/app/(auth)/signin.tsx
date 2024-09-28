import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSession } from '../context';
export default function SignIn() {
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
          secureTextEntry={true}
        />
        {loginError && 
          <Text>
            Login failed. Please try again.
          </Text>
        }
        <Button title={loading ? 'loading' : 'submit'} onPress={handleLogin}/>
      </View>
  );
}