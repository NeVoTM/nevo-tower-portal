#!/usr/bin/env node

/**
 * MMM Google Sheets Data Fetcher for Codespaces
 * Runs in NeVoTM Codespace environment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Your Google Sheets export URL
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1XWYdqMNn268qixxHMB8C-bOlNbCa3Chzpzs5iNhS6bs/export?format=csv&gid=1171148339';

// Output paths
const OUTPUT_CSV = path.join(__dirname, 'presentations', 'live-data.csv');
const OUTPUT_JSON = path.join(__dirname, 'presentations', 'live-data.json');
const OUTPUT_HTML = path.join(__dirname, 'presentations', 'mmm-dashboard.html');

console.log('🚀 MMM Codespace Data Fetcher Starting...');
console.log('📊 Fetching data from Google Sheets...');

function fetchGoogleSheetsData() {
    return new Promise((resolve, reject) => {
        https.get(SHEETS_URL, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                if (response.statusCode === 200) {
                    console.log('✅ Successfully fetched data from Google Sheets');
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

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

function generateDashboardHTML(data) {
    const totalsRow = data.find(row => row.Section === 'TOTALS');
    const serviceRows = data.filter(row => row.Section !== 'TOTALS');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MMM Financial Dashboard - Codespace Edition</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 MMM Financial Dashboard</h1>
            <h2>Codespace Integration - Live Data</h2>
            <div class="status-badge">✅ Data Synced from Google Sheets</div>
            <p style="opacity: 0.8;">Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-label">💰 Traditional Costs</div>
                <div class="summary-value">$${parseInt(totalsRow['Traditional Cost']).toLocaleString()}</div>
                <p>Total traditional project costs</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">🏗️ MMM Cash Required</div>
                <div class="summary-value">$${parseInt(totalsRow['MMM Cash Cost']).toLocaleString()}</div>
                <p>Reduced cash with MMM model</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">💵 Cash Savings</div>
                <div class="summary-value">$${parseInt(totalsRow['Cash Savings Formula']).toLocaleString()}</div>
                <p>Direct cash flow improvement</p>
            </div>
            <div class="summary-card">
                <div class="summary-label">🚀 Total Net Benefit</div>
                <div class="summary-value">$${parseInt(totalsRow['Net Benefit Formula']).toLocaleString()}</div>
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
                            <td><strong>${row.Category}</strong></td>
                            <td>$${parseInt(row['Traditional Cost'] || 0).toLocaleString()}</td>
                            <td>$${parseInt(row['MMM Cash Cost'] || 0).toLocaleString()}</td>
                            <td>${row['Equity %']}</td>
                            <td style="color: #4ECDC4;">$${parseInt(row['Cash Savings Formula'] || 0).toLocaleString()}</td>
                            <td style="color: #FFD700;">$${parseInt(row['Equity Value Formula'] || 0).toLocaleString()}</td>
                            <td style="color: #90EE90;">$${parseInt(row['Net Benefit Formula'] || 0).toLocaleString()}</td>
                            <td>${row['Project Phase']}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; opacity: 0.8;">
            <p>🔄 Refresh this page to get latest data from Google Sheets</p>
            <p>🌐 Accessible from anywhere via Codespace forwarded port</p>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
    try {
        // Create presentations directory if it doesn't exist
        const presentationsDir = path.join(__dirname, 'presentations');
        if (!fs.existsSync(presentationsDir)) {
            fs.mkdirSync(presentationsDir, { recursive: true });
            console.log('📁 Created presentations directory');
        }
        
        // Fetch data from Google Sheets
        const csvData = await fetchGoogleSheetsData();
        
        // Save raw CSV
        fs.writeFileSync(OUTPUT_CSV, csvData);
        console.log('💾 Saved CSV data to:', OUTPUT_CSV);
        
        // Parse and save JSON
        const jsonData = parseCSVToJSON(csvData);
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonData, null, 2));
        console.log('💾 Saved JSON data to:', OUTPUT_JSON);
        
        // Generate and save dashboard HTML
        const dashboardHTML = generateDashboardHTML(jsonData);
        fs.writeFileSync(OUTPUT_HTML, dashboardHTML);
        console.log('🎨 Generated dashboard HTML:', OUTPUT_HTML);
        
        console.log('✅ MMM Integration Complete!');
        console.log('📊 Data Summary:');
        console.log(`   • Rows processed: ${jsonData.length}`);
        console.log(`   • Files generated: CSV, JSON, HTML dashboard`);
        console.log('🌐 Open dashboard in Codespace to view live data!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fetchGoogleSheetsData, parseCSVToJSON, generateDashboardHTML };