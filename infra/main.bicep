targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the resource group')
param resourceGroupName string = 'rg-${environmentName}'

@description('Port for the MCP server')
param PORT string = '3000'

@description('Node.js environment')
param NODE_ENV string = 'production'

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources to the resource group
module resources 'resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    PORT: PORT
    NODE_ENV: NODE_ENV
  }
}

// Outputs
output RESOURCE_GROUP_ID string = rg.id
output AZURE_LOCATION string = location
output SERVICE_MCP_SQL_SERVER_ENDPOINT_URL string = resources.outputs.SERVICE_MCP_SQL_SERVER_ENDPOINT_URL
output SERVICE_MCP_SQL_SERVER_NAME string = resources.outputs.SERVICE_MCP_SQL_SERVER_NAME
