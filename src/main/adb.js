const { exec, execFile } = require('child_process');
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
 * Get detailed device specifications and status (battery, OS, display, storage, IP)
 */
async function getDeviceInfo(serial) {
  const adb = await getAdbPath();
  const args = [];
  if (serial && serial !== 'auto') {
    args.push('-s', serial);
  }
  
  // Clean single-line command for Android shell
  const shellCmd = "echo ===PROPS=== && getprop ro.product.manufacturer && getprop ro.product.model && getprop ro.product.brand && getprop ro.build.version.release && getprop ro.build.version.sdk && getprop ro.product.cpu.abi && echo ===BATTERY=== && dumpsys battery && echo ===DISPLAY=== && wm size && wm density && echo ===STORAGE=== && df -h /data && echo ===NETWORK=== && ip -o -4 addr show wlan0";
  args.push('shell', shellCmd);

  return new Promise((resolve, reject) => {
    execFile(adb, args, { windowsHide: true }, (error, stdout) => {
      if (error && !stdout) {
        return reject(new Error(error.message));
      }

      const raw = stdout || '';
      const sections = {};
      let currentSec = 'INIT';
      raw.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
          currentSec = trimmed.replace(/=/g, '');
          sections[currentSec] = [];
        } else if (currentSec) {
          if (!sections[currentSec]) sections[currentSec] = [];
          sections[currentSec].push(trimmed);
        }
      });

      // Parse Props
      const props = sections['PROPS'] || [];
      const manufacturer = props[0] || '';
      const model = props[1] || '';
      const brand = props[2] || '';
      const androidVersion = props[3] || 'Unknown';
      const sdk = props[4] || '';
      const abi = props[5] || '';

      // Parse Battery
      let batteryLevel = 0;
      let isCharging = false;
      let batteryStatus = 'Unknown';
      (sections['BATTERY'] || []).forEach(line => {
        if (line.includes('level:')) {
          batteryLevel = parseInt(line.split(':')[1].trim(), 10) || 0;
        } else if (line.includes('status:')) {
          const st = parseInt(line.split(':')[1].trim(), 10);
          // 2 = Charging, 3 = Discharging, 4 = Not charging, 5 = Full
          if (st === 2 || st === 5) isCharging = true;
          batteryStatus = st === 2 ? 'Charging' : (st === 5 ? 'Full' : 'Discharging');
        } else if (line.includes('AC powered: true') || line.includes('USB powered: true') || line.includes('Wireless powered: true')) {
          isCharging = true;
        }
      });

      // Parse Display
      let resolution = 'Unknown';
      let density = '';
      (sections['DISPLAY'] || []).forEach(line => {
        if (line.toLowerCase().includes('size:')) {
          const parts = line.split(':');
          if (parts[1]) resolution = parts[1].trim();
        } else if (line.toLowerCase().includes('density:')) {
          const parts = line.split(':');
          if (parts[1]) density = parts[1].trim();
        }
      });

      // Parse Storage
      let storageUsed = '';
      let storageAvail = '';
      let storageSize = '';
      let storagePercent = '';
      const storageLines = sections['STORAGE'] || [];
      if (storageLines.length > 1) {
        const lastLine = storageLines[storageLines.length - 1];
        const parts = lastLine.split(/\s+/);
        if (parts.length >= 5) {
          storageSize = parts[1];
          storageUsed = parts[2];
          storageAvail = parts[3];
          storagePercent = parts[4];
        }
      }

      // Parse IP
      let ip = '';
      const netLines = sections['NETWORK'] || [];
      for (const line of netLines) {
        const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
          ip = match[1];
          break;
        }
      }

      resolve({
        manufacturer: manufacturer ? manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1) : '',
        model: model || 'Android Device',
        brand: brand ? brand.toUpperCase() : '',
        androidVersion,
        sdk,
        abi,
        battery: {
          level: batteryLevel,
          charging: isCharging,
          status: batteryStatus
        },
        display: {
          resolution,
          density
        },
        storage: {
          size: storageSize,
          used: storageUsed,
          available: storageAvail,
          percent: storagePercent
        },
        network: {
          ip
        }
      });
    });
  });
}

/**
 * Capture quick screen snapshot as base64 JPEG/PNG for live preview card
 */
async function getScreenPreview(serial) {
  const adb = await getAdbPath();
  const serialFlag = serial && serial !== 'auto' ? `-s ${serial}` : '';

  return new Promise((resolve, reject) => {
    // Exec-out screencap produces raw PNG stream directly to buffer
    exec(`"${adb}" ${serialFlag} exec-out screencap -p`, {
      encoding: 'buffer',
      maxBuffer: 15 * 1024 * 1024,
      windowsHide: true
    }, (error, stdout) => {
      if (error || !stdout || stdout.length < 100) {
        return reject(new Error(error ? error.message : 'Failed to capture screen preview'));
      }
      const base64 = stdout.toString('base64');
      resolve(`data:image/png;base64,${base64}`);
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
  takeScreenshot,
  getDeviceInfo,
  getScreenPreview
};
