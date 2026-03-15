import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cruiseconnect.hub',
  appName: 'CC Hub〽️',
  webDir: 'out',          // static export dir — see build section

  // ── PRODUCTION: load live Netlify URL ──────────────────────
  // This means ALL features work: Supabase auth, payments, everything
  server: {
    url: 'https://cruise-connect-hub.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    // Allow the live URL to run inside native shell
    allowNavigation: [
      'cruise-connect-hub.vercel.app',
      'xiyjgcoeljquryixmfut.supabase.co',
      '*.paystack.co',
      '*.twitter.com',
      '*.x.com',
    ],
  },

  // ── iOS CONFIG ─────────────────────────────────────────────
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: false,
  },

  // ── ANDROID CONFIG ─────────────────────────────────────────
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'none',
  },

  // ── PLUGINS ────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#EAB308',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
