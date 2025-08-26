# Application Insights KQL Queries for MCP Server

## 1. Monitor All HTTP Requests (Last 30 minutes)
```kusto
requests
| where timestamp > ago(30m)
| project timestamp, name, url, resultCode, duration, operation_Id
| order by timestamp desc
```

## 2. Track MCP Endpoint Activity
```kusto
requests
| where timestamp > ago(1h)
| where url contains "/mcp" or url endswith "/"
| project timestamp, name, url, resultCode, duration, clientIP
| order by timestamp desc
```

## 3. Monitor POST Requests to Root and MCP Endpoints
```kusto
requests
| where timestamp > ago(1h)
| where name == "POST /" or name == "POST /mcp"
| project timestamp, name, url, resultCode, duration, operation_Id
| order by timestamp desc
```

## 4. Check for Errors and Failed Requests
```kusto
requests
| where timestamp > ago(2h)
| where resultCode >= 400
| project timestamp, name, url, resultCode, duration, operation_Id
| order by timestamp desc
```

## 5. Monitor Azure AI Foundry Connection Attempts
```kusto
requests
| where timestamp > ago(1h)
| where clientIP contains "52.224" or clientIP contains "20.36" or clientIP contains "40.74"
| project timestamp, name, url, resultCode, duration, clientIP, userAgent
| order by timestamp desc
```

## 6. Track MCP Tools Usage
```kusto
traces
| where timestamp > ago(1h)
| where message contains "tools/list" or message contains "tools/call"
| project timestamp, message, severityLevel, operation_Id
| order by timestamp desc
```

## 7. Performance Monitoring (Response Times)
```kusto
requests
| where timestamp > ago(1h)
| summarize 
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    p99_duration = percentile(duration, 99),
    request_count = count()
    by name
| order by avg_duration desc
```

## 8. Real-time Activity (Last 5 minutes)
```kusto
requests
| where timestamp > ago(5m)
| project timestamp, name, url, resultCode, duration
| order by timestamp desc
```

## 9. Custom Logs from Your Application
```kusto
traces
| where timestamp > ago(30m)
| where message contains "POST request to" or message contains "MCP request"
| project timestamp, message, severityLevel
| order by timestamp desc
```

## 10. Health Check Monitoring
```kusto
requests
| where timestamp > ago(1h)
| where name == "GET /health" or name == "GET /tools"
| summarize count() by name, resultCode
| order by name
```

## 11. User Agent Analysis (Identify Client Types)
```kusto
requests
| where timestamp > ago(2h)
| extend userAgent = tostring(customDimensions.["User-Agent"])
| summarize count() by userAgent, resultCode
| order by count_ desc
```

## 12. Dependencies and External Calls
```kusto
dependencies
| where timestamp > ago(1h)
| project timestamp, name, type, target, duration, success
| order by timestamp desc
```

## Quick Start Queries for Troubleshooting:

### A. Is the server receiving requests?
```kusto
requests | where timestamp > ago(10m) | count
```

### B. What endpoints are being hit?
```kusto
requests 
| where timestamp > ago(30m) 
| summarize count() by name 
| order by count_ desc
```

### C. Any recent errors?
```kusto
requests 
| where timestamp > ago(30m) and resultCode >= 400 
| project timestamp, name, resultCode, url
```

### D. MCP protocol activity?
```kusto
requests 
| where timestamp > ago(30m) 
| where url contains "mcp" 
| project timestamp, resultCode, duration
```

## Usage Instructions:
1. Go to Azure Portal → Your App Service → Application Insights
2. Click on "Logs" in the left menu
3. Copy and paste any of these queries
4. Adjust the time range (ago(30m), ago(1h), etc.) as needed
5. Click "Run" to execute the query
