import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View } from 'react-native';
import AccordionItem from './../../components/OrderContent'; 
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { Text, ScrollView, YStack } from 'tamagui';
import { useEffect, useState } from 'react';
import Logo from "../../assets/images/Logo";
import { useSession } from '../context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

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
  const SERVER_ADDRESS = "192.168.0.32"
  const [audioInfo, setAudioInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const userEmail = session?.email;

  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const response = await fetch(`http://${SERVER_ADDRESS}:5000/audio/user/${userEmail}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(Object.keys(data))
        setAudioInfo(data);
      } catch (error) {
        console.error('Error fetching audio data:', error);
      } finally {
        setLoading(false);
      }
      const data = await response.json();
      setAudioInfo(data);
    } catch (error) {
      console.error('Error fetching audio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAudioData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Logo height={80}></Logo>
        <Text color={Colors.light.white}>Loading...</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

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
              date={formatDate(info.date.split(' ')[0])}
              time={info.date.split(' ')[1]}
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
