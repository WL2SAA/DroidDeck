# DroidDeck 📱⚡

**DroidDeck** is a modern, minimalist desktop controller and screen mirroring suite for Android. Built with an elegant **Purple, White & Black** palette, DroidDeck gives you hardware remote control, live screen previews, full hardware specifications, wireless ADB pairing, drag-and-drop file transfers, and silent `scrcpy` mirroring with **zero flashing CMD prompts**.

---

## 🎨 Key Highlights & Design

- **Handcrafted Minimalist Aesthetic**: A dark interface featuring Pitch Black (`#08080a`), Slate Charcoal (`#101014`), crisp white typography, and vibrant Android Purple (`#7c3aed`) accents.
- **Dynamic Auto-Organizing Layout**:
  - **Compact Default Window**: Opens in a neat `760x530px` window (similar to Windows CMD).
  - **Fluid Responsive Fullscreen**: Automatically rearranges into balanced, full-height columns without dead or awkward empty space when resized or maximized.
- **Zero CMD Windows or Console Popups**:
  - All background subprocesses (`scrcpy`, `adb`, system diagnostics) run with `windowsHide: true` and direct headless pipes. No black command prompts flash on your screen.

---

## ✨ Features

### 1. 📲 Prominent Device Header & Live Status
- Displays your connected device model name (e.g. `Samsung SM-N986B`) and connection type (`USB` / `WI-FI`).
- **Live Battery Indicator**: Shows battery percentage and real-time charging status (`97% ⚡`).
- **Android OS Pill**: Instant readout of your Android version (e.g. `Android 13`).

### 2. 🔍 Comprehensive Device Specifications Modal
- Click the **Specs** button to view:
  - **Hardware**: Manufacturer, Model, Brand, CPU Architecture (`arm64-v8a`).
  - **Operating System**: Android Version & API SDK level.
  - **Display**: Screen resolution and density (DPI).
  - **Internal Storage**: Used, free, and total disk space on `/data`.
  - **Network IP**: View Wi-Fi IP address with a 1-click **Use IP for Wireless** button.

### 3. 🖼️ Embedded Live Screen Preview
- Built-in snapshot preview directly inside the GUI.
- Manual refresh snapshot button or toggle **Live** mode (auto-refreshes every 2.5s) without needing to launch a full scrcpy session.

### 4. 🎮 Remote Navigation & Hardware Controls
- Quick-access remote control strip:
  - **Back** (`KEYCODE_BACK`)
  - **Home** (`KEYCODE_HOME`)
  - **Recents** (`KEYCODE_APP_SWITCH`)
  - **Power / Screen Lock** (`KEYCODE_POWER`)
  - **Volume Down & Up**
  - **Notifications** (expands the notification shade)
  - **Screenshot** (captures and saves full-resolution image to PC Pictures folder)

### 5. 📂 Drag & Drop File Transfer & APK Installer
- Drag and drop any files into the card to push directly to `/sdcard/Download/`.
- Drag or select `.apk` files to install them immediately via ADB with progress indicators.

### 6. 🌐 Wireless ADB Pairing
- Connect wirelessly by IP and port (`:5555`).
- One-click **TCP/IP** mode switch for seamless cable-free transition.

### 7. ⚙️ Stream Configuration & Scrcpy Engine
- Segmented resolution selector: `720p`, `1080p`, `1440p`, or `Native`.
- Bitrate selector: `4 Mbps`, `8 Mbps`, `12 Mbps`, `16 Mbps`.
- Toggles for *Turn screen off*, *Stay awake*, *Disable audio*, *Always on top*, and *Show touches*.
- Collapsible diagnostics console drawer.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have ADB and scrcpy installed on your machine:
```bash
# Using Windows Package Manager (winget)
winget install Google.PlatformTools
winget install Genymobile.scrcpy
```

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/WL2SAA/DroidDeck.git
cd DroidDeck
npm install
```

### Running the App
- **Double Click**: Launch [`DroidDeck.lnk`](DroidDeck.lnk) or run [`start.vbs`](start.vbs) for a zero-console launch.
- **Development**:
  ```bash
  npm start
  ```

### Building the Executable
Package DroidDeck into a standalone Windows `.exe`:
```bash
npm run build:exe
```
The compiled application will be generated in:
```
dist/DroidDeck-win32-x64/DroidDeck.exe
```

---

## 🛠️ Tech Stack
- **Framework**: Electron
- **Front-end**: HTML5, CSS3 (Modern Flexbox & Responsive Grid System), JavaScript (ES6+)
- **Bridge**: Electron ContextBridge & IPC
- **Backend & Subprocesses**: Node.js `child_process` (`execFile`) interfacing with `adb` and `scrcpy`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
