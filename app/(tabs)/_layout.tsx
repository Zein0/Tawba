import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext';
import { useRTL } from '@/hooks/useRTL';

const TabLayout: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const rtl = useRTL();
  const isDark = settings?.theme === 'dark';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7a8b71',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#101418' : '#ffffff',
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 12,
          paddingTop: 12,
          flexDirection: rtl.isRTL ? 'row-reverse' : 'row'
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'home':
              return <Ionicons name="home" color={color} size={size} />;
            case 'prayer-times':
              return <Ionicons name="time" color={color} size={size} />;
            case 'logs':
              return <Ionicons name="book" color={color} size={size} />;
            case 'progress':
              return <Ionicons name="stats-chart" color={color} size={size} />;
            case 'settings':
              return <Ionicons name="settings" color={color} size={size} />;
            default:
              return null;
          }
        }
      })}
    >
      <Tabs.Screen name="home" options={{ title: t('dashboard.greeting') }} />
      <Tabs.Screen name="prayer-times" options={{ title: t('prayerTimes.shortTitle') }} />
      <Tabs.Screen name="logs" options={{ title: t('logs.title') }} />
      <Tabs.Screen name="progress" options={{ title: t('progress.title') }} />
      <Tabs.Screen name="settings" options={{ title: t('settings.title') }} />
    </Tabs>
  );
};

export default TabLayout;
