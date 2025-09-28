import React from 'react';
import { Text, TextProps } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';

export const Heading: React.FC<TextProps> = ({ children, className, ...rest }) => {
  const { settings } = useAppContext();
  return (
    <Text
      {...rest}
      className={clsx(
        'font-semibold text-2xl text-teal',
        settings?.theme === 'dark' && 'text-white',
        className
      )}
    >
      {children}
    </Text>
  );
};

export const Body: React.FC<TextProps> = ({ children, className, ...rest }) => {
  const { settings } = useAppContext();
  return (
    <Text
      {...rest}
      className={clsx(
        'text-base text-teal/80',
        settings?.theme === 'dark' && 'text-white/80',
        settings?.fontSize === 'small' && 'text-sm',
        settings?.fontSize === 'large' && 'text-lg',
        className
      )}
    >
      {children}
    </Text>
  );
};
