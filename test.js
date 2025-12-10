const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  log.info('Testing health check endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.status === 'ok') {
      log.success('Health check passed');
      return true;
    } else {
      log.error('Health check returned unexpected status');
      return false;
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Token Status
 */
async function testTokenStatus() {
  log.info('Testing token status endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/token-status`);
    if (response.data.hasToken) {
      log.success(`Token status: Active (expires in ${response.data.expiresIn})`);
      return true;
    } else {
      log.error('No token available');
      return false;
    }
  } catch (error) {
    log.error(`Token status check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Image Recognition (if test image exists)
 */
async function testImageRecognition() {
  log.info('Testing image recognition endpoint...');
  
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    log.warn('Test image not found. Skipping image recognition test.');
    log.warn('To test image recognition, place a food image at: test-image.jpg');
    return null; // Not a failure, just skipped
  }

  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

    const response = await axios.post(`${BASE_URL}/api/recognize-food`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    if (response.data.success) {
      log.success('Image recognition successful');
      if (response.data.data.foods && response.data.data.foods.length > 0) {
        log.info(`Found ${response.data.data.foods.length} food items`);
        response.data.data.foods.slice(0, 3).forEach((food, index) => {
          console.log(`  ${index + 1}. ${food.food_name}`);
        });
      }
      return true;
    } else {
      log.error('Image recognition returned unsuccessful response');
      return false;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Image recognition failed: ${error.response.status} - ${error.response.data.message || error.response.data.error}`);
    } else {
      log.error(`Image recognition failed: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 4: Error Handling - No Image
 */
async function testNoImageError() {
  log.info('Testing error handling (no image)...');
  try {
    await axios.post(`${BASE_URL}/api/recognize-food`);
    log.error('Should have returned an error for missing image');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly rejected request with no image');
      return true;
    } else {
      log.error(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('  FatSecret API Proxy Server - Test Suite');
  console.log('='.repeat(50) + '\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Run tests
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Token Status', fn: testTokenStatus },
    { name: 'Image Recognition', fn: testImageRecognition },
    { name: 'Error Handling', fn: testNoImageError },
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result === true) {
      results.passed++;
    } else if (result === false) {
      results.failed++;
    } else {
      results.skipped++;
    }
    console.log(''); // Blank line between tests
  }

  // Summary
  console.log('='.repeat(50));
  console.log('Test Summary:');
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  if (results.failed > 0) {
    console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  }
  if (results.skipped > 0) {
    console.log(`  ${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
  }
  console.log('='.repeat(50) + '\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running before testing
async function checkServerRunning() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    log.error('Server is not running!');
    log.info('Please start the server first:');
    console.log('  npm run dev\n');
    process.exit(1);
  }

  await runTests();
})();
