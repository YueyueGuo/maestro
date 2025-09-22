/**
 * Food database utilities for Open Food Facts API integration
 */

import { debugLog, logError, measurePerformance } from './debug'
import { MOCK_MODE } from './config'
import { MOCK_API_RESPONSES } from './test-data'

export interface ProductData {
  name: string
  brand?: string
  barcode: string
  source: 'barcode' | 'search' | 'manual'
  nutrition: {
    calories: number
    carbs: number
    fat: number
    protein: number
    fiber: number
  }
  imageUrl?: string
  verified: boolean
}

/**
 * Look up product by barcode using Open Food Facts API
 */
export async function lookupBarcode(barcode: string): Promise<ProductData | null> {
  return measurePerformance('Barcode Lookup', async () => {
    debugLog(`Looking up barcode: ${barcode}`)

    // Mock mode for development
    if (MOCK_MODE.enabled) {
      return mockBarcodeResponse(barcode)
    }

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'Maestro-Nutrition-Tracker/1.0.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status !== 1) {
        debugLog(`Product not found for barcode: ${barcode}`)
        return null
      }

      const product = data.product
      const nutrition = extractNutritionFromProduct(product)

      if (!nutrition) {
        debugLog(`No nutrition data available for barcode: ${barcode}`)
        return null
      }

      const result: ProductData = {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || undefined,
        barcode,
        source: 'barcode',
        nutrition,
        imageUrl: product.image_front_url || product.image_url || undefined,
        verified: true
      }

      debugLog(`Product found: ${result.name}`)
      return result

    } catch (error) {
      logError(error as Error, 'Barcode lookup')
      return null
    }
  })
}

/**
 * Extract nutrition information from Open Food Facts product data
 */
function extractNutritionFromProduct(product: any): ProductData['nutrition'] | null {
  const nutriments = product.nutriments
  if (!nutriments) return null

  // Try to get per-100g nutrition data
  const calories = nutriments['energy-kcal_100g'] ||
                  nutriments['energy_100g'] / 4.184 || // Convert kJ to kcal
                  0

  const carbs = nutriments.carbohydrates_100g || 0
  const fat = nutriments.fat_100g || 0
  const protein = nutriments.proteins_100g || 0
  const fiber = nutriments.fiber_100g || 0

  // Validate that we have meaningful nutrition data
  if (calories === 0 && carbs === 0 && fat === 0 && protein === 0) {
    return null
  }

  return {
    calories: Math.round(calories),
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    fiber: Math.round(fiber * 10) / 10
  }
}

/**
 * Search for products by name using Open Food Facts API
 */
export async function searchProducts(query: string, limit: number = 20): Promise<ProductData[]> {
  return measurePerformance('Product Search', async () => {
    debugLog(`Searching products for: ${query}`)

    // Mock mode for development
    if (MOCK_MODE.enabled) {
      return mockSearchResponse(query, limit)
    }

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`,
        {
          headers: {
            'User-Agent': 'Maestro-Nutrition-Tracker/1.0.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const products: ProductData[] = []

      for (const product of data.products || []) {
        const nutrition = extractNutritionFromProduct(product)
        if (nutrition && product._id) {
          products.push({
            name: product.product_name || product.product_name_en || 'Unknown Product',
            brand: product.brands || undefined,
            barcode: product._id,
            source: 'barcode',
            nutrition,
            imageUrl: product.image_front_url || product.image_url || undefined,
            verified: true
          })
        }
      }

      debugLog(`Found ${products.length} products for query: ${query}`)
      return products

    } catch (error) {
      logError(error as Error, 'Product search')
      return []
    }
  })
}

/**
 * Mock barcode response for development
 */
function mockBarcodeResponse(barcode: string): Promise<ProductData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate error rate
      if (Math.random() < MOCK_MODE.errorRate) {
        resolve(null)
        return
      }

      // Use mock data with dynamic barcode
      const mockResponse = MOCK_API_RESPONSES.barcodeSuccess
      const mockData: ProductData = {
        name: mockResponse.name,
        brand: mockResponse.brand,
        barcode,
        source: 'barcode' as const,
        nutrition: mockResponse.nutrition,
        verified: true
      }

      resolve(mockData)
    }, MOCK_MODE.delay)
  })
}

/**
 * Mock search response for development
 */
function mockSearchResponse(query: string, limit: number): Promise<ProductData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts: ProductData[] = []
      const numResults = Math.min(limit, Math.floor(Math.random() * 10) + 1)

      for (let i = 0; i < numResults; i++) {
        mockProducts.push({
          name: `${query} Product ${i + 1}`,
          brand: `Brand ${i + 1}`,
          barcode: `123456789${i.toString().padStart(3, '0')}`,
          source: 'barcode',
          nutrition: {
            calories: 100 + Math.floor(Math.random() * 300),
            carbs: Math.floor(Math.random() * 50),
            fat: Math.floor(Math.random() * 20),
            protein: Math.floor(Math.random() * 25),
            fiber: Math.floor(Math.random() * 10)
          },
          verified: true
        })
      }

      resolve(mockProducts)
    }, MOCK_MODE.delay)
  })
}

/**
 * Validate barcode format
 */
export function validateBarcode(barcode: string): boolean {
  // Remove any spaces or dashes
  const cleanBarcode = barcode.replace(/[\s-]/g, '')

  // Check for valid lengths (UPC-A: 12, EAN-13: 13, EAN-8: 8)
  if (![8, 12, 13].includes(cleanBarcode.length)) {
    return false
  }

  // Check that it contains only digits
  if (!/^\d+$/.test(cleanBarcode)) {
    return false
  }

  return true
}

/**
 * Format barcode for display
 */
export function formatBarcode(barcode: string): string {
  const clean = barcode.replace(/[\s-]/g, '')

  if (clean.length === 13) {
    // EAN-13: 1-234567-890123
    return `${clean.substring(0, 1)}-${clean.substring(1, 7)}-${clean.substring(7)}`
  } else if (clean.length === 12) {
    // UPC-A: 123456-789012
    return `${clean.substring(0, 6)}-${clean.substring(6)}`
  } else if (clean.length === 8) {
    // EAN-8: 1234-5678
    return `${clean.substring(0, 4)}-${clean.substring(4)}`
  }

  return clean
}