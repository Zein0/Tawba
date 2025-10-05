import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useRTL } from '@/hooks/useRTL';

const TabLayout: React.FC = () => {
  const { t } = useTranslation();
  const rtl = useRTL();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7a8b71',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          height: Platform.OS === 'ios' ? 82 : 72,
          paddingBottom: Platform.OS === 'ios' ? 20 : 20,
          paddingTop: Platform.OS === 'ios' ? 12 : 12,
          flexDirection: rtl.isRTL ? 'row-reverse' : 'row',
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
      <Tabs.Screen name="home" options={{ title: t('dashboard.home') }} />
      <Tabs.Screen name="prayer-times" options={{ title: t('prayerTimes.shortTitle') }} />
      <Tabs.Screen name="logs" options={{ title: t('logs.title') }} />
      <Tabs.Screen name="progress" options={{ title: t('progress.title') }} />
      <Tabs.Screen name="settings" options={{ title: t('settings.title') }} />
    </Tabs>
  );
};

export default TabLayout;
