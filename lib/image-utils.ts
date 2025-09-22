/**
 * Image processing and optimization utilities for Maestro
 */

import { config } from './config'
import { debugLog, measurePerformance } from './debug'
import CryptoJS from 'crypto-js'

export interface OptimizedImage {
  blob: Blob
  base64: string
  hash: string
  width: number
  height: number
  size: number
}

/**
 * Optimize image for API processing
 */
export async function optimizeImage(file: File): Promise<OptimizedImage> {
  return measurePerformance('Image Optimization', async () => {
    debugLog(`Optimizing image: ${file.name} (${file.size} bytes)`)

    // Validate file size
    if (file.size > config.maxFileSize) {
      throw new Error(`File size too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not create canvas context')
    }

    // Load image
    const img = await createImageFromFile(file)

    // Calculate new dimensions
    const { width, height } = calculateOptimalDimensions(
      img.width,
      img.height,
      config.maxImageSize
    )

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Draw and compress image
    ctx.drawImage(img, 0, 0, width, height)

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        },
        'image/jpeg',
        config.imageQuality
      )
    })

    // Convert to base64
    const base64 = await blobToBase64(blob)

    // Generate hash for caching
    const hash = generateImageHash(base64)

    debugLog(`Image optimized: ${width}x${height}, ${blob.size} bytes`)

    return {
      blob,
      base64,
      hash,
      width,
      height,
      size: blob.size
    }
  })
}

/**
 * Create image element from file
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio)
    }
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize
    }
  }
}

/**
 * Convert blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Generate SHA-256 hash for image caching
 */
function generateImageHash(base64: string): string {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '')
  return CryptoJS.SHA256(cleanBase64).toString()
}

/**
 * Strip EXIF data from image (privacy protection)
 */
export function stripExifData(canvas: HTMLCanvasElement): HTMLCanvasElement {
  // Canvas automatically strips EXIF data when drawing
  // This function is mainly for documentation purposes
  debugLog('EXIF data stripped from image')
  return canvas
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`
    }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are supported'
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions without loading the full image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}