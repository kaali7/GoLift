# 📱 GoLift Mobile App

The native companion for the GoLift ecosystem. Built with **React Native 0.84** and **React 19**, this application provides a premium, high-performance training experience on the go.

---

## 🏗️ Development Status
> [!IMPORTANT]
> This project is currently under active development. While the UI and navigation are largely complete, finishing touches on real-time API integrations and native optimizations are in progress.

### Progress Checklist
- [x] **Project Scaffolding**: React Native + TypeScript + Navigation 7 setup.
- [x] **UI & Theming**: Centralized color system and premium typography.
- [x] **Navigation**: Tab-based and Stack navigation for all 20+ screens.
- [/] **API Integration**: Centralized Axios service with token refresh (In Progress).
- [/] **Authentication Flow**: Managed via AuthContext and Secure Storage (In Progress).
- [ ] **Offline Support**: Local caching of workout templates (Planned).
- [ ] **Native Features**: HealthKit/Google Fit sync (Planned).

---

## 🛠️ Technology Stack
- **Framework**: [React Native 0.84](https://reactnative.dev/)
- **Library**: [React 19](https://react.dev/)
- **Navigation**: [React Navigation 7](https://reactnavigation.org/)
- **State Management**: React Context API (AuthContext)
- **API Client**: [Axios](https://axios-http.com/)
- **Storage**: AsyncStorage
- **Icons & UI**: Lucide React Native, Vector Icons, Linear Gradient
- **Data Visualization**: React Native Chart Kit, SVG

---

## 📐 Application Architecture
The mobile app follows a clean, modular architecture:

- **Navigation (`src/navigation`)**: Centralized `AppNavigator` managing Auth and App stacks.
- **Context (`src/context`)**: Global state for authentication and user sessions.
- **Services (`src/services`)**: Centralized API layer with interceptors for token management.
- **Theme (`src/theme`)**: Unified design tokens for consistent branding.

---

## 📂 Repository Structure

```text
phone/GoLiftApp/
 ├── src/
 │   ├── screens/       # 20+ feature-specific screens
 │   ├── components/    # Reusable UI elements (Buttons, Inputs, Cards)
 │   ├── navigation/    # Stack and Tab navigation logic
 │   ├── context/       # Global Auth and State management
 │   ├── services/      # API abstraction and interceptors
 │   └── theme/         # Color palettes and typography
 ├── android/           # Native Android project files
 ├── ios/               # Native iOS project files
 ├── assets/            # Fonts, images, and static resources
 └── package.json       # App dependencies and scripts
```

---

## 📺 Screen Documentation
The application features a comprehensive suite of screens (21 total):
- **Onboarding**: `OnboardingScreen`, `Register`, `Login`, `VerifyEmail`, `ForgotPassword`.
- **Training**: `TrainingScreen`, `WorkoutSession`, `CustomWorkout`, `TemplateSelection`.
- **Insights**: `InsightsScreen`, `BodyMetrics`, `MLFlowScreen`.
- **Profile & Settings**: `ProfileScreen`, `EditProfile`, `Settings`, `ChangePassword`.
- **Discovery**: `CreationHub`, `ExerciseDetail`, `PlanDetails`.

---

## 🔗 API Integration
The app communicates with the GoLift Backend via a centralized Axios instance:
- **Environment Aware**: Automatically switches between `localhost` (iOS) and host IP (Android) for local development.
- **Auto-Refresh**: Interceptors automatically handle 401 errors by attempting a token refresh via `/v1/auth/refresh`.
- **Security**: JWT tokens are stored securely using `AsyncStorage` and injected into every authenticated request.

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (>= 22.11.0)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/)

### Steps
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Metro Bundler**:
   ```bash
   npm start
   ```
3. **Run on Android**:
   ```bash
   npm run android
   ```
4. **Run on iOS**:
   ```bash
   npm run ios
   ```

---

## 🎨 UI/UX Design
GoLift Mobile prioritizes a premium, "Glassmorphism" aesthetic:
- **Gradients**: Heavy use of linear gradients for depth and visual appeal.
- **Typography**: Optimized for mobile readability across different screen sizes.
- **Responsiveness**: Layouts are built using `react-native-safe-area-context` to ensure compatibility with various device notches and aspect ratios.

---

## 🛡️ Known Limitations
- Requires the **GoLift Backend** to be running locally on the same network.
- Some data-heavy charts are currently using placeholder data while the ML endpoints are being finalized.
- Offline mode is limited to read-only views of cached profiles.
