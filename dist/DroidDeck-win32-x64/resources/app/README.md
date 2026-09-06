# DroidDeck 📱⚡

**DroidDeck** is a desktop control and screen mirroring suite for Android featuring a sleek **Purple, White & Black** aesthetic inspired by **Android Material You gradients**, native ADB hardware controls, seamless drag-and-drop file transfers, and non-blocking `scrcpy` mirroring.

---

## 🎨 Design & Aesthetic

- **Theme Palette**: Pitch Black (`#06070a`), Crisp Pure White (`#ffffff`), and Vibrant Android Purple (`#7c3aed`, `#9333ea`, `#c084fc`).
- **Android Gradients**: Material You signature gradients (`linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c084fc 100%)`) applied to controls, sliders, status tags, and action buttons.
- **Active Device Header**: The detected device name (e.g. `Pixel 7 Pro`, `Samsung Galaxy S23`) is prominently displayed directly in the top header with a live status beacon (no `scrcpy minimal` labels).

---

## ⚡ Key Capabilities

### 1. 🎛️ Dedicated Device Quick Controls
Control your Android device directly from your PC without touching the phone:
- **◀ Back** (`KEYCODE_BACK`)
- **🏠 Home** (`KEYCODE_HOME`)
- **▢ Recents** (`KEYCODE_APP_SWITCH`)
- **⏻ Power / Lock Screen** (`KEYCODE_POWER`)
- **🔊 Volume Up** (`KEYCODE_VOLUME_UP`)
- **🔉 Volume Down** (`KEYCODE_VOLUME_DOWN`)
- **📸 Screenshot Capture** (Captures screen directly to PC Pictures folder)
- **🔔 Expand Notifications** (`cmd statusbar expand-notifications`)

### 2. 📂 File Transfer & APK Push
- **Drag & Drop**: Simply drop any file or folder directly into the DroidDeck transfer zone to push it to `/sdcard/Download/`.
- **Install APKs**: Drag-and-drop or select `.apk` files to install them directly onto your device with a single click (`adb install -r`).
- **Browse Files Dialog**: Integrated file selector for batch file transfers.

### 3. 📱 Streaming & Display Tuning
- Non-blocking detached process execution powered by `scrcpy 4.1`.
- **Display Toggles**:
  - *Turn Screen Off* (`--turn-screen-off`)
  - *Stay Awake* (`--stay-awake`)
  - *Disable Audio* (`--no-audio`)
  - *Always on Top* (`--always-on-top`)
  - *Show Touches* (`--show-touches`)
- **Max Resolution**: Stepped slider (720p, 1080p, 1440p, Native).
- **Video Bitrate**: Segment selector (4 Mbps, 8 Mbps, 12 Mbps, 16 Mbps).

### 4. 🌐 Connectivity & ADB Tools
- Real-time USB and Wireless ADB device discovery (`adb devices -l`).
- Wireless TCP/IP pairing via IP and port 5555.
- One-click **Enable TCP/IP** mode switcher for USB devices.
- One-click **Reset ADB** daemon restart.
- Collapsible diagnostics console drawer.

---

## 📁 Repository Structure

```
D:\Projects\baklava\
├── dist\
│   └── DroidDeck-win32-x64\
│       └── DroidDeck.exe                # Standalone Windows Executable
├── scripts\
│   ├── start.bat                        # Launcher with validation
│   └── build-exe.bat                    # Standalone .exe build script
├── src\
│   ├── main\                            # Electron backend services
│   │   ├── index.js                     # Main window & IPC dispatcher
│   │   ├── paths.js                     # Binary locator (PATH & fallbacks)
│   │   ├── adb.js                       # ADB device scanning, controls, file push
│   │   └── scrcpy.js                    # Non-blocking detached stream runner
│   ├── preload\
│   │   └── index.js                     # Secure ContextBridge API
│   └── renderer\                        # DroidDeck UI
│       ├── index.html                   # Semantic HTML layout
│       ├── style.css                    # Purple, White & Black Android gradient CSS
│       └── app.js                       # Client controller & state manager
├── build-exe.bat                        # Root one-click build script
├── start.bat                            # Root one-click launcher
├── package.json                         # Project configuration
└── README.md                            # Documentation
```

---

## 🚀 How to Run & Build

### Run in Development Mode
Double-click [`start.bat`](file:///D:/Projects/baklava/start.bat) or run:
```powershell
npm start
```

### Build the Standalone `.exe`
Double-click [`build-exe.bat`](file:///D:/Projects/baklava/build-exe.bat) or run:
```powershell
npm run build:exe
```

The compiled standalone executable is ready at:
```
dist\DroidDeck-win32-x64\DroidDeck.exe
```
