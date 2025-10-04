import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { I18nManager, StatusBar } from 'react-native';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import '@/i18n/config';
import i18n from '@/i18n/config';
import { checkAppVersion } from '@/utils/appVersion';

const SyncLanguage: React.FC = () => {
  const { settings } = useAppContext();

  useEffect(() => {
    if (!settings) return;

    // Sync i18n language
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }

    // Enable RTL support globally
    const shouldUseRTL = settings.language === 'ar';
    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(true);

    // Force RTL direction based on language
    if (I18nManager.isRTL !== shouldUseRTL) {
      I18nManager.forceRTL(shouldUseRTL);
    }
  }, [settings?.language]);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  return null;
};

const RootLayoutInner: React.FC = () => {
  const { settings, loading } = useAppContext();

  useEffect(() => {
    if (!loading) {
      checkAppVersion();
    }
  }, [loading]);

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
