#!/usr/bin/env python3
"""Simple Azure AI Foundry Agent Test with MCP"""

import os
from azure.ai.agents import AgentsClient
from azure.ai.agents.models import Agent, McpTool
from azure.identity import ClientSecretCredential
from dotenv import load_dotenv
import time
import json

# Load environment variables
load_dotenv()

def test_simple_agent():
    """Test simple agent creation and MCP tool usage"""
    print("🚀 Testing Azure AI Foundry Agent with MCP Server")
    print("=" * 60)
    
    try:
        # Setup credentials
        credential = ClientSecretCredential(
            tenant_id=os.getenv("AZURE_TENANT_ID"),
            client_id=os.getenv("AZURE_CLIENT_ID"),
            client_secret=os.getenv("AZURE_CLIENT_SECRET")
        )
        
        # Create client
        endpoint = os.getenv("AZURE_AI_FOUNDRY_ENDPOINT") or os.getenv("AZURE_AI_ENDPOINT")
        print(f"🔗 Using endpoint: {endpoint}")
        
        client = AgentsClient(
            endpoint=endpoint,
            credential=credential
        )
        print("✅ Client connected successfully")
        
        # Create MCP tool with our server
        mcp_tool = McpTool(
            mcp_servers={
                "sql-mcp-server": {
                    "uri": "https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net"
                }
            }
        )
        
        # Create agent
        agent = client.create_agent(
            model="GPT4ForMCP",
            name="MCP Test Agent",
            description="Test agent with MCP SQL server",
            instructions="You can access a SQL database through MCP tools. Help users query data and create action cards.",
            tools=[mcp_tool]
        )
        print(f"✅ Agent created: {agent.id}")
        
        # Create thread
        thread = client.create_thread()
        print(f"✅ Thread created: {thread.id}")
        
        # Send test message
        print("\n📝 Sending test message...")
        message = client.create_message(
            thread_id=thread.id,
            content="Hello! Can you tell me what tools you have available and show me an action card for user 1?"
        )
        
        # Create run
        run = client.create_run(
            thread_id=thread.id,
            agent_id=agent.id
        )
        print(f"🏃 Run started: {run.id}")
        
        # Wait for completion
        max_wait = 60  # 60 seconds max
        wait_time = 0
        while run.status in ["queued", "in_progress"] and wait_time < max_wait:
            time.sleep(3)
            wait_time += 3
            run = client.get_run(thread_id=thread.id, run_id=run.id)
            print(f"   Status: {run.status} (waited {wait_time}s)")
        
        # Get response
        if run.status == "completed":
            print("✅ Run completed successfully!")
            messages = client.list_messages(thread_id=thread.id)
            
            print("\n📋 Conversation:")
            for msg in reversed(messages.data):
                role_emoji = "👤" if msg.role == "user" else "🤖"
                print(f"{role_emoji} {msg.role.upper()}:")
                for content in msg.content:
                    if hasattr(content, 'text'):
                        print(f"   {content.text.value}")
                print()
                
        elif run.status == "failed":
            print(f"❌ Run failed: {run.last_error}")
        else:
            print(f"⏰ Run timeout or unexpected status: {run.status}")
        
        # Cleanup
        try:
            client.delete_thread(thread_id=thread.id)
            client.delete_agent(agent_id=agent.id)
            print("🧹 Cleanup completed")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")
        
        return run.status == "completed"
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_simple_agent()
    print("\n" + "=" * 60)
    if success:
        print("🎉 MCP Agent Integration Test: SUCCESS!")
    else:
        print("❌ MCP Agent Integration Test: FAILED!")
