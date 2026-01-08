import requests
import sys
import json
from datetime import datetime

class ZWAPAPITester:
    def __init__(self, base_url="https://zwap-wallet.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_wallet = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_test(name, True)
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:100]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n" + "="*50)
        print("TESTING USER ENDPOINTS")
        print("="*50)
        
        # Generate test wallet address
        import random
        self.test_wallet = "0x" + ''.join([random.choice('0123456789abcdef') for _ in range(40)])
        print(f"Using test wallet: {self.test_wallet}")
        
        # Test wallet connection (creates user with 100 ZWAP)
        success, user_data = self.run_test(
            "Connect Wallet (Create User)",
            "POST",
            "users/connect",
            200,
            {"wallet_address": self.test_wallet}
        )
        
        if success and user_data:
            print(f"   Created user with balance: {user_data.get('zwap_balance', 0)} ZWAP")
            
            # Verify user has 100 ZWAP starting balance
            if user_data.get('zwap_balance') == 100.0:
                print("   ✅ Starting balance correct (100 ZWAP)")
            else:
                print(f"   ❌ Starting balance incorrect: {user_data.get('zwap_balance')}")
        
        # Test get user
        self.run_test(
            "Get User by Wallet",
            "GET",
            f"users/{self.test_wallet}",
            200
        )
        
        # Test connecting existing wallet (should return existing user)
        self.run_test(
            "Connect Existing Wallet",
            "POST",
            "users/connect",
            200,
            {"wallet_address": self.test_wallet}
        )

    def test_faucet_endpoints(self):
        """Test faucet (earning) endpoints"""
        print("\n" + "="*50)
        print("TESTING FAUCET ENDPOINTS")
        print("="*50)
        
        if not self.test_wallet:
            print("❌ No test wallet available, skipping faucet tests")
            return
        
        # Test step rewards
        success, step_result = self.run_test(
            "Claim Step Rewards",
            "POST",
            f"faucet/steps/{self.test_wallet}",
            200,
            {"steps": 1500}
        )
        
        if success and step_result:
            print(f"   Steps counted: {step_result.get('steps_counted')}")
            print(f"   Rewards earned: {step_result.get('rewards_earned')} ZWAP")
            print(f"   New balance: {step_result.get('new_balance')} ZWAP")
        
        # Test game rewards
        success, game_result = self.run_test(
            "Claim Game Rewards",
            "POST",
            f"faucet/game/{self.test_wallet}",
            200,
            {"score": 1200, "blocks_destroyed": 15}
        )
        
        if success and game_result:
            print(f"   Score: {game_result.get('score')}")
            print(f"   Blocks destroyed: {game_result.get('blocks_destroyed')}")
            print(f"   Rewards earned: {game_result.get('rewards_earned')} ZWAP")
            print(f"   New balance: {game_result.get('new_balance')} ZWAP")
        
        # Test scratch to win
        success, scratch_result = self.run_test(
            "Scratch to Win",
            "POST",
            f"faucet/scratch/{self.test_wallet}",
            200
        )
        
        if success and scratch_result:
            print(f"   Won: {scratch_result.get('won')}")
            print(f"   Amount: {scratch_result.get('amount')} ZWAP")
            print(f"   New balance: {scratch_result.get('new_balance')} ZWAP")

    def test_shop_endpoints(self):
        """Test shop endpoints"""
        print("\n" + "="*50)
        print("TESTING SHOP ENDPOINTS")
        print("="*50)
        
        # Test get shop items
        success, items = self.run_test(
            "Get Shop Items",
            "GET",
            "shop/items",
            200
        )
        
        if success and items:
            print(f"   Found {len(items)} shop items")
            if items:
                first_item = items[0]
                print(f"   Sample item: {first_item.get('name')} - {first_item.get('price')} ZWAP")
                
                # Test purchase (might fail due to insufficient balance, that's ok)
                if self.test_wallet:
                    success, purchase_result = self.run_test(
                        "Purchase Item",
                        "POST",
                        f"shop/purchase/{self.test_wallet}",
                        200,  # Expect success or 400 for insufficient funds
                        {"item_id": first_item.get('id')}
                    )
                    
                    # If it fails with 400, that's expected for insufficient balance
                    if not success:
                        print("   Note: Purchase may fail due to insufficient balance (expected)")

    def test_swap_endpoints(self):
        """Test swap endpoints"""
        print("\n" + "="*50)
        print("TESTING SWAP ENDPOINTS")
        print("="*50)
        
        # Test get prices
        success, prices = self.run_test(
            "Get Crypto Prices",
            "GET",
            "swap/prices",
            200
        )
        
        if success and prices:
            print(f"   Available tokens: {list(prices.keys())}")
            for token, price in prices.items():
                print(f"   {token}: ${price}")
        
        # Test swap execution (small amount)
        if self.test_wallet and success:
            success, swap_result = self.run_test(
                "Execute Swap (ZWAP to ETH)",
                "POST",
                f"swap/execute/{self.test_wallet}",
                200,
                {"from_token": "ZWAP", "to_token": "ETH", "amount": 10.0}
            )
            
            if success and swap_result:
                print(f"   Swapped: {swap_result.get('from_amount')} {swap_result.get('from_token')}")
                print(f"   Received: {swap_result.get('to_amount')} {swap_result.get('to_token')}")
                print(f"   Rate: {swap_result.get('rate')}")
                print(f"   Fee: ${swap_result.get('fee')}")

    def test_error_cases(self):
        """Test error handling"""
        print("\n" + "="*50)
        print("TESTING ERROR CASES")
        print("="*50)
        
        # Test non-existent user
        self.run_test(
            "Get Non-existent User",
            "GET",
            "users/0x0000000000000000000000000000000000000000",
            404
        )
        
        # Test invalid swap
        if self.test_wallet:
            self.run_test(
                "Invalid Swap (Insufficient Balance)",
                "POST",
                f"swap/execute/{self.test_wallet}",
                400,
                {"from_token": "ZWAP", "to_token": "BTC", "amount": 999999}
            )

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting ZWAP! Coin API Tests")
        print(f"Testing against: {self.base_url}")
        
        start_time = datetime.now()
        
        try:
            self.test_health_endpoints()
            self.test_user_endpoints()
            self.test_faucet_endpoints()
            self.test_shop_endpoints()
            self.test_swap_endpoints()
            self.test_error_cases()
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Print summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        print(f"Duration: {duration:.2f} seconds")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = ZWAPAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())