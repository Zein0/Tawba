import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PRAYER_ORDER } from '@/constants/prayer';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';
import { useRTL } from '@/hooks/useRTL';

const PRAYER_ICONS: Record<PrayerName, keyof typeof Ionicons.glyphMap> = {
  fajr: 'cloudy-night-outline',
  dhuhr: 'sunny-outline',
  asr: 'partly-sunny-outline',
  maghrib: 'moon-outline',
  isha: 'moon-sharp'
};

const PrayerTimesScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { prayerTimes, loadingLocation, error, locationDetails, nextPrayer, refreshNextPrayer } = usePrayerTimes();
  const { settings } = useAppContext();
  const rtl = useRTL();
  const isDark = settings?.theme === 'dark';

  useFocusEffect(
    React.useCallback(() => {
      refreshNextPrayer();
    }, [refreshNextPrayer])
  );

  return (
    <ScreenContainer>
      <Card>
        <Heading className="mb-2 text-2xl">{t('prayerTimes.title')}</Heading>
        {locationDetails?.formatted ? (
          <Body className="text-olive/80">{t('prayerTimes.location', { location: locationDetails.formatted })}</Body>
        ) : (
          <Body className="text-olive/80">{t('prayerTimes.locationUnknown')}</Body>
        )}

        <View className="my-5 rounded-3xl bg-white/60 p-4 shadow-sm shadow-black/5">
          {loadingLocation ? (
            <View className={clsx("items-center justify-center py-6", rtl.flexDirection)}>
              <ActivityIndicator color="#7a8b71" />
              <Body className={clsx("text-olive/80", rtl.ml("3"))}>{t('prayerTimes.loading')}</Body>
            </View>
          ) : error ? (
            <View className="py-4">
              <Body className="text-red-500">{t(`prayerTimes.errors.${error}`)}</Body>
            </View>
          ) : (
            PRAYER_ORDER.map((prayer) => {
              const entry = prayerTimes.find((item) => item.prayer === prayer);
              if (!entry) return null;
              const isNext = nextPrayer && entry.prayer === nextPrayer.prayer;
              return (
                <View
                  key={prayer}
                  className={clsx(
                    'mb-3 rounded-2xl px-4 py-3',
                    isNext
                      ? 'border border-teal/40 bg-teal/10'
                      : isDark
                      ? 'bg-white/5'
                      : 'bg-white/40'
                  )}
                >
                  <View className={clsx("items-center justify-between", rtl.flexDirection)}>
                    <View className={clsx("items-center gap-3", rtl.flexDirection)}>
                      <View
                        className={clsx(
                          'rounded-2xl p-2',
                          isNext ? 'bg-teal/20' : isDark ? 'bg-white/10' : 'bg-olive/20'
                        )}
                      >
                        <Ionicons
                          name={PRAYER_ICONS[prayer]}
                          size={20}
                          color={isNext ? '#0f766e' : isDark ? '#f8fafc' : '#3f4f43'}
                        />
                      </View>
                      <Body
                        className={clsx(
                          'font-semibold',
                          isNext ? 'text-teal' : 'text-teal/90 dark:text-white'
                        )}
                      >
                        {t(`prayers.${prayer}`)}
                      </Body>
                    </View>
                    <View className="items-end">
                      <Body className="text-lg font-semibold text-teal dark:text-white">
                        {dayjs(entry.time).format('h:mm A')}
                      </Body>
                      {isNext && (
                        <Body className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal">
                          {t('prayerTimes.upNext')}
                        </Body>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Body className="mb-4 text-olive/70">{t('prayerTimes.updateHint')}</Body>
        <Button
          title={t('prayerTimes.manageLocation')}
          variant="secondary"
          onPress={() => router.push('/(tabs)/settings')}
        />
      </Card>
    </ScreenContainer>
  );
};

export default PrayerTimesScreen;
