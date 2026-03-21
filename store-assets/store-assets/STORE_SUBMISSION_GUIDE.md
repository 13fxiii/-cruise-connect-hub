# 🚌 Cruise Connect Hub — App Store Submission Guide

**App ID:** `com.cruiseconnect.hub`  
**Version:** `1.0.0`  
**Live URL:** `https://cruise-connect-hub.netlify.app`  
**Dev:** @13fxiii · @CCHub_

---

## 📱 PLATFORM 1 — GOOGLE PLAY STORE (Android)

### Requirements
- **Computer:** Mac, Windows, or Linux
- **Tools:** Node.js 18+, Android Studio, Java 17
- **Account:** Google Play Console ($25 one-time fee) → play.google.com/console

### Step 1 — Install Android Studio
Download from: https://developer.android.com/studio  
Install Android SDK Platform 33+ and Android Build-Tools

### Step 2 — Build the Android App
```bash
# Clone your repo locally
git clone https://github.com/13fxiii/-cruise-connect-hub.git
cd -cruise-connect-hub
npm install

# Add Android platform
npx cap add android

# Copy store icons to Android project
# After adding platform, copy android-icons from store-assets/android-icons
# to android/app/src/main/res/mipmap-*/

# Sync and open in Android Studio
npx cap sync android
npx cap open android
```

### Step 3 — In Android Studio
1. Click **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle (.aab)** — required for Play Store
3. Create a new keystore (save the password safely!)
4. Get your SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore your-keystore.jks -alias your-alias
   ```
5. Paste the SHA-256 into: `public/.well-known/assetlinks.json` → redeploy to Netlify

### Step 4 — Upload to Play Store
1. Go to https://play.google.com/console → Create App
2. Fill in:
   - **App name:** Cruise Connect Hub
   - **Category:** Social
   - **Content rating:** Everyone 13+
3. Upload your `.aab` file
4. Add screenshots from `store-assets/`
5. Add feature graphic: `store-assets/play-store-feature-graphic.png`
6. Submit for review (usually 2-7 days)

### Play Store Assets Checklist
- [x] Feature Graphic: 1024 x 500px (`play-store-feature-graphic.png`)
- [x] App Icon: 512 x 512px (generated in `android-icons/`)
- [ ] Screenshots: min 2, 16:9 or 9:16 ratio (take real screenshots)
- [ ] Short description (80 chars): "The home of Naija culture. Spaces, Games, Music & more."
- [ ] Full description (4000 chars): Use text from README

---

## 🍎 PLATFORM 2 — APPLE APP STORE (iOS)

### Requirements
- **Computer:** Mac ONLY (mandatory for iOS)
- **Tools:** Xcode 15+, CocoaPods
- **Account:** Apple Developer Program ($99/year) → developer.apple.com/programs

### Step 1 — Set Up Xcode
```bash
xcode-select --install
sudo gem install cocoapods
```

### Step 2 — Add iOS Platform
```bash
# In your project folder
npx cap add ios
npx cap sync ios
npx cap open ios
```

### Step 3 — Configure in Xcode
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select **App** target → **Signing & Capabilities**
3. Set your Apple Developer Team
4. Bundle Identifier: `com.cruiseconnect.hub`
5. Add icons from `store-assets/ios-icons/` to **Assets.xcassets → AppIcon**

### Step 4 — Add Splash Screens
Copy splash images from `store-assets/splash-screens/` into the Xcode project.

### Step 5 — Build for TestFlight
1. Select **Any iOS Device (arm64)** as target
2. **Product → Archive**
3. In Organizer: **Distribute App → App Store Connect**
4. Upload to TestFlight first to test

### Step 6 — Submit to App Store
1. Go to https://appstoreconnect.apple.com
2. Create new app → fill in metadata
3. Select build from TestFlight
4. Submit for review (usually 24-48 hours)

### iOS App Store Assets Checklist
- [x] App Icon: 1024 x 1024px (`ios-icons/icon-1024.png`)
- [ ] Screenshots:
  - iPhone 6.7": 1290 x 2796 (use `appstore-6.7inch.png` as template)
  - iPhone 5.5": 1242 x 2208 (use `appstore-5.5inch.png` as template)
- [ ] App Preview Video (optional but recommended)
- [ ] Keywords: naija,community,spaces,games,music,nigerian,chat,live
- [ ] Privacy Policy URL: Add `/privacy` page to your app
- [ ] Age Rating: 12+

---

## 🖥️ PLATFORM 3 — DESKTOP (Windows, Mac, Linux)

### No store needed — distribute directly!

### Build Desktop Apps
```bash
# Install electron-builder
npm install

# Build for current platform
npm run electron:build

# Or build for specific platforms (Mac only can build Mac+Linux+Win)
npx electron-builder --win    # Windows (.exe installer + portable)
npx electron-builder --mac    # macOS (.dmg + .zip)
npx electron-builder --linux  # Linux (.AppImage + .deb + .snap)
```

### Output files (in `dist-electron/`)
- **Windows:** `Cruise Connect Hub Setup 1.0.0.exe` (installer) + portable
- **macOS:** `Cruise Connect Hub-1.0.0.dmg` + `.zip`
- **Linux:** `Cruise Connect Hub-1.0.0.AppImage` + `.deb` + `.snap`

### macOS Icon (ICNS)
On a Mac, run this once to generate the `.icns` file:
```bash
iconutil -c icns electron/icons/cc_hub.iconset -o electron/icons/icon.icns
```

### Windows Store (Optional)
Can submit the `.exe` to Microsoft Store if desired:
https://partner.microsoft.com/dashboard

### Distribute Desktop Builds
Options:
1. **GitHub Releases** — auto-configured in `package.json` (provider: github)
2. **Direct link** — host the `.exe`/`.dmg` on your website
3. **Microsoft Store** — optional, requires Windows 10 MSIX package

---

## 🔗 IMPORTANT: Link Your Website to Your Apps

After publishing, update these files on your Netlify site:

### For Android (Play Store)
Edit `public/.well-known/assetlinks.json` — replace `REPLACE_WITH_YOUR_SHA256_KEYSTORE_FINGERPRINT` with your actual keystore SHA-256.

### For iOS (App Store)  
Edit `public/.well-known/apple-app-site-association` — replace `REPLACE_TEAM_ID` with your Apple Team ID (found in developer.apple.com → Membership).

Redeploy to Netlify after both changes.

---

## 📋 Quick Build Summary

| Platform     | Command                    | Output                  | Store              |
|--------------|----------------------------|-------------------------|--------------------|
| Android      | `npx cap open android`     | `.aab` via Android Studio | Google Play Store |
| iOS          | `npx cap open ios`         | `.ipa` via Xcode        | Apple App Store    |
| Windows      | `npm run electron:build -- --win` | `.exe` installer | Optional: MS Store |
| macOS        | `npm run electron:build -- --mac` | `.dmg`          | Optional: Mac App Store |
| Linux        | `npm run electron:build -- --linux` | `.AppImage`   | Snap Store / direct |

---

## 💡 Tips
- The app uses your **live Netlify URL** — so any update you push to Netlify instantly updates ALL platforms automatically. No store resubmission needed for content changes!
- Only submit to stores when the core app functionality changes.
- Keep your Supabase + Paystack keys secure — never commit them to GitHub.

