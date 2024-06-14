import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionDescription}>{children}</Text>
        </View>
    );
};
