import Link from 'next/link'
import { ArrowLeft, TrendingUp, Target, Calendar } from 'lucide-react'
import { CaloriesRing, CarbsRing, ProteinRing, FatRing } from '@/components/MacroRing'
import { TODAY_MEALS, calculateDailyTotals } from '@/lib/test-data'
import { getMacroDistribution } from '@/lib/nutrition-calc'
import { config } from '@/lib/config'

export default function AnalyticsPage() {
  const todayTotals = calculateDailyTotals(TODAY_MEALS)
  const macroDistribution = getMacroDistribution(todayTotals)
  const goals = config.defaultDailyGoals

  // Mock data for trends (in a real app, this would come from the database)
  const weeklyAverage = {
    calories: 1850,
    carbs: 200,
    protein: 120,
    fat: 65
  }

  const streakDays = 7

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">Track your progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Goal Streak</div>
                <div className="text-xl font-bold text-gray-900">{streakDays} days</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Weekly Avg</div>
                <div className="text-xl font-bold text-gray-900">{weeklyAverage.calories}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Progress</h3>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <CaloriesRing
              label="Calories"
              current={todayTotals.calories}
              goal={goals.calories}
              size="md"
            />
            <CarbsRing
              label="Carbs"
              current={todayTotals.carbs}
              goal={goals.carbs}
              size="md"
            />
            <ProteinRing
              label="Protein"
              current={todayTotals.protein}
              goal={goals.protein}
              size="md"
            />
            <FatRing
              label="Fat"
              current={todayTotals.fat}
              goal={goals.fat}
              size="md"
            />
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Macro Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Carbohydrates</span>
                <span className="font-medium">{macroDistribution.carbsPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${macroDistribution.carbsPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Protein</span>
                <span className="font-medium">{macroDistribution.proteinPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${macroDistribution.proteinPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Fat</span>
                <span className="font-medium">{macroDistribution.fatPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${macroDistribution.fatPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Recommended:</span> 45-65% carbs, 15-25% protein, 20-35% fat
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Average</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Calories</span>
                <span className="font-medium">{weeklyAverage.calories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbs</span>
                <span className="font-medium">{weeklyAverage.carbs}g</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Protein</span>
                <span className="font-medium">{weeklyAverage.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fat</span>
                <span className="font-medium">{weeklyAverage.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div>• Weekly and monthly trend charts</div>
                <div>• Goal achievement tracking</div>
                <div>• Macro ratio optimization tips</div>
                <div>• Food pattern insights</div>
                <div>• Export data to health apps</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}