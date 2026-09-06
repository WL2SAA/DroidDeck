const { spawn, exec } = require('child_process');
const { findExecutable } = require('./paths');

let cachedScrcpyPath = null;
let activeProcess = null;

async function getScrcpyPath() {
  if (!cachedScrcpyPath) {
    cachedScrcpyPath = await findExecutable('scrcpy');
  }
  if (!cachedScrcpyPath) {
    throw new Error('scrcpy binary not found. Please ensure scrcpy is installed and added to your PATH.');
  }
  return cachedScrcpyPath;
}

/**
 * Spawns scrcpy non-blockingly with selected streaming options.
 */
async function launchScrcpy(options, onLog, onStatus) {
  const scrcpyPath = await getScrcpyPath();

  // If already mirroring, kill previous instance
  if (activeProcess && !activeProcess.killed) {
    try {
      process.kill(activeProcess.pid);
    } catch (e) {
      // ignore
    }
    activeProcess = null;
  }

  const args = [];

  // Device selection: only pass -s if a concrete device serial was chosen
  if (options.serial && options.serial !== 'auto') {
    args.push('-s', options.serial);
  }

  // Toggles
  if (options.turnScreenOff) {
    args.push('--turn-screen-off');
  }
  if (options.stayAwake) {
    args.push('--stay-awake');
  }
  if (options.disableAudio) {
    args.push('--no-audio');
  }
  if (options.alwaysOnTop) {
    args.push('--always-on-top');
  }
  if (options.showTouches) {
    args.push('--show-touches');
  }

  // Resolution
  if (options.maxResolution && options.maxResolution !== 'native') {
    args.push('--max-size', String(options.maxResolution));
  }

  // Bitrate
  if (options.bitrate && Number(options.bitrate) > 0) {
    args.push('--video-bit-rate', `${options.bitrate}M`);
  }

  // Window title: DroidDeck
  const deviceLabel = options.deviceName || (options.serial && options.serial !== 'auto' ? options.serial : 'Default');
  args.push('--window-title', `DroidDeck Mirror - ${deviceLabel}`);

  console.log('Launching scrcpy binary:', scrcpyPath, args);

  try {
    // Note: detached: false + windowsHide: true ensures Windows does NOT allocate a console window
    const child = spawn(scrcpyPath, args, {
      shell: false,
      windowsHide: true,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    activeProcess = child;

    child.stdout.on('data', (data) => {
      if (onLog) onLog({ type: 'stdout', text: data.toString() });
    });

    child.stderr.on('data', (data) => {
      if (onLog) onLog({ type: 'stderr', text: data.toString() });
    });

    child.on('error', (err) => {
      console.error('scrcpy process error:', err);
      if (onStatus) onStatus({ running: false, error: err.message });
      activeProcess = null;
    });

    child.on('close', (code) => {
      console.log('scrcpy process closed with code:', code);
      if (onStatus) onStatus({ running: false, exitCode: code });
      activeProcess = null;
    });

    return {
      success: true,
      pid: child.pid,
      command: `scrcpy ${args.join(' ')}`
    };
  } catch (err) {
    throw new Error(`Failed to spawn scrcpy process: ${err.message}`);
  }
}

/**
 * Stops any running scrcpy instance.
 */
async function stopScrcpy() {
  if (activeProcess && !activeProcess.killed) {
    try {
      process.kill(activeProcess.pid);
      activeProcess = null;
      return { success: true, message: 'Stream process stopped.' };
    } catch (e) {
      // fallback to taskkill
    }
  }

  return new Promise((resolve) => {
    exec('taskkill /F /IM scrcpy.exe', { windowsHide: true }, () => {
      activeProcess = null;
      resolve({ success: true, message: 'scrcpy terminated.' });
    });
  });
}

module.exports = {
  getScrcpyPath,
  launchScrcpy,
  stopScrcpy
};
