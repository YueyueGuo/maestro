'use client'

/**
 * Capture Error Boundary - Top-level error boundary for capture page
 * Handles catastrophic failures and provides navigation fallbacks
 */

import React from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw, FileText } from 'lucide-react'
import { debugLog, logError } from '../../../lib/debug'

interface CaptureErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface CaptureErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class CaptureErrorBoundary extends React.Component<CaptureErrorBoundaryProps, CaptureErrorBoundaryState> {
  constructor(props: CaptureErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<CaptureErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debugLog('Capture page error boundary caught error', { error, errorInfo })
    logError(error, 'Capture Page Error Boundary')

    this.setState({
      errorInfo
    })

    // Notify parent component
    this.props.onError?.(error, errorInfo)

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Future: Send to error monitoring service (Sentry, etc.)
      console.error('Capture page error:', error, errorInfo)
    }
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverable(error: Error | null): boolean {
    if (!error) return false

    const message = error.message.toLowerCase()

    // These errors suggest the page/app is in a bad state
    const unrecoverablePatterns = [
      'chunk',
      'loading',
      'network',
      'failed to fetch',
      'out of memory',
      'maximum call stack'
    ]

    return !unrecoverablePatterns.some(pattern => message.includes(pattern))
  }

  /**
   * Get appropriate error message based on error type
   */
  private getErrorMessage(error: Error | null): { title: string; description: string } {
    if (!error) {
      return {
        title: 'Something went wrong',
        description: 'An unexpected error occurred while trying to access the camera.'
      }
    }

    const message = error.message.toLowerCase()

    if (message.includes('chunk') || message.includes('loading')) {
      return {
        title: 'App Update Required',
        description: 'A new version of the app is available. Please refresh the page to update.'
      }
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description: 'Please check your internet connection and try again.'
      }
    }

    if (message.includes('memory') || message.includes('stack')) {
      return {
        title: 'App Overloaded',
        description: 'The app is using too much memory. Please refresh the page to restart.'
      }
    }

    return {
      title: 'Capture Error',
      description: 'Something went wrong with the food logging feature. You can try again or log food manually.'
    }
  }

  /**
   * Reload the page
   */
  private handleReload = () => {
    debugLog('Reloading page after capture error')
    window.location.reload()
  }

  /**
   * Reset error state (for recoverable errors)
   */
  private handleReset = () => {
    debugLog('Resetting capture error boundary')
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    const { children } = this.props
    const { hasError, error, errorInfo } = this.state

    if (hasError) {
      const { title, description } = this.getErrorMessage(error)
      const recoverable = this.isRecoverable(error)

      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">Error</h1>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
            <div className="max-w-md w-full text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {title}
              </h2>

              <p className="text-gray-600 mb-8">
                {description}
              </p>

              <div className="space-y-4">
                {/* Primary action */}
                {recoverable ? (
                  <button
                    onClick={this.handleReset}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                ) : (
                  <button
                    onClick={this.handleReload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload App
                  </button>
                )}

                {/* Secondary actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>

                  <Link
                    href="/meals"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Manual Log
                  </Link>
                </div>
              </div>

              {/* Help text */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Need help?</strong> Try refreshing the page or check that camera permissions are enabled in your browser settings.
                </p>
              </div>

              {/* Technical details (development mode) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left">
                  <summary className="text-gray-600 text-sm cursor-pointer">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

export default CaptureErrorBoundary