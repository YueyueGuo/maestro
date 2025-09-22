/**
 * Nutrition calculation utilities for Maestro
 */

import { config } from './config'

export interface NutritionInfo {
  calories: number
  carbs: number
  fat: number
  protein: number
  fiber: number
}

export interface DailyGoals extends NutritionInfo {}

export interface NutritionProgress {
  current: NutritionInfo
  goals: DailyGoals
  percentages: NutritionInfo
  remaining: NutritionInfo
  exceeded: boolean[]
}

/**
 * Calculate nutrition totals from multiple food entries
 */
export function calculateNutritionTotals(foods: NutritionInfo[]): NutritionInfo {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + food.calories,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat,
      protein: total.protein + food.protein,
      fiber: total.fiber + food.fiber
    }),
    { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 }
  )
}

/**
 * Calculate progress towards daily goals
 */
export function calculateProgress(
  current: NutritionInfo,
  goals: DailyGoals = config.defaultDailyGoals
): NutritionProgress {
  const percentages = {
    calories: (current.calories / goals.calories) * 100,
    carbs: (current.carbs / goals.carbs) * 100,
    fat: (current.fat / goals.fat) * 100,
    protein: (current.protein / goals.protein) * 100,
    fiber: (current.fiber / goals.fiber) * 100
  }

  const remaining = {
    calories: Math.max(0, goals.calories - current.calories),
    carbs: Math.max(0, goals.carbs - current.carbs),
    fat: Math.max(0, goals.fat - current.fat),
    protein: Math.max(0, goals.protein - current.protein),
    fiber: Math.max(0, goals.fiber - current.fiber)
  }

  const exceeded = [
    current.calories > goals.calories,
    current.carbs > goals.carbs,
    current.fat > goals.fat,
    current.protein > goals.protein,
    current.fiber > goals.fiber
  ]

  return {
    current,
    goals,
    percentages,
    remaining,
    exceeded
  }
}

/**
 * Calculate nutrition per 100g from serving size
 */
export function convertToNutritionPer100g(
  nutrition: NutritionInfo,
  servingSize: number,
  servingUnit: 'g' | 'ml' | 'oz' | 'cup' = 'g'
): NutritionInfo {
  // Convert serving size to grams
  const gramsPerServing = convertToGrams(servingSize, servingUnit)
  const conversionFactor = 100 / gramsPerServing

  return {
    calories: nutrition.calories * conversionFactor,
    carbs: nutrition.carbs * conversionFactor,
    fat: nutrition.fat * conversionFactor,
    protein: nutrition.protein * conversionFactor,
    fiber: nutrition.fiber * conversionFactor
  }
}

/**
 * Calculate total nutrition from quantity and per-100g nutrition
 */
export function calculateTotalNutrition(
  nutritionPer100g: NutritionInfo,
  quantity: number,
  unit: 'g' | 'oz' | 'cup' | 'piece' | 'ml'
): NutritionInfo {
  const totalGrams = convertToGrams(quantity, unit)
  const conversionFactor = totalGrams / 100

  return {
    calories: Math.round(nutritionPer100g.calories * conversionFactor),
    carbs: Math.round(nutritionPer100g.carbs * conversionFactor * 10) / 10,
    fat: Math.round(nutritionPer100g.fat * conversionFactor * 10) / 10,
    protein: Math.round(nutritionPer100g.protein * conversionFactor * 10) / 10,
    fiber: Math.round(nutritionPer100g.fiber * conversionFactor * 10) / 10
  }
}

/**
 * Convert various units to grams
 */
export function convertToGrams(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
    cup: 240, // Approximate for liquids/soft foods
    ml: 1, // Approximate density
    piece: 100, // Default assumption
    slice: 25, // Default assumption
    tbsp: 15,
    tsp: 5
  }

  return quantity * (conversions[unit.toLowerCase()] || 100)
}

/**
 * Get macro distribution (percentages of calories from each macro)
 */
export function getMacroDistribution(nutrition: NutritionInfo): {
  carbsPercent: number
  fatPercent: number
  proteinPercent: number
} {
  const totalMacroCalories = nutrition.carbs * 4 + nutrition.fat * 9 + nutrition.protein * 4

  if (totalMacroCalories === 0) {
    return { carbsPercent: 0, fatPercent: 0, proteinPercent: 0 }
  }

  return {
    carbsPercent: Math.round((nutrition.carbs * 4 / totalMacroCalories) * 100),
    fatPercent: Math.round((nutrition.fat * 9 / totalMacroCalories) * 100),
    proteinPercent: Math.round((nutrition.protein * 4 / totalMacroCalories) * 100)
  }
}

/**
 * Calculate recommended macro split based on goals
 */
export function getRecommendedMacroSplit(
  calorieGoal: number,
  activityLevel: 'sedentary' | 'moderate' | 'active' = 'moderate'
): NutritionInfo {
  // Protein: 1.2-2.0g per kg body weight (assuming 70kg average)
  const proteinGrams = activityLevel === 'active' ? 140 : activityLevel === 'moderate' ? 105 : 84

  // Fat: 20-35% of calories
  const fatPercent = activityLevel === 'active' ? 0.25 : 0.30
  const fatGrams = Math.round((calorieGoal * fatPercent) / 9)

  // Carbs: remaining calories
  const remainingCalories = calorieGoal - (proteinGrams * 4) - (fatGrams * 9)
  const carbGrams = Math.round(remainingCalories / 4)

  // Fiber: 25-35g per day
  const fiberGrams = 30

  return {
    calories: calorieGoal,
    carbs: carbGrams,
    fat: fatGrams,
    protein: proteinGrams,
    fiber: fiberGrams
  }
}

/**
 * Format nutrition value for display
 */
export function formatNutritionValue(value: number, unit: string): string {
  if (unit === 'kcal' || unit === 'calories') {
    return Math.round(value).toString()
  }

  // Round to 1 decimal place for grams
  return (Math.round(value * 10) / 10).toString()
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'
): number {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }

  return Math.round(bmr * activityMultipliers[activityLevel])
}