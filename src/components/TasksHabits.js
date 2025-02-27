import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install this package
import { deleteTask, createDoneTask, deleteDoneTask, createTask, setDone, deleteHabit, setUndone, resetStreak } from '../storage/storage';

// Task component
const Task = ({ text, date, on }) => {
    const [showIcon, setShowIcon] = useState(false);
    const onDelete = async () => {
        await deleteTask(text, date)
        on();
    };
    useEffect(() => {
        let timer;

        const handleTimeout = async () => {
            setShowIcon(false);
            await deleteTask(text, date);
            await createDoneTask(text, new Date())
            on();
        };

        if (showIcon) {
            // Schedule the execution after 10 milliseconds
            timer = setTimeout(handleTimeout, 10);
        }

        return () => clearTimeout(timer); // Cleanup the timer when component unmounts or when showIcon changes
    }, [showIcon]);


    const handlePress = () => {
        setShowIcon(true); // Show the icon
    };

    return (
        <View style={styles.taskContainer}>
            <TouchableOpacity style={styles.taskCheckbox} onPress={handlePress}>
                {showIcon && <MaterialIcons name="check" size={24} color="white" />}
            </TouchableOpacity>
            <View onPress={handlePress} style={styles.taskTextAndDateContainer}>
                <Text style={styles.taskText}>{text}</Text>
                <Text style={styles.taskDate}>{formatDate(date)}</Text>
            </View>
            <TouchableOpacity style={styles.taskDeleteButton} onPress={onDelete}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

// DoneTask component
const DoneTask = ({ text, date, on }) => {

    const onDelete = async () => {
        await deleteDoneTask(text, date)
        on();
    };
    const onClick = async () => {
        await deleteDoneTask(text, date)
        await createTask(text, date);
        on();
    }
    return (
        <View style={doneTaskStyles.container}>
            <TouchableOpacity style={doneTaskStyles.check} onPress={onClick}>
                <MaterialIcons name="check" size={24} color="rgb(10, 10, 10)" />
            </TouchableOpacity>
            <View onPress={onClick} style={doneTaskStyles.textAndDateContainer}>
                <Text style={doneTaskStyles.text}>{text}</Text>
                <Text style={doneTaskStyles.date}>{formatDate(date)}</Text>
            </View>
            <TouchableOpacity style={doneTaskStyles.deleteButton} onPress={onDelete}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

// Habit component
const Habit = ({ text, date, streak, done, on, days, last }) => {

    const [isDone, setIsDone] = useState(done);

    const handlePress = async () => {
        var v = isDone ? -1 : 1
        //streak++/streal--
        setIsDone(!isDone)
        await setDone(text)
        streak = isDone ? streak - 1 : streak + 1
        on()
    };
    const onDelete = () => {
        Alert.alert(
            "Delete Habit", // Title of the alert
            "Are you sure you want to delete this habit?", // Message of the alert
            [
                {
                    text: "No", // Text for the 'No' button
                    onPress: () => ("Deletion cancelled"), // Function to execute when 'No' is pressed
                    style: "cancel"
                },
                {
                    text: "Yes", // Text for the 'Yes' button
                    onPress: () => {
                        // Function to execute when 'Yes' is pressed
                        deleteHabit(text)
                        on()
                    }
                }
            ],
            { cancelable: false } // This prevents the alert from being dismissed by tapping outside of it
        );
    };
    const doned = () => {
        const now = new Date();
        const todayString = now.toDateString();

        // 1) If we've already checked today, do nothing:
        if (new Date(last).toDateString() === todayString) {
            return;
        }

        // 2) Map 0–6 → your weekday keys in the correct order:
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

        // 3) If today is a scheduled day and you didn't mark it done yesterday, reset the streak:
        if (shouldBeDoneToday && !done) {
            resetStreak(text);
        }

        // 4) If today is a scheduled day (regardless of yesterday’s done state), clear the done flag for the new day:
        if (shouldBeDoneToday) {
            setUndone(text);
        }
    };

    doned()

    return (
        <View style={habitStyles.container}>
            <TouchableOpacity
                style={isDone ? habitStyles.check : habitStyles.checkbox}
                onPress={handlePress}>
                {isDone && <MaterialIcons name="check" size={24} color="rgb(10, 10, 10)" />}
            </TouchableOpacity>
            <View onPress={handlePress} style={habitStyles.textAndDateContainer}>
                <Text style={habitStyles.text}>{text}</Text>
                <Text style={habitStyles.date}>{date}</Text>
            </View>
            <Text style={habitStyles.streak}>Streak:{"\n"}{streak}</Text>
            <TouchableOpacity style={habitStyles.deleteButton} onPress={onDelete}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

const formatDate = (inputDate) => {
    const date = new Date(inputDate); // Convert the inputDate to a Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


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
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        justifyContent: 'space-between',
    },
    textAndDateContainer: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
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
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        justifyContent: 'space-between',
    },
    taskTextAndDateContainer: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flex: 1,
        marginLeft: 10,
    },
    taskText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    taskDate: {
        color: '#999',
    },
    taskDeleteButton: {
        padding: 10,
    },
    taskCheckbox: {
        width: 24,
        height: 24,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
const doneTaskStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        color: 'white',
        justifyContent: 'space-between',
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
});
const habitStyles = StyleSheet.create({
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
});

export { TaskHabitsList, DoneTaskHabits, ThoughtList, Task, DoneTask, Habit }