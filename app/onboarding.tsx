import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TextInput, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import clsx from 'clsx';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { PRAYER_ORDER } from '@/constants/prayer';
import { useAppContext } from '@/contexts/AppContext';
import { calculateInitialEstimate } from '@/utils/calculations';
import { PrayerName } from '@/types';
import { todayISO } from '@/utils/calculations';
import { useRouter } from 'expo-router';

const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding, updateLocation, settings } = useAppContext();
  const [years, setYears] = useState('0');
  const [counts, setCounts] = useState<Record<PrayerName, string>>({
    fajr: '0',
    dhuhr: '0',
    asr: '0',
    maghrib: '0',
    isha: '0'
  });
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (hasAdjusted) return;
    const numericYears = Number(years);
    if (Number.isNaN(numericYears) || numericYears < 0) return;
    const perPrayer = Math.round(numericYears * 365);
    setCounts({
      fajr: String(perPrayer),
      dhuhr: String(perPrayer),
      asr: String(perPrayer),
      maghrib: String(perPrayer),
      isha: String(perPrayer)
    });
  }, [years, hasAdjusted]);

  const totalEstimate = useMemo(() => calculateInitialEstimate(Number(years)), [years]);

  const handleCountChange = (prayer: PrayerName, value: string) => {
    setHasAdjusted(true);
    setCounts((prev) => ({ ...prev, [prayer]: value }));
  };

  const resetAdjustments = () => {
    setHasAdjusted(false);
    const numericYears = Number(years);
    const perPrayer = Math.round(numericYears * 365);
    setCounts({
      fajr: String(perPrayer),
      dhuhr: String(perPrayer),
      asr: String(perPrayer),
      maghrib: String(perPrayer),
      isha: String(perPrayer)
    });
  };

  const requestLocation = async () => {
    try {
      setLoadingLocation(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      await updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleContinue = async () => {
    const estimates = PRAYER_ORDER.map((prayer) => ({
      prayer,
      initialCount: Math.max(parseInt(counts[prayer], 10) || 0, 0)
    }));
    await completeOnboarding({
      startDate: todayISO(),
      estimates
    });
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card>
          <Heading className="mb-2 text-3xl">{t('onboarding.title')}</Heading>
          <Body className="mb-6">{t('onboarding.subtitle')}</Body>

          <View className="mb-6">
            <Text className="mb-2 text-teal/70">{t('onboarding.yearsLabel')}</Text>
            <TextInput
              keyboardType="numeric"
              value={years}
              onChangeText={setYears}
              className={clsx(
                'rounded-2xl border border-olive/40 px-4 py-3 text-teal text-lg',
                settings?.theme === 'dark' && 'border-white/20 text-white'
              )}
            />
            <Body className="mt-3">
              {t('onboarding.calculate', { count: totalEstimate.toLocaleString() })}
            </Body>
          </View>

          <Body className="mb-4">{t('onboarding.adjust')}</Body>

          {PRAYER_ORDER.map((prayer) => (
            <View key={prayer} className="mb-3">
              <Text className="mb-1 text-teal/70">{t(`prayers.${prayer}`)}</Text>
              <TextInput
                keyboardType="numeric"
                value={counts[prayer]}
                onChangeText={(value) => handleCountChange(prayer, value)}
                className={clsx(
                  'rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                  settings?.theme === 'dark' && 'border-white/20 text-white'
                )}
              />
            </View>
          ))}

          <View className="mb-2">
            <Body>{t('onboarding.acquiringLocation')}</Body>
            <Body className="mt-1 text-olive/70">{t('onboarding.locationPermission')}</Body>
          </View>

          <View className="flex-row justify-end items-center mb-8">
            <Button title={loadingLocation ? '...' : t('settings.updateLocation')} variant="secondary" onPress={requestLocation} />
          </View>

          <Button title={t('onboarding.continue')} onPress={handleContinue} />
          {hasAdjusted && (
            <View className="mt-3">
              <Button title={t('onboarding.reset')} variant="secondary" onPress={resetAdjustments} />
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default OnboardingScreen;
