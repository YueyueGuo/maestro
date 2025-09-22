'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Image as ImageIcon, Scan, CheckCircle } from 'lucide-react'
import CameraInterface from './components/CameraInterface'
import CaptureErrorBoundary from './components/CaptureErrorBoundary'
import CameraErrorBoundary from './components/CameraErrorBoundary'
import { debugLog } from '../../lib/debug'

export default function CapturePage() {
  const [captureResult, setCaptureResult] = useState<any>(null)
  const [currentMode, setCurrentMode] = useState<string>('barcode')

  /**
   * Handle successful barcode detection
   */
  const handleBarcodeSuccess = (result: any) => {
    debugLog('Barcode capture success', result)
    setCaptureResult(result)
  }

  /**
   * Handle mode changes
   */
  const handleModeChange = (mode: string) => {
    debugLog(`Capture mode changed to: ${mode}`)
    setCurrentMode(mode)
  }

  /**
   * Handle capture errors
   */
  const handleCaptureError = (error: string) => {
    debugLog('Capture error', error)
    // Error handling is done within the CameraInterface component
  }

  /**
   * Reset capture to try again
   */
  const resetCapture = () => {
    setCaptureResult(null)
    setCurrentMode('barcode')
  }

  return (
    <CaptureErrorBoundary onError={handleCaptureError}>
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
              <h1 className="text-lg font-semibold text-gray-900">Log Food</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          {/* Working Camera Interface with Error Boundary */}
          <div className="mb-6 camera-viewfinder">
            <CameraErrorBoundary
              onError={handleCaptureError}
              maxRetries={3}
            >
              <CameraInterface
                onBarcodeSuccess={handleBarcodeSuccess}
                onModeChange={handleModeChange}
                onError={handleCaptureError}
                className="h-96"
              />
            </CameraErrorBoundary>
          </div>

        {/* Success Result Display */}
        {captureResult?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Product Found!</h3>
                <div className="space-y-2">
                  <p className="text-green-800">
                    <span className="font-medium">{captureResult.product.name}</span>
                    {captureResult.product.brand && (
                      <span className="text-green-600"> by {captureResult.product.brand}</span>
                    )}
                  </p>
                  <div className="text-sm text-green-700">
                    Quality: <span className="font-medium capitalize">{captureResult.product.quality.level}</span>
                    {' '}({captureResult.product.quality.score}/100)
                  </div>
                  {captureResult.product.quality.issues.length > 0 && (
                    <div className="text-sm text-green-600">
                      Note: {captureResult.product.quality.issues.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Add to Meal
                  </button>
                  <button
                    onClick={resetCapture}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Preview - Show upcoming capabilities */}
        {!captureResult && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Multiple Ways to Log Food</h2>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Scan className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Scan Barcode</h3>
                  <p className="text-sm text-gray-600">
                    Automatically detect and scan product barcodes
                  </p>
                </div>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ ACTIVE
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Read Nutrition Label</h3>
                  <p className="text-sm text-gray-600">
                    Scan nutrition facts labels with OCR
                  </p>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  COMING SOON
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Analyze Food</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered analysis of fresh foods and meals
                  </p>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  COMING SOON
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Status & Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            {currentMode === 'barcode' ? 'Barcode Scanning Active' : 'Camera Instructions'}:
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Point camera at food item or barcode</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>System auto-detects barcodes in real-time</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Choose manual options if no barcode detected</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Review and confirm nutrition data</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </CaptureErrorBoundary>
  )
}