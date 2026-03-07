# ═══════════════════════════════════════════════════════════════════
# CRUISE CONNECT HUB — STORE SUBMISSION STEP-BY-STEP GUIDE
# ═══════════════════════════════════════════════════════════════════

## ════════════════════════════════
## PART 1: GOOGLE PLAY STORE (Android)
## Easiest & fastest — start here
## ════════════════════════════════

### STEP 1: One-time setup
1. Create a Google Play Developer account → play.google.com/console
2. Pay the $25 one-time registration fee
3. Complete identity verification (takes 1–2 days)

### STEP 2: Build the Android app
Run these commands in your project folder:

```bash
# Install dependencies
npm install

# Build Next.js static export
npm run build:static

# Sync with Capacitor
npx cap sync android

# Open Android Studio (then build from there)
npx cap open android
```

In Android Studio:
- Wait for Gradle sync to finish
- Go to: Build → Generate Signed Bundle/APK
- Choose: Android App Bundle (AAB) — required for Play Store
- Create a new keystore (SAVE THIS FILE FOREVER — you can never replace it)
- Build release AAB

### STEP 3: Submit to Play Store
1. Go to play.google.com/console → Create app
2. Fill in app details using APP_STORE_METADATA.md
3. Upload your AAB under: Production → Create new release
4. Complete the store listing, content rating, pricing
5. Submit for review (usually 1–3 days)

---

## ════════════════════════════════
## PART 2: APPLE APP STORE (iOS)
## Requires Mac + Apple Developer account
## ════════════════════════════════

### STEP 1: One-time setup
1. Apple Developer account → developer.apple.com ($99/year)
2. Create App ID: com.cruiseconnect.hub
3. Create a distribution certificate
4. Create a provisioning profile

### STEP 2: Build the iOS app
```bash
# Install dependencies
npm install

# Build static
npm run build:static

# Sync Capacitor
npx cap sync ios

# Open Xcode
npx cap open ios
```

In Xcode:
- Set Bundle Identifier: com.cruiseconnect.hub
- Set your Team (Apple Developer account)
- Set Version: 1.0.0
- Set Build: 1
- Product → Archive
- Distribute App → App Store Connect → Upload

### STEP 3: Submit to App Store
1. Go to appstoreconnect.apple.com → My Apps → +
2. Fill in all details from APP_STORE_METADATA.md
3. Upload screenshots for each device size
4. Submit build uploaded from Xcode
5. Submit for review (usually 1–3 days)

---

## ════════════════════════════════
## PART 3: WINDOWS / MAC / LINUX DESKTOP
## Automated via GitHub Actions
## ════════════════════════════════

### Trigger a desktop build:
```bash
# Tag a release and push
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build Windows .exe installer
- Build macOS .dmg
- Build Linux .AppImage + .deb
- Create a GitHub Release with download links

### Manual desktop build (local):
```bash
# Install electron + electron-builder
npm install electron electron-builder --save-dev

# Build for current platform
npm run electron:build

# Built files appear in: dist-electron/
```

---

## ════════════════════════════════
## PART 4: MICROSOFT STORE (Windows)
## Alternative to direct .exe distribution
## ════════════════════════════════

### Option A: PWA Builder (easiest)
1. Go to pwabuilder.com
2. Enter: https://cruise-connect-hub.netlify.app
3. Click "Package For Stores" → Windows
4. Download the MSIX package
5. Submit to Microsoft Partner Center (partner.microsoft.com)

### Option B: Electron MSIX (from GitHub Actions)
- The GitHub Action already builds MSIX for Microsoft Store
- Submit at: partner.microsoft.com/dashboard

---

## ════════════════════════════════
## QUICK REFERENCE: APP IDs
## ════════════════════════════════

| Platform      | ID / Bundle                 |
|---------------|-----------------------------|
| iOS / macOS   | com.cruiseconnect.hub       |
| Android       | com.cruiseconnect.hub       |
| Windows       | com.cruiseconnect.hub       |
| Deep link     | ccapp://                    |
| Web URL       | cruise-connect-hub.netlify.app |

---

## ════════════════════════════════
## REQUIRED ACCOUNTS & COSTS
## ════════════════════════════════

| Platform         | Account                    | Cost         |
|------------------|----------------------------|--------------|
| Google Play      | play.google.com/console    | $25 one-time |
| Apple App Store  | developer.apple.com        | $99/year     |
| Microsoft Store  | partner.microsoft.com      | $19 one-time |
| GitHub Actions   | github.com (already have)  | Free         |

---

## ════════════════════════════════
## WHAT YOU NEED BEFORE SUBMITTING
## ════════════════════════════════

[ ] Privacy Policy page live at /privacy
[ ] Terms of Service page at /terms
[ ] Support email or page at /support
[ ] Screenshots for each platform (see metadata file)
[ ] App Store icon: 1024×1024px (use public/icons/icon-1024x1024.png)
[ ] Google Play feature graphic: 1024×500px
[ ] Keystore file (Android) — KEEP THIS FOREVER
[ ] Apple Developer certificate + provisioning profile (iOS)
