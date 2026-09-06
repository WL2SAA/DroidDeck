const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  checkBinaries: () => ipcRenderer.invoke('check-binaries'),
  getDevices: () => ipcRenderer.invoke('get-devices'),
  connectWireless: (ip, port) => ipcRenderer.invoke('connect-wireless', ip, port),
  disconnectWireless: (target) => ipcRenderer.invoke('disconnect-wireless', target),
  enableTcpip: (serial, port) => ipcRenderer.invoke('enable-tcpip', serial, port),
  killAdb: () => ipcRenderer.invoke('kill-adb'),
  sendKeyevent: (serial, keycode) => ipcRenderer.invoke('send-keyevent', { serial, keycode }),
  expandNotifications: (serial) => ipcRenderer.invoke('expand-notifications', { serial }),
  pushFile: (serial, filePath, remotePath) => ipcRenderer.invoke('push-file', { serial, filePath, remotePath }),
  installApk: (serial, apkPath) => ipcRenderer.invoke('install-apk', { serial, apkPath }),
  takeScreenshot: (serial) => ipcRenderer.invoke('take-screenshot', { serial }),
  getDeviceInfo: (serial) => ipcRenderer.invoke('get-device-info', { serial }),
  getScreenPreview: (serial) => ipcRenderer.invoke('get-screen-preview', { serial }),
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  launchScrcpy: (options) => ipcRenderer.invoke('launch-scrcpy', options),
  stopScrcpy: () => ipcRenderer.invoke('stop-scrcpy'),
  showDialog: (data) => ipcRenderer.invoke('show-dialog', data),
  onScrcpyLog: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('scrcpy-log', subscription);
    return () => ipcRenderer.removeListener('scrcpy-log', subscription);
  },
  onScrcpyStatus: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('scrcpy-status', subscription);
    return () => ipcRenderer.removeListener('scrcpy-status', subscription);
  }
});
