# Natural Language Usage Guide for MCP SQL Server

## 🗣️ **Talk Naturally to Your Database!**

With the updated configuration, you can interact with your MCP SQL Server using natural language without the `@mcp` prefix. GitHub Copilot will automatically invoke your MCP tools when relevant.

## ✨ **Natural Language Examples:**

### **Database Queries**
Instead of: `@mcp run SQL query`  
**You can say:**
```
How many users are in my database?
```
```
Show me the last 5 users that were added
```
```
What's the email of user ID 3?
```

### **User Management**
Instead of: `@mcp add user`  
**You can say:**
```
Add a new user named John Smith with email john.smith@company.com
```
```
Create a user account for Sarah Johnson, age 28, email sarah@example.com
```

### **Action Cards**
Instead of: `@mcp get action card`  
**You can say:**
```
Show me an action card for user 1
```
```
Create an interactive card with yes/no buttons for user ID 5
```
```
I want to see user options for the person with ID 2
```

### **Action Card Responses**
Instead of: `@mcp handle response`  
**You can say:**
```
I clicked yes on the action card for user 1
```
```
Process a "no" response for user ID 3
```
```
The user approved the action for ID 7
```

### **Complex Workflows**
**You can combine operations naturally:**
```
Find all users with gmail addresses, then create an action card for the first one
```
```
Add a test user and then show me their action card options
```
```
Count how many users we have, then show me an action card for user 1
```

## 🎯 **Keywords That Trigger MCP Tools:**

GitHub Copilot will recognize these contexts and automatically use your MCP server:

### **Database Operations:**
- "query", "database", "SQL", "users table"
- "how many users", "show me users", "find users"
- "count", "select", "from users"

### **User Management:**
- "add user", "create user", "new user"
- "user named", "with email", "age"

### **Action Cards:**
- "action card", "interactive card", "yes/no buttons"
- "show options for user", "card for user ID"

### **Responses:**
- "clicked yes", "clicked no", "approved", "denied"
- "process response", "handle click"

## 🚀 **Getting Started:**

1. **Restart VS Code** (to load the new configuration)
2. **Open Copilot Chat** (`Ctrl+Shift+I`)
3. **Start with simple requests:**

```
How many users do I have?
```

```
Show me an action card for user 1
```

## 🔧 **Configuration Updates Applied:**

- ✅ `autoInvoke: true` - Copilot can automatically use MCP tools
- ✅ `enableMcp: true` - MCP integration enabled
- ✅ `autoInvokeMcp: true` - Automatic tool invocation
- ✅ Enhanced descriptions for better context understanding

## 💡 **Tips for Natural Interaction:**

### **Be Specific About Intent:**
```
Good: "Show me the users in my database"
Better: "Query my users table and show me all records"
```

### **Use Domain Language:**
```
"I need user information for ID 5"
"Create a new user account"
"Show me interaction options for this user"
```

### **Combine Context:**
```
"After adding a user named Bob, show me their action card"
"Query users then create an interactive card for the newest one"
```

## 🐛 **If Natural Language Doesn't Work:**

1. **Fallback to explicit calls:**
   ```
   @mcp list available tools
   ```

2. **Check MCP server status:**
   ```bash
   npm run test-mcp
   ```

3. **Restart VS Code and try again**

## 🎊 **Examples to Try Right Now:**

```
Tell me about my users database
```

```
Add a user named Alice Cooper with email alice@rock.com
```

```
Show me interactive options for user 1
```

```
I want to approve something for user ID 2
```

---

**Remember:** The goal is to make database interactions feel as natural as having a conversation about your data! 🗣️📊
