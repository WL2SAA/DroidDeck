@echo off
setlocal
cd /d "%~dp0\.."

if exist "%~dp0..\dist\DroidDeck-win32-x64\DroidDeck.exe" (
    start "" "%~dp0..\dist\DroidDeck-win32-x64\DroidDeck.exe"
    exit
)

if exist "%~dp0..\node_modules\electron\dist\electron.exe" (
    start "" "%~dp0..\node_modules\electron\dist\electron.exe" "%~dp0..\."
    exit
)

start "" wscript.exe "%~dp0start.vbs"
exit
