/**
 * Capture Hook - Orchestrates camera, barcode detection, and capture modes
 * Implements the hybrid capture flow with balanced UX
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCamera } from './useCamera'
import { useBarcodeDetection } from './useBarcodeDetection'
import { foodLookupService, type LookupResult } from '../services/food-lookup-service'
import { debugLog, logError } from '../lib/debug'

export type CaptureMode = 'barcode' | 'nutrition-label' | 'ai-analysis' | 'manual'

export interface CaptureState {
  mode: CaptureMode
  isActive: boolean
  isProcessing: boolean
  autoDetectionComplete: boolean
  showModeSelection: boolean
  lookupResult: LookupResult | null
  error: string | null
}

export interface CaptureControls {
  startCapture: () => Promise<void>
  stopCapture: () => void
  switchMode: (mode: CaptureMode) => void
  retryCapture: () => Promise<void>
  clearResult: () => void
  setupVideoElement: (element: HTMLVideoElement) => void
}

export interface UseCaptureOptions {
  autoDetectionTimeoutMs?: number
  onBarcodeDetected?: (result: LookupResult) => void
  onModeChange?: (mode: CaptureMode) => void
  onError?: (error: string) => void
}

export function useCapture(options: UseCaptureOptions = {}): CaptureState & CaptureControls {
  const {
    autoDetectionTimeoutMs = 3000,
    onBarcodeDetected,
    onModeChange,
    onError
  } = options

  const [state, setState] = useState<CaptureState>({
    mode: 'barcode',
    isActive: false,
    isProcessing: false,
    autoDetectionComplete: false,
    showModeSelection: false,
    lookupResult: null,
    error: null
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const autoDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<CaptureState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Camera hook with error handling
   */
  const camera = useCamera({
    onError: (cameraError) => {
      updateState({
        error: cameraError.message,
        isActive: false,
        showModeSelection: cameraError.fallbackAvailable
      })
      onError?.(cameraError.message)
    },
    onSuccess: (stream) => {
      debugLog('Camera ready, starting auto-detection flow')
      startAutoDetection()
    }
  })

  /**
   * Barcode detection hook
   */
  const barcodeDetection = useBarcodeDetection({
    enableContinuousScanning: true,
    maxScanAttempts: 5,
    onDetected: async (barcodeResult) => {
      debugLog(`Barcode detected: ${barcodeResult.text}`)
      await handleBarcodeDetected(barcodeResult.text)
    },
    onError: (error) => {
      debugLog('Barcode detection error (non-critical)', error)
      // Don't show barcode errors to user - just continue with flow
    }
  })

  /**
   * Handle barcode detection success
   */
  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    updateState({ isProcessing: true, error: null })

    try {
      debugLog(`Looking up product for barcode: ${barcode}`)
      const result = await foodLookupService.lookupByBarcode(barcode, {
        enableCache: true,
        maxRetries: 2,
        timeoutMs: 5000
      })

      updateState({
        lookupResult: result,
        isProcessing: false,
        autoDetectionComplete: true,
        showModeSelection: !result.success
      })

      if (result.success) {
        onBarcodeDetected?.(result)
      } else {
        // Show manual options since barcode failed
        updateState({ showModeSelection: true })
      }

    } catch (error) {
      logError(error as Error, 'Barcode lookup failed')
      updateState({
        error: 'Failed to look up product',
        isProcessing: false,
        showModeSelection: true
      })
      onError?.('Failed to look up product')
    }
  }, [updateState, onBarcodeDetected, onError])

  /**
   * Start auto-detection flow (barcode scanning for 3 seconds)
   */
  const startAutoDetection = useCallback(() => {
    if (!videoRef.current) {
      debugLog('Cannot start auto-detection: no video element')
      return
    }

    debugLog('Starting auto-detection flow')
    updateState({
      mode: 'barcode',
      autoDetectionComplete: false,
      showModeSelection: false,
      error: null
    })

    // Start barcode scanning
    barcodeDetection.startContinuousScanning(videoRef.current)

    // Set timeout to show manual options
    autoDetectionTimeoutRef.current = setTimeout(() => {
      if (!state.autoDetectionComplete && !state.lookupResult) {
        debugLog('Auto-detection timeout - showing manual options')
        barcodeDetection.stopContinuousScanning()
        updateState({
          autoDetectionComplete: true,
          showModeSelection: true
        })
      }
    }, autoDetectionTimeoutMs)

  }, [barcodeDetection, autoDetectionTimeoutMs, state.autoDetectionComplete, state.lookupResult, updateState])

  /**
   * Start capture process
   */
  const startCapture = useCallback(async () => {
    debugLog('Starting capture process')
    updateState({
      isActive: true,
      error: null,
      lookupResult: null,
      autoDetectionComplete: false,
      showModeSelection: false
    })

    try {
      await camera.startCamera()
      // Camera success handler will call startAutoDetection
    } catch (error) {
      logError(error as Error, 'Failed to start capture')
      updateState({
        error: 'Failed to start camera',
        isActive: false,
        showModeSelection: true
      })
    }
  }, [camera, updateState])

  /**
   * Stop capture process
   */
  const stopCapture = useCallback(() => {
    debugLog('Stopping capture process')

    // Clear auto-detection timeout
    if (autoDetectionTimeoutRef.current) {
      clearTimeout(autoDetectionTimeoutRef.current)
      autoDetectionTimeoutRef.current = null
    }

    // Stop detection
    barcodeDetection.stopContinuousScanning()

    // Stop camera
    camera.stopCamera()

    updateState({
      isActive: false,
      isProcessing: false,
      autoDetectionComplete: false,
      showModeSelection: false
    })
  }, [camera, barcodeDetection, updateState])

  /**
   * Switch capture mode
   */
  const switchMode = useCallback((newMode: CaptureMode) => {
    debugLog(`Switching to mode: ${newMode}`)

    // Stop current detection
    barcodeDetection.stopContinuousScanning()

    updateState({
      mode: newMode,
      autoDetectionComplete: true,
      showModeSelection: newMode !== 'barcode',
      error: null
    })

    onModeChange?.(newMode)

    // Handle mode-specific logic
    switch (newMode) {
      case 'barcode':
        if (videoRef.current) {
          barcodeDetection.startContinuousScanning(videoRef.current)
        }
        break
      case 'nutrition-label':
        // Future: Start OCR capture mode
        debugLog('Nutrition label scanning not yet implemented')
        break
      case 'ai-analysis':
        // Future: Start AI capture mode
        debugLog('AI food analysis not yet implemented')
        break
      case 'manual':
        // Stop all detection, show manual entry
        break
    }
  }, [barcodeDetection, updateState, onModeChange])

  /**
   * Retry capture (restart auto-detection)
   */
  const retryCapture = useCallback(async () => {
    debugLog('Retrying capture')
    clearResult()

    if (camera.isActive && videoRef.current) {
      startAutoDetection()
    } else {
      await startCapture()
    }
  }, [camera.isActive, startAutoDetection, startCapture])

  /**
   * Clear current result
   */
  const clearResult = useCallback(() => {
    updateState({
      lookupResult: null,
      error: null,
      isProcessing: false,
      autoDetectionComplete: false,
      showModeSelection: false
    })
    barcodeDetection.resetResult()
  }, [updateState, barcodeDetection])

  /**
   * Setup video element reference
   */
  const setupVideoElement = useCallback((element: HTMLVideoElement) => {
    videoRef.current = element
    camera.setupVideoElement(element)
    debugLog('Video element setup for capture hook')
  }, [camera])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      debugLog('Capture hook cleanup')
      if (autoDetectionTimeoutRef.current) {
        clearTimeout(autoDetectionTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    // Expose camera state for UI
    stream: camera.stream,
    cameraLoading: camera.isLoading,
    cameraError: camera.error,
    hasPermission: camera.hasPermission,
    // Controls
    startCapture,
    stopCapture,
    switchMode,
    retryCapture,
    clearResult,
    setupVideoElement,
    // Additional camera controls
    toggleTorch: camera.toggleTorch,
    restartCamera: camera.restartCamera
  } as CaptureState & CaptureControls & {
    stream: MediaStream | null
    cameraLoading: boolean
    cameraError: any
    hasPermission: boolean | null
    toggleTorch: (enabled: boolean) => Promise<boolean>
    restartCamera: () => Promise<void>
  }
}