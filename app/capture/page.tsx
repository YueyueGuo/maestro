'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Image as ImageIcon, Scan } from 'lucide-react'
import CameraInterface from './components/CameraInterface'
import CaptureErrorBoundary from './components/CaptureErrorBoundary'
import CameraErrorBoundary from './components/CameraErrorBoundary'
import NutritionFactsCard from './components/NutritionFactsCard'
import MealSelectionModal from './components/MealSelectionModal'
import { debugLog } from '../../lib/debug'
import { addFoodToMeal } from '../../lib/meal-storage'

export default function CapturePage() {
  const [captureResult, setCaptureResult] = useState<any>(null)
  const [currentMode, setCurrentMode] = useState<string>('barcode')
  const [showMealModal, setShowMealModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<any>(null)

  /**
   * Handle successful barcode detection
   */
  const handleBarcodeSuccess = (result: any) => {
    debugLog('Barcode capture success', result)
    setCaptureResult(result)
  }

  /**
   * Handle nutrition facts confirmation - Open meal selection
   */
  const handleNutritionConfirm = (product: any, servingSize: number) => {
    debugLog('Opening meal selection for product', { product: product.name, servingSize })
    setPendingProduct({ ...product, servingSize })
    setShowMealModal(true)
  }

  /**
   * Handle actual meal addition
   */
  const handleMealConfirm = (mealType: string, servings: number, totalNutrition: any) => {
    if (!pendingProduct) return

    debugLog('Adding food to meal', { mealType, servings, totalNutrition })

    const result = addFoodToMeal(pendingProduct, mealType as any, servings, totalNutrition)

    if (result.success) {
      // Success - show confirmation and reset
      alert(`Successfully added ${pendingProduct.name} to ${mealType}!`)
      resetCapture()
      setPendingProduct(null)
    } else {
      // Error - show error message
      alert(`Error adding food to meal: ${result.error}`)
    }
  }

  /**
   * Handle edit nutrition details
   */
  const handleEditDetails = () => {
    debugLog('Edit nutrition details requested')
    // TODO: Implement nutrition editing interface
    alert('Nutrition editing interface coming soon!')
  }

  /**
   * Handle mode changes
   */
  const handleModeChange = (mode: string) => {
    debugLog(`Capture mode changed to: ${mode}`)
    setCurrentMode(mode)
  }

  /**
   * Handle capture errors from error boundary
   */
  const handleCaptureError = (error: Error, errorInfo: React.ErrorInfo) => {
    debugLog('Capture error', { error: error.message, errorInfo })
    // Error handling is done within the CameraInterface component
  }

  /**
   * Handle camera interface errors (string format)
   */
  const handleCameraError = (error: string) => {
    debugLog('Camera interface error', error)
    // Error handling is done within the CameraInterface component
  }

  /**
   * Reset capture to try again
   */
  const resetCapture = () => {
    setCaptureResult(null)
    setCurrentMode('barcode')
    setShowMealModal(false)
    setPendingProduct(null)
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
          {/* Barcode Scanning Tips - Above scan box for visibility */}
          {!captureResult && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">📱 Barcode Scanning Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hold your phone steady over the barcode</li>
                <li>• Ensure good lighting on the product</li>
                <li>• Keep the barcode within the scanning frame</li>
                <li>• Try different angles if scanning doesn't work</li>
              </ul>
            </div>
          )}

          {/* Working Camera Interface with Error Boundary */}
          <div className="mb-6 camera-viewfinder">
            <CameraErrorBoundary
              onError={handleCaptureError}
              maxRetries={3}
            >
              <CameraInterface
                onBarcodeSuccess={handleBarcodeSuccess}
                onModeChange={handleModeChange}
                onError={handleCameraError}
                className="h-96"
              />
            </CameraErrorBoundary>
          </div>

        {/* Nutrition Facts Display */}
        {captureResult?.success && (
          <NutritionFactsCard
            product={captureResult.product}
            onConfirm={handleNutritionConfirm}
            onEdit={handleEditDetails}
            onScanAnother={resetCapture}
            className="mb-6"
          />
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

        {/* Meal Selection Modal */}
        {pendingProduct && (
          <MealSelectionModal
            product={pendingProduct}
            isOpen={showMealModal}
            onClose={() => setShowMealModal(false)}
            onConfirm={handleMealConfirm}
          />
        )}
      </div>
      </div>
    </CaptureErrorBoundary>
  )
}