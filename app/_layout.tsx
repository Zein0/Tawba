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
    const shouldUseRTL = settings.language === 'ar';
    if (I18nManager.isRTL !== shouldUseRTL) {
      I18nManager.allowRTL(shouldUseRTL);
      I18nManager.forceRTL(shouldUseRTL);
    }
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
