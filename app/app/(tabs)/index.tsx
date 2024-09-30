import { StyleSheet, Image, View, FlatList, Animated, TouchableOpacity} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState, useRef } from 'react';
import { useSession } from '../context';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import {Text, YStack, ScrollView} from "tamagui";
import { Colors } from '@/constants/Colors';
import Logo from "../../assets/images/Logo";

const promoData = [
  { id: '1', source: require('../../assets/images/promo1.png') },
  { id: '2', source: require('../../assets/images/promo2.png') },
  { id: '3', source: require('../../assets/images/promo3.png') },
];

const pizzaData = [
  { id: '1', source: require('../../assets/images/pizza1.png') },
  { id: '2', source: require('../../assets/images/pizza2.png') },
  { id: '3', source: require('../../assets/images/pizza3.png') },
  { id: '4', source: require('../../assets/images/pizza4.png') },
  { id: '5', source: require('../../assets/images/pizza5.png') },
  { id: '6', source: require('../../assets/images/pizza6.png') },
];

const activePizzaData = [
  { id: '7', source: require('../../assets/images/pizza7.png') },
  { id: '8', source: require('../../assets/images/pizza8.png') },
  { id: '9', source: require('../../assets/images/pizza9.png') },
  { id: '10', source: require('../../assets/images/pizza10.png') },
  { id: '11', source: require('../../assets/images/pizza11.png') },
  { id: '12', source: require('../../assets/images/pizza12.png') },
];

const SERVER_ADDRESS = "10.36.247.235"
export default function LoadScreen() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isPizzaClicked, setIsPizzaClicked] = useState(false); // State to track pizza image clicks
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const mediaRef = useRef<Audio.Recording | null>(null); // Use a ref for media

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== undefined) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!session) {
        router.navigate('/signin');
      }
    }, 2000);

    if (session) {
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [session]);  

  const handlePizzaClickStart = async () => {
    setIsPizzaClicked(!isPizzaClicked); // Toggle between active and default pizza data

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
      console.log("recording");
    } else {
      console.error("Microphone permission not granted.");
      setIsRecording(false);
      return null;
    }
  };

  const handlePizzaClickEnd = async () => {
    setIsPizzaClicked(!isPizzaClicked); // Toggle between active and default pizza data
    setIsRecording(false);

    if (mediaRef.current) {
      await mediaRef.current.stopAndUnloadAsync().then(async () => {
        if (mediaRef.current) {
          const uri = mediaRef.current.getURI();
          const sound = new Audio.Sound();
          console.log("recording stopped")
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
  };

  const compressAndSendAudio = async (uri: string) => {
    try {
      console.log(`File URI: ${uri}`);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log(`File size: ${fileInfo.size} bytes`);
      
      // Read the file content
      const random_name = generateRandomString(10);
      const today = new Date();

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `${random_name}.wav`,
        type: 'audio/wav',
      } as any);

      if (session?.email) {
        formData.append('email', session?.email);
      }
      
      if (session?.password) {
        formData.append('password', session?.password);
      }

      if (today) {
        formData.append('date', today.toISOString())
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

  const generateRandomString = (length: number): string => {
    return [...Array(length)]
      .map(() => Math.random().toString(36)[2])
      .join('');
  };

  const displayedPizzaData = isPizzaClicked ? activePizzaData : pizzaData; // Conditionally display pizza data

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Logo height={80}></Logo>
          <Text color={Colors.light.white}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.container }>
            <View style={{ flex: 1, height:200 }}>
              <FlatList
                data={promoData}
                renderItem={({ item, index }) => (
                    <View style={[styles.cardContainer, {
                        paddingLeft: index === 0 ? 60 : (index === 1 ? 37.5: 15),
                        paddingRight: index === 0 ? 25 : (index === 1 ? 37.5: 60),
                    }]}>
                        <Image source={item.source} style={styles.image} />
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
                initialScrollIndex={0}
                getItemLayout={(data, index) => ({ length: 390, offset: 390 * index, index })}
                initialNumToRender={1}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
            <ThemedView style={styles.titleContainer}>
              <Text color={Colors.light.black} fontSize={'$heading1'} fontWeight={'$bold'}>Signature Pizzas</Text>
            </ThemedView>
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.pizzaContainer}>
                {displayedPizzaData.map((pizza) => (
                  <TouchableOpacity key={pizza.id} onPress={isPizzaClicked ? handlePizzaClickEnd : handlePizzaClickStart}>
                    <Image source={pizza.source} style={styles.pizzaImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
        </View>
      )}
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  titleContainer: {
    gap: 8,
    backgroundColor: 'transparent',
    paddingTop: 35,
    padding: 20,
  },
  cardContainer: {
    paddingTop: 35,
    width: 370,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    position: 'relative',
  },
  image: {
    width: 320,
    height: 250,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  pizzaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  pizzaImage: {
    width: 350,
    height: 100,
    margin: 10,
    resizeMode: 'cover',
    borderRadius: 7,
  },
});

