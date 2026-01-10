"""
Backend API Tests for ZWAP! Coin - Blockchain Integration & Core Features
Tests blockchain endpoints, user management, and core API functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "zwap-api"
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "ZWAP" in data["message"]


class TestBlockchainEndpoints:
    """Blockchain integration endpoint tests - REAL on-chain data from Polygon"""
    
    def test_contract_info_returns_connected(self):
        """Test /api/blockchain/contract-info returns connected:true"""
        response = requests.get(f"{BASE_URL}/api/blockchain/contract-info")
        assert response.status_code == 200
        data = response.json()
        assert data["connected"] == True
        assert data["symbol"] == "ZWAP"
        assert data["decimals"] == 18
        assert data["network"] == "polygon"
        assert data["chain_id"] == 137
        assert data["contract_address"] == "0xe8898453af13b9496a6e8ada92c6efdaf4967a81"
        # Total supply should be 30 billion
        assert data["total_supply"] == 30000000000.0
    
    def test_balance_endpoint_valid_address(self):
        """Test /api/blockchain/balance/{wallet} returns on-chain balance"""
        # Test with the contract owner address
        wallet = "0x85EaDbB165cf4c8202d33562DfaeeA0b632B0849"
        response = requests.get(f"{BASE_URL}/api/blockchain/balance/{wallet}")
        assert response.status_code == 200
        data = response.json()
        assert data["wallet_address"] == wallet
        assert "onchain_balance" in data
        assert data["onchain_balance"] is not None
        assert isinstance(data["onchain_balance"], (int, float))
        assert data["contract_address"] == "0xe8898453af13b9496a6e8ada92c6efdaf4967a81"
        assert data["network"] == "polygon"
        assert data["chain_id"] == 137
        assert data["decimals"] == 18
    
    def test_balance_endpoint_zero_address(self):
        """Test balance endpoint with zero address"""
        wallet = "0x0000000000000000000000000000000000000000"
        response = requests.get(f"{BASE_URL}/api/blockchain/balance/{wallet}")
        assert response.status_code == 200
        data = response.json()
        assert data["onchain_balance"] == 0.0
    
    def test_balance_endpoint_random_address(self):
        """Test balance endpoint with random address (should return 0 or valid balance)"""
        wallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f1e123"
        response = requests.get(f"{BASE_URL}/api/blockchain/balance/{wallet}")
        assert response.status_code == 200
        data = response.json()
        assert "onchain_balance" in data
        assert data["onchain_balance"] is not None


class TestUserEndpoints:
    """User management endpoint tests"""
    
    def test_connect_wallet_creates_user(self):
        """Test POST /api/users/connect creates new user"""
        test_wallet = f"0xtest{uuid.uuid4().hex[:32]}"
        response = requests.post(
            f"{BASE_URL}/api/users/connect",
            json={"wallet_address": test_wallet}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["wallet_address"] == test_wallet.lower()
        assert data["zwap_balance"] == 100.0  # Initial balance
        assert data["tier"] == "starter"
        assert "id" in data
    
    def test_get_user_returns_user(self):
        """Test GET /api/users/{wallet} returns user data"""
        # First create a user
        test_wallet = f"0xtest{uuid.uuid4().hex[:32]}"
        requests.post(
            f"{BASE_URL}/api/users/connect",
            json={"wallet_address": test_wallet}
        )
        
        # Then get the user
        response = requests.get(f"{BASE_URL}/api/users/{test_wallet}")
        assert response.status_code == 200
        data = response.json()
        assert data["wallet_address"] == test_wallet.lower()
    
    def test_get_user_not_found(self):
        """Test GET /api/users/{wallet} returns 404 for non-existent user"""
        fake_wallet = f"0xnonexistent{uuid.uuid4().hex[:26]}"
        response = requests.get(f"{BASE_URL}/api/users/{fake_wallet}")
        assert response.status_code == 404


class TestTiersEndpoint:
    """Tier configuration endpoint tests"""
    
    def test_get_tiers(self):
        """Test GET /api/tiers returns tier configurations"""
        response = requests.get(f"{BASE_URL}/api/tiers")
        assert response.status_code == 200
        data = response.json()
        assert "starter" in data
        assert "plus" in data
        assert data["starter"]["name"] == "Starter"
        assert data["plus"]["name"] == "Plus"
        assert data["plus"]["price"] == 12.99


class TestSwapEndpoints:
    """Swap/exchange endpoint tests"""
    
    def test_get_prices(self):
        """Test GET /api/swap/prices returns crypto prices"""
        response = requests.get(f"{BASE_URL}/api/swap/prices")
        assert response.status_code == 200
        data = response.json()
        assert "BTC" in data
        assert "ETH" in data
        assert "ZWAP" in data
        assert data["ZWAP"] == 0.01  # Fixed ZWAP price


class TestShopEndpoints:
    """Shop/marketplace endpoint tests"""
    
    def test_get_shop_items(self):
        """Test GET /api/shop/items returns shop items"""
        response = requests.get(f"{BASE_URL}/api/shop/items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check first item has required fields
        item = data[0]
        assert "id" in item
        assert "name" in item
        assert "price_zwap" in item


class TestLeaderboardEndpoints:
    """Leaderboard endpoint tests"""
    
    def test_get_leaderboard_stats(self):
        """Test GET /api/leaderboard/stats returns global stats"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_zwap_distributed" in data
        assert "total_steps_walked" in data
    
    def test_get_leaderboard_by_category(self):
        """Test GET /api/leaderboard/{category} returns leaderboard"""
        for category in ["steps", "games", "earned", "zpts"]:
            response = requests.get(f"{BASE_URL}/api/leaderboard/{category}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
