# CC Hub〽️ — Native App Build Guide

## Architecture
This is a **Capacitor** app — the native shell loads the live Vercel web app.
No separate build needed when you update the web app — just release a new version.

---

## ANDROID — Build APK / AAB for Play Store

### Requirements
- Android Studio (download at developer.android.com/studio)
- JDK 17+
- Git clone of this repo

### Steps
1. Clone the repo:
   git clone https://github.com/13fxiii/-cruise-connect-hub.git
   cd cruise-connect-hub

2. Install dependencies:
   npm install

3. Sync Capacitor:
   npx cap sync android

4. Open in Android Studio:
   npx cap open android

5. In Android Studio:
   - Build → Generate Signed Bundle/APK
   - Choose Android App Bundle (.aab) for Play Store
   - Create a new keystore (save it securely!)
   - Build release

6. Upload the .aab to:
   play.google.com/console → Create app → Production → Upload

### App Details
- Package: com.cruiseconnect.hub
- Min SDK: 23 (Android 6.0)
- Target SDK: 34

---

## iOS — Build for App Store

### Requirements
- Mac with Xcode 15+
- Apple Developer Account ($99/year) — appleid.apple.com
- Git clone of this repo

### Steps
1. Clone and install:
   git clone https://github.com/13fxiii/-cruise-connect-hub.git
   cd cruise-connect-hub
   npm install

2. Sync Capacitor:
   npx cap sync ios

3. Open in Xcode:
   npx cap open ios

4. In Xcode:
   - Select "App" target
   - Signing & Capabilities → select your Apple Developer Team
   - Bundle Identifier: com.cruiseconnect.hub
   - Version: 1.0.0, Build: 1

5. Product → Archive
6. Distribute App → App Store Connect → Upload

7. In App Store Connect (appstoreconnect.apple.com):
   - Create new app
   - Fill in store listing (see store-assets/STORE_LISTING.md)
   - Submit for review

---

## App Icons Needed
Place these in the correct directories:

Android: android/app/src/main/res/mipmap-*/
iOS: ios/App/App/Assets.xcassets/AppIcon.appiconset/

Required sizes:
- 1024x1024 (master — App Store / Play Store)
- 512x512
- 192x192
- 144x144
- 96x96
- 72x72
- 48x48

---

## Splash Screen
- Android: android/app/src/main/res/drawable/splash.png
- iOS: ios/App/App/Assets.xcassets/Splash.imageset/

Recommended: 2732x2732 with CC Hub logo centered on #0a0a0a background

---

## Notes
- The app loads https://cruise-connect-hub.vercel.app inside a native WebView
- All features (auth, payments, games) work natively
- X OAuth deep link: cchub://
- Push notifications require APNs (iOS) and FCM (Android) setup
