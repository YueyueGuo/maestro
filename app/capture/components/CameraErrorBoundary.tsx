'use client'

/**
 * Camera Error Boundary - Handles camera-specific errors with recovery options
 * Provides fallback UI when camera operations fail
 */

import React from 'react'
import { AlertTriangle, Camera, Upload, RotateCcw } from 'lucide-react'
import { debugLog, logError } from '../../../lib/debug'

interface CameraErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface CameraErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<CameraErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
}

interface CameraErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retry: () => void
  canRetry: boolean
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onManualEntry: () => void
}

const DEFAULT_ERROR_MESSAGES = {
  camera: 'Camera access failed. Please check permissions or try uploading a photo.',
  barcode: 'Barcode scanning encountered an error. You can try again or upload a photo.',
  permission: 'Camera permission denied. Please enable camera access in your browser settings.',
  hardware: 'Camera hardware unavailable. You can upload a photo instead.',
  unknown: 'An unexpected error occurred. Please try again or use manual entry.'
}

class CameraErrorBoundary extends React.Component<CameraErrorBoundaryProps, CameraErrorBoundaryState> {
  constructor(props: CameraErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<CameraErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debugLog('Camera error boundary caught error', { error, errorInfo })
    logError(error, 'Camera Error Boundary')

    this.setState({
      errorInfo
    })

    // Notify parent component
    this.props.onError?.(error, errorInfo)
  }

  /**
   * Determine error type from error message
   */
  private getErrorType(error: Error | null): keyof typeof DEFAULT_ERROR_MESSAGES {
    if (!error) return 'unknown'

    const message = error.message.toLowerCase()

    if (message.includes('permission') || message.includes('notallowed')) {
      return 'permission'
    }
    if (message.includes('camera') || message.includes('video')) {
      return 'camera'
    }
    if (message.includes('barcode') || message.includes('scanning')) {
      return 'barcode'
    }
    if (message.includes('hardware') || message.includes('notfound')) {
      return 'hardware'
    }

    return 'unknown'
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: Error | null): string {
    const errorType = this.getErrorType(error)
    return DEFAULT_ERROR_MESSAGES[errorType]
  }

  /**
   * Retry the failed operation
   */
  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      debugLog(`Max retries (${maxRetries}) exceeded`)
      return
    }

    debugLog(`Retrying camera operation (attempt ${retryCount + 1})`)

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1
    })
  }

  /**
   * Handle file upload fallback
   */
  private handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      debugLog('File upload fallback selected', { fileName: file.name, size: file.size })
      // Reset error state since user is using fallback
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
    }
  }

  /**
   * Handle manual entry fallback
   */
  private handleManualEntry = () => {
    debugLog('Manual entry fallback selected')
    // Reset error state since user is using fallback
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    const { children, fallback: FallbackComponent, maxRetries = 3 } = this.props
    const { hasError, error, errorInfo, retryCount } = this.state

    if (hasError) {
      const canRetry = retryCount < maxRetries
      const errorType = this.getErrorType(error)

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            retry={this.handleRetry}
            canRetry={canRetry}
            onFileUpload={this.handleFileUpload}
            onManualEntry={this.handleManualEntry}
          />
        )
      }

      // Default fallback UI
      return (
        <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-white mb-2">
              Camera Error
            </h3>

            <p className="text-gray-300 mb-6">
              {this.getErrorMessage(error)}
            </p>

            <div className="space-y-3">
              {/* Retry button */}
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </button>
              )}

              {/* File upload fallback */}
              {(errorType === 'permission' || errorType === 'hardware' || !canRetry) && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={this.handleFileUpload}
                    className="hidden"
                    id="error-fallback-upload"
                  />
                  <label
                    htmlFor="error-fallback-upload"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Photo Instead
                  </label>
                </>
              )}

              {/* Manual entry fallback */}
              <button
                onClick={this.handleManualEntry}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                type="button"
              >
                Enter Food Manually
              </button>
            </div>

            {/* Technical details (development mode) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 text-sm cursor-pointer">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return children
  }
}

export default CameraErrorBoundary
export type { CameraErrorFallbackProps }