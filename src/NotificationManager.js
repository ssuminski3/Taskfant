import * as Notifications from 'expo-notifications';

class NotificationManager {
  constructor() {
    this.scheduledNotifications = [];
    this.init();
  }

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

  // Schedule a one-time notification and return its ID
  async scheduleNotificationDateAndHour(date, task) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: task,
          body: "Make it, never give up.",
        },
        trigger: { date: date },
      });
      this.scheduledNotifications.push(id);
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Schedule multiple weekly notifications, return an array of IDs
  async scheduleWeeklyNotifications(daysOfWeek, hour, minute, habit) {
    const dayNumbers = {
      'Sun': 1, 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7
    };

    const ids = [];

    for (const day in daysOfWeek) {
      const { status } = await Notifications.requestPermissionsAsync();

      if (daysOfWeek[day]) {
        try {
          const dayNumber = dayNumbers[day];
          if (!dayNumber) {
            console.error(`Invalid day: ${day}`);
            continue;
          }

          const id = await Notifications.scheduleNotificationAsync({
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

          this.scheduledNotifications.push(id);
          ids.push(id);
        } catch (error) {
          console.error(`Failed to schedule notification for ${day}:`, error);
        }
      }
    }

    return ids;
  }

  async cancelNotification(id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      this.scheduledNotifications = this.scheduledNotifications.filter(n => n !== id);
      console.log(`Notification ${id} cancelled.`);
    } catch (error) {
      console.error(`Failed to cancel notification ${id}:`, error);
    }
  }

  async cancelAllNotifications() {
    for (const id of this.scheduledNotifications) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    this.scheduledNotifications = [];
    console.log('All scheduled notifications cancelled.');
  }
}

export default new NotificationManager();
