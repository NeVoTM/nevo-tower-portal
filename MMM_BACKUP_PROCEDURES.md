# 🚨 MMM System - Emergency Backup & Restore Procedures

## 🔐 CRITICAL BACKUP STATUS
- **Last Backup**: 2025-09-16 00:25:00
- **GitHub Repository**: https://github.com/NeVoTM/nevo-tower-portal
- **Backup Commit**: 88107a4
- **Status**: ✅ FULLY BACKED UP

## 📁 WHAT'S BACKED UP

### **Main Project Repository:**
```
NeVoTM/nevo-tower-portal (GitHub)
├── MMM/                                    ✅ BACKED UP
│   ├── README.md                           ✅ BACKED UP
│   └── presentations/                      ✅ BACKED UP
├── app/                                    ✅ BACKED UP
├── components/                             ✅ BACKED UP
├── data/                                   ✅ BACKED UP
├── .devcontainer/                          ✅ BACKED UP
└── (all project files)                     ✅ BACKED UP
```

### **MMM Integration System:**
```
C:\Users\user\Documents\MMM\Partner_Presentation\
├── Enhanced_Google_Sheets_Integration.html ✅ LOCAL COPY SAFE
├── Google_Sheets_Integration.html          ✅ LOCAL COPY SAFE
├── MMM_Partner_Presentation.html           ✅ LOCAL COPY SAFE
└── (all presentation files)                ✅ LOCAL COPY SAFE
```

## 🆘 EMERGENCY RESTORE PROCEDURES

### **Method 1: Complete Fresh Clone**
```powershell
# If everything is lost, start fresh:
cd C:\Users\user\Documents\GitHub
git clone https://github.com/NeVoTM/nevo-tower-portal.git
cd nevo-tower-portal

# Verify restoration:
ls -la MMM/
```

### **Method 2: Reset Current Directory**
```powershell
# If in existing directory but files are missing:
git reset --hard origin/main
git pull origin main

# Force overwrite with GitHub version:
git fetch origin
git reset --hard origin/main
```

### **Method 3: Recover Specific Commit**
```powershell
# To restore to specific backup point:
git log --oneline -10        # Find commit hash
git reset --hard {COMMIT_HASH}

# Current backup commit:
git reset --hard 88107a4
```

## 🔄 REGULAR BACKUP ROUTINE

### **Daily Backup Commands:**
```powershell
# Run these daily to backup changes:
git add -A
git commit -m "Daily backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main
```

### **Pre-Major-Change Backup:**
```powershell
# Before any major changes:
git add -A
git commit -m "CRITICAL BACKUP before major changes - $(Get-Date)"
git push origin main
git tag -a "backup-$(Get-Date -Format 'yyyyMMdd-HHmm')" -m "Emergency restore point"
git push origin --tags
```

## 🚨 CRITICAL FILE LOCATIONS

### **LOCAL BACKUPS:**
- **Project**: `C:\Users\user\Documents\GitHub\nevo-tower-portal\`
- **MMM System**: `C:\Users\user\Documents\MMM\Partner_Presentation\`
- **Google Sheets Integration**: `Enhanced_Google_Sheets_Integration.html`

### **GITHUB BACKUPS:**
- **Repository**: `https://github.com/NeVoTM/nevo-tower-portal`
- **MMM Folder**: `https://github.com/NeVoTM/nevo-tower-portal/tree/main/MMM`
- **Releases**: `https://github.com/NeVoTM/nevo-tower-portal/releases`

## 🔗 CODESPACE RECOVERY

### **If Codespace is Empty:**
```bash
# In Codespace terminal:
git pull origin main
ls -la MMM/

# If still empty:
git fetch origin
git reset --hard origin/main
```

### **Create New Codespace:**
1. Go to: https://github.com/NeVoTM/nevo-tower-portal
2. Click: Code → Codespaces → Create new
3. Wait for container to build
4. Run: `ls -la MMM/` to verify

## ⚡ EMERGENCY CONTACTS & INFO

### **Repository Info:**
- **Owner**: NeVoTM
- **Repository**: nevo-tower-portal  
- **Main Branch**: main
- **Token**: Stored in git remote (expires: check GitHub settings)

### **Key Files to NEVER Lose:**
1. `Enhanced_Google_Sheets_Integration.html` - Main integration system
2. `MMM/README.md` - System documentation
3. `.devcontainer/devcontainer.json` - Codespace config
4. `PROJECT_SETUP_AND_STATUS.md` - Project history

## 🎯 TEST RESTORE PROCEDURE

### **Monthly Test:**
```powershell
# Create test directory:
mkdir C:\temp\mmm-restore-test
cd C:\temp\mmm-restore-test

# Test clone:
git clone https://github.com/NeVoTM/nevo-tower-portal.git
cd nevo-tower-portal

# Verify files:
ls -la MMM/
Test-Path "MMM/README.md"

# Cleanup test:
cd ..
Remove-Item -Recurse -Force nevo-tower-portal
```

## 🏆 SUCCESS CRITERIA

✅ **Backup Successful When:**
- Git push completes without errors
- Files visible on GitHub.com
- MMM folder structure preserved
- Integration system files intact
- Codespace can access files

⚠️ **Red Flags:**
- "Everything up-to-date" but files missing from GitHub
- Codespace shows empty directory
- Git authentication failures
- Missing MMM folder in repository

---
**Last Updated**: 2025-09-16 00:25:00  
**Next Review**: 2025-09-17  
**Backup Status**: 🟢 CURRENT