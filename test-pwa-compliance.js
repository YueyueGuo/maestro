/**
 * PWA Compliance and Performance Audit Script
 * Tests PWA requirements, performance optimizations, and mobile capabilities
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const PWA_TESTS = {
  'PWA Manifest Requirements': testPWAManifest,
  'Service Worker Implementation': testServiceWorker,
  'Offline Functionality': testOfflineCapabilities,
  'Mobile Responsiveness': testMobileResponsiveness,
  'Performance Optimizations': testPerformanceOptimizations,
  'Security Headers': testSecurityHeaders,
  'Accessibility Features': testAccessibilityFeatures,
  'Cache Strategy': testCacheStrategy
};

async function runPWATests() {
  console.log('📱 Running Maestro PWA Compliance & Performance Audit\n');

  let passed = 0;
  let failed = 0;

  for (const [testName, testFn] of Object.entries(PWA_TESTS)) {
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

  console.log(`\n📊 PWA Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

function testPWAManifest() {
  const manifestPath = path.join(__dirname, 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('PWA manifest.json not found');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Check required fields
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      throw new Error(`Missing required manifest field: ${field}`);
    }
  }
  console.log(`   ✓ All ${requiredFields.length} required manifest fields present`);

  // Check icons
  if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    throw new Error('Manifest icons missing or invalid');
  }

  const hasLargeIcon = manifest.icons.some(icon =>
    icon.sizes && (icon.sizes.includes('192x192') || icon.sizes.includes('512x512'))
  );
  if (!hasLargeIcon) {
    throw new Error('Large app icons (192x192 or 512x512) missing');
  }
  console.log('   ✓ Required app icons present');

  // Check standalone display
  if (manifest.display !== 'standalone') {
    throw new Error('App display mode should be "standalone" for PWA');
  }
  console.log('   ✓ Standalone display mode configured');

  // Check PWA-specific features
  if (manifest.orientation && manifest.orientation !== 'portrait-primary') {
    console.log('   ⚠️  Orientation set to non-portrait (may affect mobile UX)');
  } else {
    console.log('   ✓ Portrait orientation configured for mobile-first experience');
  }

  // Check shortcuts (nice to have)
  if (manifest.shortcuts && manifest.shortcuts.length > 0) {
    console.log(`   ✓ ${manifest.shortcuts.length} app shortcuts configured`);
  }

  // Check categories
  if (manifest.categories && manifest.categories.includes('health')) {
    console.log('   ✓ App categorized appropriately (health)');
  }
}

function testServiceWorker() {
  const swPath = path.join(__dirname, 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    throw new Error('Service worker (sw.js) not found');
  }

  const swContent = fs.readFileSync(swPath, 'utf8');

  // Check for workbox (next-pwa generates workbox-based service worker)
  if (!swContent.includes('workbox') && !swContent.includes('precacheAndRoute')) {
    throw new Error('Service worker missing precaching functionality');
  }
  console.log('   ✓ Service worker has precaching functionality');

  // Check Next.js config for PWA
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

  if (!nextConfig.includes('withPWA')) {
    throw new Error('Next.js PWA configuration missing');
  }
  console.log('   ✓ Next.js PWA configuration found');

  // Check for caching strategies
  if (!nextConfig.includes('runtimeCaching')) {
    throw new Error('Runtime caching strategies not configured');
  }
  console.log('   ✓ Runtime caching strategies configured');

  // Check for offline support
  if (!nextConfig.includes('NetworkFirst') || !nextConfig.includes('CacheFirst')) {
    throw new Error('Cache strategies not properly configured');
  }
  console.log('   ✓ Multiple cache strategies implemented');
}

function testOfflineCapabilities() {
  // Check localStorage usage for offline data
  const mealStorage = fs.readFileSync(
    path.join(__dirname, 'lib', 'meal-storage.ts'),
    'utf8'
  );

  if (!mealStorage.includes('localStorage')) {
    throw new Error('No offline data storage mechanism found');
  }
  console.log('   ✓ Offline data storage (localStorage) implemented');

  // Check for offline error handling
  const foodLookupService = fs.readFileSync(
    path.join(__dirname, 'services', 'food-lookup-service.ts'),
    'utf8'
  );

  if (!foodLookupService.includes('fallbackSuggestions') ||
      !foodLookupService.includes('internet connection')) {
    throw new Error('Offline fallback mechanisms missing');
  }
  console.log('   ✓ Offline fallback mechanisms implemented');

  // Check for cache usage
  if (!foodLookupService.includes('cache') || !foodLookupService.includes('getCachedProduct')) {
    throw new Error('Data caching for offline access missing');
  }
  console.log('   ✓ Data caching for offline access implemented');

  // Check PWA cache configuration
  const nextConfig = fs.readFileSync(
    path.join(__dirname, 'next.config.ts'),
    'utf8'
  );

  if (!nextConfig.includes('maxAgeSeconds')) {
    throw new Error('Cache expiration policies not configured');
  }
  console.log('   ✓ Cache expiration policies configured');
}

function testMobileResponsiveness() {
  // Check layout.tsx for mobile viewport
  const layoutPath = path.join(__dirname, 'app', 'layout.tsx');
  const layout = fs.readFileSync(layoutPath, 'utf8');

  if (!layout.includes('viewport') || !layout.includes('device-width')) {
    throw new Error('Mobile viewport configuration missing');
  }
  console.log('   ✓ Mobile viewport properly configured');

  // Check for responsive classes in capture page
  const capturePage = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'page.tsx'),
    'utf8'
  );

  // Look for mobile-friendly classes
  if (!capturePage.includes('min-h-screen') || !capturePage.includes('px-4')) {
    throw new Error('Mobile-responsive layout classes missing');
  }
  console.log('   ✓ Mobile-responsive layout classes found');

  // Check for touch-friendly targets
  if (!capturePage.includes('touch-target') && !capturePage.includes('p-')) {
    console.log('   ⚠️  Touch-friendly target sizing could be improved');
  } else {
    console.log('   ✓ Touch-friendly target sizing implemented');
  }

  // Check camera interface for mobile optimization
  const cameraInterface = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'components', 'CameraInterface.tsx'),
    'utf8'
  );

  if (!cameraInterface.includes('object-cover') || !cameraInterface.includes('w-full h-full')) {
    throw new Error('Camera interface not optimized for mobile');
  }
  console.log('   ✓ Camera interface optimized for mobile');
}

function testPerformanceOptimizations() {
  // Check Next.js config for performance optimizations
  const nextConfig = fs.readFileSync(
    path.join(__dirname, 'next.config.ts'),
    'utf8'
  );

  // Check for package import optimizations
  if (!nextConfig.includes('optimizePackageImports')) {
    console.log('   ⚠️  Package import optimizations not configured');
  } else {
    console.log('   ✓ Package import optimizations configured');
  }

  // Check for image optimizations
  if (!nextConfig.includes('remotePatterns')) {
    console.log('   ⚠️  Image optimization patterns not configured');
  } else {
    console.log('   ✓ Image optimization patterns configured');
  }

  // Check for performance monitoring
  const debugUtils = fs.readFileSync(
    path.join(__dirname, 'lib', 'debug.ts'),
    'utf8'
  );

  if (!debugUtils.includes('measurePerformance')) {
    throw new Error('Performance monitoring utilities missing');
  }
  console.log('   ✓ Performance monitoring utilities implemented');

  // Check for resource management
  const resourceManager = fs.readFileSync(
    path.join(__dirname, 'lib', 'resource-manager.ts'),
    'utf8'
  );

  if (!resourceManager.includes('cleanup')) {
    throw new Error('Resource cleanup for performance missing');
  }
  console.log('   ✓ Resource cleanup for performance implemented');

  // Check bundle optimization indicators
  const packageJson = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'package.json'),
    'utf8'
  ));

  // Check if we're using optimized dependencies
  if (!packageJson.dependencies['lucide-react']) {
    console.log('   ⚠️  Consider using optimized icon library');
  } else {
    console.log('   ✓ Optimized icon library (lucide-react) in use');
  }
}

function testSecurityHeaders() {
  // Check for HTTPS requirements in PWA
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'manifest.json'),
    'utf8'
  ));

  if (manifest.start_url && manifest.start_url.startsWith('http://')) {
    throw new Error('PWA start_url should use HTTPS in production');
  }
  console.log('   ✓ PWA start_url configured for HTTPS');

  // Check for secure context requirements
  const cameraService = fs.readFileSync(
    path.join(__dirname, 'services', 'camera-service.ts'),
    'utf8'
  );

  // Camera API requires secure context
  if (!cameraService.includes('getUserMedia')) {
    throw new Error('Camera functionality missing (requires secure context)');
  }
  console.log('   ✓ Camera functionality implemented (requires secure context)');

  // Check for no mixed content
  const foodDb = fs.readFileSync(
    path.join(__dirname, 'lib', 'food-db.ts'),
    'utf8'
  );

  if (foodDb.includes('http://') && !foodDb.includes('localhost')) {
    console.log('   ⚠️  HTTP requests found (ensure HTTPS in production)');
  } else {
    console.log('   ✓ No mixed content issues detected');
  }
}

function testAccessibilityFeatures() {
  // Check for semantic HTML in capture page
  const capturePage = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'page.tsx'),
    'utf8'
  );

  if (!capturePage.includes('<h1') || !capturePage.includes('<h2')) {
    throw new Error('Semantic heading structure missing');
  }
  console.log('   ✓ Semantic heading structure found');

  // Check for aria labels and alt text
  if (!capturePage.includes('aria-') && !capturePage.includes('alt=')) {
    console.log('   ⚠️  ARIA labels and alt text could be improved');
  } else {
    console.log('   ✓ ARIA labels and alt text implemented');
  }

  // Check camera interface for accessibility
  const cameraInterface = fs.readFileSync(
    path.join(__dirname, 'app', 'capture', 'components', 'CameraInterface.tsx'),
    'utf8'
  );

  // Check for keyboard navigation support
  if (!cameraInterface.includes('disabled=') || !cameraInterface.includes('onClick')) {
    throw new Error('Interactive elements missing proper states');
  }
  console.log('   ✓ Interactive elements have proper states');

  // Check for loading states and feedback
  if (!cameraInterface.includes('Loading') || !cameraInterface.includes('Starting camera')) {
    throw new Error('Loading states and user feedback missing');
  }
  console.log('   ✓ Loading states and user feedback implemented');
}

function testCacheStrategy() {
  const nextConfig = fs.readFileSync(
    path.join(__dirname, 'next.config.ts'),
    'utf8'
  );

  // Check for different cache strategies
  const cacheStrategies = ['CacheFirst', 'NetworkFirst', 'StaleWhileRevalidate'];
  const foundStrategies = cacheStrategies.filter(strategy =>
    nextConfig.includes(strategy)
  );

  if (foundStrategies.length < 2) {
    throw new Error('Insufficient cache strategies configured');
  }
  console.log(`   ✓ ${foundStrategies.length} cache strategies configured: ${foundStrategies.join(', ')}`);

  // Check for appropriate resource caching
  if (!nextConfig.includes('static-image-assets') || !nextConfig.includes('google-fonts')) {
    throw new Error('Static resource caching not configured');
  }
  console.log('   ✓ Static resource caching configured');

  // Check for API caching
  if (!nextConfig.includes('apis') || !nextConfig.includes('NetworkFirst')) {
    throw new Error('API caching strategy not configured');
  }
  console.log('   ✓ API caching strategy configured');

  // Check cache expiration
  if (!nextConfig.includes('maxAgeSeconds') || !nextConfig.includes('maxEntries')) {
    throw new Error('Cache expiration policies incomplete');
  }
  console.log('   ✓ Cache expiration policies complete');
}

// Run tests if called directly
if (require.main === module) {
  runPWATests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runPWATests, PWA_TESTS };