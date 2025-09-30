import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

export const useRTL = () => {
  const { settings } = useAppContext();
  const preferred = settings?.language ? settings.language === 'ar' : undefined;
  const isRTL = preferred ?? I18nManager.isRTL;

  return useMemo(
    () => ({
      isRTL,
      writingDirection: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left'
    }),
    [isRTL]
  );
};
