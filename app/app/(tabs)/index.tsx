import { StyleSheet, Image, View, FlatList, Animated, TouchableOpacity} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState, useRef } from 'react';
import { useSession } from '../context';
import { router } from 'expo-router';

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


export default function LoadScreen() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isPizzaClicked, setIsPizzaClicked] = useState(false); // State to track pizza image clicks
  const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

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

  useEffect(() => {
    console.log(session)
  }, [session])

  const handlePizzaClick = () => {
    setIsPizzaClicked(!isPizzaClicked); // Toggle between active and default pizza data
  };

  const displayedPizzaData = isPizzaClicked ? activePizzaData : pizzaData; // Conditionally display pizza data

  return (
    <>
      {!loading ? (
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
                  <TouchableOpacity key={pizza.id} onPress={handlePizzaClick}>
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

