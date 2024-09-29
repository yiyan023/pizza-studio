import {useState} from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { Text, XStack, YStack, Button} from "tamagui";
import { Edit3, Plus } from '@tamagui/lucide-icons'
import Profile from "./../../assets/images/Profile"
import Comrade from "./../../assets/images/Comrade"
import ButtonA from '@/components/ButtonA';

export default function Screen() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInputFields, setShowInputFields] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [savedInfo, setSavedInfo] = useState({ name: '', phoneNumber: '' });

  const name = "John Doe";
  const email = "joedohn@gmail.com";

  const toggleAccordion = () => setIsOpen(!isOpen);
  const toggleInputFields = () => setShowInputFields(!showInputFields);

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  const handleSave = () => {
    setSavedInfo({ name: nameInput, phoneNumber: formatPhoneNumber(phoneNumberInput) });
    setShowInputFields(false); // Hide input fields after saving
  };

  return (
    <>
      <View style={styles.profileContainer}>
        <Profile></Profile>
        <Text color={Colors.light.black} fontSize={'$heading1'} fontWeight={'$bold'}>{name}</Text>
        <Text color={Colors.light.grey4} fontSize={'$heading2'} fontWeight={'$normal'}>{email}</Text>
        <YStack borderWidth={1} borderColor="#ccc" padding="$4" paddingTop="$1.5" borderRadius="$4" marginTop={20}>
        {/* Unopened State */}
        <TouchableOpacity onPress={toggleAccordion}>
          <XStack space="$2" alignItems="center" width={300} paddingTop={20}>
            {/* Fixed Image */}
            <Comrade></Comrade>
            <Text color={Colors.light.black} fontSize={'$main'} fontWeight={'$bold'}>Cheese Comrade</Text>
            <Text color={Colors.light.grey4} marginLeft={75} fontSize={'$heading1'}>
              {isOpen ? '⌃' : '⌄'}
            </Text>
          </XStack>
        </TouchableOpacity>

        {/* Opened State */}
        {isOpen && (
          <XStack space="$2" marginTop="$4" height={75} width={300}>
            {!showInputFields ? (
              <>
                {savedInfo.name && savedInfo.phoneNumber ? (
                  <XStack>
                    <YStack>
                      <Text color={Colors.light.black} fontSize={'$main'} fontWeight={'$bold'}>{savedInfo.name}</Text>
                      <Text color={Colors.light.grey3}>{savedInfo.phoneNumber}</Text>
                    </YStack>
                    <Button icon={Edit3} backgroundColor={'transparent'} color={Colors.light.grey3} onPress={toggleInputFields} style={{ marginLeft: 'auto' }}/>
                  </XStack>
                ) : (
                  <>
                    <Text color={Colors.light.grey3}>Add friends to share your favourite pizza order!</Text>
                    <Button icon={Plus} backgroundColor={'transparent'} color={Colors.light.grey4} onPress={toggleInputFields} style={{ marginLeft: 'auto' }}/>
                  </>
                )}
              </>
            ) : (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={Colors.light.grey3}
                  value={nameInput}
                  onChangeText={setNameInput}  // Update state as user types
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.light.grey3}
                  keyboardType="phone-pad"
                  value={phoneNumberInput}
                  onChangeText={setPhoneNumberInput}  // Update state as user types
                />
                <ButtonA buttonType="text" width={5} textColor={Colors.light.grey3} onPress={handleSave}>
                  Save
                </ButtonA>
              </View>
            )}
          </XStack>
        )}
      </YStack>
      </View>

      <View style={styles.horizontalLine} />

      <ThemedView style={styles.titleContainer}>
        <Text color={Colors.light.black} fontSize={'$heading1'} fontWeight={'$bold'}>Contact Us!</Text>
        <Text color={Colors.light.black} fontSize={'$main'} fontWeight={'$bold'}>Assaulted Women's Helpline: <Text color={Colors.light.green} fontSize={'$main'}>111-222-3333</Text></Text>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',  // Centers items horizontally
    marginTop: 50,  // Add margin to space it from the top
    marginBottom: 20,
  },
  titleContainer: {
    gap: 8,
    backgroundColor: 'transparent',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  input: {
    height: 40,
    width: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    color: Colors.light.black,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ccc', // You can change the color as needed
    width: '100%', // Full width
    marginVertical: 20, // Space above and below the line
  },
});
