// Optimized MCP Server for Azure AI Foundry - Ultra-fast tools response
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

// Pre-cache the tools response for instant delivery
const CACHED_TOOLS_RESPONSE = {
  tools: [
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
  ]
};

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
const isAzureAppService = process.env.WEBSITE_SITE_NAME || process.env.PORT;

if (isAzureAppService) {
  console.log('🚀 Starting MCP SQL Server in HTTP mode for Azure App Service...');
  
  const app: Express = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  // Middleware for ultra-fast responses
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
  }));
  
  app.use(express.json({ limit: '10mb' }));
  
  // Disable X-Powered-By header for faster responses
  app.disable('x-powered-by');
  
  // Ultra-fast health check with instant response
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: Date.now(),
      server: 'mcp-sql-server',
      version: '1.0.0-optimized'
    });
  });
  
  // Main endpoint - must be as fast as possible for Azure AI Foundry
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'MCP SQL Server - Optimized for Azure AI Foundry',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        tools: '/tools',
        call: '/call'
      },
      optimization: 'Cached responses for Azure AI Foundry MCP Connector'
    });
  });
  
  // CRITICAL: Ultra-fast tools endpoint - Azure AI Foundry calls this
  // This MUST respond in under 5 seconds or Azure AI Foundry times out
  app.get('/tools', (req, res) => {
    // Set headers for fastest possible response
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.setHeader('Content-Type', 'application/json');
    
    // Return pre-cached response instantly
    res.status(200).json(CACHED_TOOLS_RESPONSE);
  });
  
  // Tool execution endpoint
  app.post('/call', async (req, res) => {
    try {
      const { tool, arguments: args } = req.body;
      
      console.log(`🔧 Executing tool: ${tool}`);
      console.log(`📋 Arguments:`, args);
      
      let result;
      
      switch (tool) {
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
          return res.status(400).json({ error: `Unknown tool: ${tool}` });
      }
      
      console.log(`✅ Tool execution completed: ${tool}`);
      res.json(result);
      
    } catch (error: any) {
      console.error(`❌ Tool execution failed:`, error);
      res.status(500).json({ error: error.message || 'Tool execution failed' });
    }
  });
  
  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Express error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
  
  // Start server with optimized settings
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ MCP SQL Server (OPTIMIZED) running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🛠️ Tools endpoint: http://localhost:${PORT}/tools`);
    console.log(`⚡ Optimized for Azure AI Foundry MCP Connector`);
  });
  
  // Server optimization settings
  server.keepAliveTimeout = 65000; // Longer than default
  server.headersTimeout = 66000;   // Slightly longer than keepAliveTimeout
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
  
  server.on('listening', () => {
    console.log('🎯 Server is now listening and ready for Azure AI Foundry connections');
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
  
  // Health monitoring for Azure App Service
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
  }, 60000); // Every minute
  
  console.log('🚀 Server setup complete - optimized for Azure AI Foundry!');
  
} else {
  // STDIO mode for local MCP usage
  console.log('🏠 Starting MCP SQL Server in STDIO mode...');
  const transport = new StdioServerTransport();
  server.connect(transport);
}
