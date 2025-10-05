import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { I18nManager, StatusBar } from 'react-native';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import '@/i18n/config';
import i18n from '@/i18n/config';
import { checkAppVersion } from '@/utils/appVersion';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const SyncLanguage: React.FC = () => {
  const { settings } = useAppContext();

  useEffect(() => {
    if (!settings) return;

    // Sync i18n language with saved setting
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }

    // Enable RTL support globally (always allow RTL)
    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(true);

    // Set RTL direction based on language
    const shouldBeRTL = settings.language === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, [settings?.language]);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  return null;
};

const RootLayoutInner: React.FC = () => {
  const { settings, loading } = useAppContext();
  const [splashReady, setSplashReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkAppVersion();

      // Show splash for 2 seconds before hiding
      const timer = setTimeout(async () => {
        setSplashReady(true);
        await SplashScreen.hideAsync();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !splashReady) {
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
