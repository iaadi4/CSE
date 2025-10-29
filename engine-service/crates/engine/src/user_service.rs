use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Deserialize)]
pub struct BalanceResponse {
    pub balances: std::collections::HashMap<String, BalanceInfo>,
}

#[derive(Debug, Deserialize)]
pub struct BalanceInfo {
    pub available: f64,
    pub locked: f64,
}

#[derive(Debug, Serialize)]
pub struct LockFundsRequest {
    pub currency: String,
    pub amount: f64,
}

#[derive(Debug, Serialize)]
pub struct UpdateBalanceRequest {
    pub currency: String,
    pub amount: f64,
    pub operation: String, // "add" or "subtract"
}

#[derive(Debug, Clone)]
pub struct UserServiceClient {
    client: Client,
    base_url: String,
}

impl UserServiceClient {
    pub fn new() -> Self {
        let base_url = env::var("USER_SERVICE_URL")
            .unwrap_or_else(|_| "http://localhost:8082".to_string());

        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_balance(&self, user_id: &str, currency: &str) -> Result<BalanceInfo, String> {
        let url = format!("{}/api/balance/{}", self.base_url, currency);

        let response = self
            .client
            .get(&url)
            .header("x-service-key", "engine-service-key") // Service API key
            .header("x-user-id", user_id) // User ID for the request
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("User service returned status: {}", response.status()));
        }

        let balance_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        // Extract balance info from response
        if let Some(data) = balance_data.get("data") {
            let available = data.get("available")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            let locked = data.get("locked")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);

            Ok(BalanceInfo { available, locked })
        } else {
            Err("Invalid response format".to_string())
        }
    }

    pub async fn lock_funds(&self, user_id: &str, currency: &str, amount: f64) -> Result<(), String> {
        let url = format!("{}/api/balance/lock", self.base_url);

        let request = LockFundsRequest {
            currency: currency.to_string(),
            amount,
        };

        let response = self
            .client
            .post(&url)
            .header("x-service-key", "engine-service-key")
            .header("x-user-id", user_id)
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Failed to lock funds: {}", error_text));
        }

        Ok(())
    }

    pub async fn unlock_funds(&self, user_id: &str, currency: &str, amount: f64) -> Result<(), String> {
        let url = format!("{}/api/balance/unlock", self.base_url);

        let request = LockFundsRequest {
            currency: currency.to_string(),
            amount,
        };

        let response = self
            .client
            .post(&url)
            .header("x-service-key", "engine-service-key")
            .header("x-user-id", user_id)
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Failed to unlock funds: {}", error_text));
        }

        Ok(())
    }

    pub async fn update_balance(&self, user_id: &str, currency: &str, amount: f64, operation: &str) -> Result<(), String> {
        let url = format!("{}/api/balance/update", self.base_url);

        let request = UpdateBalanceRequest {
            currency: currency.to_string(),
            amount,
            operation: operation.to_string(),
        };

        let response = self
            .client
            .post(&url)
            .header("x-service-key", "engine-service-key")
            .header("x-user-id", user_id)
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Failed to update balance: {}", error_text));
        }

        Ok(())
    }
}