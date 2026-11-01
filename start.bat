@echo off
rem Double-click this file to start the homestay website (Windows). No login or password is needed.
cd /d "%~dp0"
title Homestay website
where node >nul 2>nul
if %errorlevel%==0 (
  node start.mjs %*
) else (
  echo.
  echo Node.js is not installed.
  echo Install the LTS version from https://nodejs.org , then double-click this file again.
)
echo.
pause
