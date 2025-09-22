/**
 * Resource Manager for PWA Memory Management
 * Handles cleanup of MediaStreams and ZXing scanners to prevent memory leaks
 */

import { debugLog, logError } from './debug'

export interface ManagedResource {
  id: string
  type: 'mediaStream' | 'scanner' | 'timeout'
  resource: any
  cleanup: () => void
}

export class ResourceManager {
  private resources = new Map<string, ManagedResource>()
  private isCleanupScheduled = false

  /**
   * Register a MediaStream for automatic cleanup
   */
  registerMediaStream(stream: MediaStream, id?: string): string {
    const resourceId = id || `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const managedResource: ManagedResource = {
      id: resourceId,
      type: 'mediaStream',
      resource: stream,
      cleanup: () => {
        try {
          stream.getTracks().forEach(track => {
            track.stop()
            debugLog(`Stopped track: ${track.kind}`)
          })
        } catch (error) {
          logError(error as Error, `Cleanup MediaStream ${resourceId}`)
        }
      }
    }

    this.resources.set(resourceId, managedResource)
    debugLog(`Registered MediaStream: ${resourceId}`)
    this.scheduleCleanupOnUnload()

    return resourceId
  }

  /**
   * Register a ZXing BrowserMultiFormatReader for cleanup
   */
  registerScanner(scanner: any, id?: string): string {
    const resourceId = id || `scanner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const managedResource: ManagedResource = {
      id: resourceId,
      type: 'scanner',
      resource: scanner,
      cleanup: () => {
        try {
          if (scanner && typeof scanner.reset === 'function') {
            scanner.reset()
            debugLog(`Reset scanner: ${resourceId}`)
          }
        } catch (error) {
          logError(error as Error, `Cleanup Scanner ${resourceId}`)
        }
      }
    }

    this.resources.set(resourceId, managedResource)
    debugLog(`Registered Scanner: ${resourceId}`)
    this.scheduleCleanupOnUnload()

    return resourceId
  }

  /**
   * Register a timeout for cleanup
   */
  registerTimeout(timeoutId: NodeJS.Timeout, id?: string): string {
    const resourceId = id || `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const managedResource: ManagedResource = {
      id: resourceId,
      type: 'timeout',
      resource: timeoutId,
      cleanup: () => {
        try {
          clearTimeout(timeoutId)
          debugLog(`Cleared timeout: ${resourceId}`)
        } catch (error) {
          logError(error as Error, `Cleanup Timeout ${resourceId}`)
        }
      }
    }

    this.resources.set(resourceId, managedResource)

    return resourceId
  }

  /**
   * Clean up a specific resource by ID
   */
  cleanup(resourceId: string): boolean {
    const resource = this.resources.get(resourceId)
    if (!resource) {
      debugLog(`Resource not found for cleanup: ${resourceId}`)
      return false
    }

    try {
      resource.cleanup()
      this.resources.delete(resourceId)
      debugLog(`Cleaned up resource: ${resourceId}`)
      return true
    } catch (error) {
      logError(error as Error, `Failed to cleanup resource ${resourceId}`)
      return false
    }
  }

  /**
   * Clean up all resources of a specific type
   */
  cleanupByType(type: ManagedResource['type']): number {
    let cleanedCount = 0

    for (const [id, resource] of this.resources) {
      if (resource.type === type) {
        if (this.cleanup(id)) {
          cleanedCount++
        }
      }
    }

    debugLog(`Cleaned up ${cleanedCount} resources of type: ${type}`)
    return cleanedCount
  }

  /**
   * Clean up all managed resources
   */
  cleanupAll(): number {
    const totalResources = this.resources.size

    for (const [id] of this.resources) {
      this.cleanup(id)
    }

    debugLog(`Cleaned up ${totalResources} total resources`)
    return totalResources
  }

  /**
   * Get count of active resources by type
   */
  getResourceCount(type?: ManagedResource['type']): number {
    if (!type) {
      return this.resources.size
    }

    return Array.from(this.resources.values())
      .filter(resource => resource.type === type).length
  }

  /**
   * Get all active resource IDs
   */
  getActiveResources(): string[] {
    return Array.from(this.resources.keys())
  }

  /**
   * Schedule cleanup on page unload (only once)
   */
  private scheduleCleanupOnUnload(): void {
    if (this.isCleanupScheduled) return

    // Handle page unload
    const handleBeforeUnload = () => {
      debugLog('Page unloading - cleaning up all resources')
      this.cleanupAll()
    }

    // Handle page visibility change (mobile app backgrounding)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        debugLog('Page hidden - cleaning up camera resources')
        this.cleanupByType('mediaStream')
      }
    }

    // Handle PWA lifecycle
    const handleFreeze = () => {
      debugLog('Page frozen - cleaning up all resources')
      this.cleanupAll()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('freeze', handleFreeze)

    this.isCleanupScheduled = true
    debugLog('Scheduled cleanup handlers for page lifecycle events')
  }
}

// Global instance for the application
export const resourceManager = new ResourceManager()

// Export convenience functions
export const registerMediaStream = (stream: MediaStream, id?: string) =>
  resourceManager.registerMediaStream(stream, id)

export const registerScanner = (scanner: any, id?: string) =>
  resourceManager.registerScanner(scanner, id)

export const registerTimeout = (timeoutId: NodeJS.Timeout, id?: string) =>
  resourceManager.registerTimeout(timeoutId, id)

export const cleanupResource = (resourceId: string) =>
  resourceManager.cleanup(resourceId)

export const cleanupAllResources = () =>
  resourceManager.cleanupAll()