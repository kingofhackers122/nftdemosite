export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      nfts: {
        Row: {
          category_id: string | null
          collection_name: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string
          like_count: number
          name: string
          owner_id: string
          price_eth: number | null
          sold_at: string | null
          status: Database["public"]["Enums"]["nft_status"]
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id?: string | null
          collection_name?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url: string
          like_count?: number
          name: string
          owner_id: string
          price_eth?: number | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["nft_status"]
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string | null
          collection_name?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string
          like_count?: number
          name?: string
          owner_id?: string
          price_eth?: number | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["nft_status"]
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "nfts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance_eth: number
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_banned: boolean
          is_verified: boolean
          updated_at: string
          username: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance_eth?: number
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_banned?: boolean
          is_verified?: boolean
          updated_at?: string
          username: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance_eth?: number
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_banned?: boolean
          is_verified?: boolean
          updated_at?: string
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          deposit_wallet_address: string | null
          id: number
          min_withdrawal_eth: number
          nowpayments_enabled: boolean
          payment_mode: string
          platform_fee_percent: number
          site_email: string | null
          site_name: string
          updated_at: string
        }
        Insert: {
          deposit_wallet_address?: string | null
          id?: number
          min_withdrawal_eth?: number
          nowpayments_enabled?: boolean
          payment_mode?: string
          platform_fee_percent?: number
          site_email?: string | null
          site_name?: string
          updated_at?: string
        }
        Update: {
          deposit_wallet_address?: string | null
          id?: number
          min_withdrawal_eth?: number
          nowpayments_enabled?: boolean
          payment_mode?: string
          platform_fee_percent?: number
          site_email?: string | null
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_eth: number
          counterparty_id: string | null
          created_at: string
          id: string
          nft_id: string | null
          notes: string | null
          payment_provider: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["tx_status"]
          tx_hash: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_eth: number
          counterparty_id?: string | null
          created_at?: string
          id?: string
          nft_id?: string | null
          notes?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          tx_hash?: string | null
          type: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_eth?: number
          counterparty_id?: string | null
          created_at?: string
          id?: string
          nft_id?: string | null
          notes?: string | null
          payment_provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          tx_hash?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      nft_status: "draft" | "on_sale" | "sold" | "unlisted"
      tx_status: "pending" | "confirmed" | "failed" | "cancelled"
      tx_type: "deposit" | "withdrawal" | "purchase" | "sale" | "fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      nft_status: ["draft", "on_sale", "sold", "unlisted"],
      tx_status: ["pending", "confirmed", "failed", "cancelled"],
      tx_type: ["deposit", "withdrawal", "purchase", "sale", "fee"],
    },
  },
} as const
