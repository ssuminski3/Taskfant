import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDays, savePlanDay, saveWriteDay } from '../../storage/storage';

const CalendarPage = () => {
  const navigation = useNavigation();
  const [dates, setDates] = useState([]);

  const fetchDates = async () => {
    const fetchedDates = await getDays();
    setDates(fetchedDates);
  };
  // Fetch dates when the component is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchDates();
    }, [])
  );

  const handleSave = async (plan, selectedDate) => {
    try {
      await savePlanDay(plan, selectedDate);
      // Fetch and update dates immediately after saving the plan
      fetchDates();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleWrite = async (note, rate, streak, date) => {
    try {
      await saveWriteDay(note, rate, streak, date);
      // Fetch and update dates immediately after saving the plan
      fetchDates();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const currentDate = new Date();
  const dateData = dates.filter((date) => {
    
    const dateObject = new Date(date.date);
    dateObject.setDate(dateObject.getDate() + 1)
    const isBeforeToday = dateObject.setHours(0, 0, 0, 0) < currentDate;
    const isToday = dateObject.setHours(0, 0, 0, 0) === currentDate;
    const hasNote = date.note ? true : false

    return isBeforeToday && !isToday && hasNote;
  });
  const planData = dates.filter((date) => {
    
    const dateObject = new Date(date.date);
    dateObject.setDate(dateObject.getDate())
    const isBeforeToday = dateObject.setHours(0, 0, 0, 0) < currentDate;
    const isToday = dateObject.setHours(0, 0, 0, 0) === currentDate;

    return !isBeforeToday && !isToday;
  });
  const onDayPress = (day) => {
    navigation.navigate("DayPage", {date: day.dateString, onSave: handleWrite, onSave2: handleSave})
  }
  const markedDates = dateData.reduce((acc, dat) => {
    acc[dat.date] = {
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
    return acc;
  }, {});

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
        // The current marked dates from the state
        markedDates={markedDates}
        markingType={'custom'}
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
