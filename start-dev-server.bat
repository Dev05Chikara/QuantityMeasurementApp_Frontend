@echo off
REM Quick start script for running the frontend with Python HTTP Server
REM Make sure Python is installed and added to PATH

echo Starting Quantity Measurement App Frontend...
echo Listening on: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0\wwwroot"
python -m http.server 8080

if errorlevel 1 (
    echo.
    echo Error: Python HTTP Server failed to start
    echo Make sure Python is installed: https://www.python.org
    echo And added to your system PATH
    pause
)
