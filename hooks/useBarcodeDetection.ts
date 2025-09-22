/**
 * Barcode Detection Hook - ZXing-js integration with resource management
 * Handles real-time barcode scanning with adaptive performance
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat, NotFoundException } from '@zxing/library'
import { resourceManager } from '../lib/resource-manager'
import { cameraService } from '../services/camera-service'
import { debugLog, logError, measurePerformance } from '../lib/debug'

export interface BarcodeResult {
  text: string
  format: string
  timestamp: Date
  confidence: number
}

export interface BarcodeDetectionState {
  isScanning: boolean
  isInitialized: boolean
  result: BarcodeResult | null
  error: string | null
  scanCount: number
}

export interface BarcodeDetectionControls {
  startDetection: (videoElement: HTMLVideoElement) => Promise<void>
  stopDetection: () => void
  startContinuousScanning: (videoElement: HTMLVideoElement) => void
  stopContinuousScanning: () => void
  resetResult: () => void
}

export interface UseBarcodeDetectionOptions {
  onDetected?: (result: BarcodeResult) => void
  onError?: (error: string) => void
  enableContinuousScanning?: boolean
  maxScanAttempts?: number
  scanInterval?: number // Will be overridden by device-specific settings
}

export function useBarcodeDetection(
  options: UseBarcodeDetectionOptions = {}
): BarcodeDetectionState & BarcodeDetectionControls {
  const {
    onDetected,
    onError,
    enableContinuousScanning = true,
    maxScanAttempts = 10
  } = options

  const [state, setState] = useState<BarcodeDetectionState>({
    isScanning: false,
    isInitialized: false,
    result: null,
    error: null,
    scanCount: 0
  })

  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const scannerIdRef = useRef<string | null>(null)
  const continuousScanRef = useRef<boolean>(false)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scanIntervalRef = useRef<number>(600) // Default, will be overridden

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<BarcodeDetectionState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Initialize ZXing reader with optimized settings
   */
  const initializeReader = useCallback(() => {
    if (readerRef.current) {
      return readerRef.current
    }

    try {
      const reader = new BrowserMultiFormatReader()

      // Optimize for common grocery barcode formats
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,    // Most common internationally
        BarcodeFormat.UPC_A,     // US standard
        BarcodeFormat.EAN_8,     // Compact products
        BarcodeFormat.UPC_E,     // Compact US
        BarcodeFormat.CODE_128,  // Store brands
        BarcodeFormat.CODE_39    // Some specialty products
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      reader.hints = hints
      readerRef.current = reader

      // Register for cleanup
      scannerIdRef.current = resourceManager.registerScanner(reader, 'primary_barcode_scanner')

      debugLog('ZXing reader initialized with optimized hints')
      updateState({ isInitialized: true })

      return reader
    } catch (error) {
      logError(error as Error, 'Failed to initialize barcode reader')
      updateState({ error: 'Failed to initialize barcode scanner' })
      onError?.('Failed to initialize barcode scanner')
      return null
    }
  }, [updateState, onError])

  /**
   * Perform single barcode detection attempt
   */
  const detectBarcodeOnce = useCallback(async (
    videoElement: HTMLVideoElement,
    timeoutMs: number = 3000
  ): Promise<BarcodeResult | null> => {
    const reader = initializeReader()
    if (!reader) return null

    return measurePerformance('Single Barcode Detection', async () => {
      try {
        updateState({ isScanning: true, error: null })

        const result = await reader.decodeOnceFromVideoDevice(undefined, videoElement)

        const barcodeResult: BarcodeResult = {
          text: result.getText(),
          format: result.getBarcodeFormat().toString(),
          timestamp: new Date(),
          confidence: 95 // ZXing is generally very reliable for clear barcodes
        }

        debugLog(`Barcode detected: ${barcodeResult.text} (${barcodeResult.format})`)
        updateState({
          result: barcodeResult,
          isScanning: false,
          scanCount: state.scanCount + 1
        })

        onDetected?.(barcodeResult)
        return barcodeResult

      } catch (error) {
        updateState({ isScanning: false })

        if (error instanceof NotFoundException) {
          // Expected when no barcode is found - not really an error
          debugLog('No barcode detected in timeout period')
          return null
        }

        const errorMessage = (error as Error).message || 'Barcode detection failed'
        logError(error as Error, 'Barcode detection error')
        updateState({ error: errorMessage })
        onError?.(errorMessage)
        return null
      }
    })
  }, [initializeReader, updateState, onDetected, onError, state.scanCount])

  /**
   * Start single detection attempt
   */
  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    if (state.isScanning) {
      debugLog('Detection already in progress')
      return
    }

    // Ensure video is ready
    await cameraService.waitForVideoReady(videoElement)

    await detectBarcodeOnce(videoElement)
  }, [state.isScanning, detectBarcodeOnce])

  /**
   * Stop current detection
   */
  const stopDetection = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.reset()
        debugLog('Barcode detection stopped')
      } catch (error) {
        debugLog('Error stopping detection (non-critical)', error)
      }
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    updateState({ isScanning: false })
  }, [updateState])

  /**
   * Start continuous scanning with device-adaptive intervals
   */
  const startContinuousScanning = useCallback((videoElement: HTMLVideoElement) => {
    if (!enableContinuousScanning) {
      debugLog('Continuous scanning is disabled')
      return
    }

    continuousScanRef.current = true

    // Get device-specific performance settings
    const perfSettings = cameraService.getPerformanceSettings()
    scanIntervalRef.current = perfSettings.scanInterval

    debugLog(`Starting continuous scanning with ${scanIntervalRef.current}ms intervals`)

    const continuousScan = async () => {
      if (!continuousScanRef.current) return

      try {
        // Check if we've exceeded max attempts
        if (maxScanAttempts > 0 && state.scanCount >= maxScanAttempts) {
          debugLog(`Max scan attempts reached: ${maxScanAttempts}`)
          stopContinuousScanning()
          onError?.('Max scan attempts reached. Try repositioning the barcode.')
          return
        }

        // Attempt detection (short timeout for responsiveness)
        const result = await detectBarcodeOnce(videoElement, 500)

        if (result) {
          // Success! Stop continuous scanning
          stopContinuousScanning()
          return
        }

        // Schedule next scan if still active
        if (continuousScanRef.current) {
          scanTimeoutRef.current = setTimeout(continuousScan, scanIntervalRef.current)
        }

      } catch (error) {
        logError(error as Error, 'Continuous scan error')
        if (continuousScanRef.current) {
          // Retry with longer interval on error
          scanTimeoutRef.current = setTimeout(continuousScan, scanIntervalRef.current * 2)
        }
      }
    }

    // Start scanning
    continuousScan()
  }, [
    enableContinuousScanning,
    detectBarcodeOnce,
    maxScanAttempts,
    state.scanCount,
    onError
  ])

  /**
   * Stop continuous scanning
   */
  const stopContinuousScanning = useCallback(() => {
    continuousScanRef.current = false

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    stopDetection()
    debugLog('Continuous scanning stopped')
  }, [stopDetection])

  /**
   * Reset detection result
   */
  const resetResult = useCallback(() => {
    updateState({
      result: null,
      error: null,
      scanCount: 0
    })
    debugLog('Barcode detection result reset')
  }, [updateState])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      debugLog('Barcode detection hook cleanup')
      stopContinuousScanning()

      if (scannerIdRef.current) {
        resourceManager.cleanup(scannerIdRef.current)
        scannerIdRef.current = null
      }

      readerRef.current = null
    }
  }, [stopContinuousScanning])

  /**
   * Handle page visibility changes
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        debugLog('Page hidden - pausing barcode detection')
        stopContinuousScanning()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [stopContinuousScanning])

  return {
    ...state,
    startDetection,
    stopDetection,
    startContinuousScanning,
    stopContinuousScanning,
    resetResult
  }
}