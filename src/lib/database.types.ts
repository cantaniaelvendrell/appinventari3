Need to install the following packages:
supabase@2.15.8
Ok to proceed? (y) 

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
