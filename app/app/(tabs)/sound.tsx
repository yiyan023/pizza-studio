import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function SoundLevelMeter() {
  const [soundLevel, setSoundLevel] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const context = new AudioContext();
  const analyzer = context.createAnalyser();
  let stream: MediaStream;

  const requestMicrophonePermission = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Microphone permission error:", error);
    }
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        console.log("Microphone track stopped:");
      });
      setMediaStream(null);
    } else {
      console.log("No active media stream to stop");
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    await requestMicrophonePermission();
    if (stream) {
      setIsRecording(true);
      const source = context.createMediaStreamSource(stream);
      source.connect(analyzer);
      analyzer.connect(context.destination);
      const pcmData = new Float32Array(analyzer.fftSize);

      if (context.state === 'suspended') {
        await context.resume();
      }
      
      function calculateVolume() {
        analyzer.getFloatTimeDomainData(pcmData);
        let sum = 0;
        for (const amplitude of pcmData) {
            sum += amplitude * amplitude;
        }
        
        const volume = Math.sqrt(sum / pcmData.length);
        const decibels = 20 * Math.log10(volume) + 100; 
        setSoundLevel(decibels);

        requestAnimationFrame(calculateVolume);
    }
    

      calculateVolume();
    }
  };

  return (
    <View>
      <Text>Sound Level: {soundLevel !== null ? `${Math.round(soundLevel)} dB` : 'N/A'}</Text>
      <Button title={isRecording ? 'Stop' : 'Start'} onPress={isRecording ? stopRecording : startRecording} />
    </View>
  );
}
