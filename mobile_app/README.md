# 📱 आपली ग्रामपंचायत (Aapli Gram Panchayat) - Citizen Mobile App

A citizen mobile application for **Aapli Gram Panchayat**, built using **Flutter (Dart)**. This app mirrors the official Gram Panchayat Citizen Portal web application, providing rural citizens with digital governance services directly on Android, iOS, and Web platforms.

---

## 🏛️ Key Features

1. **🔑 Citizen Authentication & Registration:**
   - Login with Mobile Number + static OTP verification (`123456`).
   - Registration with full Maharashtra hierarchy (District, Taluka, Gram Panchayat, Ward, House No).
   - Instant token and session persistence with `shared_preferences`.

2. **📜 E-Certificates Portal (डिजिटल दाखले):**
   - Apply for official certificates:
     - **रहिवासी दाखला** (Residence Certificate)
     - **जन्म प्रमाणपत्र** (Birth Certificate)
     - **मृत्यू प्रमाणपत्र** (Death Certificate)
     - **विवाह नोंदणी** (Marriage Certificate)
     - **दारिद्र्य रेषेखालील दाखला** (BPL Certificate)
     - **ना हरकत प्रमाणपत्र** (NOC)
     - **शौचालय दाखला** (Toilet Certificate)
     - **निराधार दाखला** (Destitute Certificate)
   - Live status tracking (`Pending`, `In-Review`, `Approved`, `Rejected`).
   - Digital certificate preview modal with verified **QR Code** for instant verification.

3. **💰 Property & Water Tax Portal (कर भरणा व पावत्या):**
   - View pending and paid property & water tax assessments (Form 8).
   - In-app mock tax payment with multiple methods (UPI, Debit/Credit Card, Net Banking).
   - Instant digital tax receipt with official Maharashtra Govt Form 9 layout and QR validation.

4. **📢 Grievance Redressal (तक्रार निवारण):**
   - File grievances across categories (Water Supply, Sanitation, Roads, Street Lights, Drainage, etc.).
   - Upload complaint attachments/photos.
   - Live status tracking with administrative resolution remarks and timelines.

5. **🌾 Government Schemes & Welfare (शासकीय योजना):**
   - Browse central and state schemes (PM-Kisan, Ladki Bahin, PM Awas Yojana, Jal Jeevan Mission, etc.).
   - Eligibility criteria, subsidy percentage, and required documents.
   - One-tap scheme application modal.

6. **📌 Gram Sabha & Public Notices (ग्रामसभा व सूचना फलक):**
   - Live announcements, upcoming Gram Sabha meeting dates, agendas, and venue details.
   - Urgent notices banner directly on the home screen.

7. **🏗️ Village Development Projects (विकास कामे):**
   - Transparent tracking of village infrastructure projects (Roads, RO Water Plants, Solar Lights, School renovation).
   - Live budget allocation, expenditure, contractor details, and completion progress bars.

8. **📞 Village Directory & Emergency Contacts (ग्रामपंचायत संपर्क डिरेक्टरी):**
   - Directory of Sarpanch, Up-Sarpanch, Gram Sevak, Talathi, Ward Members, and Asha Workers.
   - 1-tap call button and emergency numbers (Ambulance, Police, Electricity, Primary Health Centre).

9. **🌐 Complete Bilingual Support (मराठी & English):**
   - Instant toggle between Marathi (मराठी) and English without restart.

---

## 🎨 Design System

- **Theme:** Maharashtra Government Aesthetic (Bhagwa/Saffron `#E65100`, Deep Navy `#0F172A`, Emerald `#059669`).
- **Typography:** Google Fonts (`Poppins`).
- **UI Structure:** Modern 5-tab Bottom Navigation (`Home`, `Certificates`, `Tax Portal`, `Grievances`, `Profile`).

---

## 🚀 How to Run the Mobile App

### Prerequisites
- Flutter SDK 3.x+ installed
- Android SDK / Android Studio or Google Chrome for web testing

### 1. Start the Backend Server (if running locally)
In the root directory:
```bash
cd backend
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

### 2. Run the Flutter App
In the `mobile_app` directory:
```bash
cd mobile_app
flutter pub get
```

#### Run on Android Emulator:
```bash
flutter run
```
*(The app automatically connects to `http://10.0.2.2:5000/api` on Android emulators)*

#### Run on Chrome / Web:
```bash
flutter run -d chrome
```

#### Run on Linux Desktop:
```bash
flutter run -d linux
```

#### Build Android APK:
```bash
flutter build apk --release
```

---

## 🧪 Test Credentials

- **Test Mobile Number:** `9876543210` or `8080341618` (or any 10-digit number)
- **Static OTP:** `123456`

---

## 📁 Directory Structure

```
mobile_app/
├── lib/
│   ├── config/
│   │   ├── api_config.dart     # Dynamic base URL (emulator vs web/desktop)
│   │   ├── theme.dart          # Government Saffron/Navy theme tokens
│   │   └── translations.dart   # Marathi & English dictionary
│   ├── models/                 # Data classes (User, Certificate, Tax, Grievance, Scheme, Notice, Project, Official)
│   ├── providers/
│   │   └── app_provider.dart   # Unified state management & reactive stores
│   ├── screens/
│   │   ├── auth/               # Login & Registration screens
│   │   ├── certificates/       # List, Apply & Digital QR Certificate dialog
│   │   ├── directory/          # Village Directory & Emergency Contacts
│   │   ├── grievances/         # List & Lodge Grievance screens
│   │   ├── home/               # Dashboard & 5-tab Main Navigation
│   │   ├── notices/            # Gram Sabha notices
│   │   ├── profile/            # Citizen Profile & Language toggle
│   │   ├── projects/           # Village Development tracking
│   │   ├── schemes/            # Govt Welfare Schemes
│   │   └── taxes/              # Tax assessment, Pay Tax modal & Form 9 Receipt
│   ├── services/
│   │   ├── api_service.dart    # HTTP client with offline mock fallback
│   │   └── storage_service.dart# SharedPreferences local cache
│   ├── widgets/                # Reusable UI components
│   └── main.dart               # App entry point
└── test/
    └── widget_test.dart        # Flutter widget smoke tests
```
