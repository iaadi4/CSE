const axios = require('axios');

// Configuration
const ENGINE_API_URL = 'http://localhost:8081/api/v1';
const USER_API_URL = 'http://localhost:8082';
const MARKET = 'SOL_USDC';
const NUM_USERS = 50;

// Price configuration for SOL_USDC
const BASE_PRICE = 150;
const SPREAD = 0.5; // 0.5 USDC spread
const ORDER_BOOK_DEPTH = 20; // Number of price levels on each side

// Helper to generate buy orders (below base price)
function getBuyOrder(level) {
  const price = (BASE_PRICE - SPREAD / 2 - level * 0.1).toFixed(2);
  const quantity = (Math.random() * 5 + 1).toFixed(4);
  return { price, quantity };
}

// Helper to generate sell orders (above base price)
function getSellOrder(level) {
  const price = (BASE_PRICE + SPREAD / 2 + level * 0.1).toFixed(2);
  const quantity = (Math.random() * 5 + 1).toFixed(4);
  return { price, quantity };
}

// Create a user - calls engine via router to initialize balance
async function createUser(userId) {
  try {
    // Call router's /users endpoint which creates user in engine with initial balance
    const response = await axios.post(`${ENGINE_API_URL}/users`, {
      user_id: userId,
    });
    return response.data.user_id || userId; // Return the user_id
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
}

// Place an order
async function placeOrder(userId, side, price, quantity, orderType = 'LIMIT') {
  try {
    const response = await axios.post(`${ENGINE_API_URL}/order`, {
      market: MARKET,
      price: price,
      quantity: quantity,
      side: side,
      order_type: orderType,
      user_id: userId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Build initial order book
async function buildOrderBook() {
  console.log('\n📚 Building Order Book...\n');
  
  const users = [];
  const orderStats = {
    bids: 0,
    asks: 0,
    failed: 0
  };

  // Create users for buy side
  for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
    const userId = `buyer_${i}`;
    await createUser(userId);
    users.push(userId);
    
    const { price, quantity } = getBuyOrder(i);
    const result = await placeOrder(userId, 'BUY', price, quantity, 'LIMIT');
    
    if (result.success) {
      orderStats.bids++;
      console.log(`  ✓ BID: ${quantity} @ ${price}`);
    } else {
      orderStats.failed++;
      console.log(`  ✗ Failed BID @ ${price}`);
    }
    
    await sleep(100);
  }

  // Create users for sell side
  for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
    const userId = `seller_${i}`;
    await createUser(userId);
    users.push(userId);
    
    const { price, quantity } = getSellOrder(i);
    const result = await placeOrder(userId, 'SELL', price, quantity, 'LIMIT');
    
    if (result.success) {
      orderStats.asks++;
      console.log(`  ✓ ASK: ${quantity} @ ${price}`);
    } else {
      orderStats.failed++;
      console.log(`  ✗ Failed ASK @ ${price}`);
    }
    
    await sleep(100);
  }

  console.log(`\n✓ Order Book Built: ${orderStats.bids} bids, ${orderStats.asks} asks, ${orderStats.failed} failed\n`);
  return users;
}

// Simulate continuous trading
async function simulateContinuousTrading(existingUsers) {
  console.log('💹 Starting Continuous Trading...\n');
  
  let tradeCount = 0;
  let matchedTrades = 0;

  for (let i = 0; i < NUM_USERS; i++) {
    const userId = `trader_${i}`;
    await createUser(userId);
    
    // Random trader behavior
    const behavior = Math.random();
    let side, price, quantity, orderType;
    
    if (behavior < 0.3) {
      // Aggressive buyer (market order - crosses spread)
      side = 'BUY';
      price = (BASE_PRICE + SPREAD + 2).toFixed(2); // Higher price to match asks
      quantity = (Math.random() * 3 + 0.5).toFixed(4);
      orderType = 'MARKET';
      console.log(`🔥 ${userId}: Market BUY ${quantity} @ ${price}`);
    } else if (behavior < 0.6) {
      // Aggressive seller (market order - crosses spread)
      side = 'SELL';
      price = (BASE_PRICE - SPREAD - 2).toFixed(2); // Lower price to match bids
      quantity = (Math.random() * 3 + 0.5).toFixed(4);
      orderType = 'MARKET';
      console.log(`🔥 ${userId}: Market SELL ${quantity} @ ${price}`);
    } else if (behavior < 0.8) {
      // Passive buyer (limit order below best bid)
      side = 'BUY';
      price = (BASE_PRICE - SPREAD - Math.random() * 2).toFixed(2);
      quantity = (Math.random() * 5 + 1).toFixed(4);
      orderType = 'LIMIT';
      console.log(`📊 ${userId}: Limit BUY ${quantity} @ ${price}`);
    } else {
      // Passive seller (limit order above best ask)
      side = 'SELL';
      price = (BASE_PRICE + SPREAD + Math.random() * 2).toFixed(2);
      quantity = (Math.random() * 5 + 1).toFixed(4);
      orderType = 'LIMIT';
      console.log(`📊 ${userId}: Limit SELL ${quantity} @ ${price}`);
    }
    
    const result = await placeOrder(userId, side, price, quantity, orderType);
    tradeCount++;
    
    if (result.success) {
      const executedQty = result.data.executedQty;
      if (parseFloat(executedQty) > 0) {
        matchedTrades++;
        console.log(`  ✅ Matched! Executed: ${executedQty}`);
      } else {
        console.log(`  ✓ Order placed (no match)`);
      }
    } else {
      console.log(`  ✗ Failed:`, result.error);
    }
    
    await sleep(300 + Math.random() * 200); // Variable delay (300-500ms)
  }

  console.log(`\n✅ Continuous Trading Complete!`);
  console.log(`Total Orders: ${tradeCount}`);
  console.log(`Matched Trades: ${matchedTrades}`);
  console.log(`Match Rate: ${((matchedTrades / tradeCount) * 100).toFixed(2)}%\n`);
}

// Main function
async function main() {
  console.log('\n🎯 Real-World Trading Simulator\n');
  console.log(`Market: ${MARKET}`);
  console.log(`Base Price: $${BASE_PRICE}`);
  console.log(`Spread: $${SPREAD}`);
  console.log(`Order Book Depth: ${ORDER_BOOK_DEPTH} levels\n`);
  
  try {
    // Step 1: Build initial order book
    const initialUsers = await buildOrderBook();
    
    // Wait a bit
    await sleep(2000);
    
    // Step 2: Simulate continuous trading
    await simulateContinuousTrading(initialUsers);
    
    console.log('✨ Simulation Complete! Check your charts and order book.\n');
  } catch (error) {
    console.error('\n❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run the simulation
main();
