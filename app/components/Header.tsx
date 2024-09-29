import React from 'react';
import { Text, YStack } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import LogoFull from "../assets/images/LogoFull";


interface HeaderProps {
    address: string;
  }

// Header component
const Header: React.FC<HeaderProps> = ({ address }) => {
  const colorScheme = useColorScheme();
  return (
    <YStack alignItems="center" paddingTop="$10" paddingBottom="$2" backgroundColor= {Colors[colorScheme ?? 'light'].red}>
      <LogoFull height={40}/>
      <Text fontSize={'$normal'} color={Colors.light.white} fontWeight={'$bold'}>
        {address}
      </Text>
    </YStack>
  );
};

export default Header;