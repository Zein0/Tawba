import React, { useState } from 'react';
import { View, Switch, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { useAppContext } from '@/contexts/AppContext';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { settings, setLanguage, setFontSize, setTheme, setRemindersEnabled, updateLocation } = useAppContext();
  const [locLoading, setLocLoading] = useState(false);

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

  return (
    <ScreenContainer>
      <Card>
        <Heading className="mb-4">{t('settings.title')}</Heading>

        <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.language')}</Body>
          <View className="flex-row gap-3">
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
          <View className="flex-row gap-3">
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

        <View className="mb-6">
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
        </View>

        <View className="mb-6">
          <Body className="mb-2 uppercase text-xs tracking-wide text-olive/70">{t('settings.reminders')}</Body>
          <View className="flex-row items-center justify-between rounded-2xl bg-olive/10 px-4 py-4">
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
                {settings.location.latitude.toFixed(3)}, {settings.location.longitude.toFixed(3)}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </ScreenContainer>
  );
};

export default SettingsScreen;
