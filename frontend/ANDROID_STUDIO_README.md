# Android Studio Setup Instructions

## Opening the Project in Android Studio

1. **Open Android Studio**
2. **Select "Open an existing Android Studio project"**
3. **Navigate to:** `frontend/android/` folder
4. **Click "OK"**

## Building the APK

1. **Wait for Gradle sync to complete** (may take a few minutes on first run)
2. **Go to:** Build → Build Bundle(s) / APK(s) → Build APK(s)
3. **Wait for build to complete**
4. **Find your APK at:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Important Notes

- **Backend Required:** Make sure your FastAPI backend is running on `http://localhost:8000` before testing the app
- **Network Configuration:** The app is configured to allow HTTP connections to localhost for development
- **API Endpoint:** The app will connect to `http://10.0.2.2:8000` when running in Android emulator (this maps to localhost:8000 on your computer)

## Troubleshooting

- If you get build errors, try: File → Invalidate Caches and Restart
- If the app can't connect to backend, ensure backend is running and accessible
- For production, you'll need to update the API endpoint to your actual server URL

## Testing

- Use Android Emulator or connect a physical device
- Install the APK and test the delivery management features
- All three user roles (Developer, Store Owner, Driver) should work with credentials: username: `1`, password: `1`








