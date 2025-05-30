import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../NotificationManager';

const getDays = async () => {
  try {
    const existingData = await AsyncStorage.getItem('day');
    const dataArray = existingData ? JSON.parse(existingData) : [];
    return dataArray;
  } catch (error) {
    console.error('Error getting data:', error);
    return [];
  }
};

const savePlanDay = async (plan, date) => {
  try {
    // Fetch existing data from AsyncStorage
    const dataArray = await getDays();

    // Check if an object with the same date already exists
    const existingDayIndex = dataArray.findIndex((day) => day.date === date);

    if (existingDayIndex !== -1) {
      // Update the plan for the existing object
      dataArray[existingDayIndex].plan = plan;
    } else {
      // Add new object to the array
      const newDay =
      {
        plan: plan,
        date: date,
      }

      dataArray.push(newDay);
    }

    // Save updated array back to AsyncStorage
    await AsyncStorage.setItem('day', JSON.stringify(dataArray));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const saveWriteDay = async (note, rate, streak, date) => {
  try {
    // Fetch existing data from AsyncStorage
    const dataArray = await getDays();

    // Check if an object with the given date already exists
    const existingDayIndex = dataArray.findIndex((day) => day.date === date);

    if (existingDayIndex !== -1) {
      // Update existing object
      dataArray[existingDayIndex].note = note;
      dataArray[existingDayIndex].rate = rate;
      dataArray[existingDayIndex].streak = streak;
    } else {
      // Create a new object and add it to the array
      const newDay = {
        plan: '',
        date: date,
        note: note,
        rate: rate,
        onTime: new Date(date).setHours(0, 0, 0, 0) === new Date(getCurrentDate()).setHours(0, 0, 0, 0),
        streak: streak,
      }

      dataArray.push(newDay);
    }
    // Save updated array back to AsyncStorage
    await AsyncStorage.setItem('day', JSON.stringify(dataArray));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Helper function to get current date in the format "YYYY-MM-DD"
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readPlanDay = async (date) => {
  try {
    // Fetch existing data from AsyncStorage
    const dataArray = await getDays();

    // Find and return the object for the specified date
    const planDay = dataArray.find((day) => day.date === date);
    return planDay ? planDay.plan : "";
  } catch (error) {
    console.error('Error reading data:', error);
    return "";
  }
};

const readDay = async (date) => {
  try {
    // Fetch existing data from AsyncStorage
    const dataArray = await getDays();

    // Find and return the object for the specified date
    const day = dataArray.find((day) => day.date === date);

    return day ? day : null;
  } catch (error) {
    console.error('Error reading data:', error);
    return null;
  }
};

const createTask = async (text, date, id) => {
  try {
    // Retrieve existing tasks from AsyncStorage
    let tasks = await getTasks();

    // Check if tasks is null or undefined and initialize it as an empty array
    tasks = tasks || [];

    //("Before: ", JSON.stringify(tasks));

    // Add new task to the array
    const newTask = { text: text, date: date, id: id };
    tasks.push(newTask);

    //("After: ", JSON.stringify(tasks));

    // Save the updated array to AsyncStorage
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

const deleteTask = async (text, date) => {
  try {
    const tasks = await getTasks();

    // Find the task to delete
    const taskToDelete = tasks.find(task => task.text === text && task.date === date);

    // Cancel its notification if ID exists
    if (taskToDelete?.id) {
      try {
        await NotificationManager.cancelNotification(taskToDelete.id);
        console.log(`Notification ${taskToDelete.id} cancelled.`);
      } catch (error) {
        console.error(`Failed to cancel notification ${taskToDelete.id}:`, error);
      }
    }

    // Filter out the task and save
    const updatedTasks = tasks.filter(task => !(task.text === text && task.date === date));
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

    console.log(`Task "${text}" on ${date} deleted.`);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};


const getTasks = async () => {
  try {
    // Retrieve tasks from AsyncStorage
    const storedTasks = await AsyncStorage.getItem('tasks');
    //("Stored: "+storedTasks)
    // Parse and return the array of tasks
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return [];
  }
};


const createDoneTask = async (text, date) => {
  try {
    // Retrieve existing tasks from AsyncStorage
    let tasks = await getDoneTasks();

    // Check if tasks is null or undefined and initialize it as an empty array
    tasks = tasks || [];

    //("Before: ", JSON.stringify(tasks));

    // Add new task to the array
    const newTask = { text: text, date: date };
    tasks.push(newTask);

    //("After: ", JSON.stringify(tasks));

    // Save the updated array to AsyncStorage
    await AsyncStorage.setItem('donetasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

const deleteDoneTask = async (text, date) => {
  try {
    // Retrieve existing tasks from AsyncStorage
    const tasks = await getDoneTasks()
    // Remove the task with matching text and date
    const updatedTasks = tasks.filter((task) => !(task.text === text && task.date === date));

    // Save the updated array to AsyncStorage
    await AsyncStorage.setItem('donetasks', JSON.stringify(updatedTasks));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

const getDoneTasks = async () => {
  try {
    // Retrieve tasks from AsyncStorage
    const storedTasks = await AsyncStorage.getItem('donetasks');
    //("Stored: "+storedTasks)
    // Parse and return the array of tasks
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return [];
  }
};

const habitStorageKey = '@HabitTracker:Habits';

// CreateHabit function
const createHabit = async (text, time, days, ids) => {
  try {
    const existingHabits = await getHabits();
    const newHabit = {
      text,
      time,
      days,
      streak: 0, // Initial streak value (you can modify this as needed)
      done: false,
      ids
    };
    const updatedHabits = [...existingHabits, newHabit];
    await AsyncStorage.setItem(habitStorageKey, JSON.stringify(updatedHabits));
  } catch (error) {
    console.error('Error creating habit:', error);
  }
};

const deleteHabit = async (text) => {
  try {
    const existingHabits = await getHabits();

    // Find the habit to delete
    const habitToDelete = existingHabits.find(habit => habit.text === text);

    // Cancel scheduled notifications linked to this habit
    if (habitToDelete && habitToDelete.ids) {
      for (const id of habitToDelete.ids) {
        try {
          await NotificationManager.cancelNotification(id);
          console.log(`Notification ${id} cancelled.`);
        } catch (error) {
          console.error(`Failed to cancel notification ${id}:`, error);
        }
      }
    }

    // Update habit list and save
    const updatedHabits = existingHabits.filter(habit => habit.text !== text);
    await AsyncStorage.setItem(habitStorageKey, JSON.stringify(updatedHabits));

    console.log(`Habit "${text}" deleted.`);
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
};


// getHabits function
const getHabits = async () => {
  try {
    const habits = await AsyncStorage.getItem(habitStorageKey);
    return habits ? JSON.parse(habits) : [];
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

const setDone = async (text) => {
  try {
    // 1. Load raw JSON and revive dates if you ever need them as Date objects
    const raw = await AsyncStorage.getItem(habitStorageKey);
    const habits = raw
      ? JSON.parse(raw, (key, val) => {
        if ((key === 'lastDate' || key === 'time') && typeof val === 'string') {
          return new Date(val);
        }
        return val;
      })
      : [];

    // 2. Find and toggle
    let found = false;
    const now = new Date();
    const updated = habits.map(habit => {
      if (habit.text !== text) return habit;

      found = true;
      const done = !habit.done;
      const streak = done
        ? habit.streak + 1
        : Math.max(0, habit.streak - 1);

      return {
        ...habit,
        done,
        streak,
        lastDate: now.toISOString(),
      };
    });

    // 3. Warn if there was no match
    if (!found) {
      console.warn(`setDone: no habit found with text="${text}"`);
      return;
    }

    // 4. Persist the change
    await AsyncStorage.setItem(habitStorageKey, JSON.stringify(updated));
  } catch (error) {
    console.error('setDone error:', error);
  }
}


const setUndone = async (text) => {

  try {
    const existingHabits = await getHabits();
    const updatedHabits = existingHabits.map(habit =>
      habit.text === text ? { ...habit, done: false } : habit
    );
    await AsyncStorage.setItem(habitStorageKey, JSON.stringify(updatedHabits));
  } catch (error) {
    console.error('Error updating done status:', error);
  }
}

const resetStreak = async (text) => {

  try {
    const existingHabits = await getHabits();
    const updatedHabits = existingHabits.map(habit =>
      habit.text === text ? { ...habit, streak: 0, done: false } : habit
    );
    await AsyncStorage.setItem(habitStorageKey, JSON.stringify(updatedHabits));
  } catch (error) {
    console.error('Error updating done status:', error);
  }
}

const createThought = async (text, date) => {
  try {
    // Retrieve existing tasks from AsyncStorage
    let tasks = await getThought();

    // Check if tasks is null or undefined and initialize it as an empty array
    tasks = tasks || [];

    //("Before: ", JSON.stringify(tasks));

    // Add new task to the array
    const newTask = { text: text, date: date };
    tasks.push(newTask);

    //("After: ", JSON.stringify(tasks));

    // Save the updated array to AsyncStorage
    await AsyncStorage.setItem('thought', JSON.stringify(tasks));

    // Fetch the updated tasks and set the state
    tasks = await getTasks();
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

const deleteThought = async (text, date) => {
  try {
    // Retrieve existing tasks from AsyncStorage
    const tasks = await getThought()
    // Remove the task with matching text and date
    const updatedTasks = tasks.filter((task) => !(task.text === text && new Date(task.date).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)));

    // Save the updated array to AsyncStorage
    await AsyncStorage.setItem('thought', JSON.stringify(updatedTasks));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

const getThought = async () => {
  try {
    // Retrieve tasks from AsyncStorage
    const storedTasks = await AsyncStorage.getItem('thought');
    //("Stored: "+storedTasks)
    // Parse and return the array of tasks
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return [];
  }
};


const STORAGE_KEY = 'user';

const setUserStreak = async (action) => {
  try {
    // Retrieve the existing data from storage
    const existingData = await getStoredData()
    let data = existingData ? existingData : { streak: 0, lastDate: null };

    // Update streak based on the action
    if (action === 0) {
      data.streak = 0;
    } else if (action === 1) {
      data.streak += 1;
      data.lastDate = new Date();
    }
    // Save the updated data back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting streak:', error);
  }
};

const getStoredData = async () => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : { streak: 0, lastDate: null };
  } catch (error) {
    console.error('Error getting stored data:', error);
  }
};
export {
  savePlanDay, saveWriteDay, readPlanDay, readDay, getDays,
  createTask, deleteTask, getTasks, createDoneTask, deleteDoneTask, getDoneTasks, createHabit, deleteHabit, getHabits, setDone, setUndone, resetStreak,
  createThought, deleteThought, getThought,
  setUserStreak, getStoredData
}