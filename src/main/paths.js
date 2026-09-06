const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/**
 * Searches for an executable on the system PATH and standard Windows fallback locations.
 * @param {'adb' | 'scrcpy'} command
 * @returns {Promise<string|null>}
 */
function findExecutable(command) {
  return new Promise((resolve) => {
    // 1. Check using 'where' command on Windows
    exec(`where ${command}`, { windowsHide: true }, (error, stdout) => {
      if (!error && stdout) {
        const lines = stdout.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (fs.existsSync(line)) {
            return resolve(line);
          }
        }
      }

      // 2. Fallback locations on Windows
      const fallbacks = [];
      const localAppData = process.env.LOCALAPPDATA || '';
      const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
      const userProfile = process.env.USERPROFILE || '';

      if (command === 'adb') {
        fallbacks.push(
          'C:\\Android\\platform-tools\\adb.exe',
          path.join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe'),
          path.join(userProfile, 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools', 'adb.exe'),
          path.join(__dirname, '..', '..', 'scrcpy-4.1', 'adb.exe')
        );
      } else if (command === 'scrcpy') {
        // Search WinGet directory if present
        const wingetPackages = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
        if (fs.existsSync(wingetPackages)) {
          try {
            const entries = fs.readdirSync(wingetPackages);
            const scrcpyDir = entries.find(e => e.toLowerCase().includes('scrcpy'));
            if (scrcpyDir) {
              fallbacks.push(path.join(wingetPackages, scrcpyDir, 'scrcpy.exe'));
            }
          } catch (e) {
            // ignore read error
          }
        }

        fallbacks.push(
          path.join(programFiles, 'scrcpy', 'scrcpy.exe'),
          path.join(localAppData, 'Programs', 'scrcpy', 'scrcpy.exe'),
          'C:\\scrcpy\\scrcpy.exe',
          path.join(__dirname, '..', '..', 'scrcpy-4.1', 'scrcpy.exe')
        );
      }

      for (const p of fallbacks) {
        if (p && fs.existsSync(p)) {
          return resolve(p);
        }
      }

      resolve(null);
    });
  });
}

module.exports = {
  findExecutable
};
