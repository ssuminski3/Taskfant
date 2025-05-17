import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarPage from './src/pages/CalendarPage/CalendarPage';
import StartingPage from './src/pages/StartingPage/StartingPage';
import ToDoPage from './src/pages/ToDoPage/ToDoPage';
import ShopPage from './src/pages/ShopPage/ShopPage';
import ThoughtListPage from './src/pages/ThoughtListPage/ThoughtListPage';
import CreateToDoPage from './src/pages/ToDoPage/CreateToDoPage';
import DayPage from './src/pages/DayNotes/Day';
import Icon from 'react-native-vector-icons/FontAwesome'; // Choose your icon library

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#000', // Background color of the top bar
        },
        headerTintColor: '#fff', // Color of the header title and buttons
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Challenges': iconName = 'rocket'; break;
            case 'Home': iconName = 'home'; break;
            case 'Goals': iconName = 'check-square'; break;
            case 'Thoughts': iconName = 'comment-o'; break;
            case 'Calendar': iconName = 'calendar'; break;
            default: iconName = 'circle'; break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'rgb(255, 235, 59)',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#000', // Background color of the bottom tab bar
        },
      })}
    >
      <Tab.Screen name="Calendar" component={CalendarPage} />
      <Tab.Screen name="Challenges" component={ShopPage} />
      <Tab.Screen name="Home" component={StartingPage} />
      <Tab.Screen name="Goals" component={ToDoPage} />
      <Tab.Screen name="Thoughts" component={ThoughtListPage} />
    </Tab.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="CreateToDoPage"
        component={CreateToDoPage}
        options={{
          title: 'Create To Do',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="DayPage"
        component={DayPage}
        options={{
          title: 'Day Notes',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
}