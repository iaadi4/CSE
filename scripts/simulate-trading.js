const axios = require('axios');

// Configuration
const ENGINE_API_URL = 'http://localhost:8081/api/v1';
const USER_API_URL = 'http://localhost:8082';
const MARKET = 'SOL_USDC';
const TEST_USER_ID = '1'; // Our test user ID
const NUM_ORDERS = 5;

// Price range for SOL_USDC (in USDC)
const BASE_PRICE = 150;
const PRICE_VARIANCE = 20;

// Helper to generate random price around base price
function getRandomPrice() {
  const variance = (Math.random() - 0.5) * 2 * PRICE_VARIANCE;
  return (BASE_PRICE + variance).toFixed(2);
}

// Helper to generate random quantity
function getRandomQuantity() {
  return (Math.random() * 10 + 0.1).toFixed(4);
}

// Helper to get random side
function getRandomSide() {
  return Math.random() > 0.5 ? 'BUY' : 'SELL';
}

// Create a user
async function createUser(userId) {
  try {
    // First create user in user service
    const userResponse = await axios.post(`${USER_API_URL}/api/auth/register`, {
      username: userId,
      email: `${userId}@example.com`,
      role: 'investor',
      password: 'TestPass123!',
      password_confirmation: 'TestPass123!'
    });

    // Then login to get token
    const loginResponse = await axios.post(`${USER_API_URL}/api/auth/login`, {
      email: `${userId}@example.com`,
      password: 'TestPass123!'
    });

    // Then create user in engine (this might not be needed if engine gets user info from user service)
    const engineResponse = await axios.post(`${ENGINE_API_URL}/users`, {
      user_id: userId,
    });

    console.log(`✓ Created user: ${userId}`);
    return true;
  } catch (error) {
    console.log(`✗ Failed to create user ${userId}:`, error.response?.data || error.message);
    return false;
  }
}

// Place an order
async function placeOrder(userId, side, price, quantity) {
  try {
    const response = await axios.post(`${ENGINE_API_URL}/order`, {
      market: MARKET,
      price: price,
      quantity: quantity,
      side: side,
      order_type: 'LIMIT',
      user_id: userId,
    });
    console.log(`  ✓ ${userId}: ${side} ${quantity} @ ${price} - Order: ${response.data.orderId || 'placed'}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${userId}: Failed to place ${side} order:`, error.response?.data || error.message);
    return false;
  }
}

// Main simulation function
async function simulateTrading() {
  console.log('\n🚀 Starting Trading Simulation...\n');
  console.log(`Market: ${MARKET}`);
  console.log(`User ID: ${TEST_USER_ID}`);
  console.log(`Number of Orders: ${NUM_ORDERS}\n`);

  // Check initial balance
  console.log('� Checking initial balance...');
  try {
    const balanceResponse = await axios.get(`${USER_API_URL}/api/balance/USDC`, {
      headers: {
        'x-service-key': 'engine-service-key',
        'x-user-id': TEST_USER_ID
      }
    });
    console.log(`Initial balance: ${JSON.stringify(balanceResponse.data.data)}`);
  } catch (error) {
    console.log('Failed to get balance:', error.response?.data || error.message);
  }

  // Place orders
  console.log('\n📊 Placing orders...\n');
  let totalOrders = 0;
  let successfulOrders = 0;

  for (let i = 0; i < NUM_ORDERS; i++) {
    const side = getRandomSide();
    const price = getRandomPrice();
    const quantity = getRandomQuantity();
    
    const success = await placeOrder(TEST_USER_ID, side, price, quantity);
    totalOrders++;
    if (success) successfulOrders++;
    
    await sleep(1000); // Delay between orders
  }

  // Check final balance
  console.log('\n📊 Checking final balance...');
  try {
    const balanceResponse = await axios.get(`${USER_API_URL}/api/balance/USDC`, {
      headers: {
        'x-service-key': 'engine-service-key',
        'x-user-id': TEST_USER_ID
      }
    });
    console.log(`Final balance: ${JSON.stringify(balanceResponse.data.data)}`);
  } catch (error) {
    console.log('Failed to get balance:', error.response?.data || error.message);
  }

  // Summary
  console.log('\n✅ Trading Simulation Complete!\n');
  console.log(`Total Orders Attempted: ${totalOrders}`);
  console.log(`Successful Orders: ${successfulOrders}`);
  console.log(`Failed Orders: ${totalOrders - successfulOrders}`);
  console.log(`Success Rate: ${((successfulOrders / totalOrders) * 100).toFixed(2)}%\n`);
}

// Helper sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the simulation
simulateTrading().catch(error => {
  console.error('\n❌ Simulation failed:', error.message);
  process.exit(1);
});
