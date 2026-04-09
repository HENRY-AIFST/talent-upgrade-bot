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
      ats_scores: {
        Row: {
          ats_score: number
          created_at: string
          experience_relevance: number
          file_name: string | null
          format_score: number
          id: string
          improvements: string[] | null
          keyword_match: number
          missing_keywords: string[] | null
          section_analysis: Json | null
          strengths: string[] | null
          summary: string | null
          target_role: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number
          created_at?: string
          experience_relevance?: number
          file_name?: string | null
          format_score?: number
          id?: string
          improvements?: string[] | null
          keyword_match?: number
          missing_keywords?: string[] | null
          section_analysis?: Json | null
          strengths?: string[] | null
          summary?: string | null
          target_role?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number
          created_at?: string
          experience_relevance?: number
          file_name?: string | null
          format_score?: number
          id?: string
          improvements?: string[] | null
          keyword_match?: number
          missing_keywords?: string[] | null
          section_analysis?: Json | null
          strengths?: string[] | null
          summary?: string | null
          target_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_sessions: {
        Row: {
          client_id: string
          company_name: string | null
          created_at: string
          denial_reason: string | null
          duration_minutes: number
          id: string
          meet_link: string | null
          mentor_id: string
          mentor_notes: string | null
          requested_date: string
          requested_time: string
          status: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          company_name?: string | null
          created_at?: string
          denial_reason?: string | null
          duration_minutes?: number
          id?: string
          meet_link?: string | null
          mentor_id: string
          mentor_notes?: string | null
          requested_date: string
          requested_time: string
          status?: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_name?: string | null
          created_at?: string
          denial_reason?: string | null
          duration_minutes?: number
          id?: string
          meet_link?: string | null
          mentor_id?: string
          mentor_notes?: string | null
          requested_date?: string
          requested_time?: string
          status?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_companies: {
        Row: {
          client_id: string
          company_name: string
          created_at: string
          id: string
          priority: number
          target_role: string | null
        }
        Insert: {
          client_id: string
          company_name: string
          created_at?: string
          id?: string
          priority?: number
          target_role?: string | null
        }
        Update: {
          client_id?: string
          company_name?: string
          created_at?: string
          id?: string
          priority?: number
          target_role?: string | null
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          day_number: number
          description: string | null
          id: string
          is_completed: boolean
          plan_id: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          day_number: number
          description?: string | null
          id?: string
          is_completed?: boolean
          plan_id: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          is_completed?: boolean
          plan_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "placement_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_recurring: boolean
          mentor_id: string
          specific_date: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_recurring?: boolean
          mentor_id: string
          specific_date?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_recurring?: boolean
          mentor_id?: string
          specific_date?: string | null
          start_time?: string
        }
        Relationships: []
      }
      mentor_students: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          student_id?: string
        }
        Relationships: []
      }
      mentor_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          mentor_id: string
          student_id: string
          title: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          mentor_id: string
          student_id: string
          title: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          mentor_id?: string
          student_id?: string
          title?: string
        }
        Relationships: []
      }
      mentor_profile_change_requests: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          note: string | null
          rejection_reason: string | null
          requested_company: string | null
          requested_display_name: string
          requested_tag: string
          requested_title: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          note?: string | null
          rejection_reason?: string | null
          requested_company?: string | null
          requested_display_name: string
          requested_tag: string
          requested_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          note?: string | null
          rejection_reason?: string | null
          requested_company?: string | null
          requested_display_name?: string
          requested_tag?: string
          requested_title?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          plan_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          plan_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          plan_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "placement_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_plans: {
        Row: {
          company_name: string
          created_at: string
          id: string
          plan: Json
          target_role: string
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          plan?: Json
          target_role: string
          total_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          plan?: Json
          target_role?: string
          total_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          current_skills: string[] | null
          display_name: string | null
          domain: string | null
          id: string
          meet_link: string | null
          one_word_description: string | null
          specializations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          current_skills?: string[] | null
          display_name?: string | null
          domain?: string | null
          id?: string
          meet_link?: string | null
          one_word_description?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          current_skills?: string[] | null
          display_name?: string | null
          domain?: string | null
          id?: string
          meet_link?: string | null
          one_word_description?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_analyses: {
        Row: {
          created_at: string
          id: string
          input_skills: string[] | null
          readiness_score: number
          result: Json
          resume_text: string | null
          target_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_skills?: string[] | null
          readiness_score?: number
          result: Json
          resume_text?: string | null
          target_role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_skills?: string[] | null
          readiness_score?: number
          result?: Json
          resume_text?: string | null
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_analyses: {
        Row: {
          created_at: string
          id: string
          result: Json
          share_id: string
          target_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          result: Json
          share_id?: string
          target_role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          result?: Json
          share_id?: string
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "mentor" | "student" | "client"
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
      app_role: ["mentor", "student", "client"],
    },
  },
} as const
