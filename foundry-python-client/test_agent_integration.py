#!/usr/bin/env python3
"""Test Azure AI Foundry Agent with MCP Server Integration"""

import os
from azure.ai.agents import AgentsClient
from azure.ai.agents.models import (
    Agent, McpTool, McpServer, 
    MessageTextContent, ThreadMessage, ThreadRun
)
from azure.identity import ClientSecretCredential
from dotenv import load_dotenv
import time
import json

# Load environment variables
load_dotenv()

def setup_client():
    """Setup Azure AI Agents client"""
    try:
        credential = ClientSecretCredential(
            tenant_id=os.getenv("AZURE_TENANT_ID"),
            client_id=os.getenv("AZURE_CLIENT_ID"),
            client_secret=os.getenv("AZURE_CLIENT_SECRET")
        )
        
        client = AgentsClient(
            endpoint=os.getenv("AZURE_AI_FOUNDRY_ENDPOINT"),
            credential=credential
        )
        
        print("✅ Azure AI Agents client setup successful")
        return client
    except Exception as e:
        print(f"❌ Client setup failed: {e}")
        return None

def test_agent_with_mcp(client):
    """Test agent with MCP server integration"""
    print("\n🤖 Testing Agent with MCP Server Integration...")
    
    try:
        # Define MCP server configuration
        mcp_server = McpServer(
            name="sql-mcp-server",
            uri="https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net"
        )
        
        # Create MCP tool
        mcp_tool = McpTool(servers=[mcp_server])
        
        # Create or get agent
        agent = client.create_agent(
            model="GPT4ForMCP",
            name="MCP SQL Test Agent",
            description="Agent for testing MCP SQL server integration",
            instructions="You are a helpful assistant that can access a SQL database through MCP tools. Use the available tools to query user data and create action cards.",
            tools=[mcp_tool]
        )
        
        print(f"✅ Agent created: {agent.id}")
        
        # Create thread
        thread = client.create_thread()
        print(f"✅ Thread created: {thread.id}")
        
        # Test 1: Ask for available tools
        print("\n📝 Test 1: Asking agent about available tools...")
        message = client.create_message(
            thread_id=thread.id,
            content="What tools do you have available? Please list them."
        )
        
        run = client.create_run(
            thread_id=thread.id,
            agent_id=agent.id
        )
        
        # Wait for completion
        while run.status in ["queued", "in_progress"]:
            time.sleep(2)
            run = client.get_run(thread_id=thread.id, run_id=run.id)
            print(f"   Status: {run.status}")
        
        if run.status == "completed":
            messages = client.list_messages(thread_id=thread.id)
            for msg in messages.data:
                if msg.role == "assistant":
                    for content in msg.content:
                        if isinstance(content, MessageTextContent):
                            print(f"🤖 Agent Response: {content.text.value}")
                            break
                    break
        else:
            print(f"❌ Run failed with status: {run.status}")
        
        # Test 2: Ask for action card for user 1
        print("\n📝 Test 2: Requesting action card for user 1...")
        message = client.create_message(
            thread_id=thread.id,
            content="Can you show me an action card for user 1?"
        )
        
        run = client.create_run(
            thread_id=thread.id,
            agent_id=agent.id
        )
        
        # Wait for completion
        while run.status in ["queued", "in_progress"]:
            time.sleep(2)
            run = client.get_run(thread_id=thread.id, run_id=run.id)
            print(f"   Status: {run.status}")
        
        if run.status == "completed":
            messages = client.list_messages(thread_id=thread.id)
            for msg in messages.data:
                if msg.role == "assistant":
                    for content in msg.content:
                        if isinstance(content, MessageTextContent):
                            print(f"🎯 Action Card Response: {content.text.value}")
                            break
                    break
        else:
            print(f"❌ Run failed with status: {run.status}")
        
        # Test 3: Query users from database
        print("\n📝 Test 3: Querying users from database...")
        message = client.create_message(
            thread_id=thread.id,
            content="Can you query the database and show me all users?"
        )
        
        run = client.create_run(
            thread_id=thread.id,
            agent_id=agent.id
        )
        
        # Wait for completion
        while run.status in ["queued", "in_progress"]:
            time.sleep(2)
            run = client.get_run(thread_id=thread.id, run_id=run.id)
            print(f"   Status: {run.status}")
        
        if run.status == "completed":
            messages = client.list_messages(thread_id=thread.id)
            for msg in messages.data:
                if msg.role == "assistant":
                    for content in msg.content:
                        if isinstance(content, MessageTextContent):
                            print(f"📊 Database Query Response: {content.text.value}")
                            break
                    break
        else:
            print(f"❌ Run failed with status: {run.status}")
        
        # Cleanup
        try:
            client.delete_agent(agent_id=agent.id)
            client.delete_thread(thread_id=thread.id)
            print(f"🧹 Cleanup completed")
        except:
            pass
        
        return True
        
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🚀 Starting Azure AI Foundry Agent Integration Test")
    print("=" * 60)
    
    # Setup client
    client = setup_client()
    if not client:
        return
    
    # Test agent integration
    success = test_agent_with_mcp(client)
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 Agent integration test completed successfully!")
    else:
        print("❌ Agent integration test failed!")

if __name__ == "__main__":
    main()
