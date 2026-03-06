# 🖥️ GoLift Desktop

The professional desktop suite for the GoLift ecosystem. Powered by **Tauri v2**, this application provides a native, high-performance experience by seamlessly integrating the **React 19** frontend with a robust **FastAPI** backend logic.

---

## 1. Project Overview
GoLift Desktop is an all-in-one health and fitness platform that brings the power of AI-driven workout tracking directly to your computer. It solves the fragmentation of fitness data by providing a dedicated, secure, and fast environment for:
- Managing workout templates and custom plans.
- Tracking live training sessions with native window optimizations.
- Analyzing physical progress and strength metrics.

The application leverages **Tauri** to provide a lightweight native shell, ensuring minimal resource usage while maintaining a premium web-based UI.

---

## 2. Technology Stack
- **Desktop Framework**: [Tauri v2](https://tauri.app/)
- **Frontend Layer**: [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend Layer**: [FastAPI](https://fastapi.tiangolo.com/), [PostgreSQL](https://www.postgresql.org/)
- **System Language**: [Rust](https://www.rust-lang.org/) (Tauri Core)
- **Programming Language**: TypeScript (UI), Python (API/ML)
- **Package Managers**: npm, uv (Python), cargo (Rust)

---

## 3. Application Architecture
GoLift Desktop operates as a multi-process system:

```mermaid
graph LR
    A[Native Shell (Rust/Tauri)] <--> B[Frontend Webview (React)]
    B -- HTTP/JSON --> C[Backend API (FastAPI)]
    C <--> D[(PostgreSQL)]
```

- **Tauri Runtime**: Manages the application lifecycle, system tray, and native window properties.
- **Frontend Layer**: Renders the UI and communicates with the backend via a local or remote HTTP server.
- **Backend Layer**: Processes business logic, ML recommendations, and database persistence.

---

## 4. Repository Structure

```text
gym/ (Root)
 ├── desktop/          # Tauri Desktop shell (Rust core)
 │   ├── src-tauri/    # Rust source, config, and Cargo manifest
 │   └── package.json  # Desktop-specific dependencies
 ├── frontend/         # React UI application
 │   ├── src/          # Components, pages, and hooks
 │   └── tailwind.css  # Modern styling layer
 ├── backend/          # FastAPI system
 │   ├── app/          # Core logic and endpoints
 │   └── database/     # Models and migrations
 └── README.md         # Top-level ecosystem overview
```

---

## 5. Desktop Application Flow
1. **User Interaction**: Actions performed in the React UI.
2. **API Requests**: The frontend sends async requests to the local FastAPI server.
3. **Backend Processing**: Path logic, validation, and ML inference.
4. **Data Persistence**: Updates are stored in the PostgreSQL database.
5. **UI Update**: Reactive state updates provide instant feedback to the user.

---

## 6. Tauri Integration
The `src-tauri` directory contains the integration logic:
- **`tauri.conf.json`**: Configures window dimensions (450x800 for mobile-feel), frontend build path, and security permissions.
- **Native Setup**: Initialization logic in `lib.rs` for logging and system menu integration.
- **Inter-Process Communication (IPC)**: Currently optimized for HTTP-based communication with the backend service.

---

## 7. Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Python 3.14+](https://www.python.org/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Steps
1. **Initialize Backend**: Navigate to `/backend` and run `make dev`.
2. **Install Desktop Deps**:
   ```bash
   cd desktop
   npm install
   ```
3. **Run Dev App**:
   ```bash
   npm run tauri dev
   ```
   *This command will automatically start the frontend in dev mode and open the native window.*

---

## 8. Build and Packaging
To generate production-ready installers:
```bash
npm run tauri build
```
This produces optimized `.exe` (Windows), `.app` (macOS), or `.deb`/`.appimage` (Linux) bundles in the `src-tauri/target/release/bundle` directory.

---

## 9. Security & Distribution
- **App Isolation**: The webview is isolated from the system via Tauri's security model.
- **Restricted Access**: API communication is secured via local JWT validation.
- **Bundling**: Tauri produces self-contained installers that include only necessary dependencies, resulting in extremely small binary sizes (~5-10MB).

---

## 10. Future Improvements
- [ ] Direct SQLite integration for fully offline local storage.
- [ ] Native system tray notifications for workout reminders.
- [ ] Global hotkeys for timers and session control.
- [ ] Multi-window support for advanced analysis views.
