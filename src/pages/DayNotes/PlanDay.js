import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { TaskHabitsList } from '../../components/TasksHabits'
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose your icon library
import { Task, Habit } from '../../components/TasksHabits';
import { savePlanDay, readPlanDay, getHabits, getTasks, createTask, getDays } from '../../storage/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const AddTaskComponent = ({ onAddTask, }) => {
    const [task, setTask] = useState('');

    return (
        <View style={styles.containerAdd}>
            <TextInput
                style={styles.textInputAdd}
                placeholder="Add Task"
                value={task}
                onChangeText={setTask}
                placeholderTextColor="#a0a0a0"
            />
            <TouchableOpacity style={styles.addButtonAdd} onPress={() => {onAddTask(task); setTask('')}}>
                <Icon name='plus' color={'rgb(255, 235, 59)'} size={20} />
            </TouchableOpacity>
        </View>
    );
};

const PlanDay = (props) => {
    const navigation = useNavigation();
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]); // Your initial habits array
    const fetchAndReloadTasks = async () => {
        try {
            const tasksData = await getTasks();
            const habitData = await getHabits()

            setTasks(tasksData);
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
    const date = props.date;
    const onSave = props.onSave
    const [task, setTask] = useState("");
    const fetchPlan = async () => {
        const plan = await readPlanDay(date);
        setTask(plan || ''); // Set the state with the plan or an empty string if not found
    };
    useEffect(() => {
        fetchPlan();
    }, [date]);
    const handleTask = async (text) => {
        ({ text, date })
        await createTask(text, date);
        fetchAndReloadTasks();
    }
    // Inside the handleSave function in PlanDay component
    const handleSave = async () => {
        if (task)
            try {
                // Trigger onSave callback if provided
                if (onSave) {
                    onSave(task, date);
                }

            } catch (error) {
                console.error('Error saving plan:', error);
            }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.planLabel}>Plan for {date}</Text>
            <TextInput
                style={styles.textInput}
                placeholder="Here write your plan"
                placeholderTextColor="#a0a0a0"// Assuming you want a placeholder text color
                value={task}
                onChangeText={setTask}
                multiline
                numberOfLines={3} // This ensures the TextInput starts with a height for 3 lines
            />
            <AddTaskComponent onAddTask={async (newTask) => await handleTask(newTask)} />
            {/* Placeholder for your <Component/> */}
            <Text style={styles.planLabel}>Goals for {date}</Text>
            <ScrollView style={styles.componentPlaceholder}>
                <TaskHabitsList tab={tasks} Com={Task} date={date} on={fetchPlan} />
                <TaskHabitsList tab={habits} Com={Habit} type={true} date={date} on={fetchPlan} />
            </ScrollView>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.saveButton} onPress={async () => await handleSave(task)}>
                    <Text style={{ fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(10, 10, 10)',
        padding: 40,
    },
    planLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'green',
        padding: 10,
        color: 'white',
        fontSize: 16,
        textAlignVertical: 'top', // Align text at the top
        minHeight: 300, // Adjust the height based on your line height
        width: '100%',
        marginBottom: 20,
        borderRadius: 20,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 100, // Adjust the position as needed
        backgroundColor: 'rgb(255, 235, 59)',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    componentPlaceholder: {
        width: '100%',
        marginBottom: 20,
        // Just for demonstration, you might want to remove the border in your actual component
        borderWidth: 1,
        borderColor: 'grey',

        borderRadius: 20,
    },
    saveButton: {
        backgroundColor: 'rgb(255, 235, 59)',
        padding: 15,
        width: '100%',
        alignItems: 'center',
        borderRadius: 20,
    },
    containerAdd: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgb(255, 235, 59)',
        padding: 10,
        marginBottom: 20,
        borderRadius: 20,

    },
    textInputAdd: {
        flex: 1,
        color: 'white',
        paddingLeft: 10,
        paddingRight: 44, // to ensure the text doesn't go behind the icon
    },
    buttonGo: {
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
        justifyContent: 'space-between',
        alignItems: 'center', // Center text horizontally
        padding: 2
    }
});

export default PlanDay;
