import { Platform } from 'react-native';

/**
 * Reloads the app to apply RTL/language changes
 * Works in both development and production
 */
export const reloadApp = () => {
  if (Platform.OS === 'web') {
    // Web reload
    window.location.reload();
    return;
  }

  // For native platforms, we need to use the DevSettings module
  // This works in both dev and production builds
  try {
    const { DevSettings } = require('react-native');
    if (DevSettings && typeof DevSettings.reload === 'function') {
      DevSettings.reload();
    } else {
      console.warn('DevSettings.reload is not available. App needs manual restart.');
    }
  } catch (error) {
    console.warn('Could not reload app automatically. Please restart manually.');
  }
};
