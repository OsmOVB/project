import Constants from 'expo-constants';

export const config = {
  apiKey: Constants.expoConfig?.extra?.API_KEY || process.env.API_KEY,
  authDomain: Constants.expoConfig?.extra?.AUTH_DOMAIN || process.env.AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.PROJECT_ID || process.env.PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.STORAGE_BUCKET || process.env.STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.MESSAGING_SENDER_ID || process.env.MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.APP_ID || process.env.APP_ID,
  googleClientId: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  googleClientIdIos: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_IOS || process.env.GOOGLE_CLIENT_ID_IOS,
  googleClientIdWeb: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_WEB || process.env.GOOGLE_CLIENT_ID_WEB,
};


