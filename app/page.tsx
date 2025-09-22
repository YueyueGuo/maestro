import Link from 'next/link'
import { Camera, TrendingUp, Calendar } from 'lucide-react'
import NutritionCard from '@/components/NutritionCard'
import { TODAY_MEALS, calculateDailyTotals } from '@/lib/test-data'
import { formatDate } from '@/lib/utils'

export default function Home() {
  const todayMeals = TODAY_MEALS
  const dailyTotals = calculateDailyTotals(todayMeals)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maestro</h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Daily Progress</div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round((dailyTotals.calories / 2000) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Action - Log Food */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Ready to log food?</h2>
              <p className="text-blue-100 text-sm mb-4">
                Use AI-powered scanning to track your meals instantly
              </p>
              <Link
                href="/capture"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors touch-target"
              >
                <Camera className="w-5 h-5" />
                Log Food
              </Link>
            </div>
            <div className="hidden sm:block">
              <Camera className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Nutrition Progress */}
        <NutritionCard
          current={dailyTotals}
          title="Today's Nutrition"
          className="mb-6"
        />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/meals"
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors touch-target"
          >
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Meals</h3>
              <p className="text-sm text-gray-600">
                View daily meals
              </p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors touch-target"
          >
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">
                Track progress
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Meals Preview */}
        {todayMeals.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Meals</h3>
              <Link
                href="/meals"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {todayMeals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{meal.name}</div>
                    <div className="text-sm text-gray-600">
                      {meal.foods.length} item{meal.foods.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {Math.round(meal.foods.reduce((sum, food) => sum + food.totalCalories, 0))} cal
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started Tips */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Scan barcodes for instant nutrition data</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Photograph nutrition labels for easy entry</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Use AI to analyze fresh foods and meals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
