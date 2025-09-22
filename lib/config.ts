/**
 * Configuration and feature flags for Maestro
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  isDevelopment,
  isProduction,

  // API endpoints
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleVisionKeyPath: process.env.GOOGLE_VISION_KEY_PATH || '',

  // App settings
  appName: 'Maestro',
  appDescription: 'AI-Powered Macro Tracker',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Image processing settings
  maxImageSize: 1024, // max width/height in pixels
  imageQuality: 0.8,  // JPEG quality
  maxFileSize: 5 * 1024 * 1024, // 5MB max file size

  // API limits
  apiTimeout: 30000, // 30 seconds
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  // User defaults
  defaultDailyGoals: {
    calories: 2000,
    carbs: 250,
    fat: 67,
    protein: 150,
    fiber: 25
  }
}

export const FEATURES = {
  // Core features
  CAMERA_ENABLED: process.env.NEXT_PUBLIC_ENABLE_CAMERA !== 'false',
  AI_ANALYSIS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_AI !== 'false',
  OCR_ENABLED: process.env.NEXT_PUBLIC_ENABLE_OCR !== 'false',
  BARCODE_ENABLED: process.env.NEXT_PUBLIC_ENABLE_BARCODE !== 'false',

  // Debug features
  DEBUG_MODE: isDevelopment,
  SHOW_DEBUG_INFO: isDevelopment && process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true',
  MOCK_API_RESPONSES: isDevelopment && process.env.NEXT_PUBLIC_MOCK_API === 'true',

  // Advanced features (disabled by default for MVP)
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  SHARING_ENABLED: process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true',
  RECIPES_ENABLED: process.env.NEXT_PUBLIC_ENABLE_RECIPES === 'true',

  // Performance features
  IMAGE_OPTIMIZATION: true,
  AGGRESSIVE_CACHING: isProduction,
  LAZY_LOADING: true
}

export const MOCK_MODE = {
  enabled: FEATURES.MOCK_API_RESPONSES,
  delay: 1000, // Simulate API delay in ms
  errorRate: 0.1 // 10% error rate for testing
}