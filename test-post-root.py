#!/usr/bin/env python3
"""Test POST / endpoint after fix"""

import requests
import json
import time

# Azure App Service URL
BASE_URL = "https://aipocmcp-c7d6cbg2c4c4c3h3.canadacentral-01.azurewebsites.net"

def test_post_root_endpoint():
    """Test POST / endpoint"""
    print(f"\nTesting POST / endpoint...")
    
    try:
        # Test simple POST to root
        response = requests.post(
            f"{BASE_URL}/",
            json={"test": "data"},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"POST / Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"POST / Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"POST / Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"POST / Exception: {e}")
        return False

def test_mcp_via_root():
    """Test MCP request via POST / (should redirect to /mcp)"""
    print(f"\nTesting MCP request via POST /...")
    
    try:
        # Test MCP request to root (should redirect)
        mcp_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list"
        }
        
        response = requests.post(
            f"{BASE_URL}/",
            json=mcp_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"MCP via POST / Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"MCP via POST / Response: {json.dumps(data, indent=2)}")
            
            # Check if we got tools
            if 'result' in data and 'tools' in data['result']:
                print(f"✅ Tools found: {len(data['result']['tools'])} tools")
                return True
            else:
                print("❌ No tools in response")
                return False
        else:
            print(f"MCP via POST / Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"MCP via POST / Exception: {e}")
        return False

def main():
    print("Testing POST / endpoint fix...")
    
    # Wait for deployment
    print("Waiting 30 seconds for deployment...")
    time.sleep(30)
    
    # Test both scenarios
    test1 = test_post_root_endpoint()
    test2 = test_mcp_via_root()
    
    print(f"\n=== Results ===")
    print(f"POST / (regular): {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"POST / (MCP redirect): {'✅ PASS' if test2 else '❌ FAIL'}")

if __name__ == "__main__":
    main()
