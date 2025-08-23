# Azure Deployment Guide for MCP SQL Server

## Overview
This guide shows how to deploy your MCP SQL Server to Azure App Service (without Docker containers) for integration with Azure AI Foundry agents.

## Prerequisites

1. **Azure CLI** installed and logged in
2. **Azure Developer CLI (azd)** installed
3. **Node.js 20** or later
4. **Azure SQL Database** with the Users table

## Setup Steps

### 1. Install Azure Developer CLI
```powershell
# Install AZD if not already installed
winget install microsoft.azd
# or
# iwr https://aka.ms/install-azd.ps1 | iex
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your Azure SQL credentials:
```
SQL_SERVER=your-server.database.windows.net
SQL_DATABASE=your-database-name
SQL_USER=your-username
SQL_PASSWORD=your-password
SQL_ENCRYPT=true
```

### 3. Deploy to Azure

#### Option A: Using Azure Developer CLI (Recommended)
```powershell
# Initialize AZD environment
azd init

# Deploy to Azure
azd up
```

#### Option B: Manual Azure CLI Commands
```powershell
# Login to Azure
az login

# Create resource group
az group create --name rg-mcp-sql-server --location eastus

# Deploy infrastructure
az deployment group create \
  --resource-group rg-mcp-sql-server \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json

# Deploy application code
az webapp deployment source config-zip \
  --resource-group rg-mcp-sql-server \
  --name your-app-service-name \
  --src your-deployment-package.zip
```

### 4. Configure App Service Settings

After deployment, add your SQL Server credentials to App Service Configuration:

```powershell
# Set SQL connection settings
az webapp config appsettings set \
  --resource-group rg-mcp-sql-server \
  --name your-app-service-name \
  --settings \
    SQL_SERVER="your-server.database.windows.net" \
    SQL_DATABASE="your-database-name" \
    SQL_USER="your-username" \
    SQL_PASSWORD="your-password"
```

## Architecture

### App Service Configuration
- **Runtime**: Node.js 20 LTS on Linux
- **SKU**: Basic B1 (can be scaled up/down as needed)
- **Features**:
  - CORS enabled for cross-origin requests
  - HTTPS enforced
  - Application Insights for monitoring
  - Diagnostic logging enabled

### Security Features
- **Managed Identity**: User-assigned managed identity for secure access
- **Key Vault**: For secure secrets storage (optional)
- **HTTPS Only**: All traffic encrypted
- **Firewall**: App Service firewall rules

## API Endpoints

Once deployed, your MCP server will expose these HTTP endpoints:

### Base URL
```
https://your-app-name.azurewebsites.net
```

### Available Endpoints

#### 1. Health Check
```http
GET /health
```
Response:
```json
{
  "status": "healthy",
  "service": "mcp-sql-server",
  "version": "1.0.0"
}
```

#### 2. List Available Tools
```http
GET /tools
```
Response:
```json
{
  "tools": [
    {
      "name": "queryAzureSQL",
      "description": "Run read-only SQL queries on Azure SQL database.",
      "parameters": { ... }
    },
    {
      "name": "addUser",
      "description": "Add a new user to the Users table in Azure SQL database.",
      "parameters": { ... }
    }
  ]
}
```

#### 3. Execute queryAzureSQL Tool
```http
POST /tools/queryAzureSQL
Content-Type: application/json

{
  "arguments": {
    "sql": "SELECT * FROM Users"
  }
}
```

#### 4. Execute addUser Tool
```http
POST /tools/addUser
Content-Type: application/json

{
  "arguments": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }
}
```

## Azure AI Foundry Integration

### 1. Register Your MCP Server
In Azure AI Foundry, add your deployed MCP server:
- **Endpoint URL**: `https://your-app-name.azurewebsites.net`
- **Authentication**: None (or configure as needed)
- **Tools Discovery**: Use `/tools` endpoint

### 2. Agent Configuration
Configure your Azure AI Foundry agent to use the MCP server:
```json
{
  "tools": [
    {
      "type": "http",
      "name": "queryAzureSQL",
      "endpoint": "https://your-app-name.azurewebsites.net/tools/queryAzureSQL",
      "method": "POST"
    },
    {
      "type": "http", 
      "name": "addUser",
      "endpoint": "https://your-app-name.azurewebsites.net/tools/addUser",
      "method": "POST"
    },
    {
      "type": "http",
      "name": "getSampleActionCard", 
      "endpoint": "https://your-app-name.azurewebsites.net/tools/getSampleActionCard",
      "method": "POST"
    },
    {
      "type": "http",
      "name": "handleActionCardResponse",
      "endpoint": "https://your-app-name.azurewebsites.net/tools/handleActionCardResponse", 
      "method": "POST"
    }
  ]
}
```

### 3. Action Card Interaction Pattern
Action cards in AI Foundry work differently than VS Code:

**Step 1: Generate Action Card**
```
User: "Show me action card for user 1"
Agent: [Calls getSampleActionCard, displays options]
```

**Step 2: Natural Language Response**  
```
User: "I approve user 1" or "Yes for user 1"
Agent: [Calls handleActionCardResponse, shows results]
```

**Note:** Action cards appear as structured data, not clickable buttons in AI Foundry chat interface.

### 4. Natural Language Examples
Once integrated, you can use natural language with your AI agent:
- "Show me all users in the database"
- "Add a new user named Sarah with email sarah@company.com"
- "How many users are in the system?"

## Monitoring and Troubleshooting

### Application Insights
View application logs and metrics:
```powershell
# View recent logs
az monitor app-insights query \
  --app your-app-insights-name \
  --analytics-query "traces | order by timestamp desc | limit 50"
```

### App Service Logs
```powershell
# Stream live logs
az webapp log tail --resource-group rg-mcp-sql-server --name your-app-name

# Download logs
az webapp log download --resource-group rg-mcp-sql-server --name your-app-name
```

### Health Monitoring
The `/health` endpoint provides basic health status and can be used for:
- Load balancer health checks
- Monitoring system alerts
- Basic connectivity testing

## Cost Considerations

### Estimated Monthly Costs (East US)
- **App Service B1**: ~$13/month
- **Application Insights**: ~$2-5/month (based on usage)
- **Key Vault**: ~$0.03/month
- **Log Analytics**: ~$2-10/month (based on data ingestion)

### Cost Optimization Tips
1. Use **F1 Free tier** for development/testing
2. Scale down to **S1** if B1 is over-provisioned
3. Set up **auto-scaling** based on CPU/memory usage
4. Use **consumption-based pricing** for Application Insights

## Security Best Practices

1. **Store secrets in Key Vault** instead of App Service settings
2. **Enable diagnostic logging** for security monitoring
3. **Configure network restrictions** if needed
4. **Use managed identities** for database connections
5. **Regular security updates** for dependencies

## Next Steps

1. **Test the deployment** using the provided endpoints
2. **Integrate with Azure AI Foundry** following the integration guide
3. **Set up monitoring alerts** for production use
4. **Configure backup and disaster recovery**
5. **Implement additional tools** as needed for your use case
