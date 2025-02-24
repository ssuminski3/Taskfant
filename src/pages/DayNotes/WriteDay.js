import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { DoneTaskHabits, DoneTask, Task, Habit, TaskHabitsList } from '../../components/TasksHabits';
import { readDay, getDoneTasks, getTasks, getHabits, setUserStreak } from '../../storage/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const NumberSelector = ({ rate, setRate }) => {
  const [selectedNumber, setSelectedNumber] = useState(rate ?? null);

  useEffect(() => {
    setSelectedNumber(rate);
  }, [rate]);

  const interpolateColor = (number) => {
    let r = 255, g = 0, b = 0; // Default to red
    if (number == null) return 'white';
    if (number <= 5) {
      // Scale from red to yellow (approx: rgb(255, 235, 59))
      g = Math.round(255 * (number - 1) / 4);
      b = Math.round(59 * (number - 1) / 4);
    } else {
      // Scale from yellow to green
      r = Math.round(255 * (10 - number) / 5);
      g = 255;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleNumberPress = (number) => {
    setSelectedNumber(number);
    setRate(number);
  };

  return (
    <View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: interpolateColor(selectedNumber), fontSize: 40 }}>
          {selectedNumber == null ? "Rate your day" : selectedNumber}
        </Text>
      </View>
      <View style={styles.raitingContener}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
          <TouchableOpacity key={number} onPress={() => handleNumberPress(number)}>
            <Text style={{ color: interpolateColor(number), fontSize: 18 }}>
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const WriteDay = ({ date, onSave }) => {
  const [note, setNote] = useState('');
  const [rat, setRat] = useState(null);
  const [day, setDay] = useState({});
  const [doneTasks, setDoneTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const navigation = useNavigation();
  const hasInitializedNote = useRef(false);

  const fetchPlan = async () => {
    const da = await readDay(date);
    const don = await getDoneTasks();
    const ta = await getTasks();
    const ha = await getHabits();

    setRat(da.rate ?? null);
    setNote(prev => hasInitializedNote.current ? prev : (da.note ?? ''));
    if (da.note) hasInitializedNote.current = true;

    setDoneTasks(don);
    setDay(da);
    setTasks(ta);
    setHabits(ha);
  };

  useEffect(() => {
    fetchPlan();
  }, [date]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPlan();
    }, [date])
  );

  const planText = day.plan || "No plan for this date";

  const handleSave = async () => {
    try {
      if (onSave) {
        // pass rat (which may be null) back to parent
        onSave(note, rat, 3, date);
        // update streak only once per day when a note exists
        if (!hasInitializedNote.current && note.trim() !== '' &&
            new Date(date).toDateString() === new Date().toDateString()) {
          setUserStreak(1);
        }
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.planLabel}>Plan for {date}</Text>
        <Text style={styles.text}>{planText}</Text>

        <Text style={styles.planLabel}>Note for {date}</Text>
        <TextInput
          style={styles.containerText}
          placeholder="Add Note"
          value={note}
          multiline
          onChangeText={setNote}
          placeholderTextColor="#a0a0a0"
        />

        <NumberSelector rate={rat} setRate={setRat} />

        <Text style={styles.planLabel}>Goals for {date}</Text>
        <View style={styles.componentPlaceholder}>
          <ScrollView>
            <TaskHabitsList tab={tasks} Com={Task} date={date} on={fetchPlan} />
            <TaskHabitsList tab={habits} Com={Habit} type date={date} on={fetchPlan} />
          </ScrollView>
        </View>

        <Text style={styles.planLabel}>Done for {date}</Text>
        <View style={styles.componentPlaceholder}>
          <ScrollView>
            <DoneTaskHabits tab={doneTasks} Com={DoneTask} date={date} on={fetchPlan} />
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={{ fontWeight: 'bold' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(10, 10, 10)',
    padding: 40,
    paddingBottom: 50,
  },
  planLabel: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  componentPlaceholder: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
  },
  text: {
    borderWidth: 1,
    borderColor: 'green',
    padding: 10,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
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
    textAlignVertical: 'top',
    width: '100%',
    marginBottom: 20,
    borderRadius: 20,
    height: 300,
  },
  saveButton: {
    backgroundColor: 'rgb(255, 235, 59)',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 20,
  },
  raitingContener: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
    fontSize: 28,
  },
});

export default WriteDay;
