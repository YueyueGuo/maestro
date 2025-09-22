/**
 * Supabase client configuration for Maestro
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from './config'
import { debugLog, logError } from './debug'

// Types for our database tables
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          daily_calories: number | null
          daily_carbs: number | null
          daily_fat: number | null
          daily_protein: number | null
          daily_fiber: number | null
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_protein?: number | null
          daily_fiber?: number | null
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_protein?: number | null
          daily_fiber?: number | null
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          barcode: string | null
          source: string
          calories: number
          carbs: number
          fat: number
          protein: number
          fiber: number
          confidence: number | null
          image_hash: string | null
          verified: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          barcode?: string | null
          source: string
          calories: number
          carbs: number
          fat: number
          protein: number
          fiber: number
          confidence?: number | null
          image_hash?: string | null
          verified?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          barcode?: string | null
          source?: string
          calories?: number
          carbs?: number
          fat?: number
          protein?: number
          fiber?: number
          confidence?: number | null
          image_hash?: string | null
          verified?: boolean | null
          created_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          created_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          meal_id: string
          food_id: string
          quantity: number
          unit: string
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
          total_fiber: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_id: string
          quantity: number
          unit: string
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
          total_fiber: number
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_id?: string
          quantity?: number
          unit?: string
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_protein?: number
          total_fiber?: number
          created_at?: string
        }
      }
      analysis_cache: {
        Row: {
          id: string
          image_hash: string
          analysis: any
          source: string
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          image_hash: string
          analysis: any
          source: string
          confidence: number
          created_at?: string
        }
        Update: {
          id?: string
          image_hash?: string
          analysis?: any
          source?: string
          confidence?: number
          created_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export function createSupabaseClient() {
  debugLog('Creating Supabase browser client')

  return createBrowserClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey
  )
}

// Server-side Supabase client
export async function createSupabaseServerClient() {
  debugLog('Creating Supabase server client')

  const cookieStore = await cookies()

  return createServerClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, context?: string) {
  const contextText = context ? ` (${context})` : ''
  logError(new Error(`Supabase error${contextText}: ${error.message}`))

  // Return user-friendly error message
  if (error.code === 'PGRST301') {
    return 'Resource not found'
  } else if (error.code === '23505') {
    return 'This item already exists'
  } else if (error.code === '42501') {
    return 'Permission denied'
  } else {
    return 'An unexpected error occurred. Please try again.'
  }
}

// Environment variable validation
export function validateSupabaseConfig() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    const missingVars = []
    if (!config.supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!config.supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    throw new Error(
      `Missing required Supabase environment variables: ${missingVars.join(', ')}`
    )
  }

  debugLog('Supabase configuration validated successfully')
  return true
}

// Default export for convenience
export const supabase = createSupabaseClient()