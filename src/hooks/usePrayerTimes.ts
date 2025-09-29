import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { Coordinates } from 'adhan';
import { computePrayerTimes, schedulePrayerNotifications, PrayerTimeResult } from '@/services/prayerTimes';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';
import { todayISO, timeNow } from '@/utils/calculations';

interface LocationDetails {
  city: string | null;
  country: string | null;
  formatted: string | null;
}

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
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);

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
              setLocationDetails(null);
              setLoadingLocation(false);
              return;
            }
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          await updateLocation(coords);
        }

        if (!coords) {
          setLocationDetails(null);
          setError('no-location');
          setLoadingLocation(false);
          return;
        }

        setError(null);

        const today = dayjs().toDate();
        const times = computePrayerTimes(today, coords);
        setPrayerTimes(times);

        try {
          const [place] = await Location.reverseGeocodeAsync(coords);
          const city = place?.city || place?.name || place?.subregion || place?.region || null;
          const country = place?.country || null;
          const formatted = city && country ? `${city}, ${country}` : country ?? city;
          setLocationDetails({ city, country, formatted });
        } catch {
          setLocationDetails({
            city: null,
            country: null,
            formatted: `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`
          });
        }

        if (settings.remindersEnabled) {
          await schedulePrayerNotifications(times, settings.language);
        }
      } catch (err) {
        console.error('Prayer time error', err);
        setError('unknown');
        setLocationDetails(null);
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

  const logCurrentPrayer = async (prayer: PrayerName) => {
    await addLog({
      prayer,
      type: 'current',
      count: 1,
      date: todayISO(),
      loggedAt: timeNow()
    });
    setPromptPrayer(null);
  };

  const nextPrayer = useMemo(() => {
    const now = dayjs();
    const upcomingToday = prayerTimes.find((pt) => dayjs(pt.time).isAfter(now));
    if (upcomingToday) {
      return upcomingToday;
    }

    if (prayerTimes.length === 0) {
      return null;
    }

    if (!settings?.location) {
      const firstPrayer = prayerTimes[0];
      return {
        ...firstPrayer,
        time: dayjs(firstPrayer.time).add(1, 'day').toDate()
      };
    }

    const tomorrow = dayjs().add(1, 'day').toDate();
    const tomorrowTimes = computePrayerTimes(tomorrow, settings.location);
    return tomorrowTimes[0] ?? null;
  }, [prayerTimes, settings?.location]);

  return {
    prayerTimes,
    loadingLocation,
    error,
    promptPrayer,
    setPromptPrayer,
    markMissed,
    logQadhaPrayer,
    logCurrentPrayer,
    locationDetails,
    nextPrayer
  };
};
