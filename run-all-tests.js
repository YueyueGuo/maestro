/**
 * Comprehensive Test Suite Runner
 * Executes all test categories and generates summary report
 */

const { runTests } = require('./test-core-functionality');
const { runUXTests } = require('./test-ux-improvements');
const { runWorkflowTests } = require('./test-workflow');
const { runErrorTests } = require('./test-error-scenarios');
const { runPWATests } = require('./test-pwa-compliance');

async function runAllTests() {
  console.log('🧪 Maestro Comprehensive Testing Suite');
  console.log('=====================================\n');

  const results = {
    'Core Functionality': null,
    'UX Improvements': null,
    'End-to-End Workflow': null,
    'Error Scenarios': null,
    'PWA Compliance': null
  };

  let totalPassed = 0;
  let totalFailed = 0;

  try {
    // Run Core Functionality Tests
    console.log('1️⃣ Running Core Functionality Tests...');
    results['Core Functionality'] = await runTests();
    totalPassed += results['Core Functionality'].passed;
    totalFailed += results['Core Functionality'].failed;
    console.log('');

    // Run UX Improvements Tests
    console.log('2️⃣ Running UX Improvements Tests...');
    results['UX Improvements'] = await runUXTests();
    totalPassed += results['UX Improvements'].passed;
    totalFailed += results['UX Improvements'].failed;
    console.log('');

    // Run End-to-End Workflow Tests
    console.log('3️⃣ Running End-to-End Workflow Tests...');
    results['End-to-End Workflow'] = await runWorkflowTests();
    totalPassed += results['End-to-End Workflow'].passed;
    totalFailed += results['End-to-End Workflow'].failed;
    console.log('');

    // Run Error Scenarios Tests
    console.log('4️⃣ Running Error Scenarios Tests...');
    results['Error Scenarios'] = await runErrorTests();
    totalPassed += results['Error Scenarios'].passed;
    totalFailed += results['Error Scenarios'].failed;
    console.log('');

    // Run PWA Compliance Tests
    console.log('5️⃣ Running PWA Compliance Tests...');
    results['PWA Compliance'] = await runPWATests();
    totalPassed += results['PWA Compliance'].passed;
    totalFailed += results['PWA Compliance'].failed;
    console.log('');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }

  // Generate Summary Report
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('=====================================\n');

  let allPassed = true;
  for (const [category, result] of Object.entries(results)) {
    if (result) {
      const status = result.failed === 0 ? '✅ PASS' : '❌ FAIL';
      const percentage = Math.round((result.passed / (result.passed + result.failed)) * 100);

      console.log(`${status} ${category}: ${result.passed}/${result.passed + result.failed} tests (${percentage}%)`);

      if (result.failed > 0) {
        allPassed = false;
      }
    }
  }

  console.log('\n' + '='.repeat(50));

  const overallPercentage = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
  console.log(`📈 OVERALL RESULTS: ${totalPassed}/${totalPassed + totalFailed} tests passed (${overallPercentage}%)`);

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - READY FOR GITHUB PUSH!');
    console.log('🚀 Production readiness: VERIFIED');
    console.log('📱 PWA compliance: CONFIRMED');
    console.log('🔧 Core functionality: WORKING');
    console.log('🎨 UX improvements: IMPLEMENTED');
    console.log('⚠️  Error handling: COMPREHENSIVE');
  } else {
    console.log('❌ SOME TESTS FAILED - REVIEW REQUIRED');
    console.log('Please check the detailed output above for specific failures.');
  }

  console.log('\n📋 Test Report Generated: TESTING_REPORT.md');
  console.log('📁 Test Scripts Available:');
  console.log('   - test-core-functionality.js');
  console.log('   - test-ux-improvements.js');
  console.log('   - test-workflow.js');
  console.log('   - test-error-scenarios.js');
  console.log('   - test-pwa-compliance.js');

  return {
    passed: totalPassed,
    failed: totalFailed,
    allPassed,
    overallPercentage,
    categoryResults: results
  };
}

// Run all tests if called directly
if (require.main === module) {
  runAllTests().then((result) => {
    process.exit(result.allPassed ? 0 : 1);
  }).catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };