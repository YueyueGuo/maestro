/**
 * Meal Storage Utilities - Handle adding foods to meals and updating daily totals
 * Manages meal creation, food logging, and nutrition calculations
 */

import { debugLog } from './debug'
import type { EnhancedProductData } from '../services/food-lookup-service'

export interface MealEntry {
  id: string
  foodName: string
  brand?: string
  barcode?: string
  servings: number
  nutrition: {
    calories: number
    carbs: number
    fat: number
    protein: number
    fiber: number
  }
  addedAt: Date
  source: string
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string // YYYY-MM-DD format
  entries: MealEntry[]
  totalNutrition: {
    calories: number
    carbs: number
    fat: number
    protein: number
    fiber: number
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get all meals from localStorage
 */
function getAllMeals(): Meal[] {
  try {
    const stored = localStorage.getItem('maestro_meals')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    debugLog('Error loading meals from storage', error)
    return []
  }
}

/**
 * Save meals to localStorage
 */
function saveMeals(meals: Meal[]): void {
  try {
    localStorage.setItem('maestro_meals', JSON.stringify(meals))
    debugLog('Meals saved to storage', { count: meals.length })
  } catch (error) {
    debugLog('Error saving meals to storage', error)
  }
}

/**
 * Get or create a meal for today
 */
function getOrCreateMeal(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal {
  const meals = getAllMeals()
  const today = getTodayDate()

  // Look for existing meal
  let meal = meals.find(m => m.type === mealType && m.date === today)

  if (!meal) {
    // Create new meal
    meal = {
      id: `${mealType}_${today}_${Date.now()}`,
      type: mealType,
      date: today,
      entries: [],
      totalNutrition: {
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        fiber: 0
      }
    }
    meals.push(meal)
  }

  return meal
}

/**
 * Calculate total nutrition for a meal
 */
function calculateMealNutrition(entries: MealEntry[]) {
  return entries.reduce(
    (total, entry) => ({
      calories: total.calories + entry.nutrition.calories,
      carbs: total.carbs + entry.nutrition.carbs,
      fat: total.fat + entry.nutrition.fat,
      protein: total.protein + entry.nutrition.protein,
      fiber: total.fiber + entry.nutrition.fiber
    }),
    { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 }
  )
}

/**
 * Add food to a meal
 */
export function addFoodToMeal(
  product: EnhancedProductData,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  servings: number,
  totalNutrition: any
): { success: boolean; meal: Meal | null; error?: string } {
  try {
    debugLog('Adding food to meal', { product: product.name, mealType, servings })

    const meals = getAllMeals()
    const meal = getOrCreateMeal(mealType)

    // Create meal entry
    const entry: MealEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      foodName: product.name,
      brand: product.brand,
      barcode: product.barcode,
      servings,
      nutrition: totalNutrition,
      addedAt: new Date(),
      source: product.source
    }

    // Add entry to meal
    meal.entries.push(entry)

    // Recalculate meal totals
    meal.totalNutrition = calculateMealNutrition(meal.entries)

    // Update meals array
    const mealIndex = meals.findIndex(m => m.id === meal.id)
    if (mealIndex >= 0) {
      meals[mealIndex] = meal
    } else {
      meals.push(meal)
    }

    // Save to storage
    saveMeals(meals)

    debugLog('Food added to meal successfully', { mealId: meal.id, entryId: entry.id })

    return { success: true, meal }
  } catch (error) {
    debugLog('Error adding food to meal', error)
    return {
      success: false,
      meal: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get today's meals
 */
export function getTodaysMeals(): Meal[] {
  const meals = getAllMeals()
  const today = getTodayDate()
  return meals.filter(m => m.date === today)
}

/**
 * Get today's total nutrition
 */
export function getTodaysTotalNutrition() {
  const todaysMeals = getTodaysMeals()
  return todaysMeals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      carbs: total.carbs + meal.totalNutrition.carbs,
      fat: total.fat + meal.totalNutrition.fat,
      protein: total.protein + meal.totalNutrition.protein,
      fiber: total.fiber + meal.totalNutrition.fiber
    }),
    { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 }
  )
}

/**
 * Remove food entry from meal
 */
export function removeFoodFromMeal(mealId: string, entryId: string): boolean {
  try {
    const meals = getAllMeals()
    const meal = meals.find(m => m.id === mealId)

    if (!meal) return false

    // Remove entry
    meal.entries = meal.entries.filter(e => e.id !== entryId)

    // Recalculate totals
    meal.totalNutrition = calculateMealNutrition(meal.entries)

    // Save changes
    saveMeals(meals)

    debugLog('Food removed from meal', { mealId, entryId })
    return true
  } catch (error) {
    debugLog('Error removing food from meal', error)
    return false
  }
}