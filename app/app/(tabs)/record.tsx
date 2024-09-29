import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useSession } from '../context';
import * as FileSystem from 'expo-file-system';

const SERVER_ADDRESS = "192.168.0.32"

export default function RecordAudio() {
  const [soundLevel, setSoundLevel] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRef = useRef<Audio.Recording | null>(null); // Use a ref for media
  const [finished, setFinished] = useState(false);
  const { session } = useSession();
  let intervalId: NodeJS.Timeout | null = null;

  async function stopRecording() {
    setIsRecording(false);
    if (mediaRef.current) {
      await mediaRef.current.stopAndUnloadAsync().then(async () => {
        if (mediaRef.current) {
          const uri = mediaRef.current.getURI();
          const sound = new Audio.Sound();
          if (uri) {
            try {
              await compressAndSendAudio(uri);
            } catch (error) {
              console.log(error);
            }
          }
          // try {
          //     if (uri) {
          //       await sound.loadAsync({uri: uri })
          //       await sound.playAsync();
          //     }
          // } catch (error) {
          //   console.log(error)
          // }
        }
        if (intervalId) {
          clearInterval(intervalId);
        }
      });
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    }

    setFinished(true);
  }

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setIsRecording(true);
    
    if (status === 'granted') {
      await Audio.setAudioModeAsync(
        {
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        }
      );

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      mediaRef.current = recording;
    } else {
      console.error("Microphone permission not granted.");
      setIsRecording(false);
      return null;
    }
  }

  const compressAndSendAudio = async (uri: string) => {
    try {
      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.wav',
        type: 'audio/wav',
      } as any);

      if (session?.email) {
        formData.append('email', session?.email);
      }
      
      if (session?.password) {
        formData.append('password', session?.password);
      }

      const response = await fetch(`http://${SERVER_ADDRESS}:5000/uploadProcessedAudio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error compressing or sending audio:', error);
    }
  }
  
  return (
    <View style={styles.component}>
      {isRecording && <Text style={styles.whiteText}>Recording...</Text>}
      <Button title={isRecording ? 'End' : 'Start'} onPress={isRecording ? stopRecording : startRecording}/>
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',       
    padding: 16, 
  },
  whiteText: {
    color: 'white',
  },
});
