import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av'; // If using Expo
import Slider from '@react-native-community/slider';
import { Sheet, XStack, YStack, Text as TText, Button } from 'tamagui';
import { FileText, Play, Pause, ArrowUpRightFromSquare, LineChart} from '@tamagui/lucide-icons';
import { Colors } from '@/constants/Colors';

interface Analysis {
    "Danger likeliness": string;
    "Danger level": string;
    "Key words": string;
    "Person type": string;
    "Abuse type": string;
  }

// Define the component's props types
interface AccordionItemProps {
  date: string;
  time: string;
  s3_url: string; // Adjust based on your audio source
  transcript: string;
  analysis: Analysis;
  emotions: Array<string>;
  signifierColor?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ date, time, s3_url, transcript, analysis, emotions, signifierColor = Colors.light.grey3 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<Audio.AVPlaybackStatus | null>(null);
  const highlightedEmotions = ["Anger", "Distress", "Fear", "Horror", "Pain", "Anxiety"];

  const toggleAccordion = () => setIsOpen(!isOpen);
  const toggleTranscript = () => setIsTranscriptOpen(!isTranscriptOpen);
  const toggleAnalysis = () => setIsAnalysisOpen(!isAnalysisOpen);

  // Cleanup the sound on component unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlayPause = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: s3_url }, // Directly use the URL for playback
        {},
        onPlaybackStatusUpdate
      );
      // const { sound: newSound } = await Audio.Sound.createAsync(s3_url, {}, onPlaybackStatusUpdate);
      setSound(newSound);
      await newSound.playAsync();
    } else {
      if (playbackStatus?.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // Playback status updates
  const onPlaybackStatusUpdate = (status: Audio.AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPlaybackStatus(status);
    }
  };

  // Seek the audio to a specific time
  const seekAudio = async (value: number) => {
    if (sound && playbackStatus?.isLoaded) {
      const newPosition = value * playbackStatus.durationMillis!;
      await sound.setPositionAsync(newPosition);
    }
  };

  const exportAudio = () => {
    // Implement export logic here
    alert('Exporting audio...');
  };

  // Convert milliseconds to minutes and seconds
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <YStack borderWidth={1} borderColor="#ccc" padding="$4" borderRadius="$4">
      {/* Unopened State */}
      <TouchableOpacity onPress={toggleAccordion}>
        <XStack space="$2" alignItems="center">
          {/* Fixed Image */}
          <Image source={require('./../assets/images/pizza.png')} style={{ width: 50, height: 50 }} />
          <YStack>
            <TText color={Colors.light.black} fontSize={'$main'} fontWeight={'$bold'}>{date}</TText>
            <TText color={Colors.light.grey3} fontSize={'$normal'} fontWeight={'$normal'}>{time}</TText>
          </YStack>
          <TText color={signifierColor} marginLeft={75} fontSize={'$heading1'}>
            {isOpen ? '⌃' : '⌄'}
          </TText>
        </XStack>
      </TouchableOpacity>

      {/* Opened State */}
      {isOpen && (
        <YStack space="$4" marginTop="$4">
          {/* Audio Slider */}
          {isOpen && (
            <>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={
                  playbackStatus?.positionMillis
                    ? playbackStatus?.positionMillis / playbackStatus?.durationMillis!
                    : 0
                }
                onSlidingComplete={seekAudio}
              />
              {/* Display the current time and duration */}
              <XStack justifyContent="space-between">
                <Text>{formatTime(playbackStatus?.positionMillis || 0)}</Text>
                <Text>{formatTime((playbackStatus?.durationMillis) || 0)}</Text>
              </XStack>
            </>
          )}

          {/* Export and View Transcript Buttons */}
          <XStack justifyContent="space-between" marginTop="$2">
            <Button 
              backgroundColor={'transparent'} 
              color={Colors.light.red}
              icon={FileText} onPress={toggleTranscript}
            />
            <Button 
              backgroundColor={'transparent'} 
              color={Colors.light.red}
              icon={LineChart} onPress={toggleAnalysis}
            />
            <Button
              backgroundColor={'transparent'} 
              color={Colors.light.red} 
              icon={playbackStatus?.isPlaying ? Pause : Play}
              onPress={togglePlayPause}
            />
            <Button 
              backgroundColor={'transparent'} 
              color={Colors.light.red}  
              icon={ArrowUpRightFromSquare} 
              onPress={exportAudio} 
            />
          </XStack>

          {/* Transcript Accordion */}
          {isTranscriptOpen && (
            <View style={{ padding: 8, borderTopWidth: 1}}>
              <Text style={{ paddingBottom: 8, fontWeight:'bold'}}>Transcipt</Text>
              <Text>{transcript}</Text>
            </View>
          )}

        {isAnalysisOpen && (
            <View style={{ padding: 8, borderTopWidth: 1}}>
                <Text><Text style={{ fontWeight:'bold'}}>Danger likeliness: </Text> {analysis['Danger likeliness']}</Text>
                <Text><Text style={{ fontWeight:'bold'}}>Danger level: </Text> {analysis['Danger level']}</Text>
                <Text><Text style={{ fontWeight:'bold'}}>Key words: </Text> {analysis['Key words']}</Text>
                <Text><Text style={{ fontWeight:'bold'}}>Person type: </Text> {analysis['Person type']}</Text>
                <Text><Text style={{ fontWeight:'bold'}}>Abuse type: </Text> {analysis['Abuse type']}</Text>
                {emotions.length != 0 && <Text>
                    <Text style={{ fontWeight:'bold'}}>Emotions:</Text>{" "}
                    {emotions.map((emotion, index) => {
                        return (
                        <>
                            <Text style={{ color: highlightedEmotions.includes(emotion) ? Colors.light.red : 'normal' }}>
                            {emotion}
                            </Text>
                            <Text>{index < emotions.length - 1 && ", "} </Text>
                        </>
                        );
                    })}
                </Text>}
            </View>
          )}
        </YStack>
      )}
    </YStack>
  );
};

export default AccordionItem;
