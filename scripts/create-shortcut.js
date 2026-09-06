const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetExe = path.join(__dirname, '..', 'dist', 'DroidDeck-win32-x64', 'DroidDeck.exe');
const targetDir = path.join(__dirname, '..', 'dist', 'DroidDeck-win32-x64');
const lnkPath = path.join(__dirname, '..', 'DroidDeck.lnk');

const vbsContent = [
  'Set wsh = CreateObject("WScript.Shell")',
  `Set sc = wsh.CreateShortcut("${lnkPath.replace(/\\/g, '\\\\')}")`,
  `sc.TargetPath = "${targetExe.replace(/\\/g, '\\\\')}"`,
  `sc.WorkingDirectory = "${targetDir.replace(/\\/g, '\\\\')}"`,
  'sc.Description = "DroidDeck - Android Desktop Control Suite"',
  'sc.Save'
].join('\r\n');

const tempVbs = path.join(__dirname, 'make_lnk.vbs');
fs.writeFileSync(tempVbs, vbsContent);
try {
  execSync(`cscript //nologo "${tempVbs}"`, { windowsHide: true });
  console.log('DroidDeck.lnk shortcut created successfully at root.');
} finally {
  if (fs.existsSync(tempVbs)) fs.unlinkSync(tempVbs);
}
