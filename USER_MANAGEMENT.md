# MCP SQL Server - User Management

This MCP server now supports both querying and adding users to the Azure SQL database.

## Available Tools

### 1. queryAzureSQL
**Description:** Run read-only SQL queries on Azure SQL database

**Parameters:**
- `sql` (string, required): A valid read-only SQL SELECT query

**Example usage:**
```json
{
  "sql": "SELECT * FROM Users"
}
```

### 2. addUser
**Description:** Add a new user to the Users table in Azure SQL database

**Parameters:**
- `name` (string, required): The full name of the user to add
- `email` (string, required): The email address of the user (must be valid email format)
- `age` (number, optional): The age of the user (must be between 1-150)

**Example usage with age:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "age": 30
}
```

**Example usage without age:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

## Response Format

### queryAzureSQL Response
Returns an array of records from the database query.

### addUser Response
Returns an object with the following structure:

**Success response:**
```json
{
  "success": true,
  "rowsAffected": 1,
  "message": "User 'John Doe' added successfully"
}
```

**Error response:**
```json
{
  "success": false,
  "error": "Error message details",
  "message": "Failed to add user 'John Doe'"
}
```

## Security Features

1. **Parameterized Queries**: The addUser function uses parameterized queries to prevent SQL injection attacks
2. **Input Validation**: Zod schema validation ensures data integrity:
   - Email format validation
   - Age range validation (1-150)
   - Required field validation
3. **Error Handling**: Comprehensive error handling with detailed error messages

## Database Schema

The Users table should have the following structure:
```sql
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Age INT NULL
);
```

## Testing

You can test the schemas using the provided test files:
- `test-schema.ts`: Tests Zod schema validation
- `test-add-user.ts`: Tests the actual database insertion (requires database connection)

## Usage with GitHub Copilot

Once the MCP server is running and connected to VS Code, you can use natural language commands like:

- "Add a new user named 'Alice Johnson' with email 'alice@example.com' and age 28"
- "Show me all users in the database"
- "Add a user without specifying age"

The MCP server will automatically validate inputs and provide appropriate error messages for invalid data.
