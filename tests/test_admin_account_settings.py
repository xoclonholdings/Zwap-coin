"""
Test Admin Account Settings Feature - ZWAP! Coin PWA
====================================================
Tests:
- GET /api/admin/account/settings - returns admin settings (email, notifications, last_login, key_last_changed)
- PUT /api/admin/account/settings - updates admin email and notification preferences
- POST /api/admin/account/change-key - changes admin key, validates current key, stores new key hash
- verify_admin dependency authenticates against both env var AND database-stored hash
- Invalid/missing admin key returns 401
- New key too short (<12 chars) returns 400 error
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_KEY = "zwap-admin-2025-secure"

class TestAdminAuthentication:
    """Test admin authentication behavior"""
    
    def test_missing_admin_key_returns_401(self):
        """Verify missing admin key returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Missing key returns 401: {data['detail']}")
    
    def test_invalid_admin_key_returns_401(self):
        """Verify invalid admin key returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": "wrong-key-12345"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid key returns 401: {data['detail']}")
    
    def test_valid_admin_key_authenticates(self):
        """Verify valid env var admin key works"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "users" in data
        assert "rewards" in data
        print(f"✓ Valid admin key authenticates, dashboard loaded")


class TestAdminAccountSettings:
    """Test GET and PUT /api/admin/account/settings"""
    
    def test_get_admin_settings(self):
        """GET /api/admin/account/settings returns admin settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/account/settings",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify expected fields are present (or null for first run)
        expected_fields = ["admin_email", "notification_enabled", "two_factor_enabled", "last_login", "key_last_changed"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify admin_key_hash is NOT returned (security)
        assert "admin_key_hash" not in data, "admin_key_hash should not be exposed"
        
        print(f"✓ GET settings returns: admin_email={data['admin_email']}, notification_enabled={data['notification_enabled']}")
        return data
    
    def test_update_admin_settings(self):
        """PUT /api/admin/account/settings updates email and notifications"""
        test_email = "testadmin@zwap-test.com"
        
        response = requests.put(
            f"{BASE_URL}/api/admin/account/settings",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "admin_email": test_email,
                "notification_enabled": False,
                "two_factor_enabled": False
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Expected success=True, got {data}"
        print(f"✓ PUT settings updated successfully")
        
        # Verify the update by GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/account/settings",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert get_response.status_code == 200
        updated = get_response.json()
        assert updated["admin_email"] == test_email, f"Email not updated: {updated['admin_email']}"
        assert updated["notification_enabled"] == False, f"Notifications not updated: {updated['notification_enabled']}"
        print(f"✓ Verified settings persisted: email={updated['admin_email']}, notification_enabled={updated['notification_enabled']}")
    
    def test_toggle_notifications_back(self):
        """Toggle notification_enabled back to True"""
        response = requests.put(
            f"{BASE_URL}/api/admin/account/settings",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "admin_email": "admin@zwap.io",
                "notification_enabled": True,
                "two_factor_enabled": False
            }
        )
        assert response.status_code == 200
        print(f"✓ Reset notification_enabled to True")


class TestAdminKeyChange:
    """Test POST /api/admin/account/change-key"""
    
    def test_change_key_short_password_returns_400(self):
        """New key too short (<12 chars) returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "current_key": ADMIN_KEY,
                "new_key": "short"  # < 12 chars
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        assert "12 characters" in data["detail"].lower() or "12" in data["detail"]
        print(f"✓ Short key returns 400: {data['detail']}")
    
    def test_change_key_wrong_current_key_returns_401(self):
        """Wrong current key returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "current_key": "wrong-current-key",
                "new_key": "new-secure-key-12345"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong current key returns 401: {data['detail']}")
    
    def test_change_key_success_and_new_key_auth(self):
        """Change key successfully and verify new key works for auth"""
        new_key = "new-secure-admin-key-2025"
        
        # Change the key
        response = requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "current_key": ADMIN_KEY,
                "new_key": new_key
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Expected success=True, got {data}"
        print(f"✓ Key changed successfully")
        
        # Small delay for DB to persist
        time.sleep(0.5)
        
        # Verify NEW key works for authentication
        auth_response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": new_key}
        )
        assert auth_response.status_code == 200, f"New key auth failed: {auth_response.status_code} - {auth_response.text}"
        print(f"✓ NEW key authenticates successfully")
        
        # Verify key_last_changed is updated
        settings_response = requests.get(
            f"{BASE_URL}/api/admin/account/settings",
            headers={"X-Admin-Key": new_key}
        )
        assert settings_response.status_code == 200
        settings = settings_response.json()
        assert settings.get("key_last_changed") is not None, "key_last_changed should be set"
        print(f"✓ key_last_changed timestamp set: {settings['key_last_changed']}")
        
        # IMPORTANT: Change key back to original so subsequent tests work
        revert_response = requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": new_key,
                "Content-Type": "application/json"
            },
            json={
                "current_key": new_key,
                "new_key": ADMIN_KEY
            }
        )
        assert revert_response.status_code == 200, f"Failed to revert key: {revert_response.text}"
        print(f"✓ Reverted key back to original")
        
        # Verify original key still works (env var fallback)
        final_response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert final_response.status_code == 200, f"Original key stopped working: {final_response.status_code}"
        print(f"✓ Original env var key still works")


class TestVerifyAdminDualAuth:
    """Test verify_admin authenticates against BOTH env var AND database hash"""
    
    def test_env_var_key_works(self):
        """Env var admin key authenticates"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        print(f"✓ Env var key (ADMIN_API_KEY) authenticates")
    
    def test_database_stored_hash_works(self):
        """After key change, database-stored hash should work"""
        new_key = "database-stored-key-12345"
        
        # First change to new key
        change_response = requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": ADMIN_KEY,
                "Content-Type": "application/json"
            },
            json={
                "current_key": ADMIN_KEY,
                "new_key": new_key
            }
        )
        assert change_response.status_code == 200
        
        time.sleep(0.5)
        
        # Now try authenticating with the new database-stored key
        auth_response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": new_key}
        )
        assert auth_response.status_code == 200, f"Database hash auth failed: {auth_response.status_code}"
        print(f"✓ Database-stored hash key authenticates")
        
        # Env var key should ALSO still work (dual auth)
        env_auth_response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert env_auth_response.status_code == 200, f"Env var key stopped working: {env_auth_response.status_code}"
        print(f"✓ DUAL AUTH VERIFIED: Both env var AND database hash work")
        
        # Cleanup: Change back to original
        requests.post(
            f"{BASE_URL}/api/admin/account/change-key",
            headers={
                "X-Admin-Key": new_key,
                "Content-Type": "application/json"
            },
            json={
                "current_key": new_key,
                "new_key": ADMIN_KEY
            }
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
