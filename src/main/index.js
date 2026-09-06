const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { findExecutable } = require('./paths');
const adb = require('./adb');
const scrcpy = require('./scrcpy');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 760,
    height: 530,
    minWidth: 600,
    minHeight: 440,
    backgroundColor: '#07070a',
    title: 'DroidDeck',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#07070a',
      symbolColor: '#c084fc',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
    scrcpy.stopScrcpy().catch(() => {});
  });
}

app.whenReady().then(async () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: Check binary dependencies
ipcMain.handle('check-binaries', async () => {
  const adbPath = await findExecutable('adb');
  const scrcpyPath = await findExecutable('scrcpy');

  return {
    adb: {
      found: Boolean(adbPath),
      path: adbPath || null
    },
    scrcpy: {
      found: Boolean(scrcpyPath),
      path: scrcpyPath || null
    }
  };
});

// IPC: ADB Devices
ipcMain.handle('get-devices', async () => {
  return adb.getDevices();
});

// IPC: Wireless Connect
ipcMain.handle('connect-wireless', async (event, ip, port) => {
  return adb.connectWireless(ip, port);
});

// IPC: Wireless Disconnect
ipcMain.handle('disconnect-wireless', async (event, target) => {
  return adb.disconnectWireless(target);
});

// IPC: Enable TCP/IP on USB
ipcMain.handle('enable-tcpip', async (event, serial, port) => {
  return adb.enableTcpip(serial, port);
});

// IPC: Kill / Restart ADB
ipcMain.handle('kill-adb', async () => {
  return adb.killAdb();
});

// IPC: Device Hardware & Navigation Controls
ipcMain.handle('send-keyevent', async (event, { serial, keycode }) => {
  return adb.sendKeyevent(serial, keycode);
});

ipcMain.handle('expand-notifications', async (event, { serial }) => {
  return adb.expandNotifications(serial);
});

// IPC: File Transfer & APK Install
ipcMain.handle('push-file', async (event, { serial, filePath, remotePath }) => {
  return adb.pushFile(serial, filePath, remotePath);
});

ipcMain.handle('install-apk', async (event, { serial, apkPath }) => {
  return adb.installApk(serial, apkPath);
});

// IPC: Screenshot
ipcMain.handle('take-screenshot', async (event, { serial }) => {
  const picturesDir = app.getPath('pictures') || app.getPath('downloads');
  return adb.takeScreenshot(serial, picturesDir);
});

// IPC: Select files via dialog
ipcMain.handle('open-file-dialog', async (event, options = {}) => {
  return dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Select Files to Transfer',
    properties: ['openFile', ...(options.multi ? ['multiSelections'] : [])],
    filters: options.filters || [
      { name: 'All Files', extensions: ['*'] },
      { name: 'APKs', extensions: ['apk'] }
    ]
  });
});

// IPC: Launch scrcpy
ipcMain.handle('launch-scrcpy', async (event, options) => {
  return scrcpy.launchScrcpy(
    options,
    (logData) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('scrcpy-log', logData);
      }
    },
    (statusData) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('scrcpy-status', statusData);
      }
    }
  );
});

// IPC: Stop scrcpy
ipcMain.handle('stop-scrcpy', async () => {
  return scrcpy.stopScrcpy();
});

// IPC: Native Dialog
ipcMain.handle('show-dialog', async (event, { type, title, message }) => {
  return dialog.showMessageBox(mainWindow, {
    type: type || 'info',
    title: title || 'DroidDeck',
    message: message || ''
  });
});
