import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import clsx from 'clsx';

interface ScreenContainerProps {
  children: React.ReactNode;
  padded?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, padded = true }) => {
  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#f8f4ec', '#e6dfd2']}
        style={{ flex: 1 }}
      >
        <View className={clsx('flex-1', padded && 'px-5 py-4')}>{children}</View>
      </LinearGradient>
    </SafeAreaView>
  );
};
