import React from 'react';
import { View } from 'react-native';
import clsx from 'clsx';

interface ProgressBarProps {
  progress: number; // 0-1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <View className="h-2 w-full bg-olive/20 rounded-full overflow-hidden">
      <View className={clsx('h-full rounded-full bg-olive')} style={{ width: `${Math.min(progress, 1) * 100}%` }} />
    </View>
  );
};
