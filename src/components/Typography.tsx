import React from 'react';
import { Text, TextProps } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';
import { useRTL } from '@/hooks/useRTL';

export const Heading: React.FC<TextProps> = ({ children, className, ...rest }) => {
  const rtl = useRTL();
  return (
    <Text
      {...rest}
      className={clsx(
        'font-semibold text-2xl text-teal',
        rtl.textAlign,
        className
      )}
    >
      {children}
    </Text>
  );
};

export const Body: React.FC<TextProps> = ({ children, className, ...rest }) => {
  const { settings } = useAppContext();
  const rtl = useRTL();
  return (
    <Text
      {...rest}
      className={clsx(
        'text-base text-teal/80',
        settings?.fontSize === 'small' && 'text-sm',
        settings?.fontSize === 'large' && 'text-lg',
        rtl.textAlign,
        className
      )}
    >
      {children}
    </Text>
  );
};
