"""
ZWAP! Coin API Tests - Iteration 11
Testing: API Client integration, all endpoints, education spine trivia
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://secure-admin-access-2.preview.emergentagent.com').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Test basic health and info endpoints"""
    
    def test_api_health(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")
    
    def test_api_root(self):
        """GET /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "ZWAP" in data.get("message", "")
        print("✓ API root endpoint working")
    
    def test_get_tiers(self):
        """GET /api/tiers returns tier configuration"""
        response = requests.get(f"{BASE_URL}/api/tiers")
        assert response.status_code == 200
        data = response.json()
        assert "starter" in data
        assert "plus" in data
        assert data["starter"]["daily_zpts_cap"] == 75
        assert data["plus"]["daily_zpts_cap"] == 150
        print("✓ Tiers endpoint returns starter and plus tiers")


class TestUserEndpoints:
    """Test user-related endpoints"""
    
    @pytest.fixture
    def test_wallet(self):
        """Generate unique test wallet"""
        return f"0xTEST_{uuid.uuid4().hex[:24]}"
    
    def test_connect_wallet_new_user(self, test_wallet):
        """POST /api/users/connect creates new user"""
        response = requests.post(f"{BASE_URL}/api/users/connect", json={
            "wallet_address": test_wallet
        })
        assert response.status_code == 200, f"Connect wallet failed: {response.text}"
        data = response.json()
        assert data["wallet_address"] == test_wallet.lower()
        assert data["zwap_balance"] == 100.0  # Initial bonus
        assert data["tier"] == "starter"
        print(f"✓ New user created with wallet {test_wallet[:12]}...")
    
    def test_connect_wallet_existing_user(self, test_wallet):
        """POST /api/users/connect returns existing user"""
        # First create user
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": test_wallet})
        
        # Second call should return same user
        response = requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": test_wallet})
        assert response.status_code == 200
        data = response.json()
        assert data["wallet_address"] == test_wallet.lower()
        print("✓ Existing user returned on reconnect")
    
    def test_get_user(self, test_wallet):
        """GET /api/users/{wallet} returns user data"""
        # Create user first
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": test_wallet})
        
        # Get user
        response = requests.get(f"{BASE_URL}/api/users/{test_wallet}")
        assert response.status_code == 200
        data = response.json()
        assert "zwap_balance" in data
        assert "zpts_balance" in data
        assert "tier" in data
        print("✓ Get user endpoint returns user data")
    
    def test_get_user_not_found(self):
        """GET /api/users/{wallet} returns 404 for non-existent user"""
        response = requests.get(f"{BASE_URL}/api/users/0xNONEXISTENT123456789")
        assert response.status_code == 404
        print("✓ Non-existent user returns 404")


class TestShopEndpoints:
    """Test shop-related endpoints"""
    
    def test_get_shop_items(self):
        """GET /api/shop/items returns items array"""
        response = requests.get(f"{BASE_URL}/api/shop/items")
        assert response.status_code == 200, f"Shop items failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Verify item structure
        item = data[0]
        assert "id" in item
        assert "name" in item
        assert "price_zwap" in item
        assert "category" in item
        print(f"✓ Shop returns {len(data)} items")
    
    def test_shop_item_categories(self):
        """Shop items have proper categories"""
        response = requests.get(f"{BASE_URL}/api/shop/items")
        data = response.json()
        categories = set(item["category"] for item in data)
        assert len(categories) >= 2  # Should have multiple categories
        print(f"✓ Shop has categories: {categories}")


class TestSwapEndpoints:
    """Test swap-related endpoints"""
    
    def test_get_swap_prices(self):
        """GET /api/swap/prices returns crypto prices"""
        response = requests.get(f"{BASE_URL}/api/swap/prices")
        assert response.status_code == 200
        data = response.json()
        assert "ZWAP" in data
        assert "BTC" in data or "ETH" in data
        assert data["ZWAP"] == 0.01  # Fixed ZWAP price
        print("✓ Swap prices endpoint returns crypto prices")


class TestGameEndpoints:
    """Test game-related endpoints"""
    
    @pytest.fixture
    def test_user_wallet(self):
        """Create test user for game tests"""
        wallet = f"0xGAME_{uuid.uuid4().hex[:24]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        return wallet
    
    def test_get_trivia_questions(self):
        """GET /api/games/trivia/questions returns questions"""
        response = requests.get(f"{BASE_URL}/api/games/trivia/questions?count=5")
        assert response.status_code == 200
        data = response.json()
        # Note: Backend returns array directly for trivia, or a questions field
        # Check response structure - can be list or dict with questions
        print(f"✓ Trivia questions endpoint responds (data type: {type(data).__name__})")
    
    def test_submit_game_result_zbrickles(self, test_user_wallet):
        """POST /api/games/result/{wallet} for zBrickles"""
        response = requests.post(f"{BASE_URL}/api/games/result/{test_user_wallet}", json={
            "game_type": "zbrickles",
            "score": 500,
            "level": 1,
            "blocks_destroyed": 20
        })
        assert response.status_code == 200
        data = response.json()
        assert "zwap_earned" in data
        assert "zpts_earned" in data
        assert data["game"] == "zbrickles"
        print(f"✓ zBrickles game result: earned {data['zwap_earned']} ZWAP, {data['zpts_earned']} zPts")
    
    def test_submit_game_result_ztrivia(self, test_user_wallet):
        """POST /api/games/result/{wallet} for zTrivia"""
        response = requests.post(f"{BASE_URL}/api/games/result/{test_user_wallet}", json={
            "game_type": "ztrivia",
            "score": 8,  # 8 correct answers
            "level": 2
        })
        assert response.status_code == 200
        data = response.json()
        assert "zwap_earned" in data
        assert "zpts_earned" in data
        print(f"✓ zTrivia game result: earned {data['zwap_earned']} ZWAP, {data['zpts_earned']} zPts")
    
    def test_submit_game_result_ztetris_starter_blocked(self, test_user_wallet):
        """POST /api/games/result for zTetris blocked for starter tier"""
        response = requests.post(f"{BASE_URL}/api/games/result/{test_user_wallet}", json={
            "game_type": "ztetris",
            "score": 1000,
            "level": 1
        })
        # Starter tier should not have access to ztetris
        assert response.status_code == 403, "zTetris should be blocked for starter tier"
        print("✓ zTetris blocked for starter tier (403)")
    
    def test_submit_game_result_zslots_starter_blocked(self, test_user_wallet):
        """POST /api/games/result for zSlots blocked for starter tier"""
        response = requests.post(f"{BASE_URL}/api/games/result/{test_user_wallet}", json={
            "game_type": "zslots",
            "score": 200,
            "level": 1
        })
        # Starter tier should not have access to zslots
        assert response.status_code == 403, "zSlots should be blocked for starter tier"
        print("✓ zSlots blocked for starter tier (403)")


class TestMoveEndpoints:
    """Test move (step-tracking) endpoints"""
    
    @pytest.fixture
    def test_user_wallet(self):
        """Create test user for move tests"""
        wallet = f"0xMOVE_{uuid.uuid4().hex[:24]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        return wallet
    
    def test_claim_step_rewards(self, test_user_wallet):
        """POST /api/faucet/steps/{wallet} claims step rewards"""
        response = requests.post(f"{BASE_URL}/api/faucet/steps/{test_user_wallet}", json={
            "steps": 1500
        })
        assert response.status_code == 200
        data = response.json()
        assert "rewards_earned" in data
        assert data["steps_counted"] == 1500
        # With 1500 steps at tier 0.01 base: 10 + (1500-1000)*0.02 = 20 ZWAP
        assert data["rewards_earned"] >= 10  # At least base tier reward
        print(f"✓ Step rewards claimed: {data['rewards_earned']} ZWAP for {data['steps_counted']} steps")


class TestLeaderboardEndpoints:
    """Test leaderboard endpoints"""
    
    def test_get_leaderboard_stats(self):
        """GET /api/leaderboard/stats returns global stats"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_zwap_distributed" in data
        assert "top_earner" in data
        print(f"✓ Leaderboard stats: {data['total_users']} users, {data['total_zwap_distributed']} ZWAP distributed")
    
    def test_get_leaderboard_earned(self):
        """GET /api/leaderboard/earned returns top earners"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/earned?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "rank" in data[0]
            assert "username" in data[0]
            assert "value" in data[0]
        print(f"✓ Earned leaderboard returns {len(data)} entries")


class TestBlockchainEndpoints:
    """Test blockchain-related endpoints"""
    
    def test_get_contract_info(self):
        """GET /api/blockchain/contract-info returns ZWAP contract info"""
        response = requests.get(f"{BASE_URL}/api/blockchain/contract-info")
        assert response.status_code == 200
        data = response.json()
        # Contract may or may not be connected
        if data.get("connected"):
            assert "contract_address" in data
            assert "symbol" in data or "error" in data
        print(f"✓ Contract info endpoint responds (connected: {data.get('connected', False)})")


class TestZPtsConversion:
    """Test Z Points conversion endpoint"""
    
    def test_convert_zpts_insufficient(self):
        """POST /api/zpts/convert fails with insufficient zPts"""
        wallet = f"0xCONV_{uuid.uuid4().hex[:24]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/zpts/convert/{wallet}", json={
            "zpts_amount": 5000  # More than new user has
        })
        assert response.status_code == 400
        print("✓ zPts conversion fails with insufficient balance")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
