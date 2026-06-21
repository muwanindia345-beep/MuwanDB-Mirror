import { Alert, Linking } from 'react-native';

const GITHUB_API = 'https://api.github.com/repos/muwanindia345-beep/MuwanDB-Mirror/releases/latest';
const CURRENT_VERSION = '1.0.0';

export const checkForUpdate = async () => {
  try {
    const res = await fetch(GITHUB_API);
    const data = await res.json();
    const latestVersion = data.tag_name?.replace('v', '').split('-')[0];
    if (latestVersion && latestVersion !== CURRENT_VERSION) {
      const apkUrl = data.assets?.find(a => a.name.endsWith('.apk'))?.browser_download_url;
      Alert.alert(
        'Update Available! 🎉',
        `New version v${latestVersion} available!\nCurrent: v${CURRENT_VERSION}`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Update Now', onPress: () => Linking.openURL(apkUrl) },
        ]
      );
    }
  } catch (e) {
    console.log('OTA check failed:', e.message);
  }
};
