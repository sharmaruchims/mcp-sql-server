import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { queryAzureSQL, queryAzureSQLSchema, addUser, addUserSchema, getSampleActionCard, sampleActionCardSchema, handleActionCardResponse, actionCardResponseSchema } from './sqlTool.js';
import * as dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';

dotenv.config();

const server = new McpServer({
  name: 'mcp-sql-server',
  version: '1.0.0'
});

// Register the query tool
server.tool('queryAzureSQL', 'Run read-only SQL queries on Azure SQL database.', queryAzureSQLSchema.shape, async (params: any) => {
  const result = await queryAzureSQL(params);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
});

// Register the add user tool
server.tool('addUser', 'Add a new user to the Users table in Azure SQL database.', addUserSchema.shape, async (params: any) => {
  const result = await addUser(params);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
});

// Register the sample action card tool
server.tool('getSampleActionCard', 'Get a sample action card for a user.', sampleActionCardSchema.shape, async (params: any) => {
  return await getSampleActionCard(params);
});

// Register the action card response handler tool
server.tool('handleActionCardResponse', 'Handle user response from action card and call another API.', actionCardResponseSchema.shape, async (params: any) => {
  return await handleActionCardResponse(params);
});

// Check if running in Azure App Service (HTTP mode) or local (stdio mode)
const PORT = parseInt(process.env.PORT || '3000');
const isAzureAppService = process.env.WEBSITE_SITE_NAME || process.env.NODE_ENV === 'production';

if (isAzureAppService) {
  // HTTP Server mode for Azure AI Foundry integration
  console.log('Starting HTTP server mode...');
  const app = express();
  console.log('Express app created');
  
  app.use(cors());
  app.use(express.json());
  console.log('Middleware configured');
  
  app.use(cors());
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    console.log('Health check requested');
    try {
      res.json({ status: 'healthy', service: 'mcp-sql-server', version: '1.0.0' });
      console.log('Health check response sent');
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });
  
  // MCP tools endpoint
  app.get('/tools', async (req, res) => {
    try {
      const tools = [
        {
          name: 'queryAzureSQL',
          description: 'Run read-only SQL queries on Azure SQL database.',
          parameters: queryAzureSQLSchema.shape
        },
        {
          name: 'addUser',
          description: 'Add a new user to the Users table in Azure SQL database.',
          parameters: addUserSchema.shape
        },
        {
          name: 'getSampleActionCard',
          description: 'Get a sample action card from JSONPlaceholder API with Yes/No action buttons.',
          parameters: sampleActionCardSchema.shape
        },
        {
          name: 'handleActionCardResponse',
          description: 'Handle response from action card button clicks.',
          parameters: actionCardResponseSchema.shape
        }
      ];
      res.json({ tools });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list tools' });
    }
  });
  
  // Execute tool endpoint
  app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body; // Use req.body directly, not req.body.arguments
    
    try {
      let result;
      
      switch (toolName) {
        case 'queryAzureSQL':
          result = await queryAzureSQL(args);
          break;
        case 'addUser':
          result = await addUser(args);
          break;
        case 'getSampleActionCard':
          result = await getSampleActionCard(args);
          break;
        case 'handleActionCardResponse':
          result = await handleActionCardResponse(args);
          break;
        default:
          return res.status(404).json({ error: `Tool '${toolName}' not found` });
      }
      
      res.json({ result });
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      res.status(500).json({ 
        error: `Failed to execute tool ${toolName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Root endpoint with API documentation
  app.get('/', (req, res) => {
    res.json({
      service: 'MCP SQL Server',
      version: '1.0.0',
      description: 'Model Context Protocol server for Azure SQL database operations',
      endpoints: {
        health: 'GET /health',
        listTools: 'GET /tools',
        executeTool: 'POST /tools/:toolName'
      },
      tools: [
        {
          name: 'queryAzureSQL',
          description: 'Run read-only SQL queries on Azure SQL database',
          method: 'POST',
          endpoint: '/tools/queryAzureSQL',
          parameters: {
            sql: 'string (required) - A valid read-only SQL SELECT query'
          }
        },
        {
          name: 'addUser',
          description: 'Add a new user to the Users table',
          method: 'POST',
          endpoint: '/tools/addUser',
          parameters: {
            name: 'string (required) - The full name of the user',
            email: 'string (required) - Valid email address',
            age: 'number (optional) - Age between 1-150'
          }
        },
        {
          name: 'getSampleActionCard',
          description: 'Get a sample action card with Yes/No buttons',
          method: 'POST',
          endpoint: '/tools/getSampleActionCard',
          parameters: {
            postId: 'number (required) - ID of the post to fetch from JSONPlaceholder API'
          }
        },
        {
          name: 'handleActionCardResponse',
          description: 'Handle response from action card button clicks',
          method: 'POST',
          endpoint: '/tools/handleActionCardResponse',
          parameters: {
            actionId: 'string (required) - The action identifier',
            action: 'string (required) - The user action (yes/no)',
            context: 'any (optional) - Additional context data'
          }
        }
      ]
    });
  });
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`MCP SQL Server running on port ${PORT}`);
    console.log(`Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`API docs: http://0.0.0.0:${PORT}/`);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  server.on('listening', () => {
    console.log('Server is now listening and ready for connections');
  });
  
  server.on('listening', () => {
    console.log('Server is now listening and ready for connections');
  });
  
  // Keep the process alive
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
  
  // Keep alive interval
  setInterval(() => {
    console.log('Server heartbeat - still alive');
  }, 30000);
  
  console.log('Server setup complete, should be listening...');
  
  // Add global error handlers
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
  });
  
} else {
  // STDIO mode for local MCP usage
  console.log('Starting MCP SQL Server in STDIO mode...');
  const transport = new StdioServerTransport();
  server.connect(transport);
}
