import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThoughtList } from '../../components/TasksHabits';
import { getThought } from '../../storage/storage';

const ThoughtListPage = () => {

  const [thoughts, setThoughts] = useState([])


  useEffect(() => {
    const fetchAndReloadThoughs = async () => {
      try {
        const t = await getThought()
        setThoughts(t || [])
        console.log("COL ", t)
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchAndReloadThoughs()
  }, [])

  return (
    <View style={styles.con}>
      <ThoughtList
        thoughts={thoughts}
        all={true}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  con: {
    backgroundColor: 'rgb(10, 10, 10)',
    flex: 1,
    padding: 20,
  },
})

export default ThoughtListPage;
