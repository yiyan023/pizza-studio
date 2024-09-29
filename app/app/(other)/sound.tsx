import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function SoundLevelMeter() {
  const [soundLevel, setSoundLevel] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRef = useRef<Audio.Recording | null>(null); // Use a ref for media
  const [finished, setFinished] = useState(false);
  let intervalId: NodeJS.Timeout | null = null;

  async function stopRecording() {
    setIsRecording(false);
    if (mediaRef.current) {
      await mediaRef.current.stopAndUnloadAsync().then(() => {
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
      mediaRef.current = recording; // Set the ref instead of state
      recordAudioSamples(recording);
    } else {
      console.error("Microphone permission not granted.");
      setIsRecording(false);
      return null;
    }
  }

  const recordAudioSamples = async (recording: Audio.Recording) => {
    intervalId = setInterval(async () => {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        const db: number | undefined = status.metering;
        if (db !== undefined && db !== null) {
          setSoundLevel(prevSoundLevel => [...prevSoundLevel, db + 100]);
        }
      }
    }, 500);
  };

  useEffect(() => {
    if (isRecording) {
      setTimeout(() => {
        stopRecording();
      }, 5000);
    }
  }, [isRecording])
  
  return (
    <View style={styles.component}>
      {isRecording && <Text style={styles.whiteText}>Calculating sound level. Please talk into your mic.</Text>}
      <Button title={isRecording && !finished ? 'Recording' : 'Start'} onPress={startRecording} disabled={isRecording || finished}/>
      {finished && <Text style={styles.whiteText}>Your average decibels are: {(soundLevel.reduce((acc, val) => acc + val, 0) / soundLevel.length).toFixed(2)}</Text>}
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
