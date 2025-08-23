# Deploy to Azure App Service - Step by Step Guide

## 🎯 **Your Target App Service:**
- **URL:** https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net
- **Region:** Canada Central

## 🚀 **Method 1: VS Code Azure Extension (Easiest)**

### **Step 1: Install Azure Extension**
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Azure App Service"
3. Install the Azure App Service extension

### **Step 2: Sign In**
1. Press `Ctrl+Shift+P`
2. Type "Azure: Sign In"
3. Follow the authentication flow

### **Step 3: Deploy**
1. Right-click on your project folder
2. Select "Deploy to Web App..."
3. Choose your existing app service: `aipocmcp-c7d6cbg2c4c4c3h3`
4. Confirm deployment

## 🚀 **Method 2: ZIP Deployment via Browser**

### **Step 1: Create Deployment Package**
```powershell
# In your project directory
npm run build  # if you have a build script
Compress-Archive -Path * -DestinationPath mcp-server.zip -Force
```

### **Step 2: Access Kudu Console**
1. Go to: https://aipocmcp-c7d6cbg2c4c4c3h3.scm.azurewebsites.net
2. Navigate to Tools → Zip Push Deploy
3. Drag and drop your `mcp-server.zip` file

## 🚀 **Method 3: Git Deployment**

### **Step 1: Enable Git Deployment**
1. Go to Azure Portal
2. Find your App Service: `aipocmcp-c7d6cbg2c4c4c3h3`
3. Go to Deployment Center
4. Choose "Local Git" as source
5. Get the Git URL

### **Step 2: Push Your Code**
```powershell
git init
git add .
git commit -m "Deploy MCP server"
git remote add azure <your-git-url>
git push azure main
```

## ⚙️ **Required Configuration Changes**

### **1. Update package.json for Production**
Make sure your package.json has:
```json
{
  "scripts": {
    "start": "tsx index.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### **2. Environment Variables**
Set these in Azure Portal → App Service → Configuration:
- `SQL_SERVER`
- `SQL_DATABASE` 
- `SQL_USER`
- `SQL_PASSWORD`
- `SQL_ENCRYPT=true`
- `NODE_ENV=production`

### **3. Verify App Service Settings**
- **Runtime Stack:** Node.js (latest LTS)
- **Startup Command:** `npm start`

## 🧪 **Test After Deployment**

### **Health Check:**
```
GET https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net/health
```

### **List Tools:**
```
GET https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net/tools
```

### **Test Action Card:**
```
POST https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net/tools/getSampleActionCard
Content-Type: application/json

{
  "userId": 1
}
```

## 🎉 **Once Deployed, You Can:**
1. Use it with Azure AI Foundry agents
2. Access HTTP endpoints directly
3. Integrate with any system that supports HTTP APIs
4. Scale automatically based on demand

Choose the method that works best for you!
