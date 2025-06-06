import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { deleteTask, createDoneTask, deleteDoneTask, createTask, setDone, deleteHabit, setUndone, resetStreak } from '../storage/storage';

// Task component
const Task = ({ text, date, on }) => {
  const [showIcon, setShowIcon] = useState(false);

  const onDelete = async () => {
    await deleteTask(text, date);
    on();
  };

  useEffect(() => {
    let timer;

    const handleTimeout = async () => {
      setShowIcon(false);
      await deleteTask(text, date);
      await createDoneTask(text, new Date());
      on();
    };

    if (showIcon) {
      timer = setTimeout(handleTimeout, 10);
    }

    return () => clearTimeout(timer);
  }, [showIcon]);

  const handlePress = () => {
    setShowIcon(true);
  };

  return (
    <View style={styles.taskContainer}>
      <TouchableOpacity
        testID="task-checkbox"
        style={styles.taskCheckbox}
        onPress={handlePress}
      >
        {showIcon && <MaterialIcons name="check" size={24} color="white" />}
      </TouchableOpacity>
      <View style={styles.taskTextAndDateContainer}>
        <Text style={styles.taskText}>{text}</Text>
        <Text style={styles.taskDate}>{formatDate(date)}</Text>
      </View>
      <TouchableOpacity
        testID="task-delete-button"
        style={styles.taskDeleteButton}
        onPress={onDelete}
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

// DoneTask component
const DoneTask = ({ text, date, on }) => {
  const onDelete = async () => {
    await deleteDoneTask(text, date);
    on();
  };
  const onClick = async () => {
    await deleteDoneTask(text, date);
    await createTask(text, date);
    on();
  };
  return (
    <View style={doneTaskStyles.container}>
      <TouchableOpacity
        testID="done-task-undo-button"
        style={doneTaskStyles.check}
        onPress={onClick}
      >
        <MaterialIcons name="check" size={24} color="rgb(10, 10, 10)" />
      </TouchableOpacity>
      <View style={doneTaskStyles.textAndDateContainer}>
        <Text style={doneTaskStyles.text}>{text}</Text>
        <Text style={doneTaskStyles.date}>{formatDate(date)}</Text>
      </View>
      <TouchableOpacity
        testID="done-task-delete-button"
        style={doneTaskStyles.deleteButton}
        onPress={onDelete}
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

// Habit component
const Habit = ({ text, date, streak, done, on, days, last }) => {
  const [isDone, setIsDone] = useState(done);

  const handlePress = async () => {
    setIsDone(!isDone);
    await setDone(text);
    on();
  };

  const onDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        {
          text: "No",
          onPress: () => { },
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            deleteHabit(text);
            on();
          }
        }
      ],
      { cancelable: false }
    );
  };

  const doned = () => {
    const now = new Date();
    const todayString = now.toDateString();

    if (new Date(last).toDateString() === todayString) {
      return;
    }

    const scheduleDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const todayName = scheduleDays[now.getDay()];
    const shouldBeDoneToday = days[todayName];

    if (shouldBeDoneToday && !done) {
      resetStreak(text);
    }
    if (shouldBeDoneToday) {
      setUndone(text);
    }
  };

  doned();

  return (
    <View style={habitStyles.container}>
      <TouchableOpacity
        testID="habit-checkbox"
        style={isDone ? habitStyles.check : habitStyles.checkbox}
        onPress={handlePress}
      >
        {isDone && <MaterialIcons name="check" size={24} color="rgb(10, 10, 10)" />}
      </TouchableOpacity>
      <View style={habitStyles.textAndDateContainer}>
        <Text style={habitStyles.text}>{text}</Text>
        <Text style={habitStyles.date}>{date}</Text>
      </View>
      <Text style={habitStyles.streak}>Streak:{"\n"}{streak}</Text>
      <TouchableOpacity
        testID="habit-delete-button"
        style={habitStyles.deleteButton}
        onPress={onDelete}
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Thought = ({ text, date, onDelete, d }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textAndDateContainer}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={async () => onDelete(text, d)}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}
const ThoughtList = ({ thoughts, date, onDelete, all = false }) => {
  const formatDate = (d) => {
    const date = new Date(d);
    if (all) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      return `${formattedHours}:${formattedMinutes}`;
    }
  };

  return (
    <View>
      <View>
        {thoughts.map((item, index) => {
          if (all || new Date(date).setHours(0, 0, 0, 0) === new Date(item.date).setHours(0, 0, 0, 0)) {
            return (
              <Thought
                key={index}
                onDelete={async (t, d) => onDelete(t, d)}
                text={item.text}
                date={formatDate(item.date)}
                d={item.date}
              />
            );
          }
          return null; // make sure to return something for all branches
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  taskCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  taskTextAndDateContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  taskDate: {
    fontSize: 12,
    color: "gray",
  },
  taskDeleteButton: {
    padding: 5,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  textAndDateContainer: {
    flex: 1,
    marginLeft: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  date: {
    color: '#999',
  },
  deleteButton: {
    padding: 10,
  },

  textAndDateContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },

});

const doneTaskStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgb(206, 238, 196)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textAndDateContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "gray",
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
  deleteButton: {
    padding: 5,
  },
});

const habitStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgb(214, 214, 214)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgb(206, 238, 196)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textAndDateContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
  streak: {
    fontSize: 14,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
});

const DoneTaskHabits = ({ tab, Com, on, date, type = false }) => {

  return (
    <View>
      <View>
        {tab.map((item, index) => {

          if (new Date(date).setHours(0, 0, 0, 0) == new Date(item.date).setHours(0, 0, 0, 0))
            return <Com key={index} text={item.text} date={item.date} on={on} />
        })}
      </View>
    </View>
  );
}

const TaskHabitsList = ({ tab, Com, date, on, type = false }) => {

  const getDayName = (dayIndex) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek[dayIndex];
  };

  const checkIfDayMatches = (item, date) => {
    const dayIndex = new Date(date).getDay();
    return item.days[getDayName(dayIndex)] === true;
  };

  const normalizeDate = (d) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized.getTime();
  };

  return (
    <View>
      <View>
        {tab.map((item, index) => {
          if (type && checkIfDayMatches(item, date)) {
            return (
              <Com
                key={index}
                text={item.text}
                date={"For Today"}
                streak={item.streak}
                done={item.done}
                days={item.days}
                last={item.lastDate}
                on={on}
              />
            );
          }
          else if (normalizeDate(item.date) === normalizeDate(date)) {
            return (
              <Com
                key={index}
                text={item.text}
                date={item.date}
                on={on}
              />
            );
          }
          return null; // Explicitly return null for unmatched items
        })}
      </View>
    </View>
  );
};

export { TaskHabitsList, DoneTaskHabits, ThoughtList, Task, DoneTask, Habit }