import { View, StyleSheet, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [name, setName] = useState('')

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "name": name }),
      })

      const result = await response.json();

      if (response.ok) {
        console.log("Success")
      } else {
        console.log("error")
      }

    } catch (error) {
      console.log(error)
    }
  }

  return (
      <View>
        <Text>Name:</Text>
        <TextInput 
          value={name}
          onChangeText={setName}
          placeholder='name'
        />
        <Button title='submit' onPress={handleSubmit}/>
      </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
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
