import React, { useEffect, useState } from 'react';
import { Alert, View, Switch, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import clsx from 'clsx';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { useAppContext } from '@/contexts/AppContext';
import { useRTL } from '@/hooks/useRTL';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    setLanguage,
    setFontSize,
    setTheme,
    setRemindersEnabled,
    updateLocation,
    resetApp
  } = useAppContext();
  const rtl = useRTL();
  const [locLoading, setLocLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const router = useRouter();

  const handleLanguage = async (language: 'en' | 'ar') => {
    await setLanguage(language);
  };

  const handleFontSize = async (size: 'small' | 'medium' | 'large') => {
    await setFontSize(size);
  };

  const handleTheme = async (theme: 'light' | 'dark' | 'system') => {
    await setTheme(theme);
  };

  const handleReminders = async (enabled: boolean) => {
    await setRemindersEnabled(enabled);
  };

  const refreshLocation = async () => {
    try {
      setLocLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const lookup = async () => {
      if (!settings?.location) {
        setLocationLabel(null);
        return;
      }
      setResolvingLocation(true);
      try {
        const [place] = await Location.reverseGeocodeAsync(settings.location);
        if (!cancelled) {
          const city = place?.city || place?.name || place?.subregion || place?.region;
          const country = place?.country;
          const formatted = city && country ? `${city}, ${country}` : country ?? city;
          setLocationLabel(
            formatted ?? `${settings.location.latitude.toFixed(3)}, ${settings.location.longitude.toFixed(3)}`
          );
        }
      } catch {
        if (!cancelled) {
          setLocationLabel(`${settings.location.latitude.toFixed(3)}, ${settings.location.longitude.toFixed(3)}`);
        }
      } finally {
        if (!cancelled) {
          setResolvingLocation(false);
        }
      }
    };
    lookup();
    return () => {
      cancelled = true;
    };
  }, [settings?.location?.latitude, settings?.location?.longitude]);

  const handleReset = () => {
    Alert.alert(t('settings.resetTitle'), t('settings.resetMessage'), [
      { text: t('settings.resetCancel'), style: 'cancel' },
      {
        text: t('settings.resetConfirm'),
        style: 'destructive',
        onPress: async () => {
          await resetApp();
          router.replace('/onboarding');
        }
      }
    ]);
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Heading className="mb-4">{t('settings.title')}</Heading>

        <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.language')}</Body>
          <View className={clsx("gap-3", rtl.flexDirection)}>
            <View className="flex-1">
              <Button
                title={t('settings.english')}
                variant={settings?.language === 'en' ? 'primary' : 'secondary'}
                onPress={() => handleLanguage('en')}
              />
            </View>
            <View className="flex-1">
              <Button
                title={t('settings.arabic')}
                variant={settings?.language === 'ar' ? 'primary' : 'secondary'}
                onPress={() => handleLanguage('ar')}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.fontSize')}</Body>
          <View className={clsx("gap-3", rtl.flexDirection)}>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <View className="flex-1" key={size}>
                <Button
                  title={t(`settings.${size}`)}
                  variant={settings?.fontSize === size ? 'primary' : 'secondary'}
                  onPress={() => handleFontSize(size)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.theme')}</Body>
          <View className="flex-row gap-3">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <View className="flex-1" key={theme}>
                <Button
                  title={t(`settings.${theme}`)}
                  variant={settings?.theme === theme ? 'primary' : 'secondary'}
                  onPress={() => handleTheme(theme)}
                />
              </View>
            ))}
          </View>
        </View> */}

        <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.reminders')}</Body>
          <View className={clsx("items-center justify-between rounded-2xl bg-olive/10 px-4 py-4", rtl.flexDirection)}>
            <Body>{t('settings.enableReminders')}</Body>
            <Switch
              value={settings?.remindersEnabled}
              onValueChange={handleReminders}
              thumbColor={settings?.remindersEnabled ? '#7a8b71' : '#e5e7eb'}
            />
          </View>
        </View>

        <View className="mb-4">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.location')}</Body>
          <View className="rounded-2xl bg-olive/10 px-4 py-4">
            <Body className="mb-3">{t('settings.updateLocation')}</Body>
            <Button title={locLoading ? '...' : t('settings.updateLocation')} onPress={refreshLocation} />
            {settings?.location && (
              <Text className="mt-2 text-olive/70">
                {resolvingLocation
                  ? t('settings.resolvingLocation')
                  : locationLabel ??
                    `${settings.location.latitude.toFixed(3)}, ${settings.location.longitude.toFixed(3)}`}
              </Text>
            )}
          </View>
        </View>

          <View className="rounded-2xl bg-red-50 px-4 py-5">
            <Heading className="mb-2 text-lg text-red-600">{t('settings.resetDataTitle')}</Heading>
            <Body className="mb-4 text-red-500">{t('settings.resetDataDescription')}</Body>
            <Button title={t('settings.resetButton')} variant="secondary" onPress={handleReset} />
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default SettingsScreen;
