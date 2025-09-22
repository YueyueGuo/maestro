/**
 * Core Functionality Testing Script
 * Tests critical components without requiring browser environment
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TESTS = {
  'Package Dependencies': testPackageDependencies,
  'ZXing Library Access': testZXingLibrary,
  'Environment Variables': testEnvironmentSetup,
  'Food Database Service': testFoodDBService,
  'Meal Storage Functions': testMealStorage,
  'Debug Utilities': testDebugUtils,
  'PWA Configuration': testPWAConfig
};

async function runTests() {
  console.log('🚀 Running Maestro Core Functionality Tests\n');

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(TESTS)) {
    try {
      console.log(`📋 Testing: ${testName}`);
      await testFn();
      console.log(`✅ PASS: ${testName}\n`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${testName}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

function testPackageDependencies() {
  const packageJson = require('./package.json');

  // Check critical dependencies
  const required = [
    '@zxing/library',
    '@supabase/supabase-js',
    'next-pwa',
    'next',
    'react',
    'lucide-react'
  ];

  for (const dep of required) {
    if (!packageJson.dependencies[dep]) {
      throw new Error(`Missing required dependency: ${dep}`);
    }
  }

  console.log(`   ✓ All ${required.length} critical dependencies found`);
}

function testZXingLibrary() {
  try {
    // Test if ZXing can be imported (Node.js compatible test)
    const zxingPath = path.join(__dirname, 'node_modules', '@zxing', 'library');
    if (!fs.existsSync(zxingPath)) {
      throw new Error('ZXing library not installed');
    }

    console.log('   ✓ ZXing library installed');

    // Check if our barcode detection hook exists
    const hookPath = path.join(__dirname, 'hooks', 'useBarcodeDetection.ts');
    if (!fs.existsSync(hookPath)) {
      throw new Error('Barcode detection hook missing');
    }

    console.log('   ✓ Barcode detection hook found');
  } catch (error) {
    throw new Error(`ZXing library test failed: ${error.message}`);
  }
}

function testEnvironmentSetup() {
  // Test environment files exist
  const envFiles = ['.env.local', '.env.example', '.env'];
  let foundEnv = false;

  for (const file of envFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
      foundEnv = true;
      console.log(`   ✓ Environment file found: ${file}`);
      break;
    }
  }

  if (!foundEnv) {
    console.log('   ⚠️  No environment file found (may use defaults)');
  }

  // Check TypeScript config
  const tsConfig = path.join(__dirname, 'tsconfig.json');
  if (!fs.existsSync(tsConfig)) {
    throw new Error('TypeScript configuration missing');
  }

  console.log('   ✓ TypeScript configuration found');
}

function testFoodDBService() {
  const servicePath = path.join(__dirname, 'lib', 'food-db.ts');
  if (!fs.existsSync(servicePath)) {
    throw new Error('Food database service missing');
  }

  const serviceContent = fs.readFileSync(servicePath, 'utf8');

  // Check for key functions
  const requiredFunctions = [
    'lookupBarcode',
    'searchProducts',
    'validateBarcode'
  ];

  for (const fn of requiredFunctions) {
    if (!serviceContent.includes(fn)) {
      throw new Error(`Missing function: ${fn}`);
    }
  }

  console.log('   ✓ Food database service structure validated');

  // Check Open Food Facts URL
  if (!serviceContent.includes('world.openfoodfacts.org')) {
    throw new Error('Open Food Facts API integration missing');
  }

  console.log('   ✓ Open Food Facts API integration found');
}

function testMealStorage() {
  const storagePath = path.join(__dirname, 'lib', 'meal-storage.ts');
  if (!fs.existsSync(storagePath)) {
    throw new Error('Meal storage module missing');
  }

  const storageContent = fs.readFileSync(storagePath, 'utf8');

  // Check for key functions
  const requiredFunctions = [
    'addFoodToMeal',
    'getTodaysMeals',
    'getTodaysTotalNutrition'
  ];

  for (const fn of requiredFunctions) {
    if (!storageContent.includes(fn)) {
      throw new Error(`Missing function: ${fn}`);
    }
  }

  console.log('   ✓ Meal storage functions validated');

  // Check localStorage usage
  if (!storageContent.includes('localStorage')) {
    throw new Error('localStorage integration missing');
  }

  console.log('   ✓ LocalStorage integration found');
}

function testDebugUtils() {
  const debugPath = path.join(__dirname, 'lib', 'debug.ts');
  if (!fs.existsSync(debugPath)) {
    throw new Error('Debug utilities missing');
  }

  const debugContent = fs.readFileSync(debugPath, 'utf8');

  // Check for key functions
  const requiredFunctions = [
    'debugLog',
    'logError',
    'measurePerformance'
  ];

  for (const fn of requiredFunctions) {
    if (!debugContent.includes(fn)) {
      throw new Error(`Missing debug function: ${fn}`);
    }
  }

  console.log('   ✓ Debug utilities validated');
}

function testPWAConfig() {
  // Check manifest.json
  const manifestPath = path.join(__dirname, 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('PWA manifest missing');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Validate manifest structure
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      throw new Error(`Missing manifest field: ${field}`);
    }
  }

  console.log('   ✓ PWA manifest validated');

  // Check Next.js config
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  if (!fs.existsSync(nextConfigPath)) {
    throw new Error('Next.js configuration missing');
  }

  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (!nextConfig.includes('withPWA')) {
    throw new Error('PWA configuration missing from Next.js config');
  }

  console.log('   ✓ Next.js PWA configuration found');

  // Check service worker
  const swPath = path.join(__dirname, 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    throw new Error('Service worker missing');
  }

  console.log('   ✓ Service worker found');
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runTests, TESTS };