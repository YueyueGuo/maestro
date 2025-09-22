'use client'

/**
 * Macro progress ring component for Maestro
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface MacroRingProps {
  label: string
  current: number
  goal: number
  unit: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    radius: 32,
    strokeWidth: 6,
    fontSize: 'text-xs',
    containerSize: 80
  },
  md: {
    radius: 45,
    strokeWidth: 8,
    fontSize: 'text-sm',
    containerSize: 110
  },
  lg: {
    radius: 60,
    strokeWidth: 10,
    fontSize: 'text-lg',
    containerSize: 140
  }
}

export default function MacroRing({
  label,
  current,
  goal,
  unit,
  color,
  size = 'md',
  showDetails = true,
  className
}: MacroRingProps) {
  const config = sizeConfig[size]
  const percentage = Math.min((current / goal) * 100, 100)
  const circumference = 2 * Math.PI * config.radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const isOverGoal = current > goal
  const displayColor = isOverGoal ? 'rgb(239 68 68)' : color // red-500 if over goal

  const formattedCurrent = useMemo(() => {
    return current % 1 === 0 ? current.toString() : current.toFixed(1)
  }, [current])

  const formattedGoal = useMemo(() => {
    return goal % 1 === 0 ? goal.toString() : goal.toFixed(1)
  }, [goal])

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* SVG Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.containerSize, height: config.containerSize }}
      >
        <svg
          width={config.containerSize}
          height={config.containerSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={config.radius}
            stroke="rgb(229 231 235)" // gray-200
            strokeWidth={config.strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={config.radius}
            stroke={displayColor}
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="macro-ring transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('font-bold text-gray-900', config.fontSize)}>
            {formattedCurrent}
          </div>
          {size !== 'sm' && (
            <div className="text-xs text-gray-500 font-medium">
              {unit}
            </div>
          )}
        </div>

        {/* Percentage indicator for over-goal */}
        {isOverGoal && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            !
          </div>
        )}
      </div>

      {/* Label and details */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-gray-900 text-sm">
          {label}
        </div>

        {showDetails && (
          <div className="mt-1 space-y-1">
            <div className="text-xs text-gray-600">
              {formattedCurrent} / {formattedGoal} {unit}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(percentage)}% of goal
            </div>
            {current < goal && (
              <div className="text-xs text-blue-600 font-medium">
                {(goal - current).toFixed(1)} {unit} remaining
              </div>
            )}
            {isOverGoal && (
              <div className="text-xs text-red-600 font-medium">
                {(current - goal).toFixed(1)} {unit} over goal
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-configured macro rings for common nutrients
export function CaloriesRing(props: Omit<MacroRingProps, 'color' | 'unit'>) {
  return (
    <MacroRing
      {...props}
      color="rgb(16 185 129)" // emerald-500
      unit="kcal"
    />
  )
}

export function CarbsRing(props: Omit<MacroRingProps, 'color' | 'unit'>) {
  return (
    <MacroRing
      {...props}
      color="rgb(59 130 246)" // blue-500
      unit="g"
    />
  )
}

export function ProteinRing(props: Omit<MacroRingProps, 'color' | 'unit'>) {
  return (
    <MacroRing
      {...props}
      color="rgb(168 85 247)" // purple-500
      unit="g"
    />
  )
}

export function FatRing(props: Omit<MacroRingProps, 'color' | 'unit'>) {
  return (
    <MacroRing
      {...props}
      color="rgb(245 158 11)" // amber-500
      unit="g"
    />
  )
}

export function FiberRing(props: Omit<MacroRingProps, 'color' | 'unit'>) {
  return (
    <MacroRing
      {...props}
      color="rgb(34 197 94)" // green-500
      unit="g"
    />
  )
}