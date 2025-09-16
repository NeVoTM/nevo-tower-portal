#!/bin/bash

echo "🚀 Starting MMM Dashboard Server in Codespace..."
echo ""
echo "💡 This creates a shareable link for your MMM financial dashboard"
echo "🌐 Codespace will auto-forward the port for external access"
echo "📊 JSON API will be available at /api/data"
echo ""
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

# Set environment variable for Codespace port
export PORT=8080

# Change to MMM directory
cd /workspaces/nevo-tower-portal/MMM

# Start the server
node dashboard-server.js