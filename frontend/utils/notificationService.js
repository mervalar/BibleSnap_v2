import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = 'bibleReminderTime';
const NOTIFICATION_ID_KEY = 'bibleNotificationId';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bible-reminder', {
      name: 'Bible Reading Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
    });
  }
}

export async function requestPermission() {
  await ensureAndroidChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminder(hour24, minute) {
  const granted = await requestPermission();
  if (!granted) return false;

  const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📖 Bible reading time!',
      body: 'Your daily reminder to stay in the Word. Keep your streak going! 🙏',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'bible-reminder' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hour24,
      minute,
    },
  });

  await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id);
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ hour24, minute }));
  return true;
}

export async function cancelReminder() {
  const id = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
  }
  await AsyncStorage.removeItem(REMINDER_KEY);
}

export async function getSavedReminder() {
  const raw = await AsyncStorage.getItem(REMINDER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function testReminder() {
  const granted = await requestPermission();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📖 Bible reading time!',
      body: 'This is your test reminder. Daily notifications are working! 🙏',
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'bible-reminder' }),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, repeats: false },
  });
  return true;
}

export function formatReminderLabel(reminder) {
  if (!reminder) return 'Reminder';
  const { hour24, minute } = reminder;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const h = hour24 % 12 || 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}
