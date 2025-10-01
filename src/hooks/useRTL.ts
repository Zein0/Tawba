import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

export const useRTL = () => {
  const { settings } = useAppContext();
  const isRTL = settings?.language === 'ar';

  useEffect(() => {
    // Ensure native components honour RTL on both platforms
    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(true);

    // iOS ignores `swapLeftAndRightInRTL` for some primitives unless the
    // interface direction matches the desired layout. We rely on our custom
    // helpers for layout mirroring, so only flip the global layout when the
    // platform already matches the requested direction to avoid forcing a
    // reload.
    if (Platform.OS === 'ios' && I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  }, [isRTL]);

  return {
    isRTL,
    // Direction helpers
    dir: isRTL ? 'rtl' : 'ltr',
    flexDirection: isRTL ? 'flex-row-reverse' : 'flex-row',
    textAlign: isRTL ? 'text-right' : 'text-left',
    
    // Margin/Padding helpers
    ml: (size: string) => isRTL ? `mr-${size}` : `ml-${size}`,
    mr: (size: string) => isRTL ? `ml-${size}` : `mr-${size}`,
    pl: (size: string) => isRTL ? `pr-${size}` : `pl-${size}`,
    pr: (size: string) => isRTL ? `pl-${size}` : `pr-${size}`,
    
    // Positioning helpers
    left: (size: string) => isRTL ? `right-${size}` : `left-${size}`,
    right: (size: string) => isRTL ? `left-${size}` : `right-${size}`,
    
    // Border radius helpers
    roundedL: (size: string) => isRTL ? `rounded-r-${size}` : `rounded-l-${size}`,
    roundedR: (size: string) => isRTL ? `rounded-l-${size}` : `rounded-r-${size}`,
    
    // Layout helpers
    justifyStart: isRTL ? 'justify-end' : 'justify-start',
    justifyEnd: isRTL ? 'justify-start' : 'justify-end',
    itemsStart: isRTL ? 'items-end' : 'items-start',
    itemsEnd: isRTL ? 'items-start' : 'items-end',
    selfStart: isRTL ? 'self-end' : 'self-start',
    selfEnd: isRTL ? 'self-start' : 'self-end',
    
    // Text input styles for RTL
    textInputStyle: {
      textAlign: isRTL ? ('right' as const) : ('left' as const),
      writingDirection: isRTL ? ('rtl' as const) : ('ltr' as const),
    },
  };
};
