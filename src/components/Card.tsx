import React from 'react';
import { View, ViewProps } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';

export const Card: React.FC<ViewProps> = ({ style, className, children, ...rest }) => {
  const { settings } = useAppContext();
  const isDark = settings?.theme === 'dark';

  return (
    <View
      {...rest}
      style={style}
      className={clsx(
        'rounded-3xl p-5 mb-4 shadow-sm',
        isDark ? 'bg-[#20262c]' : 'bg-white/80',
        className
      )}
    >
      {children}
    </View>
  );
};
