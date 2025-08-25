#!/usr/bin/env python3
"""
Test the MCP protocol endpoint that Azure AI Foundry uses
"""

import requests
import json
import time

MCP_SERVER_URL = "https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net"

def test_mcp_protocol():
    print(f"🧪 Testing MCP Protocol Endpoint")
    print(f"📡 Server: {MCP_SERVER_URL}")
    print("=" * 60)
    
    # Test 1: MCP tools/list (what Azure AI Foundry calls first)
    print(f"\n1. Testing MCP tools/list...")
    try:
        start_time = time.time()
        response = requests.post(
            f"{MCP_SERVER_URL}/mcp",
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Azure-AI-Foundry-MCP-Client/1.0"
            },
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/list",
                "params": {}
            },
            timeout=30
        )
        duration = time.time() - start_time
        
        print(f"   Status: {response.status_code} ({duration:.2f}s)")
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data and 'tools' in data['result']:
                tools = data['result']['tools']
                print(f"   ✅ Found {len(tools)} tools: {[t['name'] for t in tools]}")
                print(f"   🎯 MCP protocol working correctly!")
            else:
                print(f"   ⚠️ Unexpected response format: {data}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 2: MCP tools/call
    print(f"\n2. Testing MCP tools/call...")
    try:
        start_time = time.time()
        response = requests.post(
            f"{MCP_SERVER_URL}/mcp",
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Azure-AI-Foundry-MCP-Client/1.0"
            },
            json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "getSampleActionCard",
                    "arguments": {
                        "userId": 1
                    }
                }
            },
            timeout=30
        )
        duration = time.time() - start_time
        
        print(f"   Status: {response.status_code} ({duration:.2f}s)")
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data:
                print(f"   ✅ Tool call successful!")
                print(f"   📄 Response type: {type(data['result'])}")
            else:
                print(f"   ⚠️ Unexpected response format: {data}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 3: Compare with old endpoint behavior
    print(f"\n3. Testing legacy /tools endpoint...")
    try:
        start_time = time.time()
        response = requests.get(
            f"{MCP_SERVER_URL}/tools",
            headers={"User-Agent": "Test-Client/1.0"},
            timeout=30
        )
        duration = time.time() - start_time
        
        print(f"   Status: {response.status_code} ({duration:.2f}s)")
        
        if response.status_code == 200:
            data = response.json()
            if 'tools' in data:
                print(f"   ✅ Legacy endpoint working: {len(data['tools'])} tools")
            else:
                print(f"   ⚠️ Unexpected response format")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    print(f"\n🏁 MCP Protocol Testing Complete!")
    print(f"\n💡 Expected Results:")
    print(f"   ✅ POST /mcp should return 200 (was 404 before)")
    print(f"   ✅ tools/list should return list of 4 tools")
    print(f"   ✅ tools/call should execute successfully")
    print(f"   ✅ Response times should be ~1-2 seconds")

if __name__ == "__main__":
    test_mcp_protocol()
