/**
 * Development debugging utilities for Maestro
 */

export const isDevelopment = process.env.NODE_ENV === 'development'

export const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[MAESTRO DEBUG] ${message}`, data ? data : '')
  }
}

export const logApiCall = (endpoint: string, response: any, duration?: number) => {
  if (isDevelopment) {
    const durationText = duration ? ` (${duration}ms)` : ''
    console.log(`[API CALL] ${endpoint}${durationText}`, response)
  }
}

export const measurePerformance = async <T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  if (isDevelopment) {
    console.time(`[PERF] ${label}`)
  }

  try {
    const result = await fn()
    if (isDevelopment) {
      console.timeEnd(`[PERF] ${label}`)
    }
    return result
  } catch (error) {
    if (isDevelopment) {
      console.timeEnd(`[PERF] ${label}`)
      console.error(`[PERF ERROR] ${label}:`, error)
    }
    throw error
  }
}

export const logError = (error: Error, context?: string) => {
  const contextText = context ? ` in ${context}` : ''
  console.error(`[MAESTRO ERROR]${contextText}:`, error)
}

export const logWarning = (message: string, data?: any) => {
  console.warn(`[MAESTRO WARNING] ${message}`, data ? data : '')
}

// Feature flag logging
export const logFeatureFlag = (flag: string, enabled: boolean) => {
  if (isDevelopment) {
    console.log(`[FEATURE FLAG] ${flag}: ${enabled ? 'ENABLED' : 'DISABLED'}`)
  }
}