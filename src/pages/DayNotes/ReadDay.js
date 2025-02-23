import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DoneTaskHabits, ThoughtList } from '../../components/TasksHabits';
import { DoneTask } from '../../components/TasksHabits';
import { getThought, readDay, deleteThought } from '../../storage/storage';
import { getDoneTasks } from '../../storage/storage';
import { useFocusEffect } from '@react-navigation/native';


const ReadDay = (props) => {
  const [doneTasks, setDoneTasks] = useState([]);
  const [thought, setThought] = useState([])
  const fetchAndReloadTasks = async () => {
    try {
      const tasksData = await getDoneTasks();
      const thoughtData = await getThought();

      setDoneTasks(tasksData);
      setThought(thoughtData)
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchAndReloadTasks();
    }, [])
  );
  const date = props.date
  const [day, setDay] = useState('')
  useEffect(() => {
    const fetchPlan = async () => {
      const da = await readDay(date);
      setDay(da || ''); // Set the state with the plan or an empty string if not found
    };

    fetchPlan();
  }, [date]);
  const plan = day.plan != '' ? day.plan : "No plan for this date";
  const note = day ? day.note : "No note for this date";
  const rate = day.rate != '' ? day.rate : "No rate for this date";
  const interpolateColor = (number) => {
    let r = 255, g = 0, b = 0; // Default to red
    if (number == null)
      return 'white';
    if (number <= 5) {
      // Scale from red to rgb(255, 235, 59)'
      g = Math.round(255 * (number - 1) / 4);
    } else {
      // Scale from rgb(255, 235, 59)' to green
      r = Math.round(255 * (10 - number) / 5);
      g = 255;
    }

    return `rgb(${r}, ${g}, ${b})`;
  };
  const onThoughtDelete = async (text, date) => {
    await deleteThought(text, date);
    fetchAndReloadTasks();
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.planLabel}>Plan for {date}</Text>
      <Text style={styles.text}>{plan}</Text>

      <Text style={styles.planLabel}>Note for {date}</Text>
      <Text style={styles.containerText}>{note}</Text>
      <Text style={styles.planLabel}>Rate:</Text>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ textAlign: 'center', color: day ? interpolateColor(rate) : 'white', fontSize: 40, paddingBottom: 10 }}>{rate}</Text>
      </View>
      <Text style={styles.planLabel}>Done for {date}</Text>
      <ScrollView style={styles.componentPlaceholder}>
        <DoneTaskHabits tab={doneTasks} Com={DoneTask} date={date} />
      </ScrollView>
      <Text style={styles.planLabel}>Thoughts for {date}</Text>
      <ScrollView style={styles.componentPlaceholder}>
        <ThoughtList thoughts={thought} date={date} onDelete={async (d, a) => onThoughtDelete(d, a)}/>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(10, 10, 10)',
    padding: 40,
    paddingBottom: 50
  },
  planLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 10,
  },
  componentPlaceholder: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
    padding: 5,
  },
  text: {
    borderWidth: 1,
    borderColor: 'green',
    padding: 10,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top', // Align text at the top
    width: '100%',
    marginBottom: 20,
    borderRadius: 20,
  },
  containerText: {
    borderWidth: 1,
    borderColor: 'rgb(255, 235, 59)',
    padding: 10,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top', // Align text at the top
    width: '100%',
    marginBottom: 20,
    borderRadius: 20,

  },
});


export default ReadDay;
