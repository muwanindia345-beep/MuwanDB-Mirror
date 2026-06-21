import { Alert } from 'react-native';
import { saveSession, getSession } from '../storage/auth';

const WS_URL = 'wss://muwandb-server-production.up.railway.app/ws';

let ws = null;

export const connectWebSocket = async (onKeysRefreshed) => {
  try {
    const session = await getSession();
    if (!session?.anonKey) return;

    ws = new WebSocket(`${WS_URL}?apiKey=${session.anonKey}`);

    ws.onopen = () => {
      console.log('WS connected');
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'KEYS_REFRESHED' && data.source === 'web') {
          const session = await getSession();
          if (data.username === session?.user?.username) {
            Alert.alert(
              '🖥️ Keys Refreshed via Web!',
              'Web Frontend ne keys refresh ki hain. App mein bhi sync karein?',
              [
                { text: 'Ignore', style: 'cancel' },
                {
                  text: 'Sync Now',
                  onPress: async () => {
                    await saveSession(
                      session.user,
                      data.anonKey,
                      data.secretKey
                    );
                    if (onKeysRefreshed) onKeysRefreshed(data.anonKey, data.secretKey);
                    Alert.alert('Done!', 'Keys synced successfully!');
                  }
                }
              ]
            );
          }
        }
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      // Reconnect after 5s
      setTimeout(() => connectWebSocket(onKeysRefreshed), 5000);
    };

  } catch (e) {
    console.log('WS error:', e.message);
  }
};

export const disconnectWebSocket = () => {
  if (ws) { ws.close(); ws = null; }
};
