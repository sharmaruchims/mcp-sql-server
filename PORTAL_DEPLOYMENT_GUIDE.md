# Azure Portal Deployment Guide

## 🚀 **Easiest Method: Kudu Zip Deploy via Portal**

### **Step 1: Access Kudu from Portal**
1. Go to https://portal.azure.com
2. Search for: `aipocmcp-c7d6cbg2c4c4c3h3`
3. Click on your App Service
4. In left menu, scroll down to "Development Tools"
5. Click "Advanced Tools"
6. Click "Go" button (opens Kudu in new tab)

### **Step 2: Deploy Your ZIP**
1. In Kudu, click "Tools" in the top menu
2. Select "Zip Push Deploy"
3. Drag your `mcp-server-deployment.zip` to the deployment area
4. Wait for deployment to complete (you'll see green checkmarks)

### **Step 3: Configure Environment Variables**
1. Back in Azure Portal → Your App Service
2. Go to "Configuration" in left menu
3. Click "New application setting" for each:

```
Name: SQL_SERVER
Value: your-server.database.windows.net

Name: SQL_DATABASE  
Value: your-database-name

Name: SQL_USER
Value: your-username

Name: SQL_PASSWORD
Value: your-password

Name: SQL_ENCRYPT
Value: true

Name: NODE_ENV
Value: production
```

4. Click "Save" at the top

### **Step 4: Restart App Service**
1. Go to "Overview" tab
2. Click "Restart" 
3. Wait for restart to complete

### **Step 5: Test Deployment**
```
https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net/health
https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net/tools
```

## 🔧 **Alternative: GitHub Integration**

### **Option A: Upload to GitHub First**
1. Create a new GitHub repository
2. Upload your MCP server files
3. In Portal → Deployment Center → GitHub
4. Connect and deploy

### **Option B: Direct Upload via Portal**
1. Portal → App Service Editor
2. Upload individual files
3. Manually recreate your folder structure

## 🎯 **Quickest Path:**
**Portal → Advanced Tools → Kudu → Zip Push Deploy**

This is the fastest way to deploy from the portal using your existing ZIP file!
