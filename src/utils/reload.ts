import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Fully reloads the app to apply RTL/language changes
 * This does a complete restart that shows the splash screen
 */
export const reloadApp = async () => {
  if (Platform.OS === 'web') {
    // Web reload
    window.location.reload();
    return;
  }

  // For native platforms, use expo-updates to do a full reload
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.warn('Could not reload app automatically. Please restart manually.', error);
  }
};
