import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PRAYER_ORDER } from '@/constants/prayer';

const PrayerTimesScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { prayerTimes, loadingLocation, error, locationDetails, nextPrayer } = usePrayerTimes();

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
            <View className="flex-row items-center justify-center py-6">
              <ActivityIndicator color="#7a8b71" />
              <Body className="ml-3 text-olive/80">{t('prayerTimes.loading')}</Body>
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
                  className={`mb-3 rounded-2xl px-4 py-3 ${
                    isNext ? 'bg-teal/10 border border-teal/30' : 'bg-white/40'
                  }`}
                >
                  <Body className={`text-lg font-semibold ${isNext ? 'text-teal' : 'text-teal/90'}`}>
                    {t(`prayers.${prayer}`)}
                  </Body>
                  <Body className="text-olive/80">{dayjs(entry.time).format('h:mm A')}</Body>
                  {isNext && (
                    <Body className="mt-1 text-xs uppercase tracking-wide text-teal/70">
                      {t('prayerTimes.upNext')}
                    </Body>
                  )}
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
