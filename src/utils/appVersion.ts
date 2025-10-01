import * as Application from 'expo-application';
import { Alert, Linking } from 'react-native';

const CONFIG_URL = 'https://tawba-config.pages.dev/config.json';

const versionLessThan = (a: string | null | undefined, b: string | null | undefined) => {
  if (!a || !b) return false;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) === -1;
};

export const checkAppVersion = async () => {
  try {
    const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`);
    const data = await response.json();

    if (data.maintenanceMode) {
      Alert.alert('Maintenance', data.maintenanceMessage, [{ text: 'OK' }], {
        cancelable: false
      });
      return false;
    }

    if (!data.checkForUpdates) return true;

    const currentVersion = Application.nativeApplicationVersion ?? '0.0.0';
    const requiredVersion: string | undefined = data.requiredVersion;
    const optionalVersion: string | undefined = data.optionalVersion;

    if (data.force && versionLessThan(currentVersion, requiredVersion)) {
      Alert.alert(
        'Update Required',
        data.message,
        [
          {
            text: 'Update Now',
            onPress: () => {
              if (data.updateUrl) {
                Linking.openURL(data.updateUrl);
              }
            }
          }
        ],
        { cancelable: false }
      );
      return false;
    }

    if (optionalVersion && versionLessThan(currentVersion, optionalVersion)) {
      Alert.alert('Update Available', data.message, [
        {
          text: 'Update',
          onPress: () => {
            if (data.updateUrl) {
              Linking.openURL(data.updateUrl);
            }
          }
        },
        { text: 'Later' }
      ]);
    }

    return true;
  } catch (err) {
    console.log('Error fetching config:', err);
    return true;
  }
};
