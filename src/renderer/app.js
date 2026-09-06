// DroidDeck - Minimalist Desktop Controller

document.addEventListener('DOMContentLoaded', () => {
  // Header Elements
  const headerDeviceDisplay = document.getElementById('header-device-display');
  const topDeviceName = document.getElementById('top-device-name');
  const topDeviceBadge = document.getElementById('top-device-badge');
  const topBatteryPill = document.getElementById('top-battery-pill');
  const topBatteryText = document.getElementById('top-battery-text');
  const topOsPill = document.getElementById('top-os-pill');
  const topOsText = document.getElementById('top-os-text');
  const btnDeviceInfo = document.getElementById('btn-device-info');
  const badgeAdb = document.getElementById('badge-adb');
  const badgeScrcpy = document.getElementById('badge-scrcpy');

  // Preview Card Elements
  const sectionPreview = document.getElementById('section-preview');
  const previewLiveTag = document.getElementById('preview-live-tag');
  const btnRefreshPreview = document.getElementById('btn-refresh-preview');
  const toggleAutoPreview = document.getElementById('toggle-auto-preview');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewImg = document.getElementById('preview-img');

  // Device Info Modal Elements
  const deviceInfoModal = document.getElementById('device-info-modal');
  const btnCloseSpecs = document.getElementById('btn-close-specs');
  const btnCopyIp = document.getElementById('btn-copy-ip');
  const specManufacturer = document.getElementById('spec-manufacturer');
  const specModel = document.getElementById('spec-model');
  const specAndroid = document.getElementById('spec-android');
  const specAbi = document.getElementById('spec-abi');
  const specBattery = document.getElementById('spec-battery');
  const specDisplay = document.getElementById('spec-display');
  const specStorage = document.getElementById('spec-storage');
  const specIp = document.getElementById('spec-ip');

  // Device Selection
  const deviceSelect = document.getElementById('device-select');
  const deviceCountBadge = document.getElementById('device-count-badge');
  const btnRefreshDevices = document.getElementById('btn-refresh-devices');
  const btnTcpipMode = document.getElementById('btn-tcpip-mode');

  // Wireless
  const inputIp = document.getElementById('input-ip');
  const inputPort = document.getElementById('input-port');
  const btnConnectWireless = document.getElementById('btn-connect-wireless');
  const btnDisconnectWireless = document.getElementById('btn-disconnect-wireless');

  // Remote Strip Controls
  const remoteItems = document.querySelectorAll('.remote-item');

  // Display & Stream Toggles
  const toggleTurnScreenOff = document.getElementById('toggle-turn-screen-off');
  const toggleStayAwake = document.getElementById('toggle-stay-awake');
  const toggleNoAudio = document.getElementById('toggle-no-audio');
  const toggleAlwaysOnTop = document.getElementById('toggle-always-on-top');
  const toggleShowTouches = document.getElementById('toggle-show-touches');

  // Segmented Controls (Resolution & Bitrate)
  const resolutionSegments = document.querySelectorAll('#resolution-segments .segment');
  const resolutionValueDisplay = document.getElementById('resolution-value-display');
  const bitrateSegments = document.querySelectorAll('#bitrate-segments .segment');
  const bitrateDisplay = document.getElementById('bitrate-display');

  // File Transfer
  const dropZone = document.getElementById('drop-zone');
  const btnBrowseFiles = document.getElementById('btn-browse-files');
  const btnBrowseApk = document.getElementById('btn-browse-apk');
  const transferStatus = document.getElementById('transfer-status');
  const transferStatusText = document.getElementById('transfer-status-text');

  // Footer Actions
  const btnLaunch = document.getElementById('btn-launch-scrcpy');
  const btnLaunchText = document.getElementById('btn-launch-text');
  const btnStop = document.getElementById('btn-stop-stream');
  const btnKillAdb = document.getElementById('btn-kill-adb');
  const streamStateText = document.getElementById('stream-state-text');

  // Terminal Logs
  const btnToggleTerminal = document.getElementById('btn-toggle-terminal');
  const terminalDrawer = document.getElementById('terminal-drawer');
  const terminalOutput = document.getElementById('terminal-output');
  const btnClearLogs = document.getElementById('btn-clear-logs');

  // Modal
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalGuide = document.getElementById('modal-guide');
  const modalBtnConfirm = document.getElementById('modal-btn-confirm');

  // State
  let selectedBitrate = 8;
  let selectedResolutionVal = 1080;
  const resolutionMap = {
    0: { label: '720p', value: 720 },
    1: { label: '1080p', value: 1080 },
    2: { label: '1440p', value: 1440 },
    3: { label: 'Native', value: 'native' }
  };
  let currentDevices = [];
  let activeDevice = null;
  let activeDeviceInfo = null;
  let autoPreviewTimer = null;

  // Keycode mapping for Android hardware controls
  const keycodeMap = {
    back: 4,          // KEYCODE_BACK
    home: 3,          // KEYCODE_HOME
    recents: 187,     // KEYCODE_APP_SWITCH
    power: 26,        // KEYCODE_POWER
    volup: 24,        // KEYCODE_VOLUME_UP
    voldown: 25       // KEYCODE_VOLUME_DOWN
  };

  // Logger
  function log(text, type = 'system') {
    const item = document.createElement('div');
    item.className = `log-item ${type}`;
    const time = new Date().toLocaleTimeString();
    item.textContent = `[${time}] ${text}`;
    terminalOutput.appendChild(item);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  // Modal Dialog
  function showModal(title, message, guideText = '') {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    if (guideText) {
      modalGuide.textContent = guideText;
      modalGuide.style.display = 'block';
    } else {
      modalGuide.style.display = 'none';
    }
    modalOverlay.classList.remove('hidden');
  }

  modalBtnConfirm.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });

  // 1. Binary Dependencies Check
  async function checkBinaries() {
    try {
      const binaries = await window.api.checkBinaries();
      log(`Binary check: ADB (${binaries.adb.found ? binaries.adb.path : 'missing'}), scrcpy (${binaries.scrcpy.found ? binaries.scrcpy.path : 'missing'})`);

      if (binaries.adb.found) {
        badgeAdb.className = 'status-pill success';
        badgeAdb.title = `ADB: ${binaries.adb.path}`;
      } else {
        badgeAdb.className = 'status-pill danger';
        badgeAdb.title = 'ADB binary not found';
      }

      if (binaries.scrcpy.found) {
        badgeScrcpy.className = 'status-pill success';
        badgeScrcpy.title = `scrcpy: ${binaries.scrcpy.path}`;
      } else {
        badgeScrcpy.className = 'status-pill danger';
        badgeScrcpy.title = 'scrcpy binary not found';
      }

      if (!binaries.adb.found || !binaries.scrcpy.found) {
        const missing = [];
        if (!binaries.adb.found) missing.push('adb');
        if (!binaries.scrcpy.found) missing.push('scrcpy');

        showModal(
          'Missing Tool Dependencies',
          `Required binaries not found in PATH: ${missing.join(', ')}.`,
          `Fix options:\n• scrcpy: 'winget install Genymobile.scrcpy'\n• adb: 'winget install Google.PlatformTools'`
        );
      }

      return binaries;
    } catch (err) {
      log(`Error checking binaries: ${err.message}`, 'stderr');
      return null;
    }
  }

  // 2. Scan Devices & Update Header Device Display
  async function refreshDevices() {
    btnRefreshDevices.disabled = true;
    const svgIcon = btnRefreshDevices.querySelector('svg');
    if (svgIcon) svgIcon.classList.add('spinning');
    log('Scanning for connected Android devices...');

    try {
      const devices = await window.api.getDevices();
      currentDevices = devices;
      deviceCountBadge.textContent = `${devices.length} ${devices.length === 1 ? 'device' : 'devices'}`;

      deviceSelect.innerHTML = '';

      if (devices.length === 0) {
        activeDevice = null;
        const opt = document.createElement('option');
        opt.value = 'auto';
        opt.textContent = 'No devices found';
        deviceSelect.appendChild(opt);

        headerDeviceDisplay.className = 'device-pill';
        topDeviceName.textContent = 'No Device Connected';
        topDeviceBadge.textContent = 'OFFLINE';
      } else {
        devices.forEach((dev) => {
          const opt = document.createElement('option');
          opt.value = dev.serial;
          const connType = dev.isWireless ? 'Wi-Fi' : 'USB';
          opt.textContent = `${dev.model} [${dev.serial}] (${connType} - ${dev.state})`;
          deviceSelect.appendChild(opt);
        });

        activeDevice = devices[0];
        updateTopDeviceHeader(activeDevice);
        log(`Active target: ${activeDevice.model} (${activeDevice.serial})`, 'stdout');
      }
    } catch (err) {
      log(`Device scan failed: ${err.message}`, 'stderr');
      deviceCountBadge.textContent = 'Error';
      headerDeviceDisplay.className = 'device-pill';
      topDeviceName.textContent = 'Scan Error';
      topDeviceBadge.textContent = 'ERROR';
      showModal('Device Scan Failed', err.message);
    } finally {
      btnRefreshDevices.disabled = false;
      if (svgIcon) svgIcon.classList.remove('spinning');
    }
  }

  function updateTopDeviceHeader(dev) {
    if (!dev) {
      headerDeviceDisplay.className = 'device-pill';
      topDeviceName.textContent = 'No Device Connected';
      topDeviceBadge.textContent = 'OFFLINE';
      topBatteryPill.classList.add('hidden');
      topOsPill.classList.add('hidden');
      btnDeviceInfo.classList.add('hidden');
      clearScreenPreview();
      activeDeviceInfo = null;
      return;
    }

    headerDeviceDisplay.className = 'device-pill connected';
    topDeviceName.textContent = `${dev.model}`;
    topDeviceBadge.textContent = dev.isWireless ? 'WI-FI' : 'USB';
    btnDeviceInfo.classList.remove('hidden');

    // Trigger asynchronous fetch of full specs & battery
    fetchDeviceInfo(dev.serial);

    // If auto-preview is enabled or preview is visible, refresh snapshot
    fetchScreenPreview(dev.serial);
  }

  // Fetch full device specifications
  async function fetchDeviceInfo(serial) {
    try {
      const info = await window.api.getDeviceInfo(serial);
      activeDeviceInfo = info;

      // Update Topbar Battery Pill
      if (info.battery && info.battery.level !== undefined) {
        topBatteryText.textContent = `${info.battery.level}%${info.battery.charging ? ' ⚡' : ''}`;
        topBatteryPill.classList.remove('hidden');
        if (info.battery.charging) {
          topBatteryPill.classList.add('charging');
        } else {
          topBatteryPill.classList.remove('charging');
        }
      }

      // Update Topbar OS Pill
      if (info.androidVersion && info.androidVersion !== 'Unknown') {
        topOsText.textContent = `Android ${info.androidVersion}`;
        topOsPill.classList.remove('hidden');
      }

      // Auto-populate Wireless IP if available and field is empty
      if (info.network && info.network.ip && !inputIp.value.trim()) {
        inputIp.placeholder = info.network.ip;
      }

      log(`Device Specs loaded: ${info.model} (Android ${info.androidVersion}, Batt: ${info.battery.level}%)`, 'system');
    } catch (err) {
      log(`Could not load detailed device specs: ${err.message}`, 'system');
    }
  }

  // Fetch quick snapshot for preview card
  async function fetchScreenPreview(serial) {
    if (!serial || serial === 'auto') return;
    previewLiveTag.textContent = 'FETCHING';

    try {
      const dataUri = await window.api.getScreenPreview(serial);
      previewImg.src = dataUri;
      previewImg.classList.remove('hidden');
      previewPlaceholder.classList.add('hidden');
      previewLiveTag.textContent = 'ACTIVE';
      previewLiveTag.classList.add('active');
    } catch (err) {
      previewLiveTag.textContent = 'IDLE';
      previewLiveTag.classList.remove('active');
    }
  }

  function clearScreenPreview() {
    previewImg.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    previewLiveTag.textContent = 'IDLE';
    previewLiveTag.classList.remove('active');
    if (autoPreviewTimer) {
      clearInterval(autoPreviewTimer);
      autoPreviewTimer = null;
      toggleAutoPreview.checked = false;
    }
  }

  // Device Info Modal Handler
  btnDeviceInfo.addEventListener('click', () => {
    if (!activeDeviceInfo && activeDevice) {
      fetchDeviceInfo(activeDevice.serial);
    }

    if (activeDeviceInfo) {
      specManufacturer.textContent = activeDeviceInfo.manufacturer || '--';
      specModel.textContent = activeDeviceInfo.model || '--';
      specAndroid.textContent = activeDeviceInfo.androidVersion ? `Android ${activeDeviceInfo.androidVersion} (API ${activeDeviceInfo.sdk || '--'})` : '--';
      specAbi.textContent = activeDeviceInfo.abi || '--';
      specBattery.textContent = `${activeDeviceInfo.battery.level}% (${activeDeviceInfo.battery.status}${activeDeviceInfo.battery.charging ? ', Charging' : ''})`;
      specDisplay.textContent = activeDeviceInfo.display.resolution !== 'Unknown' ? `${activeDeviceInfo.display.resolution} (${activeDeviceInfo.display.density || ''} dpi)` : '--';
      specStorage.textContent = activeDeviceInfo.storage.size ? `${activeDeviceInfo.storage.used} used / ${activeDeviceInfo.storage.available} free (${activeDeviceInfo.storage.percent})` : '--';
      specIp.textContent = activeDeviceInfo.network.ip || 'Not connected to Wi-Fi';

      if (activeDeviceInfo.network.ip) {
        btnCopyIp.classList.remove('hidden');
      } else {
        btnCopyIp.classList.add('hidden');
      }
    } else {
      specManufacturer.textContent = '--';
      specModel.textContent = activeDevice ? activeDevice.model : '--';
      specAndroid.textContent = '--';
      specAbi.textContent = '--';
      specBattery.textContent = 'Querying...';
      specDisplay.textContent = '--';
      specStorage.textContent = '--';
      specIp.textContent = '--';
    }

    deviceInfoModal.classList.remove('hidden');
  });

  btnCopyIp.addEventListener('click', () => {
    if (activeDeviceInfo && activeDeviceInfo.network.ip) {
      inputIp.value = activeDeviceInfo.network.ip;
      deviceInfoModal.classList.add('hidden');
      log(`Inserted Wi-Fi IP ${activeDeviceInfo.network.ip} into wireless connection field`);
    }
  });

  btnCloseSpecs.addEventListener('click', () => {
    deviceInfoModal.classList.add('hidden');
  });

  // Preview Card Controls
  btnRefreshPreview.addEventListener('click', () => {
    if (activeDevice) {
      fetchScreenPreview(activeDevice.serial);
    }
  });

  toggleAutoPreview.addEventListener('change', () => {
    if (toggleAutoPreview.checked) {
      if (activeDevice) {
        fetchScreenPreview(activeDevice.serial);
      }
      autoPreviewTimer = setInterval(() => {
        if (activeDevice) {
          fetchScreenPreview(activeDevice.serial);
        }
      }, 2500);
      log('Live screen preview auto-refresh started (2.5s interval)');
    } else {
      if (autoPreviewTimer) {
        clearInterval(autoPreviewTimer);
        autoPreviewTimer = null;
      }
      log('Live screen preview auto-refresh paused');
    }
  });

  deviceSelect.addEventListener('change', () => {
    const selectedSerial = deviceSelect.value;
    if (selectedSerial === 'auto') {
      activeDevice = currentDevices[0] || null;
    } else {
      activeDevice = currentDevices.find(d => d.serial === selectedSerial) || null;
    }
    updateTopDeviceHeader(activeDevice);
  });

  // 3. Wireless Connect
  btnConnectWireless.addEventListener('click', async () => {
    const ip = inputIp.value.trim();
    const port = parseInt(inputPort.value.trim(), 10) || 5555;

    if (!ip) {
      showModal('Wireless Address', 'Please enter a device IP address (e.g. 192.168.1.100).');
      inputIp.focus();
      return;
    }

    log(`Connecting wirelessly to ${ip}:${port}...`);
    btnConnectWireless.disabled = true;

    try {
      const res = await window.api.connectWireless(ip, port);
      log(`ADB Wireless: ${res.output}`, 'stdout');
      await refreshDevices();
    } catch (err) {
      log(`Wireless connection failed: ${err.message}`, 'stderr');
      showModal('Connection Failed', err.message, 'Ensure Wireless Debugging is enabled in Android Developer Options.');
    } finally {
      btnConnectWireless.disabled = false;
    }
  });

  btnDisconnectWireless.addEventListener('click', async () => {
    const ip = inputIp.value.trim();
    const port = parseInt(inputPort.value.trim(), 10) || 5555;
    const target = ip ? `${ip}:${port}` : null;

    log(`Disconnecting wireless target...`);
    try {
      const res = await window.api.disconnectWireless(target);
      log(res.output, 'system');
      await refreshDevices();
    } catch (err) {
      log(`Disconnect failed: ${err.message}`, 'stderr');
    }
  });

  btnTcpipMode.addEventListener('click', async () => {
    const serial = deviceSelect.value !== 'auto' ? deviceSelect.value : '';
    const port = parseInt(inputPort.value.trim(), 10) || 5555;

    log(`Enabling TCP/IP on port ${port}...`);
    try {
      const res = await window.api.enableTcpip(serial, port);
      log(`TCP/IP output: ${res.output}`, 'stdout');
      showModal('TCP/IP Active', `Port ${port} opened on ${serial || 'device'}. You can now unplug USB and connect over Wi-Fi.`);
    } catch (err) {
      log(`TCP/IP error: ${err.message}`, 'stderr');
      showModal('TCP/IP Failed', err.message, 'Connect your device via USB with USB debugging enabled.');
    }
  });

  // 4. Remote Strip Controls
  remoteItems.forEach(btn => {
    const key = btn.getAttribute('data-key');
    if (!key) return;

    btn.addEventListener('click', async () => {
      const serial = deviceSelect.value !== 'auto' ? deviceSelect.value : '';

      if (key === 'screenshot') {
        log('Capturing device screenshot...');
        try {
          const res = await window.api.takeScreenshot(serial);
          log(`Screenshot saved: ${res.filePath}`, 'stdout');
          showModal('Screenshot Saved', `Screenshot saved to computer:\n${res.filePath}`);
        } catch (err) {
          log(`Screenshot error: ${err.message}`, 'stderr');
          showModal('Screenshot Failed', err.message);
        }
        return;
      }

      if (key === 'notifs') {
        try {
          await window.api.expandNotifications(serial);
        } catch (err) {
          log(`Notification shade error: ${err.message}`, 'stderr');
        }
        return;
      }

      const keycode = keycodeMap[key];
      if (keycode) {
        try {
          await window.api.sendKeyevent(serial, keycode);
        } catch (err) {
          log(`Keyevent error: ${err.message}`, 'stderr');
        }
      }
    });
  });

  // 5. Resolution & Bitrate Segment Controls
  resolutionSegments.forEach(seg => {
    seg.addEventListener('click', () => {
      resolutionSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
      const val = parseInt(seg.getAttribute('data-val'), 10);
      selectedResolutionVal = resolutionMap[val].value;
      if (resolutionValueDisplay) resolutionValueDisplay.textContent = resolutionMap[val].label;
    });
  });

  bitrateSegments.forEach(seg => {
    seg.addEventListener('click', () => {
      bitrateSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
      selectedBitrate = parseInt(seg.getAttribute('data-bitrate'), 10);
      if (bitrateDisplay) bitrateDisplay.textContent = selectedBitrate;
    });
  });

  // 6. File Transfer & APK Push Handlers
  function showTransferStatus(msg, spinning = true) {
    transferStatusText.textContent = msg;
    const spinner = transferStatus.querySelector('.transfer-spinner');
    if (spinner) spinner.style.display = spinning ? 'block' : 'none';
    transferStatus.classList.remove('hidden');
  }

  function hideTransferStatus(delayMs = 3000) {
    setTimeout(() => {
      transferStatus.classList.add('hidden');
    }, delayMs);
  }

  async function handleFileTransfer(filePaths) {
    if (!filePaths || filePaths.length === 0) return;
    const serial = deviceSelect.value !== 'auto' ? deviceSelect.value : '';

    for (const filePath of filePaths) {
      const fileName = filePath.split(/[/\\]/).pop();
      const isApk = fileName.toLowerCase().endsWith('.apk');

      if (isApk) {
        showTransferStatus(`Installing APK: ${fileName}...`, true);
        log(`Installing APK on device: ${fileName}...`);
        try {
          const res = await window.api.installApk(serial, filePath);
          log(`APK installed successfully: ${fileName}`, 'stdout');
          showTransferStatus(`Installed: ${fileName}`, false);
        } catch (err) {
          log(`APK install error: ${err.message}`, 'stderr');
          showTransferStatus(`Install failed: ${fileName}`, false);
          showModal('APK Install Failed', err.message);
        }
      } else {
        showTransferStatus(`Transferring: ${fileName}...`, true);
        log(`Pushing file to /sdcard/Download/: ${fileName}...`);
        try {
          const res = await window.api.pushFile(serial, filePath, '/sdcard/Download/');
          log(`File transferred: ${fileName} -> ${res.remotePath}`, 'stdout');
          showTransferStatus(`Saved to /sdcard/Download/`, false);
        } catch (err) {
          log(`File push error: ${err.message}`, 'stderr');
          showTransferStatus(`Transfer failed: ${fileName}`, false);
          showModal('File Transfer Failed', err.message);
        }
      }
    }

    hideTransferStatus(3000);
  }

  btnBrowseFiles.addEventListener('click', async () => {
    try {
      const res = await window.api.openFileDialog({
        title: 'Select Files to Transfer to Device',
        multi: true
      });
      if (!res.canceled && res.filePaths) {
        await handleFileTransfer(res.filePaths);
      }
    } catch (err) {
      log(`File dialog error: ${err.message}`, 'stderr');
    }
  });

  btnBrowseApk.addEventListener('click', async () => {
    try {
      const res = await window.api.openFileDialog({
        title: 'Select Android APK to Install',
        multi: false,
        filters: [{ name: 'Android Package (*.apk)', extensions: ['apk'] }]
      });
      if (!res.canceled && res.filePaths) {
        await handleFileTransfer(res.filePaths);
      }
    } catch (err) {
      log(`APK dialog error: ${err.message}`, 'stderr');
    }
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const filePaths = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].path) {
        filePaths.push(files[i].path);
      }
    }

    if (filePaths.length > 0) {
      await handleFileTransfer(filePaths);
    }
  });

  // 7. Reset ADB
  btnKillAdb.addEventListener('click', async () => {
    log('Resetting ADB server daemon...', 'system');
    btnKillAdb.disabled = true;

    try {
      const res = await window.api.killAdb();
      log(res.output, 'stdout');
      await refreshDevices();
    } catch (err) {
      log(`Failed to reset ADB: ${err.message}`, 'stderr');
      showModal('ADB Reset Failed', err.message);
    } finally {
      btnKillAdb.disabled = false;
    }
  });

  // 8. Launch Mirroring
  btnLaunch.addEventListener('click', async () => {
    const selectedSerial = deviceSelect.value;
    const devName = activeDevice ? activeDevice.model : 'Android Device';

    const options = {
      serial: selectedSerial,
      deviceName: devName,
      turnScreenOff: toggleTurnScreenOff.checked,
      stayAwake: toggleStayAwake.checked,
      disableAudio: toggleNoAudio.checked,
      alwaysOnTop: toggleAlwaysOnTop.checked,
      showTouches: toggleShowTouches.checked,
      maxResolution: selectedResolutionVal,
      bitrate: selectedBitrate
    };

    log(`Starting DroidDeck mirror: ${devName}, resolution=${selectedResolutionVal}, bitrate=${selectedBitrate}M`);
    btnLaunch.disabled = true;
    btnLaunchText.textContent = 'Launching...';

    try {
      const result = await window.api.launchScrcpy(options);
      log(`scrcpy process spawned (PID: ${result.pid})`, 'stdout');

      streamStateText.textContent = `Mirroring ${devName}`;
      btnStop.classList.remove('hidden');
      btnLaunchText.textContent = 'Relaunch';
    } catch (err) {
      log(`Launch error: ${err.message}`, 'stderr');
      showModal('Launch Failed', err.message, 'Verify your phone is unlocked and authorized for USB/wireless debugging.');
      btnLaunchText.textContent = 'Launch Mirror';
    } finally {
      btnLaunch.disabled = false;
    }
  });

  // 9. Stop Mirroring
  btnStop.addEventListener('click', async () => {
    log('Stopping mirror session...');
    try {
      const res = await window.api.stopScrcpy();
      log(res.message || 'Stream stopped', 'system');
      onStreamStopped();
    } catch (err) {
      log(`Stop error: ${err.message}`, 'stderr');
    }
  });

  function onStreamStopped() {
    streamStateText.textContent = 'Ready to mirror';
    btnStop.classList.add('hidden');
    btnLaunchText.textContent = 'Launch Mirror';
  }

  // 10. Process Listeners
  window.api.onScrcpyLog((data) => {
    log(data.text.trim(), data.type);
  });

  window.api.onScrcpyStatus((data) => {
    if (!data.running) {
      log(`Mirror session closed${data.exitCode !== undefined ? ` (exit code ${data.exitCode})` : ''}${data.error ? ` - error: ${data.error}` : ''}`, 'system');
      onStreamStopped();
    }
  });

  // 11. Toggle Terminal Logs
  btnToggleTerminal.addEventListener('click', () => {
    terminalDrawer.classList.toggle('collapsed');
    const isCollapsed = terminalDrawer.classList.contains('collapsed');
    btnToggleTerminal.textContent = isCollapsed ? 'Console' : 'Close';
  });

  btnClearLogs.addEventListener('click', () => {
    terminalOutput.innerHTML = '<div class="log-item system">[system] Logs cleared.</div>';
  });

  btnRefreshDevices.addEventListener('click', refreshDevices);

  // Initial Boot
  (async () => {
    await checkBinaries();
    await refreshDevices();
  })();
});
