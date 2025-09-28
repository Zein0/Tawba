import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { Coordinates } from 'adhan';
import { computePrayerTimes, schedulePrayerNotifications, PrayerTimeResult } from '@/services/prayerTimes';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';
import { todayISO, timeNow } from '@/utils/calculations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export const usePrayerTimes = () => {
  const { settings, setRemindersEnabled, updateLocation, incrementMissed, addLog } = useAppContext();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeResult[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptPrayer, setPromptPrayer] = useState<PrayerName | null>(null);

  useEffect(() => {
    if (!settings) return;

    const ensurePermissions = async () => {
      if (!settings.remindersEnabled) return;
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const ask = await Notifications.requestPermissionsAsync();
        if (ask.status !== 'granted') {
          setRemindersEnabled(false);
        }
      }
    };

    ensurePermissions();
  }, [settings?.remindersEnabled]);

  useEffect(() => {
    if (!settings) return;

    const fetchLocationAndSchedule = async () => {
      try {
        setLoadingLocation(true);
        let coords = settings.location as Coordinates | null;

        if (!coords) {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== Location.PermissionStatus.GRANTED) {
            const request = await Location.requestForegroundPermissionsAsync();
            if (request.status !== Location.PermissionStatus.GRANTED) {
              setError('location-permission');
              setLoadingLocation(false);
              return;
            }
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          await updateLocation(coords);
        }

        if (!coords) {
          setError('no-location');
          setLoadingLocation(false);
          return;
        }

        const today = dayjs().toDate();
        const times = computePrayerTimes(today, coords);
        setPrayerTimes(times);
        if (settings.remindersEnabled) {
          await schedulePrayerNotifications(times, settings.language);
        }
      } catch (err) {
        console.error('Prayer time error', err);
        setError('unknown');
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocationAndSchedule();
  }, [settings?.language, settings?.remindersEnabled, settings?.location]);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const prayer = notification.request.content.data?.prayer as PrayerName | undefined;
      if (prayer) {
        setPromptPrayer(prayer);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const prayer = response.notification.request.content.data?.prayer as PrayerName | undefined;
      if (prayer) {
        setPromptPrayer(prayer);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const markMissed = async (prayer: PrayerName) => {
    await incrementMissed(prayer, 1);
    setPromptPrayer(null);
  };

  const logQadhaPrayer = async (prayer: PrayerName, count: number) => {
    if (count <= 0) {
      setPromptPrayer(null);
      return;
    }
    await addLog({
      prayer,
      type: 'qadha',
      count,
      date: todayISO(),
      loggedAt: timeNow()
    });
    setPromptPrayer(null);
  };

  return { prayerTimes, loadingLocation, error, promptPrayer, setPromptPrayer, markMissed, logQadhaPrayer };
};
