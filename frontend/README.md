# ⚡ GoLift Frontend

A premium, state-of-the-art fitness tracking and workout management interface. Built with **React 19**, **Vite 7**, and **Tailwind CSS 4**, GoLift offers a smooth, high-performance user experience with a focus on visual excellence and intuitive interaction.

---

## 1. Project Overview
GoLift Frontend is the user interface for the GoLift ecosystem. Its primary goal is to provide athletes and fitness enthusiasts with a powerful yet simple platform to:
- **Build & Manage Plans**: Easily create custom workout splits or use AI-generated recommendations.
- **Track Sessions in Real-Time**: Interactive workout execution with automated rest timers and weight tracking.
- **Visualize Progress**: Modern dashboard with insights into training volume, frequency, and personal records.
- **Cross-Platform Readiness**: Designed for desktop, web, and capable of being packaged as a native desktop app via **Tauri**.

---

## 2. Technology Stack
- **Framework**: [React 19](https://react.dev/) (utilizing the latest React Compiler)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (using the new CSS-first configuration)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Primitives) & Custom Premium Components
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`AuthContext`)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **API Client**: Axios with automatic token refresh logic
- **Charts**: [Recharts](https://recharts.org/)

---

## 3. Frontend Architecture
The project follows a **Feature-Based Modular Architecture**:

- **Components (`src/components`)**: Separated into generic `ui/` primitives (atomic design) and feature-specific components like `dashboard/`.
- **Pages (`src/pages`)**: High-level route containers that orchestrate services and components.
- **Context (`src/context`)**: Global state providers (Authentication, Theme).
- **Hooks (`src/hooks`)**: Reusable logic for auth, data fetching, and UI state.
- **Lib (`src/lib`)**: Infrastructure code, including the custom Axios instance with interceptors.

---

## 4. Folder Structure

```text
frontend/
 ├── src/
 │   ├── assets/       # Static assets and brand identities
 │   ├── components/   # UI Library and Feature components
 │   │   ├── dashboard/# Feature: Tracking, Building, Insights
 │   │   └── ui/       # Atomic components (Buttons, Cards, Inputs)
 │   ├── context/      # Auth and UI Global state
 │   ├── hooks/        # Custom React hooks
 │   ├── lib/          # API services and global utilities
 │   ├── pages/        # Application routes/screens
 │   ├── App.tsx       # Main routing and provider setup
 │   ├── index.css     # Tailwind 4 configuration & global styles
 │   └── main.tsx      # Entry point
 ├── public/           # Static public files
 ├── tailwind.config.ts# Legacy tailwind config (if needed)
 └── vite.config.ts    # Build and dev server configuration
```

---

## 5. Page Structure
- **Landing (`/`)**: High-impact brand welcome page.
- **Auth Pages**: Login, Registration, Password Reset, and Email Verification.
- **Dashboard (`/dashboard`)**: Central hub for workout plans and quick actions.
- **Training (`/training`)**: The core session tracking interface.
- **Insights (`/insights`)**: Performance data visualization.
- **Exercise Detail (`/exercise/:id`)**: Detailed history and metrics for specific exercises.
- **Settings (`/settings`)**: User profile and application preferences.

---

## 6. UI Design System
GoLift uses a sophisticated design system defined in `src/index.css`:
- **OKLCH Color Space**: Utilizing modern, perceptually uniform color definitions for vibrant purples and deep grays.
- **Dynamic Theming**: Deep integration of light and dark modes via a `ThemeProvider`.
- **Typography**: Space Grotesk for headings and Inter for body text, ensuring high readability and a "premium tech" aesthetic.
- **Glassmorphism**: Subtle blurs and semi-transparent layers for a modern feeling.

---

## 7. State Management & API Integration
### Authentication Flow
Managed via `AuthContext`, the application handles session persistence automatically:
1.  **Login**: Stores JWT and user metadata in `localStorage`.
2.  **Persistent Session**: Verifies the token on app load via the `/me` endpoint.
3.  **Automatic Refresh**: The custom Axios instance (`src/lib/axios.ts`) includes interceptors that detect `401 Unauthorized` responses and attempt to refresh the access token silently.

### Data Fetching
- Component-level `useEffect` hooks for page-specific data.
- Centralized service methods in `src/lib/session-service.ts` for complex multi-step flows like workout execution.

---

## 8. Environment Setup

### Prerequisites
- Node.js (Latest LTS)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env  # Configure VITE_API_URL
```

### Development
```bash
# Run the development server
npm run dev
```

### Tauri Desktop App
```bash
# Run as a desktop application
npm run tauri dev
```

---

## 9. Performance & Accessibility
- **React Compiler**: Optimized for minimum re-renders without manual `useMemo`/`useCallback` clutter.
- **Code Splitting**: Routes are dynamically imported (lazy loading) to minimize initial bundle size.
- **Accessibility**: Built on Radix UI primitives to ensure keyboard navigation and screen reader support.
- **Responsiveness**: Mobile-first design with a specialized "Mobile Bottom Nav" for handheld usage.

---

## 10. Future Improvements
- [ ] Offline-first persistence with IndexedDB/Sync.
- [ ] Interactive live-training audio cues.
- [ ] Social features for sharing workout plans.
- [ ] Enhanced biometrics integration (Apple Health / Google Fit).
