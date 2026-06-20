import AsyncStorage from '@react-native-async-storage/async-storage';
const KEYS = { USER: 'muwan_user', ANON_KEY: 'muwan_anon_key', SECRET_KEY: 'muwan_secret_key' };
export const saveSession = async (user, anonKey, secretKey) => {
  await AsyncStorage.multiSet([[KEYS.USER, JSON.stringify(user)], [KEYS.ANON_KEY, anonKey], [KEYS.SECRET_KEY, secretKey]]);
};
export const getSession = async () => {
  const [[, user], [, anonKey], [, secretKey]] = await AsyncStorage.multiGet([KEYS.USER, KEYS.ANON_KEY, KEYS.SECRET_KEY]);
  return { user: user ? JSON.parse(user) : null, anonKey, secretKey };
};
export const clearSession = async () => await AsyncStorage.multiRemove([KEYS.USER, KEYS.ANON_KEY, KEYS.SECRET_KEY]);
