#!/usr/bin/env node

/**
 * GitHub-Shareable MMM Dashboard Generator
 * Creates a static HTML file that can be shared via GitHub raw links
 * No server needed - just a simple shareable link!
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Your Google Sheets export URL
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1XWYdqMNn268qixxHMB8C-bOlNbCa3Chzpzs5iNhS6bs/export?format=csv&gid=1171148339';

// Output file for GitHub Pages sharing
const SHAREABLE_HTML = path.join(__dirname, '..', 'docs', 'mmm-dashboard.html');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

console.log('🚀 Generating GitHub-shareable MMM Dashboard...');

/**
 * Fetch Google Sheets data with redirect handling
 */
function fetchGoogleSheetsData() {
    return new Promise((resolve, reject) => {
        function makeRequest(url, redirectCount = 0) {
            if (redirectCount > 3) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            https.get(url, (response) => {
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
                        console.log('✅ Successfully fetched data from Google Sheets');
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
 * Generate shareable HTML dashboard
 */
function generateShareableDashboard(data) {
    const totalsRow = data.find(row => row.Section === 'TOTALS') || {};
    const lastUpdated = new Date().toLocaleString();
    const githubRepo = 'NeVoTM/nevo-tower-portal';
    const shareableLink = `https://nevotm.github.io/nevo-tower-portal/mmm-dashboard.html`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MMM Financial Dashboard - Live GitHub Data</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            backdrop-filter: blur(10px);
        }
        .header h1 {
            font-size: 3em;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        .summary-card:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.15);
        }
        .summary-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #4ECDC4;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .summary-label {
            color: #FFD700;
            font-size: 1.2em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            overflow: hidden;
            margin: 30px 0;
            backdrop-filter: blur(10px);
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
            font-size: 1.1em;
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
            border: 1px solid rgba(76,205,196,0.5);
        }
        .share-section {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 2px solid rgba(76,205,196,0.3);
        }
        .share-link {
            background: rgba(255,255,255,0.2);
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            color: #4ECDC4;
            margin: 10px 0;
            word-break: break-all;
            border: 1px solid rgba(76,205,196,0.3);
        }
        .copy-button {
            background: linear-gradient(45deg, #4ECDC4, #44A08D);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            margin: 5px;
            transition: transform 0.2s;
        }
        .copy-button:hover {
            transform: scale(1.05);
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .summary-value { font-size: 2em; }
            .data-table { font-size: 0.9em; }
            .data-table th, .data-table td { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 MMM Financial Dashboard</h1>
            <h2>🌐 GitHub-Hosted Live Data</h2>
            <div class="status-badge">✅ Data Synced from Google Sheets</div>
            <p style="opacity: 0.8;">Last updated: ${lastUpdated}</p>
        </div>
        
        <div class="share-section">
            <h3 style="color: #FFD700; margin-bottom: 15px;">🔗 Shareable Link</h3>
            <div class="share-link" id="shareLink">${shareableLink}</div>
            <button class="copy-button" onclick="copyToClipboard()">📋 Copy Link</button>
            <p style="margin-top: 10px; opacity: 0.8;">Share this link for instant access to live MMM financials</p>
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
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; border: 2px solid rgba(255,215,0,0.3); backdrop-filter: blur(10px);">
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
            <p>🔄 Update dashboard by running the generator script in Codespace</p>
            <p>📤 Dashboard automatically commits to GitHub for instant sharing</p>
            <p>🌐 No server needed - direct GitHub link access!</p>
        </div>
    </div>

    <script>
        function copyToClipboard() {
            const linkText = document.getElementById('shareLink').textContent;
            navigator.clipboard.writeText(linkText).then(() => {
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = '✅ Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            });
        }
    </script>
</body>
</html>`;
}

/**
 * Commit and push to GitHub
 */
function commitAndPush() {
    return new Promise((resolve, reject) => {
        const commands = [
            'git add docs/mmm-dashboard.html',
            'git commit -m "Update MMM dashboard with latest Google Sheets data"',
            'git push origin main'
        ];
        
        let commandIndex = 0;
        
        function runNextCommand() {
            if (commandIndex >= commands.length) {
                resolve();
                return;
            }
            
            const command = commands[commandIndex];
            console.log(`🔧 Running: ${command}`);
            
            exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error: ${error.message}`);
                    reject(error);
                    return;
                }
                
                if (stdout) console.log(stdout.trim());
                if (stderr) console.log(stderr.trim());
                
                commandIndex++;
                runNextCommand();
            });
        }
        
        runNextCommand();
    });
}

/**
 * Main execution
 */
async function main() {
    try {
        // Create docs directory if it doesn't exist
        if (!fs.existsSync(DOCS_DIR)) {
            fs.mkdirSync(DOCS_DIR, { recursive: true });
            console.log('📁 Created docs directory for GitHub Pages');
        }
        
        // Fetch fresh data from Google Sheets
        console.log('📊 Fetching fresh data from Google Sheets...');
        const csvData = await fetchGoogleSheetsData();
        
        // Parse data
        const jsonData = parseCSVToJSON(csvData);
        console.log(`✅ Processed ${jsonData.length} rows of data`);
        
        // Generate shareable dashboard
        const dashboardHTML = generateShareableDashboard(jsonData);
        
        // Save to file
        fs.writeFileSync(SHAREABLE_HTML, dashboardHTML);
        console.log('💾 Generated shareable dashboard:', SHAREABLE_HTML);
        
        // Commit and push to GitHub
        console.log('📤 Committing to GitHub...');
        await commitAndPush();
        
        console.log('');
        console.log('🎉 SUCCESS! Your shareable dashboard is ready!');
        console.log('');
        console.log('🔗 Shareable Link:');
        console.log('https://nevotm.github.io/nevo-tower-portal/mmm-dashboard.html');
        console.log('');
        console.log('💡 Anyone can access this link to see your live MMM financials!');
        console.log('🔄 Run this script again to update with latest Google Sheets data');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}