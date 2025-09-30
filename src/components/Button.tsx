import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';
import { useRTL } from '@/hooks/useRTL';

type ButtonSize = 'default' | 'compact';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: ViewStyle;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  style,
  className
}) => {
  const { settings } = useAppContext();
  const isDark = settings?.theme === 'dark';
  const { writingDirection } = useRTL();

  const containerClasses = clsx(
    'rounded-2xl items-center justify-center shadow-sm',
    fullWidth ? 'w-full' : 'self-auto',
    size === 'compact' ? 'px-4 py-2.5' : 'px-4 py-3',
    variant === 'primary'
      ? isDark
        ? 'bg-teal'
        : 'bg-olive'
      : isDark
      ? 'bg-dusk border border-teal'
      : 'bg-sand border border-olive/40',
    className
  );

  const textSizeClass = (() => {
    if (size === 'compact') {
      switch (settings?.fontSize) {
        case 'small':
          return 'text-xs';
        case 'large':
          return 'text-base';
        default:
          return 'text-sm';
      }
    }

    switch (settings?.fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  })();

  return (
    <Pressable onPress={onPress} className={containerClasses} style={style}>
      <Text
        className={clsx(
          'font-semibold',
          textSizeClass,
          variant === 'primary' ? 'text-white' : isDark ? 'text-white' : 'text-teal'
        )}
        style={{ writingDirection }}
      >
        {title}
      </Text>
    </Pressable>
  );
};
