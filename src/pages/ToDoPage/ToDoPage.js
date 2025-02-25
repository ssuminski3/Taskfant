import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose your icon library
import { Task, DoneTask, Habit } from '../../components/TasksHabits';
import { getTasks, getDoneTasks, getHabits } from '../../storage/storage';


const DropList = ({ on, tab, txt, Com, type = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleList = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (time) => {
    const d = new Date(time);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleList}>
        <Text style={styles.header}>{txt}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View>
          {tab.map((item, index) => {
            if (type) {
              return (
                <Com
                  key={index}
                  last={item.lastDate}
                  days={item.days}
                  text={item.text}
                  date={formatTime(item.time)}  // Proper use here!
                  streak={item.streak}
                  done={item.done}
                  on={on}
                />
              );
            }
            return (
              <Com
                key={index}
                text={item.text}
                date={item.date}
                on={on}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const FloatingButton = ({ onPress }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate('CreateToDoPage', { onGoBack: () => { onPress() } })}
    >
      <Icon name='plus' color={'rgb(10, 10, 10)'} size={20} />
    </TouchableOpacity>
  );
};

const ToDoPage = () => {
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]); // Your initial doneTasks array
  const [habits, setHabits] = useState([]); // Your initial habits array

  const fetchAndReloadTasks = async () => {
    try {
      const tasksData = await getTasks();
      const doneTaskData = await getDoneTasks();
      const habitData = await getHabits();
      setTasks(tasksData);
      setDoneTasks(doneTaskData)
      setHabits(habitData)
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchAndReloadTasks();
    }, [])
  );


  // Rest of your component code
  return (
    <View style={styles.con}>
      <ScrollView style={{ backgroundColor: 'rgb(10, 10, 10)' }}>
        <DropList
          on={fetchAndReloadTasks}
          tab={tasks}
          txt="Resolutions"
          Com={(props) => <Task {...props} />}
        />
        <DropList
          on={fetchAndReloadTasks}
          tab={habits}
          txt="Habits"
          type={true}
          Com={(props) => <Habit {...props} />}
        />
        <DropList
          on={fetchAndReloadTasks}
          tab={doneTasks}
          txt="Done"
          Com={(props) => <DoneTask {...props} />}
        />
      </ScrollView>
      <FloatingButton onPress={fetchAndReloadTasks} />
    </View>
  );
};


// Styles
const styles = StyleSheet.create({
  con: {
    backgroundColor: 'rgb(10, 10, 10)',
    flex: 1,
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    color: 'white',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 235, 59)',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  date: {
    color: '#999',
  },
  deleteButton: {
    justifyContent: 'right',
    alignItems: 'right',
    padding: 10,
  },
  textAndDateContainer: {
    alignItems: 'left',
    justifyContent: 'flex-start',
    flex: 1,
    marginLeft: 10,
    // ... other styles for the text and date container
  },
  streak: {
    color: 'white',
    textAlign: 'center'
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgb(255, 235, 59)', // Example color
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'rgb(10, 10, 10)',
    fontSize: 24,
  }
});

export default ToDoPage;