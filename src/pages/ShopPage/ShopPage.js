import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import ShopItem from './ShopItem';
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose your icon library


const { width } = Dimensions.get('window');
const shopItemData =
  [

  ];
const ShopPage = () => {
  if (shopItemData.length < 1) {
    return (
      <View style={styles.info}>
        <Icon name={"rocket"} size={100} color="white" style={styles.icon} />
        <Text style={styles.text}>There is no challenges right now</Text>
      </View>);
  }
  return (
    <ScrollView style={styles.container}>
      {shopItemData.map((item, index) => {
        // Check if item is at an even position to create a new row
        if (index % 2 === 0) {
          const nextItem = shopItemData[index + 1];
          return (
            <View key={index} style={styles.row}>
              <ShopItem imageUrl={item.imageUrl} title={item.title} link={item.link} />
              {nextItem && (
                <ShopItem imageUrl={nextItem.imageUrl} title={nextItem.title} link={nextItem.link} />
              )}
            </View>
          );
        }
        return null; // Skip odd indexed items as they are already rendered
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(10, 10, 10)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
  },
  text: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  image: {
    width: 200, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    marginBottom: 20,
  },
  // ... other styles ...
});

export default ShopPage;
