/**
 * Camera Hook - React hook for camera access and management
 * Integrates with CameraService for hardware abstraction
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { cameraService, type CameraError, type CameraCapabilities } from '../services/camera-service'
import { debugLog, logError } from '../lib/debug'

export interface CameraState {
  stream: MediaStream | null
  isActive: boolean
  isLoading: boolean
  error: CameraError | null
  capabilities: CameraCapabilities
  hasPermission: boolean | null
}

export interface CameraControls {
  startCamera: () => Promise<void>
  stopCamera: () => Promise<void>
  restartCamera: () => Promise<void>
  toggleTorch: (enabled: boolean) => Promise<boolean>
  setupVideoElement: (element: HTMLVideoElement) => void
  waitForVideoReady: (element: HTMLVideoElement) => Promise<void>
}

export interface UseCameraOptions {
  autoStart?: boolean
  onError?: (error: CameraError) => void
  onSuccess?: (stream: MediaStream) => void
  onPermissionChange?: (hasPermission: boolean) => void
}

export function useCamera(options: UseCameraOptions = {}): CameraState & CameraControls {
  const {
    autoStart = false,
    onError,
    onSuccess,
    onPermissionChange
  } = options

  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    isLoading: false,
    error: null,
    capabilities: {},
    hasPermission: null
  })

  const streamRef = useRef<MediaStream | null>(null)
  const isStartingRef = useRef(false)

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<CameraState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Start camera and update state
   */
  const startCamera = useCallback(async () => {
    if (isStartingRef.current || state.isActive) {
      debugLog('Camera start already in progress or active')
      return
    }

    isStartingRef.current = true
    updateState({ isLoading: true, error: null })

    try {
      debugLog('Starting camera...')
      const stream = await cameraService.startCamera()

      streamRef.current = stream

      // Get camera capabilities
      const capabilities = await cameraService.getCameraCapabilities(stream)

      // Optimize for barcode scanning
      await cameraService.optimizeForBarcodeScanning(stream)

      updateState({
        stream,
        isActive: true,
        isLoading: false,
        capabilities,
        hasPermission: true,
        error: null
      })

      // Notify success
      onSuccess?.(stream)
      onPermissionChange?.(true)

      debugLog('Camera started successfully')

    } catch (error) {
      const cameraError = error as CameraError

      updateState({
        stream: null,
        isActive: false,
        isLoading: false,
        error: cameraError,
        hasPermission: cameraError.name === 'NotAllowedError' ? false : null
      })

      logError(error as Error, 'Camera start failed')
      onError?.(cameraError)

      if (cameraError.name === 'NotAllowedError') {
        onPermissionChange?.(false)
      }

    } finally {
      isStartingRef.current = false
    }
  }, [state.isActive, onError, onSuccess, onPermissionChange, updateState])

  /**
   * Stop camera and cleanup
   */
  const stopCamera = useCallback(async () => {
    debugLog('Stopping camera...')

    try {
      await cameraService.stopCamera()

      updateState({
        stream: null,
        isActive: false,
        isLoading: false,
        error: null
      })

      streamRef.current = null
      debugLog('Camera stopped successfully')

    } catch (error) {
      logError(error as Error, 'Camera stop failed')
    }
  }, [updateState])

  /**
   * Restart camera (stop then start)
   */
  const restartCamera = useCallback(async () => {
    debugLog('Restarting camera...')
    await stopCamera()

    // Small delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 100))

    await startCamera()
  }, [stopCamera, startCamera])

  /**
   * Toggle torch/flash
   */
  const toggleTorch = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!streamRef.current) {
      debugLog('Cannot toggle torch: no active stream')
      return false
    }

    try {
      const success = await cameraService.toggleTorch(streamRef.current, enabled)
      debugLog(`Torch toggle ${success ? 'successful' : 'failed'}: ${enabled}`)
      return success
    } catch (error) {
      logError(error as Error, 'Torch toggle failed')
      return false
    }
  }, [])

  /**
   * Setup video element for camera stream
   */
  const setupVideoElement = useCallback((videoElement: HTMLVideoElement) => {
    if (!streamRef.current) {
      debugLog('Cannot setup video element: no active stream')
      return
    }

    cameraService.setupVideoElement(videoElement, streamRef.current)
    debugLog('Video element setup completed')
  }, [])

  /**
   * Wait for video element to be ready
   */
  const waitForVideoReady = useCallback(async (videoElement: HTMLVideoElement) => {
    await cameraService.waitForVideoReady(videoElement)
    debugLog('Video element is ready for processing')
  }, [])

  /**
   * Check camera permission on mount
   */
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if camera is available first
        const isAvailable = await cameraService.isCameraAvailable()
        if (!isAvailable) {
          updateState({
            hasPermission: false,
            error: {
              name: 'NotFoundError',
              message: 'No camera found on this device',
              fallbackAvailable: true,
              userAction: 'You can upload a photo instead'
            }
          })
          return
        }

        // Check permissions
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })

          const hasPermission = permission.state === 'granted'
          updateState({ hasPermission })
          onPermissionChange?.(hasPermission)

          // Listen for permission changes
          permission.addEventListener('change', () => {
            const newPermission = permission.state === 'granted'
            updateState({ hasPermission: newPermission })
            onPermissionChange?.(newPermission)
          })
        }
      } catch (error) {
        debugLog('Permission check failed (non-critical)', error)
      }
    }

    checkPermissions()
  }, [onPermissionChange, updateState])

  /**
   * Auto-start camera if requested
   */
  useEffect(() => {
    if (autoStart && !state.isActive && !state.isLoading && !isStartingRef.current) {
      debugLog('Auto-starting camera')
      startCamera()
    }
  }, [autoStart, state.isActive, state.isLoading, startCamera])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      debugLog('Camera hook cleanup')
      if (streamRef.current) {
        cameraService.stopCamera()
      }
    }
  }, [])

  /**
   * Handle page visibility changes (mobile app backgrounding)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isActive) {
        debugLog('Page hidden - stopping camera for battery optimization')
        stopCamera()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isActive, stopCamera])

  return {
    ...state,
    startCamera,
    stopCamera,
    restartCamera,
    toggleTorch,
    setupVideoElement,
    waitForVideoReady
  }
}