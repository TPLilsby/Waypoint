/**
 * Hand-written mirror of the Supabase schema defined in
 * `supabase/migrations/20260803215332_initial_schema.sql`.
 *
 * Once the project is linked to a real Supabase instance, regenerate this
 * file from the source of truth instead of editing it by hand:
 *
 *   npx supabase gen types typescript --local > src/types/database.ts
 */

export type PlaceType = 'country' | 'us_state' | 'national_park' | 'unesco_site'
export type PlaceStatus = 'visited' | 'want_to_visit'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          slug: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          slug: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          slug?: string
          is_public?: boolean
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          start_date: string | null
          end_date: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          start_date?: string | null
          end_date?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          start_date?: string | null
          end_date?: string | null
          note?: string | null
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          type: PlaceType
          ref_code: string
          name: string
          lat: number | null
          lng: number | null
          status: PlaceStatus
          visited_date: string | null
          note: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          type: PlaceType
          ref_code: string
          name: string
          lat?: number | null
          lng?: number | null
          status?: PlaceStatus
          visited_date?: string | null
          note?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          type?: PlaceType
          ref_code?: string
          name?: string
          lat?: number | null
          lng?: number | null
          status?: PlaceStatus
          visited_date?: string | null
          note?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
    }
    Enums: {
      place_type: PlaceType
      place_status: PlaceStatus
    }
  }
}
