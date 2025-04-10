export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      booking: {
        Row: {
          booking_from: string | null
          booking_id: string
          booking_to: string | null
          created_at: string
          listing_id: string
          user_id: string | null
        }
        Insert: {
          booking_from?: string | null
          booking_id?: string
          booking_to?: string | null
          created_at?: string
          listing_id?: string
          user_id?: string | null
        }
        Update: {
          booking_from?: string | null
          booking_id?: string
          booking_to?: string | null
          created_at?: string
          listing_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "booking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_messages: {
        Row: {
          complaint_id: string | null
          created_at: string
          message: string | null
          message_id: string
          user_id: string | null
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string
          message?: string | null
          message_id?: string
          user_id?: string | null
        }
        Update: {
          complaint_id?: string | null
          created_at?: string
          message?: string | null
          message_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_messages_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["complaint_id"]
          },
          {
            foreignKeyName: "complaint_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          complaint_id: string
          created_at: string
          listing_id: string
          status: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          complaint_id?: string
          created_at?: string
          listing_id?: string
          status?: string | null
          title?: string | null
          user_id?: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          listing_id?: string
          status?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          listing_id: string
          user_id: string
        }
        Insert: {
          listing_id: string
          user_id: string
        }
        Update: {
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "favourites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_availability: {
        Row: {
          available_from: string | null
          available_to: string | null
          id: string
          listing_id: string
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          id?: string
          listing_id: string
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          listing_id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          listing_id?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          listing_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listings: {
        Row: {
          area: string
          area_code: string
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string
          is_verified: string
          listing_id: string
          price: number
          reviewer: string | null
          title: string
          user_id: string
        }
        Insert: {
          area: string
          area_code: string
          bathrooms: number
          bedrooms: number
          city: string
          created_at?: string
          description: string
          is_verified?: string
          listing_id?: string
          price: number
          reviewer?: string | null
          title: string
          user_id?: string
        }
        Update: {
          area?: string
          area_code?: string
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string
          description?: string
          is_verified?: string
          listing_id?: string
          price?: number
          reviewer?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          id_number: number
          is_verified: boolean
          mobile_number: number | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          id_number: number
          is_verified?: boolean
          mobile_number?: number | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          id_number?: number
          is_verified?: boolean
          mobile_number?: number | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      unique_reviewers: {
        Row: {
          reviewer: string | null
        }
        Relationships: []
      }
      view_latest_complaint_messages: {
        Row: {
          complaint_id: string | null
          last_message_created_at: string | null
          message: string | null
          role: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_messages_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["complaint_id"]
          },
          {
            foreignKeyName: "complaint_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
