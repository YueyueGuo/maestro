'use client'

/**
 * Nutrition Facts Card - Displays detailed nutrition information for product verification
 * Shows comprehensive nutrition data with serving size and quality indicators
 */

import { CheckCircle, AlertTriangle, Edit3, Plus } from 'lucide-react'
import type { EnhancedProductData } from '../../../services/food-lookup-service'

interface NutritionFactsCardProps {
  product: EnhancedProductData
  onConfirm: (product: EnhancedProductData, servingSize: number) => void
  onEdit: () => void
  onScanAnother: () => void
  className?: string
}

export default function NutritionFactsCard({
  product,
  onConfirm,
  onEdit,
  onScanAnother,
  className = ''
}: NutritionFactsCardProps) {
  const { nutrition, quality } = product

  // Default serving size (can be adjusted by user)
  const defaultServingSize = 1

  /**
   * Get quality indicator styling
   */
  const getQualityStyles = () => {
    switch (quality.level) {
      case 'high':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        }
      default:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        }
    }
  }

  const qualityStyles = getQualityStyles()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Product Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-sm text-gray-600">by {product.brand}</p>
        )}
      </div>

      {/* Quality Indicator */}
      <div className={`mb-4 p-3 rounded-lg border ${qualityStyles.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          {quality.level === 'high' ? (
            <CheckCircle className={`w-4 h-4 ${qualityStyles.icon}`} />
          ) : (
            <AlertTriangle className={`w-4 h-4 ${qualityStyles.icon}`} />
          )}
          <span className={`text-sm font-medium ${qualityStyles.text}`}>
            Data Quality: {quality.level.toUpperCase()} ({quality.score}/100)
          </span>
        </div>
        {quality.issues.length > 0 && (
          <p className={`text-xs ${qualityStyles.text}`}>
            Note: {quality.issues.join(', ')}
          </p>
        )}
      </div>

      {/* Nutrition Facts Table */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Nutrition Facts (per 100g)</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Calories */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(nutrition.calories)}
              </div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>

            {/* Macros */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Carbs</span>
                <span className="text-sm font-medium">{nutrition.carbs.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fat</span>
                <span className="text-sm font-medium">{nutrition.fat.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Protein</span>
                <span className="text-sm font-medium">{nutrition.protein.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fiber</span>
                <span className="text-sm font-medium">{nutrition.fiber.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="mb-6 text-xs text-gray-500 text-center">
        Data from {product.source === 'barcode' ? 'Open Food Facts' : product.source}
        {product.cached && ' (cached)'}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Action - Add to Meal */}
        <button
          onClick={() => onConfirm(product, defaultServingSize)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Meal
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onEdit}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit Details
          </button>

          <button
            onClick={onScanAnother}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Scan Another
          </button>
        </div>
      </div>
    </div>
  )
}