import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { NutritionSummary } from '@/components/NutritionCard'
import { TODAY_MEALS, calculateDailyTotals } from '@/lib/test-data'
import { formatDate } from '@/lib/utils'

export default function MealsPage() {
  const todayMeals = TODAY_MEALS
  const dailyTotals = calculateDailyTotals(todayMeals)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Meals</h1>
                <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
              </div>
            </div>
            <Link
              href="/capture"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Daily Summary */}
        <NutritionSummary
          current={dailyTotals}
          className="mb-6"
        />

        {/* Meals List */}
        <div className="space-y-4">
          {todayMeals.map((meal) => {
            const mealTotals = meal.foods.reduce((totals, food) => ({
              calories: totals.calories + food.totalCalories,
              carbs: totals.carbs + food.totalCarbs,
              fat: totals.fat + food.totalFat,
              protein: totals.protein + food.totalProtein,
              fiber: totals.fiber + food.totalFiber
            }), { calories: 0, carbs: 0, fat: 0, protein: 0, fiber: 0 })

            return (
              <div key={meal.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {Math.round(mealTotals.calories)} cal
                    </div>
                    <div className="text-sm text-gray-600">
                      {meal.foods.length} item{meal.foods.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Food Items */}
                <div className="space-y-3">
                  {meal.foods.map((foodLog) => (
                    <div key={foodLog.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{foodLog.food.name}</div>
                        <div className="text-sm text-gray-600">
                          {foodLog.quantity} {foodLog.unit}
                          {foodLog.food.brand && (
                            <span className="ml-2 text-gray-500">• {foodLog.food.brand}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {Math.round(foodLog.totalCalories)} cal
                        </div>
                        <div className="text-xs text-gray-600">
                          C: {foodLog.totalCarbs.toFixed(1)}g •
                          P: {foodLog.totalProtein.toFixed(1)}g •
                          F: {foodLog.totalFat.toFixed(1)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal Totals */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-600">Carbs</div>
                      <div className="font-semibold text-blue-600">
                        {mealTotals.carbs.toFixed(1)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Protein</div>
                      <div className="font-semibold text-purple-600">
                        {mealTotals.protein.toFixed(1)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Fat</div>
                      <div className="font-semibold text-orange-600">
                        {mealTotals.fat.toFixed(1)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Fiber</div>
                      <div className="font-semibold text-green-600">
                        {mealTotals.fiber.toFixed(1)}g
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Empty Meal Placeholders */}
          {['Dinner'].filter(mealName => !todayMeals.find(m => m.name === mealName)).map(mealName => (
            <div key={mealName} className="bg-white rounded-lg border border-gray-200 border-dashed p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{mealName}</h3>
                <p className="text-sm text-gray-500 mb-4">No foods logged yet</p>
                <Link
                  href="/capture"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}