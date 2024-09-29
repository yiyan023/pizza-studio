import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';

export default function SoundLevelMeter() {
  const [soundLevel, setSoundLevel] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [finished, setFinished] = useState(false);
  const context = new AudioContext();
  const analyzer = context.createAnalyser();

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      return stream;
    } catch (error) {
      console.error("Microphone permission error:", error);
      return null;
    }
  };

  const stopRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        console.log("Microphone track stopped");
      });
      setMediaStream(null);
    }
    setIsRecording(false);
    setFinished(true);
  };

  const startRecording = async () => {
    const stream = await requestMicrophonePermission();
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
        const decibels = 20 * Math.log10(volume + Number.EPSILON) + 100; // Avoid log(0)
        
        if (decibels > 0) {
          setSoundLevel(prevSoundLevel => [...prevSoundLevel, decibels]);
        }

        requestAnimationFrame(calculateVolume);
      }

      calculateVolume();
    }
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
    <View>
      {isRecording && !finished && <Text>Calculating sound level...</Text>}
      <Button title={isRecording && !finished ? 'Recording' : 'Start'} onPress={startRecording} disabled={isRecording}/>
      {finished && <Text>Your average decibels are: {(soundLevel.reduce((acc, val) => acc + val, 0) / soundLevel.length).toFixed(2)}</Text>}
    </View>
  );
}
