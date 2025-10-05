import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Fully reloads the app to apply RTL/language changes
 * This does a complete restart
 */
export const reloadApp = async () => {
  if (Platform.OS === 'web') {
    // Web reload
    window.location.reload();
    return;
  }

  // For native platforms, check if we're in a release build or dev mode
  try {
    // In production, use expo-updates for a full reload
    if (!__DEV__) {
      await Updates.reloadAsync();
    } else {
      // In development, use DevSettings reload
      const RNDevSettings = require('react-native/Libraries/Utilities/DevSettings');
      if (RNDevSettings && typeof RNDevSettings.reload === 'function') {
        RNDevSettings.reload();
      } else {
        console.warn('DevSettings.reload is not available. App needs manual restart.');
      }
    }
  } catch (error) {
    console.warn('Could not reload app automatically. Please restart manually.', error);
  }
};
