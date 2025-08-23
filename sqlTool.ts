import { z } from 'zod';
import sql from 'mssql';
import fetch from 'node-fetch';

export const queryAzureSQLSchema = z.object({
  sql: z.string().describe('A valid read-only SQL SELECT query'),
});

export const addUserSchema = z.object({
  name: z.string().describe('The full name of the user to add'),
  email: z.string().email().describe('The email address of the user'),
  age: z.number().int().min(1).max(150).optional().describe('The age of the user (optional)'),
});

export const sampleActionCardSchema = z.object({
  userId: z.number().int().describe('User ID for the sample API')
});

export async function getSampleActionCard(params: z.infer<typeof sampleActionCardSchema>) {
  // Call a sample API (JSONPlaceholder)
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${params.userId}`);
  const userRaw: any = await response.json();
  // Defensive: fallback if API returns empty object
  const user: { id: number; name: string; email: string } = {
    id: typeof userRaw.id === 'number' ? userRaw.id : params.userId,
    name: typeof userRaw.name === 'string' ? userRaw.name : 'Unknown',
    email: typeof userRaw.email === 'string' ? userRaw.email : 'unknown@example.com'
  };

  // Return an action card optimized for AI agent interactions
  return {
    type: 'action_card',
    title: `Do you want to proceed with user ${user.name}?`,
    description: `User email: ${user.email}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    actions: [
      { 
        type: 'button', 
        label: 'Yes', 
        value: 'yes',
        description: 'Proceed with this user - will fetch their posts',
        instruction: `To approve: say "Yes for user ${user.id}" or "I approve user ${user.id}"`
      },
      { 
        type: 'button', 
        label: 'No', 
        value: 'no',
        description: 'Skip this user - will fetch related comments',
        instruction: `To decline: say "No for user ${user.id}" or "I decline user ${user.id}"`
      }
    ],
    aiFoundryInstructions: {
      text: `This is an action card for user ${user.name}. The user can respond with natural language like "yes", "approve", "no", or "decline". When they respond, call the handleActionCardResponse tool with userId=${user.id} and their response.`,
      examples: [
        `User says "yes" → call handleActionCardResponse(userId: ${user.id}, response: "yes")`,
        `User says "approve this user" → call handleActionCardResponse(userId: ${user.id}, response: "yes")`,
        `User says "no" → call handleActionCardResponse(userId: ${user.id}, response: "no")`,
        `User says "skip this user" → call handleActionCardResponse(userId: ${user.id}, response: "no")`
      ]
    }
  };
}

export const actionCardResponseSchema = z.object({
  userId: z.number().int(),
  response: z.enum(['yes', 'no'])
});

export async function handleActionCardResponse(params: z.infer<typeof actionCardResponseSchema>) {
  // Call another sample API based on user response
  let apiUrl: string;
  if (params.response === 'yes') {
    apiUrl = `https://jsonplaceholder.typicode.com/posts?userId=${params.userId}`;
  } else {
    apiUrl = `https://jsonplaceholder.typicode.com/comments?postId=${params.userId}`;
  }
  const apiResponse = await fetch(apiUrl);
  const data: unknown = await apiResponse.json();

  return {
    success: true,
    action: params.response,
    data
  };
}

// Database configuration helper
function getDatabaseConfig() {
  return {
    user: process.env.SQL_USER!,
    password: process.env.SQL_PASSWORD!,
    server: process.env.SQL_SERVER!,
    database: process.env.SQL_DATABASE!,
    options: {
      encrypt: process.env.SQL_ENCRYPT === 'true',
      trustServerCertificate: false,
    },
  };
}

export async function queryAzureSQL(params: z.infer<typeof queryAzureSQLSchema>) {
  const config = getDatabaseConfig();

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  const request = pool.request();
  const result = await request.query(params.sql);
  await pool.close();
  return result.recordset;
}

export async function addUser(params: z.infer<typeof addUserSchema>) {
  const config = getDatabaseConfig();

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  try {
    const request = pool.request();
    
    // Use parameterized query to prevent SQL injection
    request.input('name', sql.NVarChar, params.name);
    request.input('email', sql.NVarChar, params.email);
    
    let query = 'INSERT INTO Users (Name, Email';
    let values = 'VALUES (@name, @email';
    
    if (params.age !== undefined) {
      request.input('age', sql.Int, params.age);
      query += ', Age';
      values += ', @age';
    }
    
    query += ') ' + values + ')';
    
    const result = await request.query(query);
    
    // Return the number of affected rows
    return {
      success: true,
      rowsAffected: result.rowsAffected[0],
      message: `User '${params.name}' added successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: `Failed to add user '${params.name}'`
    };
  } finally {
    await pool.close();
  }
}
