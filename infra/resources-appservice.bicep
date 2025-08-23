@description('Name of the environment')
param environmentName string

@description('Primary location for all resources')
param location string = resourceGroup().location

@description('Port for the MCP server')
param PORT string = '3000'

@description('Node.js environment')
param NODE_ENV string = 'production'

// Generate unique resource token
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)
var resourcePrefix = 'mcp'

// User-assigned managed identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'az-${resourcePrefix}-logs-${resourceToken}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'az-${resourcePrefix}-ai-${resourceToken}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'az-${resourcePrefix}-kv-${resourceToken}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enabledForTemplateDeployment: true
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Key Vault role assignment for managed identity
resource keyVaultSecretsOfficerRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, userAssignedIdentity.id, 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7') // Key Vault Secrets Officer
    principalId: userAssignedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'az-${resourcePrefix}-plan-${resourceToken}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: 'az-${resourcePrefix}-app-${resourceToken}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'PORT'
          value: PORT
        }
        {
          name: 'NODE_ENV'
          value: NODE_ENV
        }
        {
          name: 'SQL_ENCRYPT'
          value: 'true'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
      ]
      cors: {
        allowedOrigins: ['*']
        supportCredentials: true
      }
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      use32BitWorkerProcess: false
      healthCheckPath: '/health'
    }
    httpsOnly: true
  }
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'mcp-sql-server'
  }
}

// App Service diagnostic settings
resource appServiceDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${appService.name}-diagnostics'
  scope: appService
  properties: {
    workspaceId: logAnalytics.id
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
    ]
  }
}

// Outputs
output SERVICE_MCP_SQL_SERVER_ENDPOINT_URL string = 'https://${appService.properties.defaultHostName}'
output SERVICE_MCP_SQL_SERVER_NAME string = appService.name
output RESOURCE_GROUP_ID string = resourceGroup().id
