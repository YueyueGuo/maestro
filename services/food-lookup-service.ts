/**
 * Food Lookup Service - Centralized API management for food data
 * Coordinates barcode lookups, caching, retries, and quality scoring
 */

import { debugLog, logError, measurePerformance } from '../lib/debug'
import { lookupBarcode, searchProducts, validateBarcode, type ProductData } from '../lib/food-db'

export interface ProductQuality {
  score: number // 0-100
  level: 'low' | 'medium' | 'high'
  issues: string[]
  strengths: string[]
}

export interface EnhancedProductData extends ProductData {
  quality: ProductQuality
  confidence: number
  cached: boolean
  source: 'barcode' | 'search' | 'manual'
}

export interface LookupOptions {
  enableCache?: boolean
  maxRetries?: number
  timeoutMs?: number
  requireHighQuality?: boolean
}

export interface LookupResult {
  success: boolean
  product?: EnhancedProductData
  error?: string
  fallbackSuggestions?: string[]
}

export class FoodLookupService {
  private cache = new Map<string, { product: EnhancedProductData; timestamp: number }>()
  private cacheMaxAge = 24 * 60 * 60 * 1000 // 24 hours
  private requestQueue = new Map<string, Promise<LookupResult>>()

  /**
   * Look up product by barcode with quality assessment
   */
  async lookupByBarcode(
    barcode: string,
    options: LookupOptions = {}
  ): Promise<LookupResult> {
    const {
      enableCache = true,
      maxRetries = 2,
      timeoutMs = 5000,
      requireHighQuality = false
    } = options

    return measurePerformance('Enhanced Barcode Lookup', async () => {
      // Validate barcode format first
      if (!validateBarcode(barcode)) {
        debugLog(`Invalid barcode format: ${barcode}`)
        return {
          success: false,
          error: 'Invalid barcode format',
          fallbackSuggestions: ['Try scanning again', 'Enter product manually']
        }
      }

      // Check cache first
      if (enableCache) {
        const cached = this.getCachedProduct(barcode)
        if (cached) {
          debugLog(`Cache hit for barcode: ${barcode}`)
          return {
            success: true,
            product: { ...cached, cached: true }
          }
        }
      }

      // Prevent duplicate requests
      const existingRequest = this.requestQueue.get(barcode)
      if (existingRequest) {
        debugLog(`Returning existing request for barcode: ${barcode}`)
        return existingRequest
      }

      // Create new request
      const lookupPromise = this.performLookup(barcode, maxRetries, timeoutMs, requireHighQuality)
      this.requestQueue.set(barcode, lookupPromise)

      try {
        const result = await lookupPromise

        // Cache successful results
        if (result.success && result.product && enableCache) {
          this.cacheProduct(barcode, result.product)
        }

        return result
      } finally {
        this.requestQueue.delete(barcode)
      }
    })
  }

  /**
   * Search for products by name
   */
  async searchByName(
    query: string,
    limit: number = 10,
    options: LookupOptions = {}
  ): Promise<EnhancedProductData[]> {
    return measurePerformance('Product Search', async () => {
      try {
        const products = await searchProducts(query, limit)

        return products.map(product => this.enhanceProductData(product, {
          cached: false,
          source: 'search'
        }))
      } catch (error) {
        logError(error as Error, 'Product search')
        return []
      }
    })
  }

  /**
   * Get quality assessment for a product
   */
  assessProductQuality(product: ProductData): ProductQuality {
    let score = 0
    const issues: string[] = []
    const strengths: string[] = []

    // Name quality (20 points)
    if (product.name && product.name.length > 3) {
      score += 20
      strengths.push('Product name available')
    } else {
      issues.push('Missing or poor product name')
    }

    // Brand information (15 points)
    if (product.brand) {
      score += 15
      strengths.push('Brand information available')
    } else {
      issues.push('No brand information')
    }

    // Nutrition completeness (40 points)
    const nutrition = product.nutrition
    const nutritionFields = [nutrition.calories, nutrition.carbs, nutrition.fat, nutrition.protein, nutrition.fiber]
    const completeFields = nutritionFields.filter(value => value > 0).length

    const nutritionScore = (completeFields / nutritionFields.length) * 40
    score += nutritionScore

    if (nutritionScore >= 30) {
      strengths.push('Complete nutrition data')
    } else if (nutritionScore >= 20) {
      strengths.push('Most nutrition data available')
      issues.push('Some nutrition values missing')
    } else {
      issues.push('Incomplete nutrition data')
    }

    // Image availability (10 points)
    if (product.imageUrl) {
      score += 10
      strengths.push('Product image available')
    } else {
      issues.push('No product image')
    }

    // Verification status (15 points)
    if (product.verified) {
      score += 15
      strengths.push('Verified product data')
    } else {
      issues.push('Unverified product data')
    }

    // Determine quality level
    let level: 'low' | 'medium' | 'high'
    if (score >= 80) {
      level = 'high'
    } else if (score >= 60) {
      level = 'medium'
    } else {
      level = 'low'
    }

    return {
      score: Math.round(score),
      level,
      issues,
      strengths
    }
  }

  /**
   * Get cached product if available and not expired
   */
  private getCachedProduct(barcode: string): EnhancedProductData | null {
    const cached = this.cache.get(barcode)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.cacheMaxAge
    if (isExpired) {
      this.cache.delete(barcode)
      debugLog(`Expired cache entry removed: ${barcode}`)
      return null
    }

    return cached.product
  }

  /**
   * Cache a product lookup result
   */
  private cacheProduct(barcode: string, product: EnhancedProductData): void {
    this.cache.set(barcode, {
      product,
      timestamp: Date.now()
    })
    debugLog(`Cached product: ${barcode}`)

    // Cleanup old cache entries periodically
    if (this.cache.size > 1000) {
      this.cleanupCache()
    }
  }

  /**
   * Perform the actual API lookup with retries
   */
  private async performLookup(
    barcode: string,
    maxRetries: number,
    timeoutMs: number,
    requireHighQuality: boolean
  ): Promise<LookupResult> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        debugLog(`Lookup attempt ${attempt + 1} for barcode: ${barcode}`)

        // Add timeout to the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        })

        const lookupPromise = lookupBarcode(barcode)
        const product = await Promise.race([lookupPromise, timeoutPromise])

        if (!product) {
          return {
            success: false,
            error: 'Product not found in database',
            fallbackSuggestions: [
              'Try scanning again in better lighting',
              'Check if barcode is complete and undamaged',
              'Search for product by name instead',
              'Enter nutrition information manually'
            ]
          }
        }

        // Enhance product data
        const enhancedProduct = this.enhanceProductData(product, {
          cached: false,
          source: 'barcode'
        })

        // Check quality requirements
        if (requireHighQuality && enhancedProduct.quality.level === 'low') {
          return {
            success: false,
            error: 'Product data quality too low',
            fallbackSuggestions: [
              'Use nutrition label scanning instead',
              'Enter nutrition information manually'
            ]
          }
        }

        return {
          success: true,
          product: enhancedProduct
        }

      } catch (error) {
        lastError = error as Error
        logError(lastError, `Lookup attempt ${attempt + 1} failed`)

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      fallbackSuggestions: [
        'Check your internet connection',
        'Try again in a moment',
        'Use nutrition label scanning instead',
        'Enter product information manually'
      ]
    }
  }

  /**
   * Enhance product data with quality assessment
   */
  private enhanceProductData(
    product: ProductData,
    metadata: { cached: boolean; source: 'barcode' | 'search' | 'manual' }
  ): EnhancedProductData {
    const quality = this.assessProductQuality(product)

    // Calculate confidence based on quality and source
    let confidence = quality.score / 100

    // Adjust confidence based on source
    if (metadata.source === 'barcode') {
      confidence *= 0.95 // Barcode scanning is very reliable
    } else if (metadata.source === 'search') {
      confidence *= 0.8 // Search results may be less precise
    }

    return {
      ...product,
      quality,
      confidence: Math.round(confidence * 100),
      cached: metadata.cached,
      source: metadata.source
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const cutoffTime = Date.now() - this.cacheMaxAge
    let removedCount = 0

    for (const [barcode, cached] of this.cache) {
      if (cached.timestamp < cutoffTime) {
        this.cache.delete(barcode)
        removedCount++
      }
    }

    debugLog(`Cleaned up ${removedCount} expired cache entries`)
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxAge: this.cacheMaxAge,
      activeRequests: this.requestQueue.size
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
    debugLog('All cache data cleared')
  }
}

// Export singleton instance
export const foodLookupService = new FoodLookupService()