'use client'

/**
 * Nutrition summary card component for Maestro
 */

import { CaloriesRing, CarbsRing, ProteinRing, FatRing, FiberRing } from './MacroRing'
import { NutritionInfo, DailyGoals, calculateProgress } from '@/lib/nutrition-calc'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

interface NutritionCardProps {
  current: NutritionInfo
  goals?: DailyGoals
  title?: string
  showTitle?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'grid' | 'row'
  className?: string
}

export default function NutritionCard({
  current,
  goals = config.defaultDailyGoals,
  title = "Today's Progress",
  showTitle = true,
  size = 'md',
  layout = 'grid',
  className
}: NutritionCardProps) {
  const progress = calculateProgress(current, goals)

  const ringProps = {
    size,
    showDetails: size !== 'sm'
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="mt-1 text-sm text-gray-600">
            {progress.current.calories} of {progress.goals.calories} calories
          </div>
        </div>
      )}

      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5'
            : 'flex flex-wrap gap-6 justify-center'
        )}
      >
        <CaloriesRing
          {...ringProps}
          label="Calories"
          current={progress.current.calories}
          goal={progress.goals.calories}
        />

        <CarbsRing
          {...ringProps}
          label="Carbs"
          current={progress.current.carbs}
          goal={progress.goals.carbs}
        />

        <ProteinRing
          {...ringProps}
          label="Protein"
          current={progress.current.protein}
          goal={progress.goals.protein}
        />

        <FatRing
          {...ringProps}
          label="Fat"
          current={progress.current.fat}
          goal={progress.goals.fat}
        />

        <FiberRing
          {...ringProps}
          label="Fiber"
          current={progress.current.fiber}
          goal={progress.goals.fiber}
        />
      </div>

      {/* Summary stats */}
      {size !== 'sm' && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Calories remaining:</span>
              <span className={cn(
                'ml-2 font-semibold',
                progress.remaining.calories > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {progress.remaining.calories > 0
                  ? `${Math.round(progress.remaining.calories)}`
                  : `${Math.round(Math.abs(progress.remaining.calories))} over`
                }
              </span>
            </div>

            <div>
              <span className="text-gray-600">Daily progress:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {Math.round(progress.percentages.calories)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for mobile
export function NutritionSummary({
  current,
  goals = config.defaultDailyGoals,
  className
}: Pick<NutritionCardProps, 'current' | 'goals' | 'className'>) {
  const progress = calculateProgress(current, goals)

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Today</h3>
        <div className="text-sm text-gray-600">
          {Math.round(progress.percentages.calories)}% complete
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <CaloriesRing
          size="sm"
          label="Cal"
          current={progress.current.calories}
          goal={progress.goals.calories}
          showDetails={false}
        />
        <CarbsRing
          size="sm"
          label="Carbs"
          current={progress.current.carbs}
          goal={progress.goals.carbs}
          showDetails={false}
        />
        <ProteinRing
          size="sm"
          label="Protein"
          current={progress.current.protein}
          goal={progress.goals.protein}
          showDetails={false}
        />
        <FatRing
          size="sm"
          label="Fat"
          current={progress.current.fat}
          goal={progress.goals.fat}
          showDetails={false}
        />
        <FiberRing
          size="sm"
          label="Fiber"
          current={progress.current.fiber}
          goal={progress.goals.fiber}
          showDetails={false}
        />
      </div>

      <div className="mt-3 text-xs text-gray-600 text-center">
        {Math.round(progress.remaining.calories) > 0
          ? `${Math.round(progress.remaining.calories)} calories remaining`
          : `${Math.round(Math.abs(progress.remaining.calories))} calories over goal`
        }
      </div>
    </div>
  )
}