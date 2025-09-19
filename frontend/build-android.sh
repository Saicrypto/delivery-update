#!/bin/bash

echo "🚀 Building Android APK for Delivery Management App"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    exit 1
fi

# Build the React app
echo "📦 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed"
    exit 1
fi

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Check if Android SDK is available
if command -v $ANDROID_HOME/tools/bin/sdkmanager &> /dev/null; then
    echo "✅ Android SDK found"
    
    # Build APK
    echo "🔨 Building APK..."
    cd android
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        echo "✅ APK built successfully!"
        echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
        echo "📲 Install with: adb install android/app/build/outputs/apk/debug/app-debug.apk"
    else
        echo "❌ APK build failed"
        exit 1
    fi
else
    echo "⚠️  Android SDK not found"
    echo "📋 Manual steps:"
    echo "1. Install Android Studio"
    echo "2. Open android/ folder in Android Studio"
    echo "3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "4. APK will be in android/app/build/outputs/apk/debug/"
fi

echo "🎉 Android deployment setup complete!"
