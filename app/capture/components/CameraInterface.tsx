'use client'

/**
 * Camera Interface - Main camera component with balanced barcode/AI UX
 * Implements the hybrid capture flow with real-time barcode detection
 */

import { useEffect, useRef, useState } from 'react'
import { Camera, Scan, FileImage, Zap, ZapOff, RotateCcw, AlertCircle } from 'lucide-react'
import { useCapture, type ExtendedCaptureHook } from '../../../hooks/useCapture'
import { debugLog } from '../../../lib/debug'

export interface CameraInterfaceProps {
  onBarcodeSuccess?: (result: any) => void
  onModeChange?: (mode: string) => void
  onError?: (error: string) => void
  className?: string
}

export default function CameraInterface({
  onBarcodeSuccess,
  onModeChange,
  onError,
  className = ''
}: CameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const capture: ExtendedCaptureHook = useCapture({
    autoDetectionTimeoutMs: 3000,
    onBarcodeDetected: (result) => {
      debugLog('Barcode detected in UI', result)
      onBarcodeSuccess?.(result)
    },
    onModeChange: (mode) => {
      onModeChange?.(mode)
    },
    onError: (error) => {
      onError?.(error)
    }
  })

  /**
   * Setup video element when camera stream is available
   */
  useEffect(() => {
    if (videoRef.current && capture.stream) {
      capture.setupVideoElement(videoRef.current)
    }
  }, [capture.stream, capture.setupVideoElement]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Auto-start capture on mount
   */
  useEffect(() => {
    capture.startCapture()
    return () => capture.stopCapture()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Hide instructions after successful detection
   */
  useEffect(() => {
    if (capture.lookupResult?.success) {
      setShowInstructions(false)
    }
  }, [capture.lookupResult])

  /**
   * Toggle torch/flash
   */
  const handleTorchToggle = async () => {
    if (capture.stream) {
      const success = await capture.toggleTorch(!torchEnabled)
      if (success) {
        setTorchEnabled(!torchEnabled)
      }
    }
  }

  /**
   * Handle mode selection
   */
  const handleModeSelect = (mode: 'nutrition-label' | 'ai-analysis' | 'manual') => {
    capture.switchMode(mode)
    setShowInstructions(false)
  }

  /**
   * Handle file upload (fallback when camera unavailable)
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      debugLog('File selected for upload', { name: file.name, size: file.size })
      // Future: Process uploaded image
      onModeChange?.('file-upload')
    }
  }

  // Loading state
  if (capture.cameraLoading) {
    return (
      <div className={`relative w-full h-full bg-black rounded-lg ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Starting camera...</p>
            <p className="text-sm text-gray-300 mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state with fallback options
  if (capture.cameraError) {
    return (
      <div className={`relative w-full h-full bg-gray-800 rounded-lg ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Camera Unavailable</h3>
          <p className="text-gray-300 mb-6">{capture.cameraError.message}</p>

          {capture.cameraError.fallbackAvailable && (
            <div className="space-y-3 w-full max-w-sm">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer transition-colors"
              >
                Upload Photo Instead
              </label>

              <button
                onClick={capture.retryCapture}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Camera Again
              </button>
            </div>
          )}

          {capture.cameraError.userAction && (
            <p className="text-sm text-gray-400 mt-4">{capture.cameraError.userAction}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Barcode Viewfinder Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Viewfinder frame */}
          <div className="w-72 h-24 border-2 border-white rounded-lg border-dashed opacity-70">
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          </div>

          {/* Scanning indicator */}
          {capture.isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex space-x-2">
          {/* Torch toggle (if available) */}
          <button
            onClick={handleTorchToggle}
            className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            disabled={!capture.stream}
          >
            {torchEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
          </button>

          {/* Restart camera */}
          <button
            onClick={capture.retryCapture}
            className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            disabled={capture.cameraLoading}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Mode indicator */}
        <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full">
          <span className="text-white text-sm font-medium">
            {capture.mode === 'barcode' ? 'Scanning...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Bottom Instructions & Mode Selection */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
        {showInstructions && !capture.showModeSelection && (
          <div className="text-center text-white mb-4">
            <p className="text-lg font-medium mb-2">Point camera at barcode</p>
            <p className="text-sm text-gray-300">
              Automatic detection will start in moments...
            </p>
          </div>
        )}

        {/* Mode Selection (appears after timeout or error) */}
        {capture.showModeSelection && (
          <div className="space-y-3">
            <div className="text-center text-white mb-4">
              <p className="text-lg font-medium mb-2">No barcode detected</p>
              <p className="text-sm text-gray-300">
                Choose how to analyze your food:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Nutrition Label OCR */}
              <button
                onClick={() => handleModeSelect('nutrition-label')}
                className="flex flex-col items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                <FileImage className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Read Label</span>
                <span className="text-xs text-purple-200">Nutrition facts</span>
              </button>

              {/* AI Food Analysis */}
              <button
                onClick={() => handleModeSelect('ai-analysis')}
                className="flex flex-col items-center p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <Camera className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Analyze Food</span>
                <span className="text-xs text-green-200">AI-powered</span>
              </button>
            </div>

            {/* Manual entry option */}
            <button
              onClick={() => handleModeSelect('manual')}
              className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Enter Manually
            </button>

            {/* Try barcode again */}
            <button
              onClick={capture.retryCapture}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Scan className="w-4 h-4 mr-2" />
              Try Barcode Again
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {capture.lookupResult && (
        <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
          {capture.lookupResult.success ? (
            <div className="bg-green-600 text-white p-4 rounded-lg text-center">
              <p className="font-medium">Product Found!</p>
              <p className="text-sm text-green-100 mt-1">
                {capture.lookupResult.product?.name}
              </p>
            </div>
          ) : (
            <div className="bg-red-600 text-white p-4 rounded-lg text-center">
              <p className="font-medium">Product Not Found</p>
              <p className="text-sm text-red-100 mt-1">
                {capture.lookupResult.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}