import AsyncStorage from '@react-native-community/async-storage';

const errorMessage = e => {
  // eslint-disable-next-line no-console
  console.error('caught error', e);
};
export default class LocalStorage {
  static async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (e) {
      errorMessage(e);
      return null;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      errorMessage(e);
    }
  }

  static async setItem(key, data) {
    data = typeof data === 'string' ? data : JSON.stringify(data);
    try {
      await AsyncStorage.setItem(key, data);
    } catch (e) {
      errorMessage(e);
    }
  }
}
