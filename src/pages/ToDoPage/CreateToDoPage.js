import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NotificationManager from '../../NotificationManager';
import { createTask, createHabit } from '../../storage/storage';
import { useNavigation } from '@react-navigation/native';

function formatNumber(number) {
  return number < 10 ? '0' + number : number;
}

const CreateToDoPage = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task'); // 'task' or 'habit'
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [text, setText] = useState('Select Date');
  const [days, setDays] = useState({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false); // New state for visibility
  const [showDatePicker2, setShowDatePicker2] = useState(false); // New state for visibility
  const [successMessage, setSuccessMessage] = useState('');

  const saveToDo = async () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Please enter a title for the to-do.');
      return;
    }
    if (type === "habit") {
      ('Saving To-Do:', { title, time, days });
      await createHabit(title, time, days)
      NotificationManager.scheduleWeeklyNotifications(days, time.getHours(), time.getMinutes());
      navigation.goBack()
    }
    if (type === "task") {
      date.setHours(time.getHours())
      date.setMinutes(time.getMinutes())
      await createTask(title, date);
      NotificationManager.scheduleNotificationDateAndHour(date, title);
      navigation.goBack()
    }

    setSuccessMessage('To-Do saved successfully!');
    // Reset form or perform other actions after save
  };

  const handleDateChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedText = formatDateTimeText(selectedDate, time, true);
      setText(formattedText);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker2(false);
      return;
    }
    setShowDatePicker2(false);
    if (selectedTime) {
      setTime(selectedTime);
      const formattedText = formatDateTimeText(date, selectedTime, false);
      setText(formattedText);
    }
  };


  const formatDateTimeText = (selectedDate, selectedTime, t = true) => {
    const day = formatNumber(selectedDate.getDate());
    const month = formatNumber(selectedDate.getMonth() + 1);
    const year = selectedDate.getFullYear();
    const hours = formatNumber(selectedTime.getHours());
    const minutes = formatNumber(selectedTime.getMinutes());

    return t ? `${day}-${month}-${year} ${hours}:${minutes}` : `${hours}:${minutes}`;
  };

  useEffect(() => {
    return () => {
      setShowDatePicker(false);
      setShowDatePicker2(false);
    };
  }, []);


  const toggleDay = (day) => {
    setDays({ ...days, [day]: !days[day] });
  };
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const [isTask, setIsTask] = useState(true); // true for 'task', false for 'habit'
  
  const toggleSwitch = () => {
    setIsTask(prev => {
      const newValue = !prev;
      setType(newValue ? 'task' : 'habit');
      setText(newValue ? 'Select Date' : 'Select Time');
      return newValue;
    });

  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create {isTask ? "Resolution" : "Habit"}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={`Enter ${isTask ? "Resolution" : "Habit"}`}
        style={styles.input}
        placeholderTextColor="#a0a0a0"
      />
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Habit</Text>
        <Switch
          trackColor={{ false: "#81b0ff", true: "#81b0ff" }}
          thumbColor={isTask ? "#f5dd4b" : "#f5dd4b"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isTask}
        />
        <Text style={styles.label}>Resolution</Text>
      </View>
      {type === 'task' && (
        <>
          <TouchableOpacity
            style={styles.yellowButton}
            onPress={() => { toggleDatePicker(); setShowDatePicker2(!showDatePicker2) }}
          >
            <Text style={styles.buttonText}>{text}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date('2024-01-01')}
              maximumDate={new Date('2025-12-31')}
            />
          )}

          {showDatePicker2 && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

        </>
      )}

      {type === 'habit' && (
        <>
          <TouchableOpacity
            style={styles.yellowButton}
            onPress={toggleDatePicker}
          >
            <Text style={styles.buttonText}>{text}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setTime(selectedTime);
                  const hours = formatNumber(selectedTime.getHours());
                  const minutes = formatNumber(selectedTime.getMinutes());
                  setText(`${hours}:${minutes}`);
                }
                setShowDatePicker(false); // Hide the picker after selection
              }}
            />
          )}
          <View style={styles.daysContainer}>
            {Object.keys(days).map(day => (
              <Button
                key={day}
                title={day}
                onPress={() => toggleDay(day)}
                color={days[day] ? 'rgb(255, 235, 59)' : 'rgb(10, 10, 10)'}
              />
            ))}
          </View>
        </>
      )}
      <TouchableOpacity
        style={styles.yellowButton}
        onPress={saveToDo}
      >
        <Text style={styles.buttonText}>Save {isTask ? "Resolution" : "Habit"}</Text>
      </TouchableOpacity>
      {successMessage ? <Text>{successMessage}</Text> : null}
    </View>
  );


};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgb(10, 10, 10)',
    color: 'white',
  },
  header: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  yellowButton: {
    backgroundColor: 'rgb(255, 235, 59)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    margin: 10,
    fontWeight: 'bold',
    // Add other styling as needed
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: 'white',
  },
  datePicker: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgb(255, 235, 59)',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  label: {
    margin: 10,
    color: 'white',
    // Add other styling for the label text as needed
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: 'bold'
  }
  // Additional styles can be added as needed
});
export default CreateToDoPage;
