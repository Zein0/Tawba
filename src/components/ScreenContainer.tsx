import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';
import { useRTL } from '@/hooks/useRTL';

interface ScreenContainerProps {
  children: React.ReactNode;
  padded?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, padded = true }) => {
  const { settings } = useAppContext();
  const isDark = settings?.theme === 'dark';
  const { writingDirection } = useRTL();

  return (
    <SafeAreaView
      className={clsx('flex-1', isDark ? 'bg-dusk' : 'bg-sand')}
      style={{ writingDirection }}
    >
      <LinearGradient
        colors={isDark ? ['#0f1416', '#1b1f24'] : ['#f8f4ec', '#e6dfd2']}
        style={{ flex: 1 }}
      >
        <View
          className={clsx('flex-1', padded && 'px-5 py-4')}
          style={{ writingDirection }}
        >
          {children}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
