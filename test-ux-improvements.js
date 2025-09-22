/**
 * UX Improvements Testing Script
 * Tests message management, positioning, and user interaction flows
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const UX_TESTS = {
  'Message Management Implementation': testMessageManagement,
  'UI Positioning and Layout': testUIPositioning,
  'Component Integration': testComponentIntegration,
  'State Management': testStateManagement,
  'User Flow Logic': testUserFlowLogic
};

async function runUXTests() {
  console.log('🎨 Running Maestro UX Improvements Tests\n');

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(UX_TESTS)) {
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

  console.log(`\n📊 UX Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

function testMessageManagement() {
  // Test CameraInterface for message clearing logic
  const cameraInterfacePath = path.join(__dirname, 'app', 'capture', 'components', 'CameraInterface.tsx');
  const cameraInterface = fs.readFileSync(cameraInterfacePath, 'utf8');

  // Check for clearResult() calls in critical user actions
  const clearResultCalls = (cameraInterface.match(/capture\.clearResult\(\)/g) || []).length;
  if (clearResultCalls < 2) {
    throw new Error('Insufficient clearResult() calls for message management');
  }
  console.log(`   ✓ Found ${clearResultCalls} clearResult() calls for message clearing`);

  // Check for message positioning (bottom-20)
  if (!cameraInterface.includes('bottom-20')) {
    throw new Error('Message positioning not moved to bottom-20');
  }
  console.log('   ✓ Messages positioned at bottom-20 (non-blocking)');

  // Check for mode selection clearing
  if (!cameraInterface.includes('handleModeSelect')) {
    throw new Error('Mode selection handler missing');
  }
  console.log('   ✓ Mode selection handler found');

  // Test useCapture hook for clearResult implementation
  const useCaptureePath = path.join(__dirname, 'hooks', 'useCapture.ts');
  const useCapture = fs.readFileSync(useCaptureePath, 'utf8');

  if (!useCapture.includes('clearResult') || !useCapture.includes('lookupResult: null')) {
    throw new Error('clearResult function not properly implemented in useCapture');
  }
  console.log('   ✓ clearResult function properly implemented in useCapture hook');
}

function testUIPositioning() {
  const capturePage = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'page.tsx'),
    'utf8'
  );

  // Check scanning tips positioning (should be above camera)
  if (!capturePage.includes('Barcode Scanning Tips')) {
    throw new Error('Scanning tips section missing');
  }

  // Look for tips positioning before camera interface
  const tipsIndex = capturePage.indexOf('Barcode Scanning Tips');
  const cameraIndex = capturePage.indexOf('<CameraInterface');

  if (tipsIndex === -1 || cameraIndex === -1 || tipsIndex > cameraIndex) {
    throw new Error('Scanning tips not positioned above camera interface');
  }
  console.log('   ✓ Scanning tips positioned above camera interface');

  // Check for blue info styling
  if (!capturePage.includes('bg-blue-50') || !capturePage.includes('border-blue-200')) {
    throw new Error('Scanning tips styling missing');
  }
  console.log('   ✓ Scanning tips have proper blue info styling');

  // Check component positioning classes
  const cameraInterface = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'components', 'CameraInterface.tsx'),
    'utf8'
  );

  // Messages should not block scan area
  if (!cameraInterface.includes('absolute bottom-') || !cameraInterface.includes('left-4 right-4')) {
    throw new Error('Message positioning classes not found');
  }
  console.log('   ✓ Messages positioned to not block scan area');
}

function testComponentIntegration() {
  // Test NutritionFactsCard component
  const nutritionCardPath = path.join(__dirname, 'app', 'capture', 'components', 'NutritionFactsCard.tsx');
  if (!fs.existsSync(nutritionCardPath)) {
    throw new Error('NutritionFactsCard component missing');
  }

  const nutritionCard = fs.readFileSync(nutritionCardPath, 'utf8');

  // Check for key props and handlers
  const requiredProps = ['product', 'onConfirm', 'onEdit', 'onScanAnother'];
  for (const prop of requiredProps) {
    if (!nutritionCard.includes(prop)) {
      throw new Error(`NutritionFactsCard missing prop: ${prop}`);
    }
  }
  console.log('   ✓ NutritionFactsCard has all required props');

  // Test MealSelectionModal component
  const mealModalPath = path.join(__dirname, 'app', 'capture', 'components', 'MealSelectionModal.tsx');
  if (!fs.existsSync(mealModalPath)) {
    throw new Error('MealSelectionModal component missing');
  }

  const mealModal = fs.readFileSync(mealModalPath, 'utf8');

  // Check for meal types
  if (!mealModal.includes('breakfast') || !mealModal.includes('lunch') ||
      !mealModal.includes('dinner') || !mealModal.includes('snack')) {
    throw new Error('MealSelectionModal missing meal types');
  }
  console.log('   ✓ MealSelectionModal has all meal types');

  // Check for serving size controls
  if (!mealModal.includes('servings') || !mealModal.includes('adjustServings')) {
    throw new Error('MealSelectionModal missing serving size controls');
  }
  console.log('   ✓ MealSelectionModal has serving size controls');
}

function testStateManagement() {
  const capturePage = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'page.tsx'),
    'utf8'
  );

  // Check for state variables
  const stateVars = [
    'captureResult',
    'currentMode',
    'showMealModal',
    'pendingProduct'
  ];

  for (const stateVar of stateVars) {
    if (!capturePage.includes(stateVar)) {
      throw new Error(`Missing state variable: ${stateVar}`);
    }
  }
  console.log(`   ✓ All ${stateVars.length} required state variables found`);

  // Check for state reset in resetCapture function
  if (!capturePage.includes('resetCapture') || !capturePage.includes('setCaptureResult(null)')) {
    throw new Error('resetCapture function not properly implemented');
  }
  console.log('   ✓ resetCapture function properly clears state');

  // Check meal storage integration
  if (!capturePage.includes('addFoodToMeal')) {
    throw new Error('Meal storage integration missing');
  }
  console.log('   ✓ Meal storage integration found');
}

function testUserFlowLogic() {
  const capturePage = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'page.tsx'),
    'utf8'
  );

  // Check for complete workflow handlers
  const requiredHandlers = [
    'handleBarcodeSuccess',
    'handleNutritionConfirm',
    'handleMealConfirm',
    'handleEditDetails',
    'handleModeChange'
  ];

  for (const handler of requiredHandlers) {
    if (!capturePage.includes(handler)) {
      throw new Error(`Missing workflow handler: ${handler}`);
    }
  }
  console.log(`   ✓ All ${requiredHandlers.length} workflow handlers found`);

  // Check for proper error handling
  if (!capturePage.includes('alert') && !capturePage.includes('error')) {
    throw new Error('Error handling mechanisms missing');
  }
  console.log('   ✓ Error handling mechanisms found');

  // Check for success feedback
  if (!capturePage.includes('Successfully added')) {
    throw new Error('Success feedback missing');
  }
  console.log('   ✓ Success feedback implementation found');

  // Check for conditional rendering logic
  if (!capturePage.includes('captureResult?.success') || !capturePage.includes('showMealModal')) {
    throw new Error('Conditional rendering logic incomplete');
  }
  console.log('   ✓ Conditional rendering logic implemented');
}

// Run tests if called directly
if (require.main === module) {
  runUXTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runUXTests, UX_TESTS };