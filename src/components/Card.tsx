import React from 'react';
import { View, ViewProps } from 'react-native';
import clsx from 'clsx';

export const Card: React.FC<ViewProps> = ({ style, className, children, ...rest }) => {
  return (
    <View
      {...rest}
      style={style}
      className={clsx(
        'rounded-3xl p-5 mb-4 shadow-sm bg-white/80',
        className
      )}
    >
      {children}
    </View>
  );
};
