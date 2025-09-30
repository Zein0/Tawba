import { I18nManager } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

export const useRTL = () => {
  const { settings } = useAppContext();
  const isRTL = settings?.language === 'ar';
  
  // Update I18nManager when language changes (for native RTL support)
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(true);
    // Note: We don't use forceRTL as it requires app restart
  }
  
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
