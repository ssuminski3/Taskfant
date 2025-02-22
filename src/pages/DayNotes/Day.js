import React, { Component, useState } from 'react'
import { StyleSheet, Text, Image, View } from 'react-native';
import Swiper from 'react-native-swiper'
import ReadDay from './ReadDay';
import WriteDay from './WriteDay'
import PlanDay from './PlanDay'
import { useFocusEffect } from '@react-navigation/native';
import { getDays } from '../../storage/storage';

export default function DayPage({ route }) {

  const { date, onSave, onSave2 } = route.params; // Extract params
  const [dates, setDates] = useState([])

  const fetchDates = async () => {
    const fetchedDates = await getDays();
    setDates(fetchedDates);
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchDates();
    }, [])
  );
  const currentDate = new Date();
  const dateData = dates.filter((date) => {

    const dateObject = new Date(date.date);
    dateObject.setDate(dateObject.getDate() + 1)
    const isBeforeToday = dateObject.setHours(0, 0, 0, 0) < currentDate;
    const isToday = dateObject.setHours(0, 0, 0, 0) === currentDate;

    return isBeforeToday && !isToday;
  });

  function addDaysToDate(inputDate, n) {
    const dateCopy = new Date(inputDate); // Create a copy of the input date to avoid mutating it

    // Add n days to the copy
    dateCopy.setDate(dateCopy.getDate() + n);

    return dateCopy.toISOString().split('T')[0];
  }

  function ChoosePage({ date }) {
    // Check if the date exists in your dateData
    const dateInfo = dateData.find((dat) => dat.date === date);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Convert both dates to strings without time components
    const dateString = selectedDay.toISOString().split('T')[0];
    const todayDateString = today.toISOString().split('T')[0];
    if (dateString === todayDateString) {
      return <WriteDay date={date} onSave={onSave} />;
    } else if (dateInfo && dateInfo.note) {
      return <ReadDay date={date} />;
    } else {
      if (selectedDay < today) {
        return <WriteDay date={date} onSave={onSave} />;
      } else {
        return <PlanDay date={date} onSave={onSave2} />;
      }
    }
  }

  const SwiperComponent = () => {
    const [dat, setDat] = useState([
      addDaysToDate(date, -7),
      addDaysToDate(date, -6),
      addDaysToDate(date, -5),
      addDaysToDate(date, -4),
      addDaysToDate(date, -3),
      addDaysToDate(date, -2),
      addDaysToDate(date, -1),
      date,
      addDaysToDate(date, 1),
      addDaysToDate(date, 2),
      addDaysToDate(date, 3),
      addDaysToDate(date, 4),
      addDaysToDate(date, 5),
      addDaysToDate(date, 6),
      addDaysToDate(date, 7),
    ]);

    const [currentIndex, setCurrentIndex] = useState(7);

    const handleIndexChanged = (index) => {
      if (index >= dat.length - 2) {
        const updatedDates = [...dat];
        for (let i = 1; i <= 7; i++) {
          updatedDates.push(addDaysToDate(dat[dat.length - 1], i));
        }
        setDat(updatedDates);
        setCurrentIndex(index);
      }

      if (index <= 1) {
        const updatedDates = [];
        for (let i = 7; i >= 1; i--) {
          updatedDates.push(addDaysToDate(dat[0], -i));
        }
        console.log("Updated: "+updatedDates)
        updatedDates.push(...dat);
        setDat(updatedDates);
        setCurrentIndex(index+7); // Adjust the current index accordingly
      }

      console.log(dat);
    };


    return (
      <Swiper
        key={currentIndex}
        style={styles.wrapper}
        showsButtons={false}
        showsPagination={false}
        index={currentIndex}
        onIndexChanged={handleIndexChanged}

      >
        {dat.map((date, index) => (
          <ChoosePage key={index} date={date} />
        ))}
      </Swiper>
    );
  };

  return (
    <View style={styles.container}>
      <SwiperComponent></SwiperComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {},
});
