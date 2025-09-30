import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { I18nManager, StatusBar } from 'react-native';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import '@/i18n/config';
import i18n from '@/i18n/config';

const SyncLanguage: React.FC = () => {
  const { settings } = useAppContext();

  useEffect(() => {
    if (!settings) return;
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
    // Enable RTL support without forcing restart
    const shouldUseRTL = settings.language === 'ar';
    I18nManager.allowRTL(true);
    // Don't use forceRTL as it requires restart - we'll handle RTL in components
  }, [settings?.language]);

  useEffect(() => {
    if (!settings) return;
    if (settings.theme === 'dark') {
      StatusBar.setBarStyle('light-content');
    } else if (settings.theme === 'light') {
      StatusBar.setBarStyle('dark-content');
    } else {
      StatusBar.setBarStyle('default');
    }
  }, [settings?.theme]);

  return null;
};

const RootLayoutInner: React.FC = () => {
  const { settings, loading } = useAppContext();
  if (loading) {
    return null;
  }
  return <Slot />;
};

const RootLayout: React.FC = () => (
  <AppProvider>
    <SyncLanguage />
    <RootLayoutInner />
  </AppProvider>
);

export default RootLayout;
