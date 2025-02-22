import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose your icon library
import { ThoughtList } from '../../components/TasksHabits';
import { createThought, deleteThought, getThought, getStoredData, setUserStreak, saveWriteDay, getHabits, setStreak } from '../../storage/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';


const AddThoughtComponent = ({ onAddThought }) => {
  const [thought, setThought] = useState('');
  return (
    <View style={styles.containerAdd}>
      <TextInput
        style={styles.textInputAdd}
        placeholder="Add Thought"
        value={thought}
        onChangeText={setThought}
        placeholderTextColor="#a0a0a0"
      />
      <TouchableOpacity style={styles.addButtonAdd} onPress={() => { onAddThought(thought); setThought('') }}>
        <Icon name='plus' color={'rgb(255, 235, 59)'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const StartingPage = () => {
  const [streak, setStreak] = useState(7); // Replace 0 with your starting value for n
  const navigation = useNavigation()

  const [thought, setThought] = useState([]);

  const isTodayOrYesterday = (timestamp) => {
    const storedDate = new Date(timestamp).toDateString();
    const currentDate = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return storedDate === currentDate || storedDate === yesterday.toDateString();
  };

  const ZeroStreak = async () => {
    const data = await getStoredData()
    const storedTimestamp = data.lastDate;

    if (!isTodayOrYesterday(storedTimestamp)) {
      // User missed a day, reset streak to 0
      setStreak(0);
      console.log("Zero")
      setUserStreak(0)
    } 
    else{
      console.log("Hura")
    }
    console.log(data.streak)
    setStreak(data.streak)
  } 

  const fetchAndReloadTasks = async () => {
    try {
      const t = await getThought()
      await ZeroStreak()
      setThought(t || '')
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchAndReloadTasks();
    }, [])
  );
  const AddThought = async (thought) => {
    await createThought(thought, new Date())
    fetchAndReloadTasks()
  }
  const onThoughtDelete = async (text, date) => {
    await deleteThought(text, date);
    fetchAndReloadTasks();
  }
  const handleWrite = async (note, rate, streak, date) => {
    try {
      await saveWriteDay(note, rate, streak, date);
      // Fetch and update dates immediately after saving the plan
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };
  const handleClick = () => {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);

    console.log(currentDate)
    const formattedDate = currentDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    console.log("Hi its nice: " + formattedDate)
    navigation.navigate('DayPage', { date: formattedDate, onSave: handleWrite });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journaling streak:</Text>
      {streak > 6 ? (
        <ImageBackground
          source={require('../../../assets/fire.png')}
          style={styles.backgroundImage}
          resizeMode="cover" // or "contain" based on your need
        >
          <Text style={styles.overlayText}>{streak}</Text>
        </ImageBackground>
      ) : (
        <Text style={styles.overlayText}>{streak}</Text>
      )}
      <Text style={styles.title}>days</Text>
      <AddThoughtComponent onAddThought={async (t) => { await AddThought(t) }} />
      <Text style={styles.planLabel}>Todays thoughts</Text>
      <ScrollView style={styles.componentPlaceholder}>
        <ThoughtList thoughts={thought} date={Date()} onDelete={async (d, a) => onThoughtDelete(d, a)} />
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleClick}>
        <Text style={{ fontWeight: 'bold' }}>Write today's note</Text>
      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(10, 10, 10)',
    paddingTop: 50
    // Other styling for the container
  },
  backgroundImage: {
    width: 100,  // You might want to adjust this
    height: 150, // You might want to adjust this
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white', // Choose a color that contrasts with the background image
    // Other styling for the title
  },
  overlayText: {
    fontSize: 110,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgb(255, 235, 59)',
    padding: 10,
    marginBottom: 20,
    borderRadius: 20,
    marginTop: 50,
    margin: 20
  },
  textInputAdd: {
    flex: 1,
    color: 'white',
    paddingLeft: 10,
    paddingRight: 44, // to ensure the text doesn't go behind the icon
  },
  addButton: {
    backgroundColor: 'rgb(255, 235, 59)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10, // Adjust the margin as needed
  },
  planLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  componentPlaceholder: {
    width: '90%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
    margin: 20
  },
  saveButton: {
    backgroundColor: 'rgb(255, 235, 59)',
    padding: 15,
    width: '90%',
    alignItems: 'center',
    borderRadius: 20,
    fontWeight: 'bold',
    margin: 10
  },
});


export default StartingPage;