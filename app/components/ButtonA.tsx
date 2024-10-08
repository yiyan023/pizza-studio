import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from "tamagui";
import { Colors } from '@/constants/Colors'; // Assuming you still want to use your color constants

type ButtonType = "outline" | "fill" | "text";

const backgroundColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.white,
    fill: Colors.light.red,
    text: 'transparent'
};

const hoverBackgroundColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.grey2,
    fill: Colors.light.darkRed,
    text: 'transparent'
};

const textColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.red,
    fill: Colors.light.white,
    text: Colors.light.red
};

const hoverTextColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.darkRed,
    fill: Colors.light.grey2,
    text: Colors.light.darkRed,
};

const borderMapping: Record<ButtonType, number> = {
    outline: 3,
    fill: 0,
    text: 0
};

interface ButtonAProps {
    buttonType: ButtonType;
    children: React.ReactNode;
    textColor?: string;
    width?: number; // Optional width prop
    backgroundColor?: string; // Added backgroundColor prop
    onPress?: () => void; 
}

const ButtonA: React.FC<ButtonAProps> = ({ 
    buttonType, 
    children, 
    textColor, 
    width = 350, // Default width
    backgroundColor: customBackgroundColor, // Custom background color prop
    onPress, 
    ...props 
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const backgroundColor = customBackgroundColor || (isHovered 
        ? hoverBackgroundColorMapping[buttonType] 
        : backgroundColorMapping[buttonType]);

    const defaultTextColor = isHovered 
        ? hoverTextColorMapping[buttonType] 
        : textColorMapping[buttonType];

    const borderWidth = borderMapping[buttonType];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderWidth,
                    borderColor: buttonType === 'outline' ? Colors.light.red : 'transparent', 
                    width
                },
            ]}
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
            onPress={onPress}
            {...props}
        >
            <Text color={textColor || defaultTextColor} fontWeight={'$bold'}>{children}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center', // Center text
        justifyContent: 'center', // Center text
    },
});

export default ButtonA;