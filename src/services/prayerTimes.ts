import { Coordinates, CalculationMethod, PrayerTimes, CalculationParameters, Madhab } from 'adhan';
import * as Notifications from 'expo-notifications';
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

const calculationMethodFactories: Partial<Record<CalculationMethod, () => CalculationParameters>> = {
  [CalculationMethod.MuslimWorldLeague]: () => CalculationMethod.MuslimWorldLeague(),
  [CalculationMethod.Egyptian]: () => CalculationMethod.Egyptian(),
  [CalculationMethod.Karachi]: () => CalculationMethod.Karachi(),
  [CalculationMethod.UmmAlQura]: () => CalculationMethod.UmmAlQura(),
  [CalculationMethod.Dubai]: () => CalculationMethod.Dubai(),
  [CalculationMethod.MoonsightingCommittee]: () => CalculationMethod.MoonsightingCommittee(),
  [CalculationMethod.NorthAmerica]: () => CalculationMethod.NorthAmerica(),
  [CalculationMethod.Kuwait]: () => CalculationMethod.Kuwait(),
  [CalculationMethod.Qatar]: () => CalculationMethod.Qatar(),
  [CalculationMethod.Singapore]: () => CalculationMethod.Singapore(),
  [CalculationMethod.Tehran]: () => CalculationMethod.Tehran(),
  [CalculationMethod.Turkey]: () => CalculationMethod.Turkey(),
  [CalculationMethod.Other]: () => new CalculationParameters()
};

export const computePrayerTimes = (
  date: Date,
  coordinates: Coordinates,
  method: CalculationMethod = CalculationMethod.MuslimWorldLeague
): PrayerTimeResult[] => {
  const paramsFactory =
    calculationMethodFactories[method] ?? calculationMethodFactories[CalculationMethod.MuslimWorldLeague];
  const params: CalculationParameters = paramsFactory ? paramsFactory() : new CalculationParameters();
  params.madhab = Madhab.Hanafi;
  const times = new PrayerTimes(coordinates, date, params);
  return PRAYER_ORDER.map((prayer) => ({
    prayer,
    time: times[prayerMap[prayer]]
  }));
};

export const schedulePrayerNotifications = async (
  prayerTimes: PrayerTimeResult[],
  language: 'en' | 'ar'
) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
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
        data: { prayer: entry.prayer }
      },
      trigger: triggerTime.toDate()
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
