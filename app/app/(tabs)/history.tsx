import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View } from 'react-native';
import AccordionItem from './../../components/OrderContent'; 

import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { Text, ScrollView, YStack } from 'tamagui';

export default function TabTwoScreen() {
  const exampleDate = "Sample Date";
  const exampleTime = "Sample Time";
  const exampleAudio = require('./audio_test_1.mp3');
  const exampleTranscript = "This is the transcript of the audio.";
  const audioInfo = [
    {
      id: "",
      date: "September 20, 2023",
      time: "1:32 PM",
      audio: 'https://pizzastudios.s3.amazonaws.com/audio_test_1.mp3',
      //audio: require('./audio_test_1.mp3'),
      transcript: "Testing testing testing hello",
      analysis: {
        "Danger likeliness": "Very unlikely",
        "Danger level": "Low",
        "Key words": "None",
        "Person type": "None",
        "Abuse type": "None"
      },
      emotions: ["Anger", "Distress", "Amusement", "Fear", "Horror", "Pain", "Calmness", "Determination"]
    }, 
    {
      id: "",
      date: "September 19, 2023",
      time: "10:25 AM",
      audio: 'https://pizzastudios.s3.amazonaws.com/audio_test_1.mp3',
      transcript: "OMG SAUR SLAY",
      analysis: {
        "Danger likeliness": "Very unlikely",
        "Danger level": "Low",
        "Key words": "None",
        "Person type": "None",
        "Abuse type": "None"
      },
      emotions: []
    }
  ]
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <Text color={Colors.light.black} fontSize={'$heading1'} fontWeight={'$bold'}>Order History</Text>
      </ThemedView>
      <ScrollView>
        <YStack>
          {audioInfo.map((info) => {
            return <AccordionItem
              date={info.date}
              time={info.time}
              audioSource={info.audio}
              transcript={info.transcript}
              analysis={info.analysis}
              emotions={info.emotions}
            />
          })}
        </YStack>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
    backgroundColor: 'transparent',
    paddingTop: 50,
    padding: 20,
  },
});
