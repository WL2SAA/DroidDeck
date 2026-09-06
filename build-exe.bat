@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo   DroidDeck - Building Windows .exe
echo ===================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in your system PATH.
    pause
    exit /b 1
)

echo Packaging DroidDeck into dist/...
call npm run build:exe

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  SUCCESS! Executable build created at:
    echo  dist\DroidDeck-win32-x64\DroidDeck.exe
    echo ===================================================
    echo.
) else (
    echo.
    echo [ERROR] Build failed with error code: %errorlevel%
    echo.
)

pause
