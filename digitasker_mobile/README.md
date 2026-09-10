# Digitasker Flutter Mobile Application (`digitasker_mobile`)

Cross-platform mobile application for **Android & iOS** for the **Digitasker (InsightLoop)** Audit & Field Verification Platform.

---

## 📱 Features

- 🔐 **Authentication & Roles**: Sanctum Token Authentication, Sign In, Sign Up with role selector (Auditor / Field Tasker, Client, Vendor).
- 📋 **Audit Task Discovery**: Browse featured tasks, search available audits by city or keyword, view payout rewards & audit requirements.
- 📸 **Camera Evidence & Geotagging**: Live camera capture for store proof, automatic GPS coordinate tagging (`geo_lat`, `geo_lng`), and background upload.
- 💼 **Wallet & Payouts**: Real-time balance view, transaction history, and instant withdrawal requests to Bank / UPI (`+91 7360002233@paytm`).
- 🌐 **Live API Backend Sync**: Connects directly to `https://tasker.digilitesstudio.com/api` (or local Laravel dev server).

---

## 🚀 How to Run & Build

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (`>= 3.0.0`)
- Android Studio (for Android SDK & Emulator) / Xcode (for iOS)

### 1. Install Dependencies
```bash
cd digitasker_mobile
flutter pub get
```

### 2. Run on Connected Device or Emulator
```bash
flutter run
```

### 3. Build Production APK for Android
```bash
flutter build apk --release
```
The output APK file will be generated at:
`digitasker_mobile/build/app/outputs/flutter-apk/app-release.apk`

---

## ⚙️ REST API Backend Configuration

The API base URL is configured in [`lib/services/api_service.dart`](file:///f:/audiance/digitasker_mobile/lib/services/api_service.dart#L5):
```dart
static const String baseUrl = 'https://tasker.digilitesstudio.com/api';
```
For local testing against Laravel dev server, change to `http://10.0.2.2:8000/api` (Android Emulator) or `http://localhost:8000/api` (iOS Simulator).
