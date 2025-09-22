/**
 * Test data for development and testing
 */

export interface Food {
  id: string
  name: string
  brand?: string
  barcode?: string
  source: 'barcode' | 'ocr' | 'ai' | 'manual'
  calories: number
  carbs: number
  fat: number
  protein: number
  fiber: number
  confidence?: number
  verified?: boolean
}

export interface Meal {
  id: string
  name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  date: string
  foods: FoodLog[]
}

export interface FoodLog {
  id: string
  food: Food
  quantity: number
  unit: 'g' | 'oz' | 'cup' | 'piece'
  totalCalories: number
  totalCarbs: number
  totalFat: number
  totalProtein: number
  totalFiber: number
}

export const TEST_FOODS: Food[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    source: 'manual',
    calories: 165,
    carbs: 0,
    fat: 3.6,
    protein: 31,
    fiber: 0,
    verified: true
  },
  {
    id: '2',
    name: 'Brown Rice',
    source: 'manual',
    calories: 111,
    carbs: 23,
    fat: 0.9,
    protein: 2.6,
    fiber: 1.8,
    verified: true
  },
  {
    id: '3',
    name: 'Broccoli',
    source: 'manual',
    calories: 34,
    carbs: 7,
    fat: 0.4,
    protein: 2.8,
    fiber: 2.6,
    verified: true
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    source: 'manual',
    calories: 59,
    carbs: 3.6,
    fat: 0.4,
    protein: 10,
    fiber: 0,
    verified: true
  },
  {
    id: '5',
    name: 'Banana',
    source: 'ai',
    calories: 89,
    carbs: 23,
    fat: 0.3,
    protein: 1.1,
    fiber: 2.6,
    confidence: 9,
    verified: false
  },
  {
    id: '6',
    name: 'Oatmeal',
    brand: 'Quaker',
    barcode: '030000013205',
    source: 'barcode',
    calories: 158,
    carbs: 28,
    fat: 3.2,
    protein: 5.9,
    fiber: 4,
    verified: true
  },
  {
    id: '7',
    name: 'Almonds',
    source: 'manual',
    calories: 579,
    carbs: 22,
    fat: 50,
    protein: 21,
    fiber: 12,
    verified: true
  },
  {
    id: '8',
    name: 'Salmon Fillet',
    source: 'ai',
    calories: 208,
    carbs: 0,
    fat: 12,
    protein: 22,
    fiber: 0,
    confidence: 8,
    verified: false
  }
]

export const SAMPLE_BARCODES = [
  '030000013205', // Quaker Oatmeal
  '073127003237', // Cheerios
  '688267068651', // Kind Bar
  '036632018366', // Lara Bar
  '041570035917', // Clif Bar
  '854482002110', // Naked Juice
  '012000020841', // Coca Cola
  '049000028270'  // Pringles
]

export const MOCK_API_RESPONSES = {
  barcodeSuccess: {
    name: 'Mock Product',
    brand: 'Test Brand',
    barcode: '123456789012',
    source: 'barcode',
    nutrition: {
      calories: 150,
      carbs: 20,
      fat: 5,
      protein: 8,
      fiber: 3
    }
  },
  barcodeNotFound: {
    error: 'Product not found in database'
  },
  ocrSuccess: {
    serving_size: '1 cup (240g)',
    nutrition_per_serving: {
      calories: 200,
      carbs: 45,
      fat: 2,
      protein: 6,
      fiber: 4
    },
    confidence: 8,
    source: 'ocr'
  },
  aiAnalysisSuccess: {
    items: [
      {
        name: 'Mixed Green Salad',
        estimated_weight_grams: 150,
        nutrition_per_100g: {
          calories: 20,
          carbs: 4,
          fat: 0.2,
          protein: 2,
          fiber: 2.5
        },
        confidence: 8
      }
    ],
    total_confidence: 8,
    assumptions: ['Estimated portion size based on plate appearance', 'No dressing visible']
  }
}

// Helper function to create a food log entry
export const createFoodLog = (food: Food, quantity: number, unit: 'g' | 'oz' | 'cup' | 'piece'): FoodLog => {
  // Convert quantity to grams for calculation (simplified)
  const gramsMultiplier = unit === 'g' ? 1 : unit === 'oz' ? 28.35 : unit === 'cup' ? 240 : 100
  const totalGrams = quantity * gramsMultiplier / 100 // nutrition is per 100g

  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    food,
    quantity,
    unit,
    totalCalories: food.calories * totalGrams,
    totalCarbs: food.carbs * totalGrams,
    totalFat: food.fat * totalGrams,
    totalProtein: food.protein * totalGrams,
    totalFiber: food.fiber * totalGrams
  }
}

// Sample meals for today
export const TODAY_MEALS: Meal[] = [
  {
    id: 'breakfast_today',
    name: 'Breakfast',
    date: new Date().toISOString().split('T')[0],
    foods: [
      createFoodLog(TEST_FOODS[5], 1, 'cup'), // Oatmeal
      createFoodLog(TEST_FOODS[4], 1, 'piece'), // Banana
      createFoodLog(TEST_FOODS[6], 28, 'g') // Almonds
    ]
  },
  {
    id: 'lunch_today',
    name: 'Lunch',
    date: new Date().toISOString().split('T')[0],
    foods: [
      createFoodLog(TEST_FOODS[0], 150, 'g'), // Chicken Breast
      createFoodLog(TEST_FOODS[1], 80, 'g'), // Brown Rice
      createFoodLog(TEST_FOODS[2], 100, 'g') // Broccoli
    ]
  },
  {
    id: 'snack_today',
    name: 'Snack',
    date: new Date().toISOString().split('T')[0],
    foods: [
      createFoodLog(TEST_FOODS[3], 150, 'g') // Greek Yogurt
    ]
  }
]

// Calculate daily totals from meals
export const calculateDailyTotals = (meals: Meal[]) => {
  return meals.reduce((total, meal) => {
    const mealTotals = meal.foods.reduce((mealTotal, foodLog) => ({
      calories: mealTotal.calories + foodLog.totalCalories,
      carbs: mealTotal.carbs + foodLog.totalCarbs,
      fat: mealTotal.fat + foodLog.totalFat,
      protein: mealTotal.protein + foodLog.totalProtein,
      fiber: mealTotal.fiber + foodLog.totalFiber
    }), { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 })

    return {
      calories: total.calories + mealTotals.calories,
      carbs: total.carbs + mealTotals.carbs,
      fat: total.fat + mealTotals.fat,
      protein: total.protein + mealTotals.protein,
      fiber: total.fiber + mealTotals.fiber
    }
  }, { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 })
}