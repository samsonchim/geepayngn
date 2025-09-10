# GeePay NGN - Build Instructions

## 🏗️ Building Your Banking App

### 🎯 **Method 1: Expo Application Services (EAS Build) - Recommended**

1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Login to Expo:**
   ```bash
   npx expo login
   ```

3. **Configure EAS:**
   ```bash
   npx eas build:configure
   ```

4. **Build APK (Preview - for testing):**
   ```bash
   npx eas build -p android --profile preview
   ```

   ✅ **This creates an APK file you can directly install on any Android device**

5. **Build AAB (Production - for Play Store):**
   ```bash
   npx eas build -p android --profile production
   ```

---

### 🚀 **Method 2: Expo CLI Classic (Turtle Build) - Fallback**

If EAS build fails, use the classic build method:

1. **Build APK with Expo Classic:**
   ```bash
   expo build:android -t apk
   ```

2. **Build AAB for Play Store:**
   ```bash
   expo build:android -t app-bundle
   ```

---

### 💻 **Method 3: Local Development Build**

1. **Install Expo Development Client:**
   ```bash
   npx expo install expo-dev-client
   ```

2. **Run on Android device/emulator:**
   ```bash
   npx expo run:android
   ```

---

### 📱 **Method 4: Simple Expo Go Testing (Development Only)**

For quick testing without building:

```bash
npx expo start
```

Then scan QR code with Expo Go app on your phone.

---

## 🔧 **If Build Fails - Quick Fixes:**

### **Fix 1: Using Stable Expo SDK (52)**
The package.json has been updated to use Expo SDK 52 (stable version - SDK 53 has Metro bundler compatibility issues).

### **Fix 2: Alternative Build Commands**

```bash
# Try with clear cache
npx eas build -p android --profile preview --clear-cache

# Or use local build
npx expo run:android --device
```

### **Fix 3: Manual APK Generation**

1. **Eject to bare workflow:**
   ```bash
   npx expo eject
   ```

2. **Build manually with Gradle:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

---

1. **Create development build:**
   ```bash
   npx expo run:android
   ```

2. **For custom development client:**
   ```bash
   npx expo install expo-dev-client
   npx eas build --profile development --platform android
   ```

### Method 3: Ejected Build (Advanced)

1. **Eject to bare React Native:**
   ```bash
   npx expo eject
   ```

2. **Build with Gradle:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## 📦 Build Profiles Explained

- **Development**: For development with Expo Dev Client
- **Preview**: Creates APK file for testing (can install on any Android device)
- **Production**: Creates AAB file for Google Play Store submission

## 🔧 Build Configuration

The `eas.json` file contains:
- **preview**: Builds APK files for direct installation
- **production**: Builds AAB files optimized for Play Store
- **development**: For development builds with hot reload

## 📱 Installing the APK

1. After build completes, download APK from EAS dashboard
2. Enable "Install from Unknown Sources" on Android device
3. Transfer APK to device and install
4. Launch "GeePay NGN" app

## 🚀 Testing

**Test Account:**
- Email: samson@geepayngn.com
- Password: password123
- Passcode: 1234
- Balance: ₦800,656.60

**Note:** All data is stored locally using AsyncStorage - no backend server needed!

## 🔒 Important Notes

- All data is stored locally on the device using AsyncStorage
- Perfect for prototyping and testing without server setup
- Data persists between app sessions
- No internet connection required
- Test thoroughly before Play Store submission

## 📋 Pre-Build Checklist

- [ ] App icons and splash screen configured
- [ ] Package name set in app.json
- [ ] Permissions configured correctly
- [ ] Test on real device before building
- [ ] Update version numbers in app.json
- [ ] Test all banking features work offline

## 🛠️ Troubleshooting

**Build Fails:**
- Check internet connection
- Verify Expo account has sufficient credits
- Review build logs in EAS dashboard

**APK Won't Install:**
- Enable "Install from Unknown Sources"
- Check device compatibility
- Verify APK file isn't corrupted

**App Crashes:**
- Check Metro bundler logs
- Verify all dependencies are compatible
- Test in development mode first
