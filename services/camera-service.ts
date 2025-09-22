/**
 * Camera Service - Hardware abstraction layer for camera access
 * Handles device-specific optimizations and iOS Safari compatibility
 */

import { debugLog, logError, measurePerformance } from '../lib/debug'
import { resourceManager } from '../lib/resource-manager'

export interface CameraConstraints {
  width: { ideal: number; max: number }
  height: { ideal: number; max: number }
  facingMode: { ideal: string }
  frameRate?: { ideal: number; max: number }
  aspectRatio?: { ideal: number }
  exposureMode?: { ideal: string }
  focusMode?: { ideal: string }
}

export interface CameraCapabilities {
  torch?: boolean
  focusMode?: boolean
  exposureMode?: boolean
  zoom?: boolean
}

export interface CameraError {
  name: string
  message: string
  fallbackAvailable: boolean
  userAction?: string
}

export class CameraService {
  private activeStreamId: string | null = null
  private isIOS: boolean
  private isSafari: boolean
  private isMobile: boolean

  constructor() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    debugLog(`Camera Service initialized - iOS: ${this.isIOS}, Safari: ${this.isSafari}, Mobile: ${this.isMobile}`)
  }

  /**
   * Get optimal camera constraints for barcode scanning
   */
  getOptimalConstraints(): CameraConstraints {
    const baseConstraints: CameraConstraints = {
      width: { ideal: 640, max: 1024 },
      height: { ideal: 480, max: 768 },
      facingMode: { ideal: 'environment' } // Back camera for scanning
    }

    if (this.isMobile) {
      return {
        ...baseConstraints,
        frameRate: { ideal: 30, max: 30 }, // Battery optimization
        aspectRatio: { ideal: 4/3 }, // Better for barcode scanning
        exposureMode: { ideal: 'continuous' },
        focusMode: { ideal: 'continuous' }
      }
    }

    return baseConstraints
  }

  /**
   * Get minimal fallback constraints
   */
  getMinimalConstraints(): MediaStreamConstraints {
    return {
      video: {
        width: { ideal: 320, max: 640 },
        height: { ideal: 240, max: 480 },
        facingMode: { ideal: 'environment' }
      }
    }
  }

  /**
   * Start camera with optimal settings
   */
  async startCamera(): Promise<MediaStream> {
    return measurePerformance('Camera Start', async () => {
      // Stop any existing camera first
      await this.stopCamera()

      try {
        const constraints = {
          video: this.getOptimalConstraints()
        }

        debugLog('Requesting camera access with optimal constraints', constraints)
        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        // Register for cleanup
        this.activeStreamId = resourceManager.registerMediaStream(stream, 'primary_camera')

        debugLog(`Camera started successfully: ${stream.id}`)
        return stream

      } catch (error) {
        debugLog('Optimal constraints failed, trying minimal constraints')

        try {
          const stream = await navigator.mediaDevices.getUserMedia(this.getMinimalConstraints())
          this.activeStreamId = resourceManager.registerMediaStream(stream, 'fallback_camera')

          debugLog(`Camera started with fallback constraints: ${stream.id}`)
          return stream

        } catch (fallbackError) {
          const cameraError = this.createCameraError(fallbackError as Error)
          logError(fallbackError as Error, 'Camera start failed')
          throw cameraError
        }
      }
    })
  }

  /**
   * Stop the active camera
   */
  async stopCamera(): Promise<void> {
    if (this.activeStreamId) {
      const success = resourceManager.cleanup(this.activeStreamId)
      if (success) {
        debugLog(`Stopped camera: ${this.activeStreamId}`)
      }
      this.activeStreamId = null
    }
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasCamera = devices.some(device => device.kind === 'videoinput')
      debugLog(`Camera availability check: ${hasCamera}`)
      return hasCamera
    } catch (error) {
      logError(error as Error, 'Camera availability check')
      return false
    }
  }

  /**
   * Get camera capabilities for advanced features
   */
  async getCameraCapabilities(stream: MediaStream): Promise<CameraCapabilities> {
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) {
      return {}
    }

    try {
      const capabilities = videoTrack.getCapabilities()
      debugLog('Camera capabilities', capabilities)

      return {
        torch: 'torch' in capabilities,
        focusMode: 'focusMode' in capabilities,
        exposureMode: 'exposureMode' in capabilities,
        zoom: 'zoom' in capabilities
      }
    } catch (error) {
      debugLog('Could not get camera capabilities', error)
      return {}
    }
  }

  /**
   * Optimize camera for barcode scanning
   */
  async optimizeForBarcodeScanning(stream: MediaStream): Promise<void> {
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      const constraints: any = {}

      // Enable torch if available (Android)
      const capabilities = await this.getCameraCapabilities(stream)

      if (capabilities.focusMode) {
        constraints.focusMode = 'continuous'
      }

      if (capabilities.exposureMode) {
        constraints.exposureMode = 'continuous'
      }

      if (Object.keys(constraints).length > 0) {
        await videoTrack.applyConstraints(constraints)
        debugLog('Applied camera optimizations', constraints)
      }
    } catch (error) {
      debugLog('Camera optimization failed (non-critical)', error)
    }
  }

  /**
   * Toggle torch/flash (if available)
   */
  async toggleTorch(stream: MediaStream, enabled: boolean): Promise<boolean> {
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return false

    try {
      // Try torch constraint (non-standard, supported by some browsers)
      await videoTrack.applyConstraints({
        advanced: [{ torch: enabled } as any]
      })
      debugLog(`Torch ${enabled ? 'enabled' : 'disabled'}`)
      return true
    } catch (error) {
      debugLog('Torch control not available', error)
      return false
    }
  }

  /**
   * Setup video element for iOS Safari compatibility
   */
  setupVideoElement(videoElement: HTMLVideoElement, stream: MediaStream): void {
    // iOS Safari specific requirements
    if (this.isIOS && this.isSafari) {
      videoElement.setAttribute('playsinline', 'true')
      videoElement.setAttribute('webkit-playsinline', 'true')
      videoElement.muted = true
      debugLog('Applied iOS Safari video element fixes')
    }

    // General setup
    videoElement.srcObject = stream
    videoElement.autoplay = true
    videoElement.playsInline = true

    // Handle load events
    const handleLoadedData = () => {
      debugLog('Video element loaded and ready')
      videoElement.removeEventListener('loadeddata', handleLoadedData)
    }

    videoElement.addEventListener('loadeddata', handleLoadedData)
  }

  /**
   * Wait for video to be ready for processing
   */
  async waitForVideoReady(videoElement: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      if (videoElement.readyState >= 2) {
        // HAVE_CURRENT_DATA or higher
        resolve()
      } else {
        const handleLoadedData = () => {
          videoElement.removeEventListener('loadeddata', handleLoadedData)
          resolve()
        }
        videoElement.addEventListener('loadeddata', handleLoadedData)
      }
    })
  }

  /**
   * Create user-friendly camera error
   */
  private createCameraError(error: Error): CameraError {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          name: 'NotAllowedError',
          message: 'Camera permission denied. Please enable camera access in your browser settings.',
          fallbackAvailable: true,
          userAction: 'Enable camera permission and refresh the page'
        }

      case 'NotFoundError':
        return {
          name: 'NotFoundError',
          message: 'No camera found on this device.',
          fallbackAvailable: true,
          userAction: 'You can upload a photo instead'
        }

      case 'NotReadableError':
        return {
          name: 'NotReadableError',
          message: 'Camera is being used by another application.',
          fallbackAvailable: false,
          userAction: 'Close other camera applications and try again'
        }

      case 'OverconstrainedError':
        return {
          name: 'OverconstrainedError',
          message: 'Camera does not support required features.',
          fallbackAvailable: true,
          userAction: 'Using basic camera mode'
        }

      case 'AbortError':
        return {
          name: 'AbortError',
          message: 'Camera access was interrupted.',
          fallbackAvailable: true,
          userAction: 'Please try again'
        }

      default:
        return {
          name: 'UnknownError',
          message: 'An unexpected camera error occurred.',
          fallbackAvailable: true,
          userAction: 'You can upload a photo instead'
        }
    }
  }

  /**
   * Get device-specific performance settings
   */
  getPerformanceSettings() {
    const isLowEnd = navigator.hardwareConcurrency <= 2

    return {
      scanInterval: this.isMobile && isLowEnd ? 800 : this.isMobile ? 600 : 400,
      maxConcurrentScans: isLowEnd ? 1 : 2,
      enableTorch: !this.isIOS, // iOS doesn't support torch API well
      enableZoom: !this.isMobile // Zoom on mobile can be confusing
    }
  }

  /**
   * Clean up all camera resources
   */
  async cleanup(): Promise<void> {
    await this.stopCamera()
    debugLog('Camera service cleanup completed')
  }
}

// Export singleton instance
export const cameraService = new CameraService()