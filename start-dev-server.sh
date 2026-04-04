#!/bin/bash
# Quick start script for running the frontend with Python HTTP Server
# Make sure Python is installed

echo "Starting Quantity Measurement App Frontend..."
echo "Listening on: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")/wwwroot"
python3 -m http.server 8080

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Python HTTP Server failed to start"
    echo "Make sure Python is installed: https://www.python.org"
fi
