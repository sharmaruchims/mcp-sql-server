#!/usr/bin/env python3
"""
Quick test to verify MCP server endpoints are working
"""

import requests
import time

MCP_SERVER_URL = "https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net"

def quick_test():
    print(f"🧪 Quick MCP Server Test")
    print(f"📡 Server: {MCP_SERVER_URL}")
    print("=" * 50)
    
    tests = [
        ("Health Check", "GET", "/health"),
        ("Tools List", "GET", "/tools"),
        ("MCP Protocol", "POST", "/mcp"),
        ("Robots.txt", "GET", "/robots.txt")
    ]
    
    for name, method, endpoint in tests:
        print(f"\n{name}...")
        try:
            start_time = time.time()
            
            if method == "GET":
                response = requests.get(f"{MCP_SERVER_URL}{endpoint}", timeout=10)
            else:  # POST
                response = requests.post(
                    f"{MCP_SERVER_URL}{endpoint}",
                    json={
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "tools/list",
                        "params": {}
                    },
                    timeout=10
                )
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                print(f"   ✅ {response.status_code} ({duration:.2f}s)")
                
                if endpoint == "/mcp":
                    data = response.json()
                    if 'result' in data and 'tools' in data['result']:
                        print(f"   🎯 MCP working! Found {len(data['result']['tools'])} tools")
                        
            else:
                print(f"   ⚠️ {response.status_code} ({duration:.2f}s)")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Quick test complete!")
    print(f"\n💡 Status:")
    print(f"   • MCP endpoint should now work (no more 404s)")
    print(f"   • Azure AI Foundry should be able to connect")
    print(f"   • Robots.txt requests handled (no more 404 logs)")

if __name__ == "__main__":
    quick_test()
