const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { findExecutable } = require('./paths');

let cachedAdbPath = null;

async function getAdbPath() {
  if (!cachedAdbPath) {
    cachedAdbPath = await findExecutable('adb');
  }
  if (!cachedAdbPath) {
    throw new Error('ADB binary not found. Please ensure Android Platform Tools is installed and in PATH.');
  }
  return cachedAdbPath;
}

/**
 * Lists connected ADB devices.
 */
async function getDevices() {
  const adb = await getAdbPath();
  return new Promise((resolve, reject) => {
    exec(`"${adb}" devices -l`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }

      const lines = stdout.split(/\r?\n/);
      const devices = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const serial = parts[0];
          const state = parts[1];
          let model = '';
          let product = '';

          for (let j = 2; j < parts.length; j++) {
            if (parts[j].startsWith('model:')) {
              model = parts[j].split(':')[1].replace(/_/g, ' ');
            } else if (parts[j].startsWith('product:')) {
              product = parts[j].split(':')[1];
            }
          }

          devices.push({
            serial,
            state,
            model: model || product || 'Android Device',
            product: product || '',
            isWireless: serial.includes(':')
          });
        }
      }

      resolve(devices);
    });
  });
}

/**
 * Connect to device over wireless ADB.
 */
async function connectWireless(ip, port = 5555) {
  const adb = await getAdbPath();
  const target = `${ip.trim()}:${port || 5555}`;
  return new Promise((resolve, reject) => {
    exec(`"${adb}" connect ${target}`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: stdout.trim(), target });
    });
  });
}

/**
 * Disconnect from wireless ADB.
 */
async function disconnectWireless(target) {
  const adb = await getAdbPath();
  return new Promise((resolve, reject) => {
    const cmd = target ? `"${adb}" disconnect ${target}` : `"${adb}" disconnect`;
    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: stdout.trim() });
    });
  });
}

/**
 * Enable TCP/IP mode on USB device.
 */
async function enableTcpip(serial, port = 5555) {
  const adb = await getAdbPath();
  return new Promise((resolve, reject) => {
    const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
    exec(`"${adb}" ${serialFlag} tcpip ${port}`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: stdout.trim() });
    });
  });
}

/**
 * Restart ADB daemon.
 */
async function killAdb() {
  const adb = await getAdbPath();
  return new Promise((resolve) => {
    exec(`"${adb}" kill-server`, { windowsHide: true }, () => {
      exec(`"${adb}" start-server`, { windowsHide: true }, (err2, stdout2) => {
        resolve({ output: 'ADB server restarted successfully.' });
      });
    });
  });
}

/**
 * Send Android keyevent (Home: 3, Back: 4, Recents: 187, Power: 26, VolUp: 24, VolDown: 25)
 */
async function sendKeyevent(serial, keycode) {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
  return new Promise((resolve, reject) => {
    exec(`"${adb}" ${serialFlag} shell input keyevent ${keycode}`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: 'Keyevent sent' });
    });
  });
}

/**
 * Expand notification panel
 */
async function expandNotifications(serial) {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
  return new Promise((resolve, reject) => {
    exec(`"${adb}" ${serialFlag} shell cmd statusbar expand-notifications`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: 'Notifications expanded' });
    });
  });
}

/**
 * Transfer / push file to device (default destination: /sdcard/Download/)
 */
async function pushFile(serial, localFilePath, remotePath = '/sdcard/Download/') {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
  const fileName = path.basename(localFilePath);
  const targetRemote = `${remotePath.replace(/\/$/, '')}/${fileName}`;

  return new Promise((resolve, reject) => {
    exec(`"${adb}" ${serialFlag} push "${localFilePath}" "${targetRemote}"`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: stdout.trim(), fileName, remotePath: targetRemote });
    });
  });
}

/**
 * Install APK file on device
 */
async function installApk(serial, localApkPath) {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
  const fileName = path.basename(localApkPath);

  return new Promise((resolve, reject) => {
    exec(`"${adb}" ${serialFlag} install -r "${localApkPath}"`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: stdout.trim(), fileName });
    });
  });
}

/**
 * Capture screenshot and save to user's Pictures or Downloads folder
 */
async function takeScreenshot(serial, destFolder) {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `droiddeck_screenshot_${timestamp}.png`;
  const fullPath = path.join(destFolder, filename);

  return new Promise((resolve, reject) => {
    exec(`"${adb}" ${serialFlag} exec-out screencap -p > "${fullPath}"`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve({ output: 'Screenshot captured', filePath: fullPath, fileName: filename });
    });
  });
}

module.exports = {
  getAdbPath,
  getDevices,
  connectWireless,
  disconnectWireless,
  enableTcpip,
  killAdb,
  sendKeyevent,
  expandNotifications,
  pushFile,
  installApk,
  takeScreenshot
};
