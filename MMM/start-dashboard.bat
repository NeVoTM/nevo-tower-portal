@echo off
echo 🚀 Starting MMM Dashboard Server...
echo.
echo 💡 This will create a shareable link for your MMM financial dashboard
echo 🌐 Access at: http://localhost:8080/dashboard
echo 📊 JSON API: http://localhost:8080/api/data
echo.
echo ⚠️  Press Ctrl+C to stop the server
echo.

cd /d "C:\Users\user\Documents\GitHub\nevo-tower-portal\MMM"
node dashboard-server.js

echo.
echo ✅ MMM Dashboard Server stopped
pause