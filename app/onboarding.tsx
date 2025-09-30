import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
import { Picker } from '@react-native-picker/picker';
import { useRTL } from '@/hooks/useRTL';

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
  const rtl = useRTL();

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
            <View
              className={clsx(
                'rounded-full border px-1 py-1 w-[fit-content] mb-2',
                rtl.flexDirection,
                rtl.selfEnd,
                isDark ? 'border-white/15 bg-white/10' : 'border-olive/20 bg-white/80'
              )}
            >
              {languageOptions.map((option) => {
                const active = (settings?.language ?? i18n.language) === option.code;
                return (
                  <Pressable
                    key={option.code}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => handleLanguageSelect(option.code)}
                    className={clsx(
                      'rounded-full px-3 py-1.5 w-max',
                      active ? (isDark ? 'bg-teal' : 'bg-olive') : 'bg-transparent'
                    )}
                  >
                    <Text
                      className={clsx(
                        'text-xs font-semibold uppercase tracking-wide',
                        active ? 'text-white' : isDark ? 'text-white/70' : 'text-olive/70'
                      )}
                    >
                      {option.code.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          <View className={clsx("mb-6 items-start justify-between", rtl.flexDirection)}>
            <View className={clsx("flex-1", rtl.pr("4"))}>
              <Heading className={clsx("text-3xl", rtl.textAlign)}>{t('onboarding.title')}</Heading>
              <Body className={clsx("mt-2 text-olive/70 dark:text-white/70", rtl.textAlign)}>{t('onboarding.subtitle')}</Body>
            </View>
          </View>

          <View className={clsx("mb-6 items-center justify-between gap-4", rtl.flexDirection)}>
            <Text className={clsx("text-xs uppercase tracking-[2px] text-olive/60 dark:text-white/60", rtl.textAlign)}>
              {t('onboarding.stepLabel', { current: stepIndex, total: totalSteps })}
            </Text>
            <View className={clsx("flex-1 gap-1.5", rtl.flexDirection)}>
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

          {step === 'duration' ? (
            <>
              <View className="mb-5 rounded-3xl border border-olive/20 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
                <Text className="text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70">
                  {t('onboarding.durationLabel')}
                </Text>
                <View className={clsx("mt-3 items-center gap-3", rtl.flexDirection)}>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={durationValue}
                    onChangeText={setDurationValue}
                    placeholder="0"
                    placeholderTextColor={isDark ? '#6b7280' : '#94a3b8'}
                    style={rtl.textInputStyle}
                    className={clsx(
                      'flex-0 rounded-2xl border border-olive/30 px-4 py-3 text-lg font-semibold text-teal',
                      isDark && 'border-white/20 bg-transparent text-white'
                    )}
                  />
                  <View
                    className={clsx(
                      'flex-1 rounded-2xl border border-olive/30',
                      isDark ? 'border-white/20 bg-white/5' : 'border-olive/30 bg-white'
                    )}
                  >
                    <Picker
                      selectedValue={durationUnit}
                      onValueChange={(value) => setDurationUnit(value as DurationUnit)}
                      style={{
                        height: Platform.OS === 'ios' ? 120 : 50,
                        color: isDark ? 'text-white' : 'text-olive',
                      }}
                      itemStyle={Platform.OS === 'ios' ? {
                        height: 120,
                        fontSize: 16,
                        fontWeight: '600',
                        color: isDark ? '#ffffff' : '#7a8b71',
                      } : {
                        color: isDark ? 'text-white' : 'text-olive',
                        fontSize: 16,
                        fontWeight: '600'
                      }}
                    >
                      {(['days', 'months', 'years'] as DurationUnit[]).map((unit) => (
                        <Picker.Item
                          key={unit}
                          label={t(`onboarding.unit${unit.charAt(0).toUpperCase() + unit.slice(1)}`)}
                          value={unit}
                          color={isDark ? '#ffffff' : '#7a8b71'}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                <Body className="mt-3 text-sm text-olive/70 dark:text-white/60">
                  {t('onboarding.durationHint')}
                </Body>
              </View>

              <View className="mb-6 rounded-3xl border border-olive/20 bg-olive/10 p-4 dark:border-white/10 dark:bg-white/10">
                <Text className="text-sm font-medium text-olive dark:text-white">
                  {t('onboarding.calculate', { total: totalEstimate.toLocaleString() })}
                </Text>
              </View>

              <Button title={t('onboarding.next')} onPress={handleNext} />
            </>
          ) : (
            <>
              <Body className="mb-4 text-olive/70 dark:text-white/70">{t('onboarding.adjust')}</Body>

              {PRAYER_ORDER.map((prayer) => (
                <View
                  key={prayer}
                  className={clsx(
                    "mb-3 items-center justify-between rounded-3xl border border-olive/20 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5",
                    rtl.flexDirection
                  )}
                >
                  <Text className={clsx("text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70", rtl.textAlign)}>
                    {t(`prayers.${prayer}`)}
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={counts[prayer]}
                    onChangeText={(value) => handleCountChange(prayer, value)}
                    style={rtl.textInputStyle}
                    className={clsx(
                      'w-20 rounded-2xl border border-olive/30 px-3 py-2 text-teal',
                      rtl.ml("3"),
                      isDark && 'border-white/20 bg-transparent text-white'
                    )}
                  />
                </View>
              ))}

              <View className="mt-2 rounded-3xl border border-olive/20 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                <View className={clsx("items-center justify-between", rtl.flexDirection)}>
                  <Text className={clsx("text-sm font-semibold uppercase tracking-wide text-olive/70 dark:text-white/70", rtl.textAlign)}>
                    {t('onboarding.locationReady')}
                  </Text>
                  {(loadingLocation || resolvingAddress) && (
                    <ActivityIndicator size="small" color={isDark ? '#ffffff' : '#0f766e'} />
                  )}
                </View>
                <Text
                  className={clsx(
                    'mt-3 text-sm',
                    locationError ? 'text-rose-500' : isDark ? 'text-white' : 'text-teal'
                  )}
                  numberOfLines={2}
                >
                  {currentLocationText}
                </Text>
                <View className={clsx("mt-4", rtl.flexDirection, rtl.justifyEnd)}>
                  <Button
                    title={loadingLocation ? '…' : t('settings.updateLocation')}
                    variant="secondary"
                    size="compact"
                    fullWidth={false}
                    onPress={requestLocation}
                  />
                </View>
              </View>

              <View className="mt-6 space-y-3">
                <Button title={t('onboarding.continue')} onPress={handleContinue} />
                <Button style={{ marginTop: 12 }} title={t('forms.back')} variant="secondary" onPress={handleBack} />
                {hasAdjusted && (
                  <Button style={{ marginTop: 12 }} title={t('onboarding.reset')} variant="secondary" onPress={resetAdjustments} />
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
