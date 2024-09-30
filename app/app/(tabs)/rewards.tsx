import { StyleSheet, Image, View, Dimensions, FlatList, Animated, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { Text } from 'tamagui';
import { Colors } from '@/constants/Colors';
import ButtonA from '@/components/ButtonA';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '../context';

const SERVER_ADDRESS = "10.36.247.235";

const data = [
    { id: '1', source: require('../../assets/images/card-1.png') },
    { id: '2', source: require('../../assets/images/card-2.png') },
];

const { width } = Dimensions.get('window');

export default function TabTwoScreen() {
    const { session } = useSession();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== undefined) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            uploadImage(imageUri);
        }
    };

    const uploadImage = async (uri) => {
        const random_name = generateRandomString(10);
        
        const formData = new FormData();
        formData.append('file', {
            uri,
            name: `${random_name}.HEIC`,
            type: 'image/heic',
        });
        
        if (session?.email) {
            formData.append('email', session?.email);
        }

        if (session?.password) {
            formData.append('password', session?.password);
        }

        const today = new Date();
        formData.append('date', today.toISOString())

        try {
            const response = await fetch(`http://${SERVER_ADDRESS}:5000/uploadPhoto`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Upload response:', data);
            Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        }
    };

    return (
        <View style={styles.container}>
            <Text fontSize={"$heading1"} color={Colors.light.black} fontWeight={"$bold"} padding={20}>
                Rewards
            </Text>
            <View style={{ flex: 1.5 }}>
                <FlatList
                    data={data}
                    renderItem={({ item, index }) => (
                        <View style={[styles.cardContainer, {
                            paddingLeft: index === 0 ? 60 : 15,
                            paddingRight: index === 0 ? 15 : 60,
                        }]}>
                            <Image source={item.source} style={styles.image} />
                            {index === 1 && ( 
                                <View style={styles.buttonContainer}>
                                    <ButtonA 
                                        buttonType='fill' 
                                        width={250}
                                        textColor={Colors.light.peach}
                                        onPress={pickImage}
                                    >
                                        UPLOAD
                                    </ButtonA>
                                    <View style={styles.buttonMargin}>
                                        <ButtonA 
                                            buttonType='outline' 
                                            width={250} 
                                            backgroundColor={Colors.light.peach}
                                            onPress={() => alert("bi")}
                                        >
                                            VIEW GALLERY
                                        </ButtonA>
                                    </View>
                                </View>
                            )}
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
            <View style={styles.pagination}>
                {data.map((_, i) => (
                    <View 
                        style={[
                            styles.dot, 
                            { backgroundColor: i === currentIndex ? Colors.light.red : Colors.light.grey3 } 
                        ]} 
                        key={i.toString()} 
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.white,
    },
    cardContainer: {
        width: 370,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        position: 'relative',
    },
    image: {
        width: 300,
        height: 450,
        resizeMode: 'cover',
    },
    flatListContent: {
        paddingHorizontal: 0,
    },
    pagination: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        padding: 20,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '9%',
        alignSelf: 'center', // Center the button container horizontally
        alignItems: 'center',
        left: '12%',
        //left: '50%',
        //transform: [{ translateX: -150 }],
        //alignItems: 'center',
    },
    buttonMargin: {
        marginTop: 15,
    },
});
function generateRandomString(arg0: number) {
    throw new Error('Function not implemented.');
}

