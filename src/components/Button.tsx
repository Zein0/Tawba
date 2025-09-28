import React from 'react';
import { Pressable, Text } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  const { settings } = useAppContext();
  const isDark = settings?.theme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'w-full rounded-2xl py-3 items-center justify-center shadow-sm',
        variant === 'primary'
          ? isDark
            ? 'bg-teal'
            : 'bg-olive'
          : isDark
          ? 'bg-dusk border border-teal'
          : 'bg-sand border border-olive/40'
      )}
    >
      <Text
        className={clsx(
          'font-semibold',
          settings?.fontSize === 'small' && 'text-sm',
          settings?.fontSize === 'medium' && 'text-base',
          settings?.fontSize === 'large' && 'text-lg',
          variant === 'primary' ? 'text-white' : isDark ? 'text-white' : 'text-teal'
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
};
