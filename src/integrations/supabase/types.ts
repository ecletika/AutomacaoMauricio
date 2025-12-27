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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          credentials: Json | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          name: string
          status: Database["public"]["Enums"]["integration_status"]
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          credentials?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          status?: Database["public"]["Enums"]["integration_status"]
          type: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          credentials?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          status?: Database["public"]["Enums"]["integration_status"]
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          business_context: string | null
          created_at: string
          escalation_keywords: string[] | null
          id: string
          is_bot_active: boolean
          updated_at: string
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          business_context?: string | null
          created_at?: string
          escalation_keywords?: string[] | null
          id?: string
          is_bot_active?: boolean
          updated_at?: string
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          business_context?: string | null
          created_at?: string
          escalation_keywords?: string[] | null
          id?: string
          is_bot_active?: boolean
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          assigned_agent_id: string | null
          context: Json | null
          created_at: string
          current_intent: Database["public"]["Enums"]["detected_intent"] | null
          customer_name: string | null
          id: string
          last_message_at: string | null
          phone_number: string
          status: Database["public"]["Enums"]["conversation_status"]
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          context?: Json | null
          created_at?: string
          current_intent?: Database["public"]["Enums"]["detected_intent"] | null
          customer_name?: string | null
          id?: string
          last_message_at?: string | null
          phone_number: string
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          context?: Json | null
          created_at?: string
          current_intent?: Database["public"]["Enums"]["detected_intent"] | null
          customer_name?: string | null
          id?: string
          last_message_at?: string | null
          phone_number?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          intent: Database["public"]["Enums"]["detected_intent"] | null
          metadata: Json | null
          sender: Database["public"]["Enums"]["message_sender"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["detected_intent"] | null
          metadata?: Json | null
          sender: Database["public"]["Enums"]["message_sender"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["detected_intent"] | null
          metadata?: Json | null
          sender?: Database["public"]["Enums"]["message_sender"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_logs: {
        Row: {
          error_message: string | null
          executed_at: string
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status: string
          user_id: string
          workflow_id: string
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          action_config: Json | null
          action_integration_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          run_count: number
          trigger_config: Json | null
          trigger_integration_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json | null
          action_integration_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          trigger_config?: Json | null
          trigger_integration_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json | null
          action_integration_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          trigger_config?: Json | null
          trigger_integration_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_action_integration_id_fkey"
            columns: ["action_integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_trigger_integration_id_fkey"
            columns: ["trigger_integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conversation_status: "active" | "waiting_human" | "with_human" | "closed"
      detected_intent:
        | "greeting"
        | "support"
        | "financial"
        | "sales"
        | "human_request"
        | "unknown"
        | "farewell"
      integration_status: "active" | "inactive" | "error" | "pending"
      integration_type:
        | "webhook"
        | "telegram"
        | "gmail"
        | "google_calendar"
        | "github"
        | "whatsapp"
        | "zoho"
        | "microsoft365"
        | "aws"
        | "postgresql"
      message_sender: "user" | "bot" | "agent"
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
      conversation_status: ["active", "waiting_human", "with_human", "closed"],
      detected_intent: [
        "greeting",
        "support",
        "financial",
        "sales",
        "human_request",
        "unknown",
        "farewell",
      ],
      integration_status: ["active", "inactive", "error", "pending"],
      integration_type: [
        "webhook",
        "telegram",
        "gmail",
        "google_calendar",
        "github",
        "whatsapp",
        "zoho",
        "microsoft365",
        "aws",
        "postgresql",
      ],
      message_sender: ["user", "bot", "agent"],
    },
  },
} as const
