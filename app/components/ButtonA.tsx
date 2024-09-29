import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {Text} from "tamagui";
import { Colors } from '@/constants/Colors'; // Assuming you still want to use your color constants

type ButtonType = "outline" | "fill";

const backgroundColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.white,
    fill: Colors.light.red,
};

const hoverBackgroundColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.grey2,
    fill: Colors.light.darkRed,
};

const textColorMapping: Record<ButtonType, string> = {
    outline: Colors.light.red,
    fill: Colors.light.white,
};

const borderMapping: Record<ButtonType, number> = {
    outline: 3,
    fill: 0,
};

interface ButtonAProps {
    buttonType: ButtonType;
    children: React.ReactNode;
}

const ButtonA: React.FC<ButtonAProps> = ({ buttonType, children, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);

    const backgroundColor = isHovered 
        ? hoverBackgroundColorMapping[buttonType] 
        : backgroundColorMapping[buttonType];

    const textColor = textColorMapping[buttonType];
    const borderWidth = borderMapping[buttonType];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderWidth,
                    borderColor: buttonType === 'outline' ? Colors.light.red : 'transparent', 
                },
            ]}
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
            {...props}
        >
            <Text color={textColor} fontWeight={'$bold'}>{children}</Text>
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
        width: 350
    },
});

export default ButtonA;
