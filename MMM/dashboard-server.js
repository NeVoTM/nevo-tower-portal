#!/usr/bin/env node

/**
 * MMM Dashboard Server - On-Demand Generation
 * Lightweight server that fetches fresh data and serves dashboard on request
 * Perfect for sharing a single link that always shows latest data
 */

const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8080;
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1XWYdqMNn268qixxHMB8C-bOlNbCa3Chzpzs5iNhS6bs/export?format=csv&gid=1171148339';

// Simple in-memory cache (5 minute expiry)
let cache = {
    data: null,
    timestamp: 0,
    expiry: 5 * 60 * 1000 // 5 minutes in milliseconds
};

console.log('🚀 Starting MMM Dashboard Server...');
console.log(`📡 Server will run on port ${PORT}`);

/**
 * Fetch Google Sheets data with redirect handling
 */
function fetchGoogleSheetsData() {
    return new Promise((resolve, reject) => {
        function makeRequest(requestUrl, redirectCount = 0) {
            if (redirectCount > 3) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            https.get(requestUrl, (response) => {
                let data = '';
                
                // Handle redirects
                if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
                    console.log(`🔄 Following redirect (${response.statusCode})`);
                    makeRequest(response.headers.location, redirectCount + 1);
                    return;
                }
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        }
        
        makeRequest(SHEETS_URL);
    });
}

/**
 * Parse CSV to JSON
 */
function parseCSVToJSON(csvData) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const jsonData = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            jsonData.push(row);
        }
    }
    
    return jsonData;
}

/**
 * Get fresh data (with caching for efficiency)
 */
async function getFreshData() {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cache.data && (now - cache.timestamp) < cache.expiry) {
        console.log('📋 Serving cached data');
        return cache.data;
    }
    
    try {
        console.log('🔄 Fetching fresh data from Google Sheets...');
        const csvData = await fetchGoogleSheetsData();
        const jsonData = parseCSVToJSON(csvData);
        
        // Update cache
        cache.data = jsonData;
        cache.timestamp = now;
        
        console.log('✅ Fresh data fetched and cached');
        return jsonData;
    } catch (error) {
        console.error('❌ Error fetching data:', error.message);
        
        // Return cached data if available, even if expired
        if (cache.data) {
            console.log('⚠️  Serving expired cached data due to fetch error');
            return cache.data;
        }
        
        throw error;
    }
}

/**
 * Generate dashboard HTML with fresh data
 */
function generateDashboard(data) {
    const totalsRow = data.find(row => row.Section === 'TOTALS') || {};
    const lastUpdated = new Date().toLocaleString();
    const cacheAge = cache.timestamp ? Math.round((Date.now() - cache.timestamp) / 1000) : 0;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MMM Financial Dashboard - Live Data</title>
    <meta http-equiv="refresh" content="300"> <!-- Auto refresh every 5 minutes -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid rgba(255,215,0,0.3);
        }
        .header h1 {
            font-size: 3em;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            border: 2px solid rgba(255,215,0,0.3);
        }
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #4ECDC4;
            margin: 15px 0;
        }
        .summary-label {
            color: #FFD700;
            font-size: 1.2em;
            margin-bottom: 10px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            overflow: hidden;
            margin: 30px 0;
        }
        .data-table th, .data-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .data-table th {
            background: rgba(255,215,0,0.3);
            color: #FFD700;
            font-weight: bold;
        }
        .totals-row {
            background: rgba(255,215,0,0.2) !important;
            font-weight: bold;
            border-top: 3px solid #FFD700;
        }
        .status-badge {
            display: inline-block;
            background: rgba(76,205,196,0.3);
            color: #4ECDC4;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .refresh-button {
            background: linear-gradient(45deg, #4ECDC4, #44A08D);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
            transition: transform 0.2s;
        }
        .refresh-button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 MMM Financial Dashboard</h1>
            <h2>🌐 On-Demand Live Data Service</h2>
            <div class="status-badge">✅ Data: ${cacheAge < 60 ? 'Fresh' : `${Math.round(cacheAge/60)}min old`}</div>
            <p style="opacity: 0.8;">Generated: ${lastUpdated}</p>
            <button class="refresh-button" onclick="window.location.reload()">🔄 Refresh Data</button>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-label">💰 Traditional Costs</div>
                <div class="summary-value">$${parseInt(totalsRow['Traditional Cost'] || 0).toLocaleString()}</div>
                <p>Total traditional project costs</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">🏗️ MMM Cash Required</div>
                <div class="summary-value">$${parseInt(totalsRow['MMM Cash Cost'] || 0).toLocaleString()}</div>
                <p>Reduced cash with MMM model</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">💵 Cash Savings</div>
                <div class="summary-value">$${parseInt(totalsRow['Cash Savings Formula'] || 0).toLocaleString()}</div>
                <p>Direct cash flow improvement</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">🚀 Total Net Benefit</div>
                <div class="summary-value">$${parseInt(totalsRow['Net Benefit Formula'] || 0).toLocaleString()}</div>
                <p>Complete MMM partnership value</p>
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; border: 2px solid rgba(255,215,0,0.3);">
            <h3 style="color: #FFD700; margin-bottom: 20px;">📊 Detailed Financial Breakdown</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Service Category</th>
                        <th>Traditional Cost</th>
                        <th>MMM Cash Cost</th>
                        <th>Equity %</th>
                        <th>Cash Savings</th>
                        <th>Equity Value</th>
                        <th>Net Benefit</th>
                        <th>Phase</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => {
                        const isTotal = row.Section === 'TOTALS';
                        return `<tr class="${isTotal ? 'totals-row' : ''}">
                            <td><strong>${row.Category || ''}</strong></td>
                            <td>$${parseInt(row['Traditional Cost'] || 0).toLocaleString()}</td>
                            <td>$${parseInt(row['MMM Cash Cost'] || 0).toLocaleString()}</td>
                            <td>${row['Equity %'] || ''}</td>
                            <td style="color: #4ECDC4;">$${parseInt(row['Cash Savings Formula'] || 0).toLocaleString()}</td>
                            <td style="color: #FFD700;">$${parseInt(row['Equity Value Formula'] || 0).toLocaleString()}</td>
                            <td style="color: #90EE90;">$${parseInt(row['Net Benefit Formula'] || 0).toLocaleString()}</td>
                            <td>${row['Project Phase'] || ''}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; opacity: 0.8;">
            <p>🔄 Page auto-refreshes every 5 minutes</p>
            <p>💡 Data cached for 5 minutes to optimize bandwidth</p>
            <p>🌐 Share this URL for instant access to latest MMM financials</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Handle incoming requests
 */
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    
    try {
        // CORS headers for wider accessibility
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        
        if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/dashboard') {
            console.log('📊 Dashboard requested');
            const data = await getFreshData();
            const dashboard = generateDashboard(data);
            
            res.writeHead(200);
            res.end(dashboard);
            
        } else if (parsedUrl.pathname === '/api/data') {
            // JSON API endpoint for developers
            console.log('📋 JSON data requested');
            const data = await getFreshData();
            
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
                data: data,
                timestamp: new Date().toISOString(),
                cached: (Date.now() - cache.timestamp) < cache.expiry
            }));
            
        } else if (parsedUrl.pathname === '/health') {
            // Health check endpoint
            res.writeHead(200);
            res.end('OK - MMM Dashboard Server Running');
            
        } else {
            res.writeHead(404);
            res.end('Not Found - Try /dashboard for MMM financials');
        }
        
    } catch (error) {
        console.error('❌ Request error:', error.message);
        res.writeHead(500);
        res.end(`Server Error: ${error.message}`);
    }
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log('✅ MMM Dashboard Server running!');
    console.log(`🌐 Access dashboard at: http://localhost:${PORT}/dashboard`);
    console.log(`📊 JSON API available at: http://localhost:${PORT}/api/data`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🚀 Ready to serve on-demand MMM financial dashboards!');
    console.log('💡 Data is cached for 5 minutes to optimize bandwidth usage');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MMM Dashboard Server...');
    server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});