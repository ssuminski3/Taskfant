import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDays, savePlanDay, saveWriteDay } from '../../storage/storage';

const CalendarPage = () => {
  const navigation = useNavigation();
  const [dates, setDates] = useState([]);

  const fetchDates = async () => {
    try {
      const fetchedDates = await getDays();
      setDates(fetchedDates);
    } catch (error) {
      console.error("Error fetching dates:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDates();
    }, [])
  );

  const handleSave = async (plan, selectedDate) => {
    try {
      await savePlanDay(plan, selectedDate);
      fetchDates();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleWrite = async (note, rate, streak, date) => {
    try {
      await saveWriteDay(note, rate, streak, date);
      fetchDates();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize currentDate for comparisons

  // Filter dates that have notes and are before today (excluding today)
  const dateData = dates.filter(({ date, note }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < currentDate && note;
  });

  // Filter dates for planData that are today or in the future
  const planData = dates.filter(({ date }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= currentDate;
  });

  const onDayPress = (day) => {
    navigation.navigate('DayPage', {
      date: day.dateString,
      onSave: handleWrite,
      onSave2: handleSave,
    });
  };

  // Build markedDates object for Calendar marking
  const markedDates = {};

  dateData.forEach((dat) => {
    markedDates[dat.date] = {
      customStyles: {
        container: {
          backgroundColor: dat.onTime ? 'rgb(255, 235, 59)' : 'rgb(10, 10, 10)',
          borderRadius: 25,
          borderWidth: 2,
          borderColor: 'rgb(255, 235, 59)',
        },
        text: {
          color: dat.onTime ? 'rgb(10, 10, 10)' : 'rgb(255, 235, 59)',
          fontWeight: 'bold',
        },
      },
    };
  });

  planData.forEach((date) => {
    if (!markedDates[date.date]) {
      markedDates[date.date] = {
        customStyles: {
          container: {
            backgroundColor: 'rgb(10, 10, 10)',
            borderWidth: 2,
            borderBottomColor: 'rgb(255, 235, 59)',
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    }
  });

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        markingType="custom"
        onDayPress={onDayPress}
        style={styles.calendar}
        theme={{
          backgroundColor: 'rgb(10, 10, 10)',
          calendarBackground: 'rgb(10, 10, 10)',
          textSectionTitleColor: '#ffffff',
          dayTextColor: '#ffffff',
          todayTextColor: 'rgb(255, 235, 59)',
          monthTextColor: '#ffffff',
          indicatorColor: 'rgb(255, 235, 59)',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
          arrowColor: 'rgb(255, 235, 59)',
        }}
        firstDay={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: 'rgb(10, 10, 10)',
    justifyContent: 'center',
  },
  calendar: {
    backgroundColor: 'rgb(10, 10, 10)',
  },
});

export default CalendarPage;
