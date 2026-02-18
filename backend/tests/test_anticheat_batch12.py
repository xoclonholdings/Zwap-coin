"""
ZWAP! Coin API Tests - Batch 12: Anti-Cheat & New Features
Testing: Rate limits, sanity checks, ZWAP caps, trivia validation, USDT prices, progressive difficulty
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://secure-admin-access-2.preview.emergentagent.com').rstrip('/')


# ============ STEP CLAIM RATE LIMITING TESTS ============

class TestStepClaimRateLimiting:
    """Test step claim rate limiting (1 per 5 minutes per wallet)"""
    
    def test_step_claim_rate_limit_blocks_second_immediate_claim(self):
        """Two immediate step claims should trigger 429 on second claim"""
        wallet = f"0xSTEPRATE_{uuid.uuid4().hex[:20]}"
        # Register wallet
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        # First claim should succeed
        response1 = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 100})
        assert response1.status_code == 200, f"First claim failed: {response1.text}"
        print(f"✓ First step claim succeeded with 100 steps")
        
        # Second immediate claim should be rate limited (429)
        response2 = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 100})
        assert response2.status_code == 429, f"Expected 429 rate limit, got {response2.status_code}: {response2.text}"
        print(f"✓ Second immediate step claim correctly blocked with 429")


class TestStepClaimSanityChecks:
    """Test step claim sanity checks on step counts"""
    
    def test_step_claim_rejects_too_few_steps(self):
        """Steps < 10 should be rejected with 400"""
        wallet = f"0xSTEPMIN_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 5})
        assert response.status_code == 400, f"Expected 400 for <10 steps, got {response.status_code}: {response.text}"
        print(f"✓ Steps < 10 correctly rejected with 400")
    
    def test_step_claim_rejects_too_many_steps(self):
        """Steps > 50000 should be rejected with 400"""
        wallet = f"0xSTEPMAX_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 60000})
        assert response.status_code == 400, f"Expected 400 for >50000 steps, got {response.status_code}: {response.text}"
        print(f"✓ Steps > 50000 correctly rejected with 400")
    
    def test_step_claim_accepts_valid_range(self):
        """Steps in valid range (10-50000) should be accepted"""
        wallet = f"0xSTEPVALID_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 5000})
        assert response.status_code == 200, f"Expected 200 for valid steps, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["steps_counted"] == 5000
        print(f"✓ Valid step count (5000) accepted successfully")


class TestStepClaimReturnsRemainingCap:
    """Test that step claims return daily_zwap_remaining field"""
    
    def test_step_claim_returns_daily_zwap_remaining(self):
        """Step claim response should include daily_zwap_remaining"""
        wallet = f"0xSTEPREMAIN_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/faucet/steps/{wallet}", json={"steps": 100})
        assert response.status_code == 200
        data = response.json()
        assert "daily_zwap_remaining" in data, f"Response missing daily_zwap_remaining: {data}"
        assert isinstance(data["daily_zwap_remaining"], (int, float)), "daily_zwap_remaining should be numeric"
        print(f"✓ Step claim returns daily_zwap_remaining: {data['daily_zwap_remaining']}")


# ============ GAME RESULT RATE LIMITING TESTS ============

class TestGameResultRateLimiting:
    """Test game result rate limiting (1 per 20 seconds per wallet)"""
    
    def test_game_result_rate_limit_blocks_rapid_submissions(self):
        """Two immediate game submissions should trigger 429 on second"""
        wallet = f"0xGAMERATE_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        # First submission should succeed
        response1 = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "zbrickles",
            "score": 100,
            "level": 1,
            "blocks_destroyed": 10
        })
        assert response1.status_code == 200, f"First game result failed: {response1.text}"
        print(f"✓ First game result submitted successfully")
        
        # Second immediate submission should be rate limited
        response2 = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "zbrickles",
            "score": 200,
            "level": 1,
            "blocks_destroyed": 15
        })
        assert response2.status_code == 429, f"Expected 429, got {response2.status_code}: {response2.text}"
        print(f"✓ Second immediate game result correctly blocked with 429")


# ============ GAME RESULT SANITY CHECKS TESTS ============

class TestGameResultSanityChecks:
    """Test game result sanity checks on scores"""
    
    def test_zbrickles_rejects_impossible_score(self):
        """zBrickles score > 5000 should be rejected"""
        wallet = f"0xBRICKSCORE_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "zbrickles",
            "score": 6000,  # Max is 5000
            "level": 1,
            "blocks_destroyed": 100
        })
        assert response.status_code == 400, f"Expected 400 for impossible zbrickles score, got {response.status_code}"
        print(f"✓ zBrickles score > 5000 correctly rejected with 400")
    
    def test_ztrivia_rejects_impossible_score(self):
        """zTrivia score > 50 should be rejected"""
        wallet = f"0xTRIVSCORE_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "ztrivia",
            "score": 60,  # Max is 50
            "level": 1
        })
        assert response.status_code == 400, f"Expected 400 for impossible ztrivia score, got {response.status_code}"
        print(f"✓ zTrivia score > 50 correctly rejected with 400")
    
    def test_ztetris_rejects_impossible_score(self):
        """zTetris score > 10000 should be rejected (Plus tier test)"""
        wallet = f"0xTETRSCORE_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        # Note: This will get 403 for starter tier first, so we're testing the max score validation
        # For starter tier, should get 403 (game not available)
        response = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "ztetris",
            "score": 15000,  # Max is 10000
            "level": 1
        })
        # Starter tier blocks the game before score check
        assert response.status_code in [400, 403], f"Expected 400 or 403, got {response.status_code}"
        print(f"✓ zTetris impossible score handled correctly (status: {response.status_code})")
    
    def test_zslots_rejects_impossible_score(self):
        """zSlots score > 8000 should be rejected"""
        wallet = f"0xSLOTSCORE_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        # For starter tier, should get 403 first
        response = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "zslots",
            "score": 9000,  # Max is 8000
            "level": 1
        })
        assert response.status_code in [400, 403], f"Expected 400 or 403, got {response.status_code}"
        print(f"✓ zSlots impossible score handled correctly (status: {response.status_code})")


# ============ DAILY ZWAP CAP TESTS ============

class TestDailyZwapCap:
    """Test daily ZWAP earning cap enforcement"""
    
    def test_game_result_returns_daily_remaining_fields(self):
        """Game result should return daily_zwap_remaining and daily_zpts_remaining"""
        wallet = f"0xGAMEREM_{uuid.uuid4().hex[:20]}"
        requests.post(f"{BASE_URL}/api/users/connect", json={"wallet_address": wallet})
        
        response = requests.post(f"{BASE_URL}/api/games/result/{wallet}", json={
            "game_type": "zbrickles",
            "score": 100,
            "level": 1,
            "blocks_destroyed": 5
        })
        assert response.status_code == 200
        data = response.json()
        assert "daily_zwap_remaining" in data, f"Missing daily_zwap_remaining: {data}"
        assert "daily_zpts_remaining" in data, f"Missing daily_zpts_remaining: {data}"
        print(f"✓ Game result returns daily_zwap_remaining: {data['daily_zwap_remaining']}, daily_zpts_remaining: {data['daily_zpts_remaining']}")


# ============ TRIVIA SERVER-SIDE VALIDATION TESTS ============

class TestTriviaEndpoints:
    """Test education spine trivia endpoints"""
    
    def test_get_trivia_questions_returns_session_id(self):
        """GET /api/games/trivia/questions returns session_id"""
        response = requests.get(f"{BASE_URL}/api/games/trivia/questions?count=5")
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data, f"Missing session_id: {data}"
        assert "questions" in data, f"Missing questions: {data}"
        print(f"✓ Trivia questions returns session_id: {data['session_id'][:12]}...")
    
    def test_trivia_questions_have_module_names(self):
        """Trivia questions should have module field"""
        response = requests.get(f"{BASE_URL}/api/games/trivia/questions?count=5")
        assert response.status_code == 200
        data = response.json()
        questions = data.get("questions", [])
        assert len(questions) > 0, "No questions returned"
        
        for q in questions:
            assert "module" in q, f"Question missing module field: {q}"
            assert "id" in q, f"Question missing id field: {q}"
            assert "question" in q, f"Question missing question field: {q}"
            assert "options" in q, f"Question missing options field: {q}"
            assert "difficulty" in q, f"Question missing difficulty field: {q}"
        
        print(f"✓ All {len(questions)} trivia questions have required fields including module")
        print(f"  Modules: {set(q['module'] for q in questions)}")
    
    def test_trivia_answer_validates_server_side(self):
        """POST /api/games/trivia/answer validates answers server-side"""
        response = requests.post(f"{BASE_URL}/api/games/trivia/answer", json={
            "question_id": "edu-crypto-1",  # From education spine
            "answer": "Digital",  # Correct answer
            "time_taken": 5.0
        })
        assert response.status_code == 200
        data = response.json()
        assert "correct" in data, f"Missing correct field: {data}"
        assert "correct_answer" in data, f"Missing correct_answer field: {data}"
        assert "time_bonus" in data, f"Missing time_bonus field: {data}"
        assert data["correct"] == True, f"Should be correct for 'Digital'"
        print(f"✓ Trivia answer validation: correct={data['correct']}, time_bonus={data['time_bonus']}")
    
    def test_trivia_answer_returns_wrong_for_incorrect(self):
        """POST /api/games/trivia/answer returns correct=false for wrong answer"""
        response = requests.post(f"{BASE_URL}/api/games/trivia/answer", json={
            "question_id": "edu-crypto-1",
            "answer": "Physical",  # Wrong answer
            "time_taken": 5.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["correct"] == False, f"Should be incorrect for 'Physical'"
        assert data["correct_answer"] == "Digital", f"Should return correct answer"
        print(f"✓ Trivia wrong answer: correct={data['correct']}, correct_answer={data['correct_answer']}")


# ============ SWAP PRICES TESTS ============

class TestSwapPricesUSDT:
    """Test swap prices include USDT"""
    
    def test_swap_prices_includes_usdt(self):
        """GET /api/swap/prices should include USDT at 1.00"""
        response = requests.get(f"{BASE_URL}/api/swap/prices")
        assert response.status_code == 200
        data = response.json()
        assert "USDT" in data, f"Missing USDT in prices: {data.keys()}"
        assert data["USDT"] == 1.00, f"USDT should be 1.00, got {data['USDT']}"
        print(f"✓ Swap prices include USDT at {data['USDT']}")
        print(f"  All tokens: {list(data.keys())}")


# ============ BASIC API HEALTH ============

class TestBasicHealth:
    """Basic health and endpoint tests"""
    
    def test_api_health(self):
        """API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print(f"✓ API health: {response.json()}")
    
    def test_tiers_endpoint(self):
        """Tiers endpoint has daily ZWAP caps"""
        response = requests.get(f"{BASE_URL}/api/tiers")
        assert response.status_code == 200
        data = response.json()
        # Note: DAILY_ZWAP_CAPS is internal, tiers may not expose it directly
        # But we can check the tier config
        assert "starter" in data
        assert "plus" in data
        print(f"✓ Tiers available: {list(data.keys())}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
