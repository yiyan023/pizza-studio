import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View } from 'react-native';
import AccordionItem from './../../components/OrderContent'; 
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { Text, ScrollView, YStack } from 'tamagui';
import { useEffect, useState } from 'react';
import Logo from "../../assets/images/Logo";

interface Analysis {
  "Danger likeliness": string;
  "Danger level": string;
  "Key words": string;
  "Person type": string;
  "Abuse type": string;
}

interface AccordionItemProps {
  date: string;
  time: string;
  s3_url: string; // Adjust based on your audio source
  transcript: string;
  analysis: Analysis;
  emotions: Array<string>;
  signifierColor?: string;
}

export default function TabTwoScreen() {
  // const exampleDate = "Sample Date";
  // const exampleTime = "Sample Time";
  // const exampleAudio = require('./audio_test_1.mp3');
  // const exampleTranscript = "This is the transcript of the audio.";
  // const audioInfo = [
  //   {
  //     id: "",
  //     date: "September 20, 2023",
  //     time: "1:32 PM",
  //     audio: 'https://pizzastudios.s3.amazonaws.com/audio_test_1.mp3',
  //     //audio: require('./audio_test_1.mp3'),
  //     transcript: "Testing testing testing hello",
  //     analysis: {
  //       "Danger likeliness": "Very unlikely",
  //       "Danger level": "Low",
  //       "Key words": "None",
  //       "Person type": "None",
  //       "Abuse type": "None"
  //     },
  //     emotions: ["Anger", "Distress", "Amusement", "Fear", "Horror", "Pain", "Calmness", "Determination"]
  //   }, 
  //   {
  //     id: "",
  //     date: "September 19, 2023",
  //     time: "10:25 AM",
  //     audio: 'https://pizzastudios.s3.amazonaws.com/audio_test_1.mp3',
  //     transcript: "OMG SAUR SLAY",
  //     analysis: {
  //       "Danger likeliness": "Very unlikely",
  //       "Danger level": "Low",
  //       "Key words": "None",
  //       "Person type": "None",
  //       "Abuse type": "None"
  //     },
  //     emotions: []
  //   }
  // ]

  const SERVER_ADDRESS = "192.168.0.32"
  const [audioInfo, setAudioInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = 'bob@gmail.com'; // Replace with the actual user email

  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const response = await fetch(`http://${SERVER_ADDRESS}:5000/audio/user/${userEmail}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAudioInfo(data);
      } catch (error) {
        console.error('Error fetching audio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Logo height={80}></Logo>
        <Text color={Colors.light.white}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <Text color={Colors.light.black} fontSize={'$heading1'} fontWeight={'$bold'}>Order History</Text>
      </ThemedView>
      <ScrollView>
        <YStack>
          {audioInfo.map((info: AccordionItemProps, index: number) => (
            <AccordionItem
              key={index}
              date="September 29"
              time="12:49"
              s3_url={info.s3_url}
              transcript={info.transcript}
              analysis={info.analysis}
              emotions={info.emotions}
            />
          ))}
        </YStack>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.red,
  },
  titleContainer: {
    gap: 8,
    backgroundColor: 'transparent',
    paddingTop: 50,
    padding: 20,
  },
});
