import * as Notifications from 'expo-notifications';

class NotificationManager {
  // Constructor
  constructor() {
    this.init();
  }

  // Initialize by requesting permissions
  async init() {
    await this.requestPermissions();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
  }

  // Request permissions for notifications
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === 'granted';
  }

  // Schedule a notification by date and hour
  async scheduleNotificationDateAndHour(date, task) {
    console.log("Scheduled for: "+date)
    Notifications.scheduleNotificationAsync({
      content: {
        title: task,
        body: "Make it, never give up.",
      },
      trigger: {date: date},
    });
  }

  // Schedule weekly notifications
  async scheduleWeeklyNotifications(daysOfWeek, hour, minute, habit) {
    const dayNumbers = {
      'Sun': 1, 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7
    };

    for (const day in daysOfWeek) {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification Permission Status:', status);

      if (daysOfWeek[day]) { // Check if the day is set to true
        try {
          const dayNumber = dayNumbers[day];
          if (!dayNumber) {
            console.error(`Invalid day: ${day}`);
            continue;
          }

          Notifications.scheduleNotificationAsync({
            content: {
              title: habit,
              body: "Work on your habits.",
            },
            trigger: {
              weekday: dayNumber,
              hour: hour,
              minute: minute,
              repeats: true,
            },
          });
          console.log({
            weekday: dayNumber,
            hour: hour,
            minute: minute,
            repeats: true
          });
        } catch (error) {
          console.error(`Failed to schedule notification for ${day}:`, error);
        }
      }
    }
  }


}

export default new NotificationManager();
