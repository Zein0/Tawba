import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import clsx from 'clsx';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { PRAYER_ORDER } from '@/constants/prayer';
import { useAppContext } from '@/contexts/AppContext';
import { calculateInitialEstimate, todayISO } from '@/utils/calculations';
import { PrayerName } from '@/types';
import { useRouter } from 'expo-router';

type DurationUnit = 'days' | 'months' | 'years';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const totalSteps = 2;

const getFallbackLabel = ({ latitude, longitude }: Coordinates) =>
  `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

const OnboardingScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { completeOnboarding, updateLocation, settings, setLanguage } = useAppContext();

  const [step, setStep] = useState<'duration' | 'breakdown'>('duration');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('years');
  const [durationValue, setDurationValue] = useState('1');
  const [counts, setCounts] = useState<Record<PrayerName, string>>({
    fajr: '0',
    dhuhr: '0',
    asr: '0',
    maghrib: '0',
    isha: '0'
  });
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const isDark = settings?.theme === 'dark';

  const durationInYears = useMemo(() => {
    const value = parseFloat(durationValue.replace(',', '.'));
    if (Number.isNaN(value) || value < 0) return 0;
    switch (durationUnit) {
      case 'days':
        return value / 365;
      case 'months':
        return (value * 30) / 365;
      default:
        return value;
    }
  }, [durationValue, durationUnit]);

  const perPrayer = useMemo(() => Math.max(Math.round(durationInYears * 365), 0), [durationInYears]);
  const totalEstimate = useMemo(() => calculateInitialEstimate(durationInYears), [durationInYears]);

  const applyBaseCounts = useCallback(() => {
    const value = String(perPrayer);
    setCounts({
      fajr: value,
      dhuhr: value,
      asr: value,
      maghrib: value,
      isha: value
    });
  }, [perPrayer]);

  useEffect(() => {
    if (!hasAdjusted) {
      applyBaseCounts();
    }
  }, [applyBaseCounts, hasAdjusted]);

  const handleCountChange = (prayer: PrayerName, value: string) => {
    setHasAdjusted(true);
    setCounts((prev) => ({ ...prev, [prayer]: value }));
  };

  const resetAdjustments = () => {
    setHasAdjusted(false);
    applyBaseCounts();
  };

  const handleLanguageSelect = async (language: 'en' | 'ar') => {
    if (settings?.language === language) return;
    await setLanguage(language);
    await i18n.changeLanguage(language);
  };

  const fetchLocationLabel = useCallback(async (coords: Coordinates) => {
    try {
      const geocoded = await Location.reverseGeocodeAsync(coords);
      const place = geocoded[0];
      if (!place) {
        return getFallbackLabel(coords);
      }
      const { name, city, subregion, region, country } = place;
      const parts = [name, city, subregion, region, country].filter(
        (part, index, array) => part && array.indexOf(part) === index
      ) as string[];
      return parts.length > 0 ? parts.join(', ') : getFallbackLabel(coords);
    } catch {
      return getFallbackLabel(coords);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const lookup = async () => {
      const coords = settings?.location;
      if (!coords) {
        setLocationLabel(null);
        setResolvingAddress(false);
        return;
      }
      setResolvingAddress(true);
      try {
        const label = await fetchLocationLabel(coords);
        if (!isCancelled) {
          setLocationLabel(label);
          setLocationError(null);
        }
      } finally {
        if (!isCancelled) {
          setResolvingAddress(false);
        }
      }
    };
    lookup();
    return () => {
      isCancelled = true;
    };
  }, [settings?.location?.latitude, settings?.location?.longitude, fetchLocationLabel]);

  const requestLocation = async () => {
    try {
      setLoadingLocation(true);
      setResolvingAddress(true);
      setLocationError(null);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationError(t('onboarding.locationDenied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      const coords: Coordinates = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      };
      await updateLocation(coords);
      const label = await fetchLocationLabel(coords);
      setLocationLabel(label);
    } catch (error) {
      setLocationError(t('onboarding.locationError'));
    } finally {
      setLoadingLocation(false);
      setResolvingAddress(false);
    }
  };

  const handleNext = () => {
    setStep('breakdown');
  };

  const handleBack = () => {
    setStep('duration');
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

  const stepIndex = step === 'duration' ? 1 : 2;
  const languageOptions: Array<{ code: 'en' | 'ar'; label: string }> = [
    { code: 'en', label: t('settings.english') },
    { code: 'ar', label: t('settings.arabic') }
  ];

  const currentLocationText = locationError
    ? locationError
    : loadingLocation || resolvingAddress
    ? t('onboarding.acquiringLocation')
    : locationLabel
    ? locationLabel
    : t('onboarding.locationUnknown');

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View className="mb-6 rounded-3xl border border-olive/20 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <Text className="text-xs uppercase tracking-[2px] text-olive/70 dark:text-white/60">
              {t('onboarding.languagePrompt')}
            </Text>
            <View className="mt-3 flex-row gap-3">
              {languageOptions.map((option) => {
                const isActive = settings?.language === option.code;
                return (
                  <Pressable
                    key={option.code}
                    onPress={() => handleLanguageSelect(option.code)}
                    className={clsx(
                      'flex-1 rounded-2xl px-4 py-3 items-center justify-center border',
                      isActive
                        ? 'border-teal bg-teal'
                        : isDark
                        ? 'border-white/20 bg-transparent'
                        : 'border-olive/30 bg-transparent'
                    )}
                  >
                    <Text
                      className={clsx(
                        'font-semibold text-sm',
                        isActive ? 'text-white' : isDark ? 'text-white/80' : 'text-teal'
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs uppercase tracking-[2px] text-olive/70 dark:text-white/60">
              {t('onboarding.stepLabel', { current: stepIndex, total: totalSteps })}
            </Text>
            <View className="mt-3 flex-row gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  className={clsx(
                    'h-1 flex-1 rounded-full',
                    index < stepIndex ? 'bg-teal' : 'bg-olive/30 dark:bg-white/20'
                  )}
                />
              ))}
            </View>
          </View>

          <Heading className="mb-2 text-3xl">{t('onboarding.title')}</Heading>
          <Body className="mb-6">{t('onboarding.subtitle')}</Body>

          {step === 'duration' ? (
            <>
              <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70">
                {t('onboarding.durationLabel')}
              </Text>
              <View className="mb-4 rounded-3xl border border-olive/20 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <TextInput
                  keyboardType="decimal-pad"
                  value={durationValue}
                  onChangeText={setDurationValue}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                  className={clsx(
                    'rounded-2xl border border-olive/30 px-4 py-3 text-lg text-teal',
                    isDark && 'border-white/20 text-white bg-transparent'
                  )}
                />
                <Body className="mt-3">{t('onboarding.durationHint')}</Body>
                <View className="mt-4 flex-row gap-3">
                  {(['days', 'months', 'years'] as DurationUnit[]).map((unit) => {
                    const active = durationUnit === unit;
                    return (
                      <Pressable
                        key={unit}
                        onPress={() => setDurationUnit(unit)}
                        className={clsx(
                          'flex-1 rounded-2xl border px-4 py-3 items-center justify-center',
                          active
                            ? 'border-teal bg-teal'
                            : isDark
                            ? 'border-white/20 bg-transparent'
                            : 'border-olive/30 bg-transparent'
                        )}
                      >
                        <Text
                          className={clsx(
                            'font-semibold text-sm',
                            active ? 'text-white' : isDark ? 'text-white/80' : 'text-teal'
                          )}
                        >
                          {t(`onboarding.unit${unit.charAt(0).toUpperCase() + unit.slice(1)}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-8 rounded-3xl border border-olive/20 bg-olive/10 p-4 dark:border-white/10 dark:bg-white/10">
                <Text className="text-sm font-medium text-teal dark:text-white">
                  {t('onboarding.calculate', { count: totalEstimate.toLocaleString() })}
                </Text>
              </View>

              <Button title={t('onboarding.next')} onPress={handleNext} />
            </>
          ) : (
            <>
              <Body className="mb-4">{t('onboarding.adjust')}</Body>

              {PRAYER_ORDER.map((prayer) => (
                <View
                  key={prayer}
                  className="mb-3 rounded-3xl border border-olive/20 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70">
                    {t(`prayers.${prayer}`)}
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={counts[prayer]}
                    onChangeText={(value) => handleCountChange(prayer, value)}
                    className={clsx(
                      'rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                      isDark && 'border-white/20 text-white bg-transparent'
                    )}
                  />
                </View>
              ))}

              <View className="mt-2 rounded-3xl border border-olive/20 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70">
                  {t('onboarding.locationReady')}
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text
                      className={clsx(
                        'text-base',
                        locationError
                          ? 'text-rose-500'
                          : isDark
                          ? 'text-white'
                          : 'text-teal'
                      )}
                    >
                      {currentLocationText}
                    </Text>
                    {!locationError && (
                      <Body className="mt-2 text-olive/70">
                        {t('onboarding.locationPermission')}
                      </Body>
                    )}
                  </View>
                  {(loadingLocation || resolvingAddress) && (
                    <ActivityIndicator color={isDark ? '#fff' : '#0f766e'} />
                  )}
                </View>
                <View className="mt-4">
                  <Button
                    title={loadingLocation ? '…' : t('settings.updateLocation')}
                    variant="secondary"
                    onPress={requestLocation}
                  />
                </View>
              </View>

              <View className="mt-6 space-y-3">
                <Button title={t('onboarding.continue')} onPress={handleContinue} />
                <Button title={t('forms.back')} variant="secondary" onPress={handleBack} />
                {hasAdjusted && (
                  <Button title={t('onboarding.reset')} variant="secondary" onPress={resetAdjustments} />
                )}
              </View>
            </>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default OnboardingScreen;
