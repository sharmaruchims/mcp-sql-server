# MCP SQL Server

A Model Context Protocol (MCP) server for Azure SQL database operations with action card support.

## 🏗️ **Core Files**

### **Essential MCP Server Files:**
- `index.ts` - Main MCP server entry point (supports both stdio and HTTP modes)
- `sqlTool.ts` - Database operations and action card implementations
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env` - Database connection credentials (create from .env.example)
- `.env.example` - Template for environment variables

### **Configuration:**
- `mcp_config.json` - MCP server configuration for VS Code integration

### **Documentation:**
- `README.md` - This file
- `NATURAL_LANGUAGE_GUIDE.md` - How to use natural language with the MCP server
- `USER_MANAGEMENT.md` - Database schema and user management details
- `AZURE_DEPLOYMENT_GUIDE.md` - Azure deployment instructions

### **Azure Deployment:**
- `azure.yaml` - Azure Developer CLI configuration
- `infra/` - Bicep infrastructure templates
  - `main.bicep` - Main infrastructure template
  - `main.parameters.json` - Infrastructure parameters
  - `resources.bicep` - Resource definitions
  - `resources-appservice.bicep` - App Service specific resources

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Configure Environment**
```bash
cp .env.example .env
# Edit .env with your Azure SQL database credentials
```

### **3. Run MCP Server**
```bash
# For local MCP usage (stdio mode)
npm start

# For HTTP mode (Azure deployment)
NODE_ENV=production npm start
```

### **4. Test the Server**
```bash
# Basic functionality test
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npx tsx index.ts
```

## 🛠️ **Available Tools**

1. **queryAzureSQL** - Execute read-only SQL queries
2. **addUser** - Add new users to the database
3. **getSampleActionCard** - Generate interactive action cards
4. **handleActionCardResponse** - Process action card responses

## 📚 **Usage**

### **With GitHub Copilot Chat:**
```
Show me an action card for user 1
How many users are in my database?
Add a user named John with email john@example.com
```

### **Direct MCP Testing:**
```bash
# Get action card
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"getSampleActionCard","arguments":{"userId":1}}}' | npx tsx index.ts
```

## 🌐 **Deployment**

### **Azure App Service:**
```bash
azd up
```

### **Local Development:**
```bash
npm start
```

---

**Status:** ✅ Production Ready  
**Mode:** Dual (stdio for MCP, HTTP for Azure)  
**Database:** Azure SQL Database  
**Action Cards:** Interactive Yes/No workflows
