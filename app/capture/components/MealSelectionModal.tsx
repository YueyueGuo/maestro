'use client'

/**
 * Meal Selection Modal - Allows users to add food to specific meals with portion control
 * Provides meal type selection and serving size adjustment
 */

import { useState } from 'react'
import { X, Coffee, Sun, Moon, Cookie, Plus, Minus } from 'lucide-react'
import type { EnhancedProductData } from '../../../services/food-lookup-service'

interface MealSelectionModalProps {
  product: EnhancedProductData
  isOpen: boolean
  onClose: () => void
  onConfirm: (mealType: string, servings: number, totalNutrition: any) => void
}

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'bg-orange-500' },
  { id: 'lunch', name: 'Lunch', icon: Sun, color: 'bg-yellow-500' },
  { id: 'dinner', name: 'Dinner', icon: Moon, color: 'bg-blue-500' },
  { id: 'snack', name: 'Snack', icon: Cookie, color: 'bg-purple-500' }
]

export default function MealSelectionModal({
  product,
  isOpen,
  onClose,
  onConfirm
}: MealSelectionModalProps) {
  const [selectedMeal, setSelectedMeal] = useState('lunch') // Default to lunch
  const [servings, setServings] = useState(1)

  if (!isOpen) return null

  /**
   * Calculate total nutrition based on servings
   */
  const calculateTotalNutrition = () => {
    const { nutrition } = product
    return {
      calories: Math.round(nutrition.calories * servings),
      carbs: Math.round(nutrition.carbs * servings * 10) / 10,
      fat: Math.round(nutrition.fat * servings * 10) / 10,
      protein: Math.round(nutrition.protein * servings * 10) / 10,
      fiber: Math.round(nutrition.fiber * servings * 10) / 10
    }
  }

  const totalNutrition = calculateTotalNutrition()

  /**
   * Handle serving size adjustment
   */
  const adjustServings = (delta: number) => {
    const newServings = Math.max(0.5, servings + delta)
    setServings(Math.round(newServings * 2) / 2) // Round to nearest 0.5
  }

  /**
   * Handle meal confirmation
   */
  const handleConfirm = () => {
    onConfirm(selectedMeal, servings, totalNutrition)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Add to Meal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="text-center">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            {product.brand && (
              <p className="text-sm text-gray-600">by {product.brand}</p>
            )}
          </div>

          {/* Serving Size Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Serving Size (100g portions)
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustServings(-0.5)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={servings <= 0.5}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{servings}</div>
                <div className="text-sm text-gray-600">servings</div>
              </div>
              <button
                onClick={() => adjustServings(0.5)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calculated Nutrition */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Total Nutrition</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Calories:</span>
                <span className="font-medium">{totalNutrition.calories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbs:</span>
                <span className="font-medium">{totalNutrition.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fat:</span>
                <span className="font-medium">{totalNutrition.fat}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protein:</span>
                <span className="font-medium">{totalNutrition.protein}g</span>
              </div>
            </div>
          </div>

          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add to which meal?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_TYPES.map((meal) => {
                const Icon = meal.icon
                const isSelected = selectedMeal === meal.id
                return (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg ${meal.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {meal.name}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add to {MEAL_TYPES.find(m => m.id === selectedMeal)?.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}