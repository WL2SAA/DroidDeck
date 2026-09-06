# DroidDeck 📱⚡

**DroidDeck** is a modern desktop control and screen mirroring suite for Android featuring an ultra-minimalist **Purple, White & Black** aesthetic, native ADB hardware controls, drag-and-drop file transfers, and silent non-blocking `scrcpy` mirroring with **zero CMD prompts**.

---

## 🎨 Design & Responsive Layout

- **Compact Default Window**: Opens in a compact footprint (`760x530px`) modeled after the standard Windows Command Prompt window.
- **Dynamic Auto-Organizing Fullscreen**:
  - Automatically reorganizes into **3 balanced, full-height columns** on widescreen/fullscreen monitors:
    1. **Connection & Wireless ADB**
    2. **Display & Streaming Flags**
    3. **File Transfer, APK Push & Storage Target**
  - All cards stretch to fill vertical and horizontal space, eliminating empty voids.
- **Color Palette**: Pitch Black (`#08080a`), Graphite (`#101014`), Pure White (`#ffffff`), and surgical Android Purple (`#7c3aed`).

---

## 🔕 100% Hidden Console Prompts

- **No Scrcpy Console**: Removed `detached: true` flag in Node process spawning, allowing `windowsHide: true` to suppress Windows console allocation so only the native mirrored screen appears.
- **No ADB Flicker**: All ADB queries, keyevents, screenshots, and transfers are executed with `{ windowsHide: true }`.
- **Zero-Console Launchers**:
  - `DroidDeck.lnk`: Direct root Windows shortcut pointing to the native GUI executable.
  - `start.vbs`: Headless VBScript launcher that invokes the app with window style `0`.
  - `start.bat`: Instantly delegates to the GUI executable and exits.

---

## 🎛️ Features

1. **Active Device Display**: Top header displays the connected Android model name and live status beacon (no generic branding).
2. **Device Hardware Controls**: Instant access to `Back`, `Home`, `Recents`, `Power`, `Volume + / -`, `Screenshot`, and `Notifications`.
3. **File Transfer & APK Push**: Drag & drop any file or `.apk` to send to `/sdcard/Download/` or install with one click.
4. **Streaming Settings**: Native switches for *Screen Off*, *Stay Awake*, *Audio*, *Always on Top*, and *Touches*, plus segmented resolution and bitrate controls.

---

## 🚀 How to Run & Build

### Recommended: Double-Click the Shortcut
Double-click [`DroidDeck.lnk`](file:///D:/Projects/baklava/DroidDeck.lnk) in the root directory (opens with **zero console prompt**).

### Development Mode
Run [`start.bat`](file:///D:/Projects/baklava/start.bat) or [`start.vbs`](file:///D:/Projects/baklava/start.vbs).

### Rebuild Standalone `.exe`
Run [`build-exe.bat`](file:///D:/Projects/baklava/build-exe.bat) or:
```powershell
npm run build:exe
```
Executable compiled to:
```
dist\DroidDeck-win32-x64\DroidDeck.exe
```
