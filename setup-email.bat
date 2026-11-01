@echo off
rem Double-click to connect your Gmail to the website and send a test email.
cd /d "%~dp0"
title Connect homestay email
where node >nul 2>nul
if %errorlevel%==0 (
  node backend\setup-email.mjs %*
) else (
  echo.
  echo Node.js is not installed. Install the LTS version from https://nodejs.org , then double-click this file again.
)
echo.
pause
