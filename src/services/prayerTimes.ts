import { Coordinates, CalculationMethod, PrayerTimes, CalculationParameters, Madhab } from 'adhan';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import dayjs from 'dayjs';
import { PrayerName } from '@/types';
import { PRAYER_ORDER } from '@/constants/prayer';

export interface PrayerTimeResult {
  prayer: PrayerName;
  time: Date;
}

const prayerMap: Record<PrayerName, keyof PrayerTimes> = {
  fajr: 'fajr',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha'
};

const calculationMethodFactories: Record<string, () => CalculationParameters> = {
  'MuslimWorldLeague': () => CalculationMethod.MuslimWorldLeague(),
  'Egyptian': () => CalculationMethod.Egyptian(),
  'Karachi': () => CalculationMethod.Karachi(),
  'UmmAlQura': () => CalculationMethod.UmmAlQura(),
  'Dubai': () => CalculationMethod.Dubai(),
  'MoonsightingCommittee': () => CalculationMethod.MoonsightingCommittee(),
  'NorthAmerica': () => CalculationMethod.NorthAmerica(),
  'Kuwait': () => CalculationMethod.Kuwait(),
  'Qatar': () => CalculationMethod.Qatar(),
  'Singapore': () => CalculationMethod.Singapore(),
  'Tehran': () => CalculationMethod.Tehran(),
  'Turkey': () => CalculationMethod.Turkey(),
  'Other': () => new CalculationParameters(null)
};

export const computePrayerTimes = (
  date: Date,
  coordinates: Coordinates,
  method: string = 'MuslimWorldLeague'
): PrayerTimeResult[] => {
  const paramsFactory =
    calculationMethodFactories[method] ?? calculationMethodFactories['MuslimWorldLeague'];
  const params: CalculationParameters = paramsFactory ? paramsFactory() : new CalculationParameters(null);
  params.madhab = Madhab.Hanafi;
  const times = new PrayerTimes(coordinates, date, params);
  return PRAYER_ORDER.map((prayer) => {
    const prayerTime = times[prayerMap[prayer]] as Date;
    return {
      prayer,
      time: prayerTime
    };
  });
};

export const schedulePrayerNotifications = async (
  prayerTimes: PrayerTimeResult[],
  language: 'en' | 'ar'
) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Set notification channel for Android (icon automatically uses app icon)
  await Notifications.setNotificationChannelAsync('prayer-reminders', {
    name: 'Prayer Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
    lightColor: '#7a8b71',
    showBadge: true,
  });

  const now = dayjs();

  for (const entry of prayerTimes) {
    const triggerTime = dayjs(entry.time).add(10, 'minute');
    if (triggerTime.isBefore(now)) continue;

    const content =
      language === 'ar'
        ? {
            title: 'تذكير الصلاة',
            body: `هل صليت ${prayerDisplayName(entry.prayer, language)}؟`
          }
        : {
            title: 'Prayer reminder',
            body: `Did you pray ${prayerDisplayName(entry.prayer, language)}?`
          };

    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        data: { prayer: entry.prayer },
        sound: 'default',
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#7a8b71',
        categoryIdentifier: 'prayer-reminders',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: triggerTime.toDate(),
        channelId: 'prayer-reminders',
      }
    });
  }
};

const prayerDisplayName = (prayer: PrayerName, language: 'en' | 'ar') => {
  const names: Record<PrayerName, { en: string; ar: string }> = {
    fajr: { en: 'Fajr', ar: 'الفجر' },
    dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    asr: { en: 'Asr', ar: 'العصر' },
    maghrib: { en: 'Maghrib', ar: 'المغرب' },
    isha: { en: 'Isha', ar: 'العشاء' }
  };
  return names[prayer][language];
};
