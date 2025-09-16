# 📊 Google Sheets Update Instructions

## 🔄 How to Keep Your MMM Dashboard Updated

**After making changes to your Google Sheets financial data, follow these steps to update the live dashboard:**

---

## 📝 **Copy These Instructions to Your Google Sheet:**

### **Dashboard Update Process:**

1. **Make your changes** in the Google Sheets MMM financial model
2. **Save your changes** (they save automatically in Google Sheets)
3. **Update the live dashboard** using ONE of these methods:

#### **Method A: From Codespace (Recommended)**
```
1. Open your Codespace: https://github.com/NeVoTM/nevo-tower-portal
2. Open terminal in Codespace
3. Run: cd MMM
4. Run: node generate-shareable-dashboard.js
5. Wait for "SUCCESS!" message
6. Your dashboard is now updated!
```

#### **Method B: From Windows (Local)**
```
1. Open PowerShell/Command Prompt
2. Run: cd "C:\Users\user\Documents\GitHub\nevo-tower-portal\MMM"
3. Run: node generate-shareable-dashboard.js
4. Wait for "SUCCESS!" message
5. Your dashboard is now updated!
```

---

## 🌐 **Your Live Dashboard Links:**

- **Main Dashboard:** https://nevotm.github.io/nevo-tower-portal/mmm-dashboard.html
- **Auto-redirect:** https://nevotm.github.io/nevo-tower-portal/

---

## ⚡ **Quick Reference:**

**What happens when you run the update script:**
1. ✅ Fetches latest data from THIS Google Sheet
2. ✅ Generates beautiful HTML dashboard 
3. ✅ Commits to GitHub automatically
4. ✅ Updates live website (takes 2-3 minutes)

**Share this link with anyone:** https://nevotm.github.io/nevo-tower-portal/mmm-dashboard.html

---

## 🆘 **Troubleshooting:**

**If you get errors:**
- Make sure you're connected to internet
- Try refreshing your Codespace
- Check that your GitHub token is still valid

**If dashboard doesn't update:**
- Wait 5 minutes for GitHub to process
- Try hard refresh (Ctrl+F5) on the dashboard
- Check GitHub repository for latest commit

---

## 💡 **Pro Tips:**

- **Update frequency:** Run after major financial model changes
- **Best practice:** Test your Google Sheets changes before updating dashboard
- **Sharing:** The dashboard link never changes, just the data updates
- **Mobile friendly:** Dashboard works perfectly on phones and tablets

---

**Remember:** Every time you update your Google Sheets, run the generator script to keep your live dashboard current! 🚀