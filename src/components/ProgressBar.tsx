import React from 'react';
import { View } from 'react-native';
import clsx from 'clsx';
import { useRTL } from '@/hooks/useRTL';

interface ProgressBarProps {
  progress: number; // 0-1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const rtl = useRTL();
  const progressPercent = Math.min(progress, 1) * 100;
  
  return (
    <View className="h-2 w-full bg-olive/20 rounded-full overflow-hidden">
      <View 
        className={clsx('h-full rounded-full bg-olive')} 
        style={{ 
          width: `${progressPercent}%`,
          marginLeft: rtl.isRTL ? 'auto' : 0,
          marginRight: rtl.isRTL ? 0 : 'auto'
        }} 
      />
    </View>
  );
};
