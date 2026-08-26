import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crevings.partner.delivery',
  appName: 'Crevings Delivery Partner',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'backend.crevings.com',
      '*.crevings.com'
    ]
  },
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
