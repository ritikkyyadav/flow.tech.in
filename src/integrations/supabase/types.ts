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
      ai_requests: {
        Row: {
          cost: number
          created_at: string
          duration: number
          id: string
          model: string
          provider: string
          status: string
          tokens: number
          user_id: string | null
        }
        Insert: {
          cost?: number
          created_at?: string
          duration?: number
          id?: string
          model: string
          provider: string
          status?: string
          tokens?: number
          user_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          duration?: number
          id?: string
          model?: string
          provider?: string
          status?: string
          tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_alerts: {
        Row: {
          alert_type: string
          budget_id: string
          created_at: string
          id: string
          is_sent: boolean
          sent_at: string | null
          threshold_percentage: number
          user_id: string
        }
        Insert: {
          alert_type: string
          budget_id: string
          created_at?: string
          id?: string
          is_sent?: boolean
          sent_at?: string | null
          threshold_percentage: number
          user_id: string
        }
        Update: {
          alert_type?: string
          budget_id?: string
          created_at?: string
          id?: string
          is_sent?: boolean
          sent_at?: string | null
          threshold_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_history: {
        Row: {
          budget_id: string
          change_reason: string | null
          changed_by: string
          created_at: string
          id: string
          new_amount: number
          old_amount: number | null
        }
        Insert: {
          budget_id: string
          change_reason?: string | null
          changed_by: string
          created_at?: string
          id?: string
          new_amount: number
          old_amount?: number | null
        }
        Update: {
          budget_id?: string
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          new_amount?: number
          old_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_history_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          period: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          period?: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          period?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_address: string | null
          business_registration_number: string | null
          business_type: string | null
          company_name: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          pincode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          pincode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_registration_number?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          pincode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          spending_limit: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          spending_limit?: number | null
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          spending_limit?: number | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          tax_rate: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate?: number
          tax_rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          tax_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_terms: string | null
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_terms?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_terms?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          bill_reminders: boolean
          budget_alerts: boolean
          created_at: string
          email_notifications: boolean
          id: string
          push_notifications: boolean
          transaction_alerts: boolean
          unusual_spending: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_reminders?: boolean
          budget_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          transaction_alerts?: boolean
          unusual_spending?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_reminders?: boolean
          budget_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          transaction_alerts?: boolean
          unusual_spending?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          auto_dismiss: boolean
          created_at: string
          dismiss_after_seconds: number | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          auto_dismiss?: boolean
          created_at?: string
          dismiss_after_seconds?: number | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          auto_dismiss?: boolean
          created_at?: string
          dismiss_after_seconds?: number | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_address: string | null
          business_type: string | null
          company_name: string | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          date_of_birth: string | null
          email_notifications: boolean | null
          full_name: string | null
          gender: string | null
          gst_number: string | null
          id: string
          is_email_verified: boolean | null
          is_phone_verified: boolean | null
          language: string | null
          phone: string | null
          profile_picture_url: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          date_of_birth?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          gender?: string | null
          gst_number?: string | null
          id: string
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          language?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          date_of_birth?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          gender?: string | null
          gst_number?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          language?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transaction_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_attachments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          is_business_related: boolean | null
          is_recurring: boolean | null
          is_reimbursable: boolean | null
          is_tax_exempt: boolean | null
          location: string | null
          parent_transaction_id: string | null
          payment_method: string | null
          recurring_end_date: string | null
          recurring_frequency: string | null
          recurring_occurrences: number | null
          reference_number: string | null
          source_client: string | null
          subcategory: string | null
          tax_rate: number | null
          tds_amount: number | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
          vendor_merchant: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_business_related?: boolean | null
          is_recurring?: boolean | null
          is_reimbursable?: boolean | null
          is_tax_exempt?: boolean | null
          location?: string | null
          parent_transaction_id?: string | null
          payment_method?: string | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_occurrences?: number | null
          reference_number?: string | null
          source_client?: string | null
          subcategory?: string | null
          tax_rate?: number | null
          tds_amount?: number | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
          vendor_merchant?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_business_related?: boolean | null
          is_recurring?: boolean | null
          is_reimbursable?: boolean | null
          is_tax_exempt?: boolean | null
          location?: string | null
          parent_transaction_id?: string | null
          payment_method?: string | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_occurrences?: number | null
          reference_number?: string | null
          source_client?: string | null
          subcategory?: string | null
          tax_rate?: number | null
          tds_amount?: number | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
          vendor_merchant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          currency: string | null
          date_format: string | null
          id: string
          language: string | null
          number_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          number_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          number_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          location: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
