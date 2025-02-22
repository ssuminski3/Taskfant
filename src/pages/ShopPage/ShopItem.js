import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';

// Get the device's screen width
const { width } = Dimensions.get('window');

const ShopItem = ({ imageUrl, title, link }) => (
    <View style={styles.itemContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.button} onPress={() => openLink(link)}>
            <Text style={styles.buttonText}>Take the challenge</Text>
        </TouchableOpacity>
    </View>
);


// Function to handle link opening
const openLink = (link) => {
    Linking.canOpenURL(link)
        .then((supported) => {
            if (!supported) {
            } else {
                return Linking.openURL(link);
            }
        })
        .catch((err) => console.error('An error occurred', err));
};


const styles = StyleSheet.create({
    itemContainer: {
        width: width / 2 - 10, // Half of screen width minus some margin
        padding: 10,
        borderColor: 'rgb(255, 235, 59)',
        borderWidth: 1,
        borderRadius: 5,
        margin: 5,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 150, // Set a fixed height or make it responsive
        resizeMode: 'cover',
        borderRadius: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        color: 'white'
    },
    button: {
        backgroundColor: 'rgb(255, 235, 59)',
        padding: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: 'rgb(10, 10, 10)',
        fontSize: 14,
        fontWeight: 'bold',

    },
});

export default ShopItem;
