# Maestro Testing Instructions

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: http://localhost:3000

## Testing Checklist

### ✅ Core Features to Test

#### 1. **Landing Page (Homepage)**
- [ ] App loads without errors
- [ ] "Maestro" title displays correctly
- [ ] Current date shows in header
- [ ] Daily progress percentage displays (should show ~62% with test data)
- [ ] "Log Food" button is prominent and clickable
- [ ] Nutrition progress rings display with test data:
  - Calories: 1,237 / 2,000
  - Carbs: 139.8g / 250g
  - Protein: 95.1g / 150g
  - Fat: 39.5g / 67g
  - Fiber: 21.6g / 25g
- [ ] Recent meals section shows 3 test meals
- [ ] Quick action cards for Meals and Analytics work

#### 2. **Navigation**
- [ ] Bottom navigation bar is visible and fixed
- [ ] All 4 navigation items work (Home, Capture, Meals, Analytics)
- [ ] Active page is highlighted in navigation
- [ ] Touch targets are adequate for mobile

#### 3. **Capture Page**
- [ ] Back button returns to homepage
- [ ] Camera placeholder shows with "coming soon" message
- [ ] Three capture options are displayed:
  - Scan Barcode (FREE)
  - Read Nutrition Label (~$0.002)
  - Analyze Food (~$0.015)
- [ ] Instructions section explains the process
- [ ] All elements are mobile-responsive

#### 4. **Meals Page**
- [ ] Shows today's date in header
- [ ] Daily nutrition summary displays correctly
- [ ] Test meals appear:
  - Breakfast: Oatmeal, Banana, Almonds
  - Lunch: Chicken Breast, Brown Rice, Broccoli
  - Snack: Greek Yogurt
- [ ] Each meal shows individual food items with quantities
- [ ] Meal totals calculate correctly
- [ ] Macro breakdown (C/P/F) displays for each meal
- [ ] Empty "Dinner" placeholder shows "Add Food" link

#### 5. **Analytics Page**
- [ ] Key stats show: 7-day streak, 1,850 weekly average
- [ ] Today's progress rings match homepage data
- [ ] Macro distribution percentages display correctly
- [ ] Weekly comparison shows averages
- [ ] "Coming Soon" features are listed

### 📱 Mobile Testing

#### Responsive Design
- [ ] Test on mobile viewport (390px wide)
- [ ] Test on tablet viewport (768px wide)
- [ ] Test on desktop (1024px+ wide)
- [ ] All text is readable without zooming
- [ ] Touch targets are minimum 44px
- [ ] Content fits within safe areas
- [ ] Horizontal scrolling is not required

#### PWA Features (Production Only)
- [ ] App installs as PWA when served over HTTPS
- [ ] Service worker registers correctly
- [ ] Offline functionality works
- [ ] App icon appears correctly

### 🔧 Development Features

#### Debug Mode
- [ ] Console shows debug messages in development
- [ ] Performance measurements appear in console
- [ ] No production API calls are made (mock mode enabled)

#### Error Handling
- [ ] App gracefully handles missing data
- [ ] Navigation works even with empty states
- [ ] TypeScript compilation succeeds without errors

## Test Data Verification

The app uses static test data. Verify these calculations:

**Expected Daily Totals:**
- Calories: 1,237
- Carbs: 139.8g
- Protein: 95.1g
- Fat: 39.5g
- Fiber: 21.6g

**Sample Meal Breakdown:**
- **Breakfast**: 582 cal (Oatmeal: 158, Banana: 89, Almonds: 335)
- **Lunch**: 505 cal (Chicken: 248, Rice: 89, Broccoli: 34)
- **Snack**: 89 cal (Greek Yogurt)

## Performance Testing

### Build Performance
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] Bundle sizes are reasonable (~100-150kB)
- [ ] No critical warnings or errors

### Runtime Performance
- [ ] Pages load quickly (<2 seconds)
- [ ] Animations are smooth (60fps)
- [ ] Memory usage is stable
- [ ] No console errors

## Browser Compatibility

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Common Issues & Solutions

### Build Errors
- **TypeScript errors**: Check ESLint configuration in `eslint.config.mjs`
- **Missing types**: Install `@types/` packages as needed
- **Import errors**: Verify all file paths are correct

### Runtime Errors
- **Hydration errors**: Check for client/server differences
- **Navigation issues**: Verify Next.js App Router setup
- **Styling problems**: Check Tailwind CSS compilation

### PWA Issues
- **Service worker not registering**: Serve over HTTPS in production
- **Icons not appearing**: Add actual icon files to `/public`
- **Offline functionality**: Only works in production builds

## Next Steps for Full Implementation

After testing, these areas need development:

1. **Camera Integration** (Day 2-3)
   - Real camera access
   - Barcode detection with ZXing-js
   - Image capture and optimization

2. **API Integration** (Day 3-5)
   - Supabase database setup
   - OpenAI Vision API
   - Google Vision OCR
   - Open Food Facts integration

3. **Full User Experience** (Day 5-6)
   - Real-time data updates
   - User authentication
   - Data persistence
   - Advanced analytics

## Deployment Checklist

When ready to deploy:

- [ ] Add real PWA icons (192x192, 512x512)
- [ ] Configure environment variables
- [ ] Set up Supabase project
- [ ] Add API keys for OpenAI and Google Vision
- [ ] Test on production domain
- [ ] Verify PWA installation works
- [ ] Test camera permissions on mobile devices