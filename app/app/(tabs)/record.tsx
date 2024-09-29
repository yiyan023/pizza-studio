import React, { useState, useEffect } from 'react';
import { View, Text, Button} from 'react-native';

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function RecordAudio() {
  const [soundLevel, setSoundLevel] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [finished, setFinished] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  let mediaRecorder;
  let chunks: Blob[] = [];
  let audio_url;

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

  const stopRecording = async () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        console.log("Microphone track stopped");
      });
      setMediaStream(null);
    }

    setIsRecording(false);
    setFinished(true);

    if (recorder) {
      recorder.stop()
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
      chunks = [];
      audio_url = window.URL.createObjectURL(blob);
      const path = '../assets/audio/file.mp3'

      try {
        const { uri } = await FileSystem.downloadAsync(audio_url, path);
        console.log("Success!")
        console.log(uri)
        const soundInstance = new Audio.Sound();
        await soundInstance.loadAsync({ uri: uri });
        setSound(soundInstance);
      } catch (error) {
        console.log(error)
      }
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await requestMicrophonePermission();
    
    if (stream) {
      mediaRecorder = new MediaRecorder(stream)
      setRecorder(mediaRecorder)
      mediaRecorder.start();
      console.log("State: ", mediaRecorder.state);

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
    }
  };

  const playAudio = async () => {
    const ready_sound = await sound?._loaded;

    if (ready_sound && sound) {
      await sound.playAsync();
    }
    
  }
  
  return (
    <View>
      {isRecording && !finished && <Text>Recording...</Text>}
      <Button title={isRecording ? 'Stop' : 'Start'} onPress={isRecording ? stopRecording : startRecording} />
      {finished && 
      (
        <>
          <Button title='Play Audio' onPress={playAudio}/>
        </>
      )
      }
    </View>
  );
}
