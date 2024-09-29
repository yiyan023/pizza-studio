import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Audio } from 'expo-av';

export default function SoundLevelMeter() {
  const [soundLevel, setSoundLevel] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<Audio.Recording | null>(null);
  const [finished, setFinished] = useState(false);

  const stopRecording = async () => {
    if (mediaStream) {
      await mediaStream.stopAndUnloadAsync(); 
      console.log("Recording stopped");
      setMediaStream(null);
    }
    
    setIsRecording(false);
    setFinished(true);
  };

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
      setMediaStream(recording);
      console.log("Recording...")

      recordAudioSamples(recording);
    } else {
      console.error("Microphone permission not granted.");
      return null;
    }
  }

  const recordAudioSamples = async (recording: Audio.Recording) => {
    // Set an interval to calculate decibels
    const intervalId = setInterval(async () => {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        const db: number | undefined = status.metering;
        if (db !== undefined && db !== null) {
          setSoundLevel(prevSoundLevel => [...prevSoundLevel, db + 100]);
        }
      }
    }, 1000); // Adjust the interval as needed

    // Clear the interval when recording is stopped
    return () => clearInterval(intervalId);
  };

  const calculateRMS = (data) => {
    const sumOfSquares = data.reduce((acc, value) => acc + value * value, 0);
    const mean = sumOfSquares / data.length;
    return Math.sqrt(mean);
  };

  useEffect(() => {
    if (isRecording) {
      setTimeout(() => {
        stopRecording();
      }, 5000);
    }

    console.log(soundLevel)
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