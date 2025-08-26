import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'mcp-sql-server-simple', version: '1.0.0', time: new Date().toISOString() });
});

// Tools list endpoint
app.get('/tools', (req, res) => {
  const tools = [
    {
      name: 'queryAzureSQL',
      description: 'Query the Azure SQL database for user information',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'SQL query to execute (SELECT statements only)' }
        },
        required: ['query']
      }
    },
    {
      name: 'addUser',
      description: 'Add a new user to the Azure SQL database',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name of the user' },
          email: { type: 'string', description: 'Email address of the user' }
        },
        required: ['name', 'email']
      }
    },
    {
      name: 'getSampleActionCard',
      description: 'Generate a sample action card for user management with interactive buttons',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'number', description: 'Optional user ID to create action card for specific user' }
        }
      }
    },
    {
      name: 'handleActionCardResponse',
      description: 'Handle user interaction with action card buttons',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'The action taken (approve, deny, edit, etc.)' },
          userId: { type: 'number', description: 'ID of the user related to the action' },
          data: { type: 'object', description: 'Additional data from the action card' }
        },
        required: ['action']
      }
    }
  ];
  
  res.json({ tools });
});

// MCP Protocol endpoint - This is what Azure AI Foundry needs!
app.post('/mcp', (req, res) => {
  console.log('MCP request received:', JSON.stringify(req.body, null, 2));
  
  try {
    const { method, params, id } = req.body;
    
    if (method === 'tools/list') {
      console.log('Handling tools/list request');
      
      const tools = [
        {
          name: 'queryAzureSQL',
          description: 'Query the Azure SQL database for user information',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'SQL query to execute (SELECT statements only)' }
            },
            required: ['query']
          }
        },
        {
          name: 'addUser',
          description: 'Add a new user to the Azure SQL database',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Full name of the user' },
              email: { type: 'string', description: 'Email address of the user' }
            },
            required: ['name', 'email']
          }
        },
        {
          name: 'getSampleActionCard',
          description: 'Generate a sample action card for user management with interactive buttons',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'number', description: 'Optional user ID to create action card for specific user' }
            }
          }
        },
        {
          name: 'handleActionCardResponse',
          description: 'Handle user interaction with action card buttons',
          inputSchema: {
            type: 'object',
            properties: {
              action: { type: 'string', description: 'The action taken (approve, deny, edit, etc.)' },
              userId: { type: 'number', description: 'ID of the user related to the action' },
              data: { type: 'object', description: 'Additional data from the action card' }
            },
            required: ['action']
          }
        }
      ];
      
      const response = {
        jsonrpc: '2.0',
        id: id,
        result: { tools }
      };
      
      console.log('Sending tools list response');
      return res.json(response);
    }
    
    if (method === 'tools/call') {
      console.log('Handling tools/call request for:', params?.name);
      
      // For now, just return a success response
      const response = {
        jsonrpc: '2.0',
        id: id,
        result: {
          content: [
            {
              type: 'text',
              text: `Tool ${params?.name} executed successfully with arguments: ${JSON.stringify(params?.arguments || {})}`
            }
          ]
        }
      };
      
      console.log('Sending tool call response');
      return res.json(response);
    }
    
    // Unknown method
    console.log('Unknown MCP method:', method);
    res.status(400).json({
      jsonrpc: '2.0',
      id: id,
      error: { code: -32601, message: `Method not found: ${method}` }
    });
    
  } catch (error) {
    console.error('MCP error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: 'Internal error', data: error.message }
    });
  }
});

// Root endpoint - GET
app.get('/', (req, res) => {
  res.json({
    service: 'MCP SQL Server - Simple',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      tools: 'GET /tools',
      mcp: 'POST /mcp'
    },
    mcp_methods: [
      'tools/list',
      'tools/call'
    ]
  });
});

// Root endpoint - POST (handle MCP requests directly)
app.post('/', async (req, res) => {
  console.log('POST request to root endpoint:', JSON.stringify(req.body, null, 2));
  
  // If this looks like an MCP request, handle it directly
  if (req.body && req.body.method && req.body.method.startsWith('tools/')) {
    console.log('Handling MCP request directly at root endpoint');
    
    try {
      const { method, params, id } = req.body;
      
      if (method === 'tools/list') {
        console.log('Handling tools/list request at root');
        
        const tools = [
          {
            name: 'queryAzureSQL',
            description: 'Query the Azure SQL database for user information',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'SQL query to execute (SELECT statements only)' }
              },
              required: ['query']
            }
          },
          {
            name: 'addUser',
            description: 'Add a new user to the Azure SQL database',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Full name of the user' },
                email: { type: 'string', description: 'Email address of the user' }
              },
              required: ['name', 'email']
            }
          },
          {
            name: 'getSampleActionCard',
            description: 'Generate a sample action card for user management with interactive buttons',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'number', description: 'Optional user ID to create action card for specific user' }
              }
            }
          },
          {
            name: 'handleActionCardResponse',
            description: 'Handle user interaction with action card buttons',
            inputSchema: {
              type: 'object',
              properties: {
                action: { type: 'string', description: 'The action taken (approve, deny, edit, etc.)' },
                userId: { type: 'number', description: 'ID of the user related to the action' },
                data: { type: 'object', description: 'Additional data from the action card' }
              },
              required: ['action']
            }
          }
        ];
        
        const response = {
          jsonrpc: '2.0',
          id: id,
          result: { tools }
        };
        
        console.log('Sending tools list response from root');
        return res.json(response);
      }
      
      if (method === 'tools/call') {
        console.log('Handling tools/call request at root for:', params?.name);
        
        const response = {
          jsonrpc: '2.0',
          id: id,
          result: {
            content: [
              {
                type: 'text',
                text: `Tool ${params?.name} executed successfully at root endpoint with arguments: ${JSON.stringify(params?.arguments || {})}`
              }
            ]
          }
        };
        
        console.log('Sending tool call response from root');
        return res.json(response);
      }
      
      // Unknown method
      console.log('Unknown MCP method at root:', method);
      res.status(400).json({
        jsonrpc: '2.0',
        id: id,
        error: { code: -32601, message: `Method not found: ${method}` }
      });
      
    } catch (error) {
      console.error('MCP error at root:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32603, message: 'Internal error', data: error.message }
      });
    }
  } else {
    // Otherwise return root endpoint info
    res.json({
      service: 'MCP SQL Server - Simple',
      version: '1.0.0',
      message: 'This is the root POST endpoint',
      endpoints: {
        health: 'GET /health',
        tools: 'GET /tools',
        mcp: 'POST /mcp'
      },
      received_body: req.body
    });
  }
});

// Handle robots.txt requests (Azure monitoring)
app.get('/robots*.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple MCP Server running on port ${port}`);
  console.log(`🔗 Health: http://localhost:${port}/health`);
  console.log(`🛠️ Tools: http://localhost:${port}/tools`);
  console.log(`🎯 MCP: POST http://localhost:${port}/mcp`);
});

export default app;
