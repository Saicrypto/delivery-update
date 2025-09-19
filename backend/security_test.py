#!/usr/bin/env python3
"""
Security Testing Script for Delivery Management System
This script tests all security measures implemented in the application.
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

class SecurityTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test results."""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    def test_security_headers(self) -> bool:
        """Test if security headers are properly set."""
        try:
            response = self.session.get(f"{self.base_url}/")
            headers = response.headers
            
            required_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options", 
                "X-XSS-Protection",
                "Strict-Transport-Security",
                "Content-Security-Policy",
                "Referrer-Policy"
            ]
            
            missing_headers = []
            for header in required_headers:
                if header not in headers:
                    missing_headers.append(header)
            
            if missing_headers:
                self.log_test("Security Headers", False, f"Missing headers: {missing_headers}")
                return False
            else:
                self.log_test("Security Headers", True, "All required security headers present")
                return True
                
        except Exception as e:
            self.log_test("Security Headers", False, f"Error: {str(e)}")
            return False
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting functionality."""
        try:
            # Make multiple requests quickly to trigger rate limiting
            responses = []
            for i in range(70):  # More than the 60/minute limit
                response = self.session.get(f"{self.base_url}/health")
                responses.append(response.status_code)
                if i % 10 == 0:  # Small delay every 10 requests
                    time.sleep(0.1)
            
            # Check if any requests were rate limited (429 status)
            rate_limited = any(status == 429 for status in responses)
            
            if rate_limited:
                self.log_test("Rate Limiting", True, "Rate limiting is working")
                return True
            else:
                self.log_test("Rate Limiting", False, "Rate limiting not triggered")
                return False
                
        except Exception as e:
            self.log_test("Rate Limiting", False, f"Error: {str(e)}")
            return False
    
    def test_sql_injection_prevention(self) -> bool:
        """Test SQL injection prevention."""
        try:
            # Test with common SQL injection payloads
            malicious_inputs = [
                "'; DROP TABLE users; --",
                "' OR '1'='1",
                "'; INSERT INTO users VALUES ('hacker', 'password'); --",
                "admin'--",
                "1' UNION SELECT * FROM users--"
            ]
            
            for payload in malicious_inputs:
                # Test login endpoint with malicious input
                data = {
                    "username": payload,
                    "password": "test"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    data=data
                )
                
                # Should not return 500 (server error) for SQL injection attempts
                if response.status_code == 500:
                    self.log_test("SQL Injection Prevention", False, f"Server error with payload: {payload}")
                    return False
            
            self.log_test("SQL Injection Prevention", True, "SQL injection attempts properly handled")
            return True
            
        except Exception as e:
            self.log_test("SQL Injection Prevention", False, f"Error: {str(e)}")
            return False
    
    def test_xss_prevention(self) -> bool:
        """Test XSS prevention."""
        try:
            # Test with XSS payloads
            xss_payloads = [
                "<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "javascript:alert('xss')",
                "<svg onload=alert('xss')>",
                "'><script>alert('xss')</script>"
            ]
            
            for payload in xss_payloads:
                # Test registration endpoint with XSS payload
                data = {
                    "username": payload,
                    "email": f"{payload}@test.com",
                    "password": "TestPass123!",
                    "role": "store_owner"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/register",
                    json=data
                )
                
                # Check if response contains the raw payload (indicating XSS vulnerability)
                if payload in response.text:
                    self.log_test("XSS Prevention", False, f"XSS payload found in response: {payload}")
                    return False
            
            self.log_test("XSS Prevention", True, "XSS payloads properly sanitized")
            return True
            
        except Exception as e:
            self.log_test("XSS Prevention", False, f"Error: {str(e)}")
            return False
    
    def test_authentication_security(self) -> bool:
        """Test authentication security measures."""
        try:
            # Test with weak password
            weak_password_data = {
                "username": "testuser",
                "email": "test@example.com",
                "password": "123",  # Too short
                "role": "store_owner"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=weak_password_data
            )
            
            # Should reject weak password
            if response.status_code == 400 and "password" in response.text.lower():
                self.log_test("Password Strength Validation", True, "Weak passwords properly rejected")
            else:
                self.log_test("Password Strength Validation", False, "Weak password accepted")
                return False
            
            # Test account lockout (simulate multiple failed logins)
            for i in range(6):  # More than the 5 attempt limit
                login_data = {
                    "username": "nonexistentuser",
                    "password": "wrongpassword"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    data=login_data
                )
            
            # Check if account is locked
            if response.status_code == 423:  # Locked status
                self.log_test("Account Lockout", True, "Account properly locked after failed attempts")
            else:
                self.log_test("Account Lockout", False, "Account not locked after failed attempts")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Authentication Security", False, f"Error: {str(e)}")
            return False
    
    def test_cors_configuration(self) -> bool:
        """Test CORS configuration."""
        try:
            # Test with unauthorized origin
            headers = {
                "Origin": "https://malicious-site.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
            
            response = self.session.options(
                f"{self.base_url}/api/auth/login",
                headers=headers
            )
            
            # Should not allow unauthorized origin
            if "Access-Control-Allow-Origin" in response.headers:
                allowed_origin = response.headers["Access-Control-Allow-Origin"]
                if allowed_origin == "*" or "malicious-site.com" in allowed_origin:
                    self.log_test("CORS Configuration", False, "Unauthorized origin allowed")
                    return False
            
            self.log_test("CORS Configuration", True, "CORS properly configured")
            return True
            
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error: {str(e)}")
            return False
    
    def test_input_validation(self) -> bool:
        """Test input validation."""
        try:
            # Test invalid email format
            invalid_email_data = {
                "username": "testuser",
                "email": "invalid-email",
                "password": "TestPass123!",
                "role": "store_owner"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=invalid_email_data
            )
            
            # Should reject invalid email
            if response.status_code == 400 and "email" in response.text.lower():
                self.log_test("Email Validation", True, "Invalid emails properly rejected")
            else:
                self.log_test("Email Validation", False, "Invalid email accepted")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Input Validation", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all security tests."""
        print("🔒 Running Security Tests...")
        print("=" * 50)
        
        tests = [
            self.test_security_headers,
            self.test_rate_limiting,
            self.test_sql_injection_prevention,
            self.test_xss_prevention,
            self.test_authentication_security,
            self.test_cors_configuration,
            self.test_input_validation
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed_tests += 1
            except Exception as e:
                self.log_test(test.__name__, False, f"Test failed with exception: {str(e)}")
        
        print("=" * 50)
        print(f"📊 Test Results: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All security tests passed! Your application is secure.")
        else:
            print("⚠️  Some security tests failed. Please review the issues above.")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "results": self.test_results
        }

def main():
    """Main function to run security tests."""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8000"
    
    print(f"Testing security for: {base_url}")
    print("Make sure your application is running before starting tests.")
    print()
    
    tester = SecurityTester(base_url)
    results = tester.run_all_tests()
    
    # Save results to file
    with open("security_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: security_test_results.json")
    
    # Exit with appropriate code
    if results["passed_tests"] == results["total_tests"]:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
