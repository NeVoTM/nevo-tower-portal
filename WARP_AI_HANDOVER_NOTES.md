# 🤖 WARP AI HANDOVER NOTES - MMM SYSTEM

## 🔐 **CRITICAL: GITHUB TOKEN LOCATIONS**

**NeVoTM GitHub Personal Access Token stored in:**
1. `C:\Users\user\Documents\NeVoTM_GitHub_Token_SECURE.txt`
2. `C:\Users\user\Documents\GitHub\nevo-tower-portal\.env.github`
3. `C:\Users\user\Documents\GitHub\nevo-tower-portal\.github_token_nevotm.txt`

**⚠️ GitHub security prevents tokens in repository - read from local files!**

## 🚨 **CRITICAL RULES:**

### ❌ **NEVER USE koachconsulting:**
- **NO references** to koachconsulting in any commands
- **NO authentication** with koachconsulting account
- **Check Codespace prompt** - must show `@NeVoTM` NOT `@koachconsulting`
- **If contaminated** - DELETE codespace immediately and rebuild

### ✅ **ALWAYS USE NeVoTM:**
- **Repository**: `NeVoTM/nevo-tower-portal`
- **Organization**: NeVoTM only
- **Authentication**: NeVoTM account only

## 📊 **MMM SYSTEM STATUS:**

### **Complete & Ready:**
- ✅ Enhanced Google Sheets Integration system
- ✅ Repository backup system with procedures
- ✅ Clean NeVoTM authentication established
- ✅ Token storage in multiple secure locations
- ✅ All MMM files backed up to GitHub

### **Main Integration File:**
`C:\Users\user\Documents\MMM\Partner_Presentation\Enhanced_Google_Sheets_Integration.html`

## 🛠️ **QUICK COMMANDS:**

### **Setup Git Remote (Load Token from File):**
```powershell
# Read token from secure file:
$token = (Get-Content "C:\Users\user\Documents\NeVoTM_GitHub_Token_SECURE.txt" | Select-String "GITHUB_TOKEN=" | ForEach-Object { $_.ToString().Split("=")[1] }).Trim()
git remote add origin https://$token@github.com/NeVoTM/nevo-tower-portal.git
```

### **Test MMM Integration:**
```powershell
Start-Process "C:\Users\user\Documents\MMM\Partner_Presentation\Enhanced_Google_Sheets_Integration.html"
```

### **Backup All Changes:**
```powershell
git add -A
git commit -m "Backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main
```

## 🔗 **IMPORTANT URLS:**

- **GitHub Repository**: https://github.com/NeVoTM/nevo-tower-portal
- **Codespaces Management**: https://github.com/codespaces
- **MMM Folder**: https://github.com/NeVoTM/nevo-tower-portal/tree/main/MMM

## 🎯 **CURRENT TASK STATUS:**

**Next Step**: Complete Codespace rebuild from scratch to eliminate koachconsulting contamination

## 📝 **FOR NEXT WARP AI:**

- Token is stored in secure local files (see locations above)
- Use PowerShell to load token from file for git operations
- NEVER put actual token in repository (GitHub security blocks it)
- All systems ready for clean Codespace rebuild

---
**Last Updated**: 2025-09-16 01:33  
**System Status**: 🟢 All files safe, documentation secure, ready for rebuild