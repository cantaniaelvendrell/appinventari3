import { createBrowserClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        if (typeof window === 'undefined') return undefined
        const cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : undefined
      },
      set(name: string, value: string, options: CookieOptions) {
        if (typeof window === 'undefined') return
        document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 31536000}; domain=${options.domain || window.location.hostname}; samesite=${options.sameSite || 'Strict'}; ${options.secure ? 'secure;' : ''}`
      },
      remove(name: string, options: CookieOptions) {
        if (typeof window === 'undefined') return
        document.cookie = `${name}=; path=${options.path || '/'}; max-age=0; domain=${options.domain || window.location.hostname}; samesite=${options.sameSite || 'Strict'}; ${options.secure ? 'secure;' : ''}`
      }
    }
  }
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      subfamilies: {
        Row: {
          id: string
          name: string
          family_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          family_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          family_id?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          model: string
          family_id: string
          subfamily_id: string
          usage: 'internal' | 'external'
          image_url: string | null
          observations: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          model: string
          family_id: string
          subfamily_id: string
          usage: 'internal' | 'external'
          image_url?: string | null
          observations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          model?: string
          family_id?: string
          subfamily_id?: string
          usage?: 'internal' | 'external'
          image_url?: string | null
          observations?: string | null
          created_at?: string
        }
      }
      item_locations: {
        Row: {
          id: string
          item_id: string
          location_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          location_id: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          location_id?: string
          quantity?: number
          created_at?: string
        }
      }
    }
  }
} 