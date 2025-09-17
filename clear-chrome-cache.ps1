# PowerShell script to clear Chrome cache every minute
# Run this in PowerShell as Administrator

while ($true) {
    Write-Host "Clearing Chrome cache..." -ForegroundColor Yellow
    
    # Close Chrome processes
    Get-Process -Name "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Clear Chrome cache directories
    $chromeCache = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
    $chromeCache2 = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache"
    
    if (Test-Path $chromeCache) {
        Remove-Item "$chromeCache\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cache cleared!" -ForegroundColor Green
    }
    
    if (Test-Path $chromeCache2) {
        Remove-Item "$chromeCache2\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Code cache cleared!" -ForegroundColor Green
    }
    
    # Restart Chrome with your dashboard
    Start-Process "chrome.exe" "https://nevotm.github.io/nevo-tower-portal/mmm-master-dashboard.html"
    
    # Wait 60 seconds before next clear
    Write-Host "Waiting 60 seconds..." -ForegroundColor Cyan
    Start-Sleep -Seconds 60
}