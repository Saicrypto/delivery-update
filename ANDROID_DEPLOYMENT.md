# 📱 Android App Deployment Guide

This guide will help you deploy your Delivery Management System as an Android app.

## 🚀 Quick Start

### Method 1: Using Android Studio (Recommended)

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Follow the installation wizard
   - Install Android SDK and tools

2. **Open Project**:
   ```bash
   cd frontend
   npx cap open android
   ```

3. **Build APK**:
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Method 2: Command Line Build

```bash
cd frontend
./build-android.sh
```

## 📋 Prerequisites

### Required Software:
- ✅ Node.js (already installed)
- ✅ Android Studio
- ✅ Android SDK
- ✅ Java Development Kit (JDK)

### Environment Setup:
```bash
# Set Android SDK path (add to ~/.zshrc or ~/.bashrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🔧 Configuration

### App Configuration:
The app is already configured in `capacitor.config.ts`:

```typescript
{
  appId: 'com.cosmyk.app',
  appName: 'Delivery Management',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
}
```

### Backend URL:
Update `frontend/src/services/api.ts` to point to your production backend:

```typescript
const API_BASE_URL = 'https://your-backend-url.com'; // Change this
```

## 📱 Building the APK

### Step 1: Build React App
```bash
cd frontend
npm run build
```

### Step 2: Sync with Capacitor
```bash
npx cap sync
```

### Step 3: Build Android APK
```bash
# Option A: Using Android Studio
npx cap open android

# Option B: Command line (if Android SDK is set up)
cd android
./gradlew assembleDebug
```

## 📲 Installing the APK

### On Android Device:
1. **Enable Developer Options**:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Go back → Developer Options → Enable "USB Debugging"

2. **Install APK**:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Alternative Installation:
- Copy APK to device and install manually
- Use file manager to install APK

## 🔄 Real-time Sync Features

### Already Implemented:
- ✅ Shared Supabase database
- ✅ Instant data sync between users
- ✅ Live order updates
- ✅ Customer data synchronization

### How Sync Works:
1. **User A** creates delivery → Saved to Supabase
2. **User B** refreshes app → Sees new delivery instantly
3. **Status changes** → Both users see updates immediately

## 🎯 Production Deployment

### For Production APK:

1. **Update Backend URL**:
   ```typescript
   // In frontend/src/services/api.ts
   const API_BASE_URL = 'https://your-production-backend.com';
   ```

2. **Build Production APK**:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   # In Android Studio: Build → Generate Signed Bundle / APK
   ```

3. **Sign the APK** (for Google Play Store):
   - Create keystore
   - Sign APK with release key
   - Upload to Google Play Console

## 📊 App Features

### For 2 Users:
- ✅ **Real-time sync** via Supabase
- ✅ **Shared database** - both users see same data
- ✅ **Instant updates** - no manual refresh needed
- ✅ **Offline support** - works without internet (with sync when online)
- ✅ **Mobile optimized** - touch-friendly interface

### User Roles:
- **Developer**: `admin` / `admin123`
- **Store Owner**: `store1` / `store123`
- **Driver**: `driver1` / `driver123`

## 🛠️ Troubleshooting

### Common Issues:

1. **"Android SDK not found"**:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   ```

2. **"Gradle build failed"**:
   - Update Android Studio
   - Update Gradle version
   - Clean project: `./gradlew clean`

3. **"App crashes on startup"**:
   - Check backend URL in `api.ts`
   - Ensure backend is running
   - Check network permissions

4. **"APK won't install"**:
   - Enable "Install from Unknown Sources"
   - Check device compatibility (Android 5.0+)

## 📱 Testing

### Test on Device:
1. Build debug APK
2. Install on Android device
3. Test login with default credentials
4. Test data sync between two devices

### Test Sync:
1. Install app on two devices
2. Login as different users
3. Create delivery on Device A
4. Check if it appears on Device B

## 🎉 Success!

Once deployed, your Delivery Management System will be:
- ✅ **Fully functional Android app**
- ✅ **Real-time sync between users**
- ✅ **Professional mobile interface**
- ✅ **Ready for production use**

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify all prerequisites are installed
3. Check Android Studio logs
4. Ensure backend is accessible from mobile device
