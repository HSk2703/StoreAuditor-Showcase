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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      _app_secrets: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entry_hash: string | null
          id: string
          metadata: Json | null
          prev_hash: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entry_hash?: string | null
          id?: string
          metadata?: Json | null
          prev_hash?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entry_hash?: string | null
          id?: string
          metadata?: Json | null
          prev_hash?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          address: string | null
          agency_name: string
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string
          employees_count: string | null
          extra_seats: number
          id: string
          logo_url: string | null
          owner_user_id: string
          phone: string | null
          seats_purchased: number
          services: string[] | null
          subscription_active: boolean
          subscription_plan: string
          subscription_status: string
          timezone: string | null
          updated_at: string
          website: string | null
          years_in_business: string | null
        }
        Insert: {
          address?: string | null
          agency_name: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email: string
          employees_count?: string | null
          extra_seats?: number
          id?: string
          logo_url?: string | null
          owner_user_id: string
          phone?: string | null
          seats_purchased?: number
          services?: string[] | null
          subscription_active?: boolean
          subscription_plan?: string
          subscription_status?: string
          timezone?: string | null
          updated_at?: string
          website?: string | null
          years_in_business?: string | null
        }
        Update: {
          address?: string | null
          agency_name?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string
          employees_count?: string | null
          extra_seats?: number
          id?: string
          logo_url?: string | null
          owner_user_id?: string
          phone?: string | null
          seats_purchased?: number
          services?: string[] | null
          subscription_active?: boolean
          subscription_plan?: string
          subscription_status?: string
          timezone?: string | null
          updated_at?: string
          website?: string | null
          years_in_business?: string | null
        }
        Relationships: []
      }
      agency_branding: {
        Row: {
          company_name: string | null
          contact_email: string | null
          created_at: string
          footer_text: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      agency_personnel: {
        Row: {
          agency_id: string
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string
          role_title: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name: string
          role_title?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          role_title?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_personnel_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_actions: {
        Row: {
          action_type: string
          agency_id: string | null
          ai_reasoning: string | null
          created_at: string
          credits_cost: number
          error_message: string | null
          executed_at: string | null
          id: string
          outcome_metrics: Json | null
          outcome_recorded_at: string | null
          payload_after: Json | null
          payload_before: Json | null
          result_summary: string | null
          rolled_back_at: string | null
          status: string
          store_id: string
          target_resource_id: string | null
          target_resource_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string
          agency_id?: string | null
          ai_reasoning?: string | null
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          executed_at?: string | null
          id?: string
          outcome_metrics?: Json | null
          outcome_recorded_at?: string | null
          payload_after?: Json | null
          payload_before?: Json | null
          result_summary?: string | null
          rolled_back_at?: string | null
          status?: string
          store_id: string
          target_resource_id?: string | null
          target_resource_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          agency_id?: string | null
          ai_reasoning?: string | null
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          executed_at?: string | null
          id?: string
          outcome_metrics?: Json | null
          outcome_recorded_at?: string | null
          payload_after?: Json | null
          payload_before?: Json | null
          result_summary?: string | null
          rolled_back_at?: string | null
          status?: string
          store_id?: string
          target_resource_id?: string | null
          target_resource_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_actions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_actions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_consent_log: {
        Row: {
          created_at: string
          id: string
          intent: string
          policy_version: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          intent: string
          policy_version?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          intent?: string
          policy_version?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_credit_purchases: {
        Row: {
          created_at: string
          credits_amount: number
          credits_remaining: number
          expires_at: string
          id: string
          price_cents: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_amount: number
          credits_remaining: number
          expires_at?: string
          id?: string
          price_cents: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_amount?: number
          credits_remaining?: number
          expires_at?: string
          id?: string
          price_cents?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_decision_events: {
        Row: {
          action_type: string
          confidence_weight: number
          created_at: string
          edited_content: string | null
          feature_name: string
          id: string
          metadata: Json | null
          original_content: string | null
          suggestion_id: string
          user_id: string
        }
        Insert: {
          action_type?: string
          confidence_weight?: number
          created_at?: string
          edited_content?: string | null
          feature_name: string
          id?: string
          metadata?: Json | null
          original_content?: string | null
          suggestion_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          confidence_weight?: number
          created_at?: string
          edited_content?: string | null
          feature_name?: string
          id?: string
          metadata?: Json | null
          original_content?: string | null
          suggestion_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          credits_limit: number
          credits_used: number
          id: string
          period_end: string
          period_start: string
          plan_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_limit?: number
          credits_used?: number
          id?: string
          period_end?: string
          period_start?: string
          plan_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_limit?: number
          credits_used?: number
          id?: string
          period_end?: string
          period_start?: string
          plan_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          created_at: string
          credits_cost: number
          feature_name: string
          id: string
          purchase_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_cost?: number
          feature_name: string
          id?: string
          purchase_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_cost?: number
          feature_name?: string
          id?: string
          purchase_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "ai_credit_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      app_secret_access_log: {
        Row: {
          caller: string | null
          id: string
          read_at: string
          secret_key: string
        }
        Insert: {
          caller?: string | null
          id?: string
          read_at?: string
          secret_key: string
        }
        Update: {
          caller?: string | null
          id?: string
          read_at?: string
          secret_key?: string
        }
        Relationships: []
      }
      billing_operations: {
        Row: {
          created_at: string
          id: string
          idempotency_key: string
          operation: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idempotency_key: string
          operation: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idempotency_key?: string
          operation?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body: Json
          category: string
          created_at: string
          created_by: string | null
          excerpt: string
          id: string
          is_published: boolean
          keywords: string[]
          meta_description: string
          published_at: string
          reading_minutes: number
          related: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt: string
          id?: string
          is_published?: boolean
          keywords?: string[]
          meta_description: string
          published_at?: string
          reading_minutes?: number
          related?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          id?: string
          is_published?: boolean
          keywords?: string[]
          meta_description?: string
          published_at?: string
          reading_minutes?: number
          related?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          agency_user_id: string
          client_email: string
          created_at: string
          id: string
          managed_store_id: string
          status: string
          token_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          agency_user_id: string
          client_email: string
          created_at?: string
          id?: string
          managed_store_id: string
          status?: string
          token_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          agency_user_id?: string
          client_email?: string
          created_at?: string
          id?: string
          managed_store_id?: string
          status?: string
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      client_store_access: {
        Row: {
          client_user_id: string
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          managed_store_id: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          managed_store_id: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          managed_store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_store_access_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analyses: {
        Row: {
          ai_insights: string | null
          competitor_audit_id: string
          competitor_url: string
          created_at: string
          id: string
          source_audit_id: string
          user_id: string | null
        }
        Insert: {
          ai_insights?: string | null
          competitor_audit_id: string
          competitor_url: string
          created_at?: string
          id?: string
          source_audit_id: string
          user_id?: string | null
        }
        Update: {
          ai_insights?: string | null
          competitor_audit_id?: string
          competitor_url?: string
          created_at?: string
          id?: string
          source_audit_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analyses_competitor_audit_id_fkey"
            columns: ["competitor_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_analyses_source_audit_id_fkey"
            columns: ["source_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      copilot_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      copilot_insights: {
        Row: {
          created_at: string
          description: string
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          severity: string | null
          source_data: Json | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          source_data?: Json | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          source_data?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      copilot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "copilot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_twin_runs: {
        Row: {
          agency_id: string | null
          ai_executive_summary: string | null
          baseline_aov: number | null
          baseline_conversion_rate: number | null
          baseline_monthly_revenue: number | null
          baseline_snapshot: Json | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          id: string
          impact_predictions: Json | null
          last_heartbeat_at: string | null
          predicted_aov: number | null
          predicted_conversion_rate: number | null
          predicted_monthly_revenue: number | null
          pricing_analysis: Json | null
          risk_assessment: Json | null
          scenario_config: Json | null
          scenario_type: string
          simulated_changes: Json | null
          status: string
          store_audit_id: string | null
          store_url: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          ai_executive_summary?: string | null
          baseline_aov?: number | null
          baseline_conversion_rate?: number | null
          baseline_monthly_revenue?: number | null
          baseline_snapshot?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          impact_predictions?: Json | null
          last_heartbeat_at?: string | null
          predicted_aov?: number | null
          predicted_conversion_rate?: number | null
          predicted_monthly_revenue?: number | null
          pricing_analysis?: Json | null
          risk_assessment?: Json | null
          scenario_config?: Json | null
          scenario_type?: string
          simulated_changes?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          ai_executive_summary?: string | null
          baseline_aov?: number | null
          baseline_conversion_rate?: number | null
          baseline_monthly_revenue?: number | null
          baseline_snapshot?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          impact_predictions?: Json | null
          last_heartbeat_at?: string | null
          predicted_aov?: number | null
          predicted_conversion_rate?: number | null
          predicted_monthly_revenue?: number | null
          pricing_analysis?: Json | null
          risk_assessment?: Json | null
          scenario_config?: Json | null
          scenario_type?: string
          simulated_changes?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_runs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_twin_runs_store_audit_id_fkey"
            columns: ["store_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      emotional_analysis_runs: {
        Row: {
          agency_id: string | null
          ai_summary: string | null
          analytics: Json | null
          completed_at: string | null
          created_at: string
          dynamic_adjustments: Json | null
          emotional_states: Json | null
          id: string
          last_heartbeat_at: string | null
          persuasion_score: number | null
          predicted_conversion_uplift: number | null
          status: string
          store_audit_id: string | null
          store_url: string
          user_id: string
          visitor_signals: Json | null
        }
        Insert: {
          agency_id?: string | null
          ai_summary?: string | null
          analytics?: Json | null
          completed_at?: string | null
          created_at?: string
          dynamic_adjustments?: Json | null
          emotional_states?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          persuasion_score?: number | null
          predicted_conversion_uplift?: number | null
          status?: string
          store_audit_id?: string | null
          store_url: string
          user_id: string
          visitor_signals?: Json | null
        }
        Update: {
          agency_id?: string | null
          ai_summary?: string | null
          analytics?: Json | null
          completed_at?: string | null
          created_at?: string
          dynamic_adjustments?: Json | null
          emotional_states?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          persuasion_score?: number | null
          predicted_conversion_uplift?: number | null
          status?: string
          store_audit_id?: string | null
          store_url?: string
          user_id?: string
          visitor_signals?: Json | null
        }
        Relationships: []
      }
      feature_usage_log: {
        Row: {
          agency_id: string | null
          created_at: string
          feature_name: string
          id: string
          metadata: Json | null
          subscription_plan: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          feature_name: string
          id?: string
          metadata?: Json | null
          subscription_plan: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          feature_name?: string
          id?: string
          metadata?: Json | null
          subscription_plan?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_log_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_profiles: {
        Row: {
          created_at: string
          cumulative_score: number | null
          design_preference: string | null
          id: string
          last_updated_at: string | null
          risk_level: string | null
          strategy_bias: string | null
          tone_preference: string | null
          top_features: string[] | null
          total_accepts: number | null
          total_edits: number | null
          total_ignores: number | null
          total_rejects: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cumulative_score?: number | null
          design_preference?: string | null
          id?: string
          last_updated_at?: string | null
          risk_level?: string | null
          strategy_bias?: string | null
          tone_preference?: string | null
          top_features?: string[] | null
          total_accepts?: number | null
          total_edits?: number | null
          total_ignores?: number | null
          total_rejects?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          cumulative_score?: number | null
          design_preference?: string | null
          id?: string
          last_updated_at?: string | null
          risk_level?: string | null
          strategy_bias?: string | null
          tone_preference?: string | null
          top_features?: string[] | null
          total_accepts?: number | null
          total_edits?: number | null
          total_ignores?: number | null
          total_rejects?: number | null
          user_id?: string
        }
        Relationships: []
      }
      free_trials: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          ip_address: string | null
          plan_name: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string
          id?: string
          ip_address?: string | null
          plan_name: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          ip_address?: string | null
          plan_name?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      function_errors: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string
          function_name: string
          id: string
          request_id: string | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          function_name: string
          id?: string
          request_id?: string | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          function_name?: string
          id?: string
          request_id?: string | null
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      function_timings: {
        Row: {
          created_at: string
          duration_ms: number
          function_name: string
          id: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          duration_ms: number
          function_name: string
          id?: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number
          function_name?: string
          id?: string
          status_code?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          insights: Json | null
          priority: string
          progress: number
          status: string
          strategy: Json | null
          target_value: string
          tasks: Json | null
          timeframe: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type?: string
          id?: string
          insights?: Json | null
          priority?: string
          progress?: number
          status?: string
          strategy?: Json | null
          target_value: string
          tasks?: Json | null
          timeframe?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          insights?: Json | null
          priority?: string
          progress?: number
          status?: string
          strategy?: Json | null
          target_value?: string
          tasks?: Json | null
          timeframe?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_scores: {
        Row: {
          achievements_unlocked: string[]
          conversion: number
          created_at: string
          id: string
          marketing: number
          missions_completed: number
          overall: number
          streak: number
          traffic: number
          updated_at: string
          user_id: string
          ux: number
          xp: number
        }
        Insert: {
          achievements_unlocked?: string[]
          conversion?: number
          created_at?: string
          id?: string
          marketing?: number
          missions_completed?: number
          overall?: number
          streak?: number
          traffic?: number
          updated_at?: string
          user_id: string
          ux?: number
          xp?: number
        }
        Update: {
          achievements_unlocked?: string[]
          conversion?: number
          created_at?: string
          id?: string
          marketing?: number
          missions_completed?: number
          overall?: number
          streak?: number
          traffic?: number
          updated_at?: string
          user_id?: string
          ux?: number
          xp?: number
        }
        Relationships: []
      }
      invite_audit_log: {
        Row: {
          action: string
          agency_id: string | null
          created_at: string
          id: string
          invite_id: string | null
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          agency_id?: string | null
          created_at?: string
          id?: string
          invite_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          agency_id?: string | null
          created_at?: string
          id?: string
          invite_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_audit_log_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_audit_log_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "team_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      kairo_actions: {
        Row: {
          action_name: string
          agency_id: string | null
          created_at: string
          error_message: string | null
          id: string
          idempotency_key: string | null
          input_payload: Json
          output_response: Json | null
          rollback_data: Json | null
          rolled_back_at: string | null
          status: string
          tool: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_name: string
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          input_payload?: Json
          output_response?: Json | null
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string
          tool: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_name?: string
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          input_payload?: Json
          output_response?: Json | null
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string
          tool?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kairo_execution_traces: {
        Row: {
          action: string
          action_id: string | null
          agency_id: string | null
          created_at: string
          credits_cost: number | null
          duration_ms: number | null
          error_message: string | null
          id: string
          request_id: string
          request_payload: Json
          response_payload: Json
          status: string
          user_id: string
        }
        Insert: {
          action: string
          action_id?: string | null
          agency_id?: string | null
          created_at?: string
          credits_cost?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          request_id: string
          request_payload?: Json
          response_payload?: Json
          status?: string
          user_id: string
        }
        Update: {
          action?: string
          action_id?: string | null
          agency_id?: string | null
          created_at?: string
          credits_cost?: number | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          request_id?: string
          request_payload?: Json
          response_payload?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      managed_stores: {
        Row: {
          agency_id: string | null
          auto_pilot_enabled: boolean
          client_name: string | null
          created_at: string
          id: string
          last_audit_date: string | null
          last_audit_id: string | null
          last_audit_score: number | null
          notes: string | null
          store_name: string
          store_url: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          auto_pilot_enabled?: boolean
          client_name?: string | null
          created_at?: string
          id?: string
          last_audit_date?: string | null
          last_audit_id?: string | null
          last_audit_score?: number | null
          notes?: string | null
          store_name: string
          store_url: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          auto_pilot_enabled?: boolean
          client_name?: string | null
          created_at?: string
          id?: string
          last_audit_date?: string | null
          last_audit_id?: string | null
          last_audit_score?: number | null
          notes?: string | null
          store_name?: string
          store_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managed_stores_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_stores_last_audit_id_fkey"
            columns: ["last_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          experience_level: string | null
          full_name: string
          google_analytics_id: string | null
          id: string
          is_reviewer: boolean
          meta_pixel_id: string | null
          phone: string | null
          profession: string | null
          purpose: string | null
          stores_managed: number | null
          subscription_plan: string
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          experience_level?: string | null
          full_name: string
          google_analytics_id?: string | null
          id?: string
          is_reviewer?: boolean
          meta_pixel_id?: string | null
          phone?: string | null
          profession?: string | null
          purpose?: string | null
          stores_managed?: number | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string
          google_analytics_id?: string | null
          id?: string
          is_reviewer?: boolean
          meta_pixel_id?: string | null
          phone?: string | null
          profession?: string | null
          purpose?: string | null
          stores_managed?: number | null
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          updated_at: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      revenue_engine_runs: {
        Row: {
          agency_id: string | null
          ai_strategy_summary: string | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          current_monthly_revenue: number | null
          detected_issues: Json | null
          experiments: Json | null
          id: string
          last_heartbeat_at: string | null
          predicted_monthly_revenue: number | null
          predicted_revenue_uplift: number | null
          prioritized_actions: Json | null
          status: string
          store_audit_id: string | null
          store_url: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          ai_strategy_summary?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          current_monthly_revenue?: number | null
          detected_issues?: Json | null
          experiments?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          predicted_monthly_revenue?: number | null
          predicted_revenue_uplift?: number | null
          prioritized_actions?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          ai_strategy_summary?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          current_monthly_revenue?: number | null
          detected_issues?: Json | null
          experiments?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          predicted_monthly_revenue?: number | null
          predicted_revenue_uplift?: number | null
          prioritized_actions?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_engine_runs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_engine_runs_store_audit_id_fkey"
            columns: ["store_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      service_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          issue_type: string
          name: string
          revenue_range: string
          store_url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          issue_type: string
          name: string
          revenue_range: string
          store_url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          issue_type?: string
          name?: string
          revenue_range?: string
          store_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      simulation_runs: {
        Row: {
          agency_id: string | null
          ai_summary: string | null
          completed_at: string | null
          created_at: string
          drop_off_points: Json | null
          heatmap_data: Json | null
          id: string
          last_heartbeat_at: string | null
          persona_count: number
          predicted_conversion_rate: number | null
          predicted_revenue: number | null
          results: Json | null
          simulated_journeys: Json | null
          simulation_config: Json | null
          status: string
          store_audit_id: string | null
          store_url: string
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          ai_summary?: string | null
          completed_at?: string | null
          created_at?: string
          drop_off_points?: Json | null
          heatmap_data?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          persona_count?: number
          predicted_conversion_rate?: number | null
          predicted_revenue?: number | null
          results?: Json | null
          simulated_journeys?: Json | null
          simulation_config?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url: string
          user_id: string
        }
        Update: {
          agency_id?: string | null
          ai_summary?: string | null
          completed_at?: string | null
          created_at?: string
          drop_off_points?: Json | null
          heatmap_data?: Json | null
          id?: string
          last_heartbeat_at?: string | null
          persona_count?: number
          predicted_conversion_rate?: number | null
          predicted_revenue?: number | null
          results?: Json | null
          simulated_journeys?: Json | null
          simulation_config?: Json | null
          status?: string
          store_audit_id?: string | null
          store_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_runs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_runs_store_audit_id_fkey"
            columns: ["store_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          platform: string
          post_type: string
          published_at: string | null
          recurring: boolean
          scheduled_date: string
          scheduled_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          platform?: string
          post_type?: string
          published_at?: string | null
          recurring?: boolean
          scheduled_date: string
          scheduled_time?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          platform?: string
          post_type?: string
          published_at?: string | null
          recurring?: boolean
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          managed_store_id: string
          message: string
          severity: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          managed_store_id: string
          message: string
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          managed_store_id?: string
          message?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_alerts_managed_store_id_fkey_cascade"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_audits: {
        Row: {
          created_at: string
          homepage_score: number | null
          id: string
          issues: Json | null
          mobile_score: number | null
          overall_score: number | null
          product_page_score: number | null
          raw_analysis: Json | null
          recommendations: Json | null
          seo_score: number | null
          status: string
          store_url: string
          trust_score: number | null
        }
        Insert: {
          created_at?: string
          homepage_score?: number | null
          id?: string
          issues?: Json | null
          mobile_score?: number | null
          overall_score?: number | null
          product_page_score?: number | null
          raw_analysis?: Json | null
          recommendations?: Json | null
          seo_score?: number | null
          status?: string
          store_url: string
          trust_score?: number | null
        }
        Update: {
          created_at?: string
          homepage_score?: number | null
          id?: string
          issues?: Json | null
          mobile_score?: number | null
          overall_score?: number | null
          product_page_score?: number | null
          raw_analysis?: Json | null
          recommendations?: Json | null
          seo_score?: number | null
          status?: string
          store_url?: string
          trust_score?: number | null
        }
        Relationships: []
      }
      store_credentials: {
        Row: {
          connected_at: string
          created_at: string
          id: string
          managed_store_id: string
          shopify_access_token: string
          shopify_domain: string
          shopify_scopes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          created_at?: string
          id?: string
          managed_store_id: string
          shopify_access_token: string
          shopify_domain: string
          shopify_scopes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          created_at?: string
          id?: string
          managed_store_id?: string
          shopify_access_token?: string
          shopify_domain?: string
          shopify_scopes?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_credentials_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: true
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_monitoring: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          interval_days: number
          managed_store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_days?: number
          managed_store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          interval_days?: number
          managed_store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_monitoring_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: true
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_monitoring_history: {
        Row: {
          ai_insights: string | null
          audit_id: string | null
          conversion_score: number | null
          created_at: string
          id: string
          issues_detected: Json | null
          managed_store_id: string
          previous_score: number | null
          score_change: number | null
        }
        Insert: {
          ai_insights?: string | null
          audit_id?: string | null
          conversion_score?: number | null
          created_at?: string
          id?: string
          issues_detected?: Json | null
          managed_store_id: string
          previous_score?: number | null
          score_change?: number | null
        }
        Update: {
          ai_insights?: string | null
          audit_id?: string | null
          conversion_score?: number | null
          created_at?: string
          id?: string
          issues_detected?: Json | null
          managed_store_id?: string
          previous_score?: number | null
          score_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_monitoring_history_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_monitoring_history_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_monitoring_history_store_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_snapshots: {
        Row: {
          ai_analysis: string | null
          audit_id: string
          changes_detected: Json | null
          created_at: string
          id: string
          snapshot_data: Json
          store_url: string
          user_id: string | null
        }
        Insert: {
          ai_analysis?: string | null
          audit_id: string
          changes_detected?: Json | null
          created_at?: string
          id?: string
          snapshot_data?: Json
          store_url: string
          user_id?: string | null
        }
        Update: {
          ai_analysis?: string | null
          audit_id?: string
          changes_detected?: Json | null
          created_at?: string
          id?: string
          snapshot_data?: Json
          store_url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_snapshots_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_applications: {
        Row: {
          created_at: string
          id: string
          plan_selected: string
          status: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_selected: string
          status?: string
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_selected?: string
          status?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          agency_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          invited_user_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          agency_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          agency_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tasks: {
        Row: {
          assigned_to: string | null
          audit_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          managed_store_id: string
          priority: string
          source_issue: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          audit_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          managed_store_id: string
          priority?: string
          source_issue?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          audit_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          managed_store_id?: string
          priority?: string
          source_issue?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string | null
          account_name: string | null
          agency_id: string | null
          composio_connection_id: string | null
          connected_at: string | null
          created_at: string
          id: string
          last_refresh_error: string | null
          last_verified_at: string | null
          metadata: Json | null
          provider: string
          refresh_token: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name?: string | null
          agency_id?: string | null
          composio_connection_id?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          last_refresh_error?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string | null
          agency_id?: string | null
          composio_connection_id?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          last_refresh_error?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
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
      ux_optimization_runs: {
        Row: {
          agency_id: string | null
          best_variation_index: number | null
          comparison_summary: string | null
          completed_at: string | null
          created_at: string
          current_analysis: Json | null
          id: string
          predicted_overall_uplift: number | null
          status: string
          store_audit_id: string | null
          store_url: string
          user_id: string
          variations: Json | null
        }
        Insert: {
          agency_id?: string | null
          best_variation_index?: number | null
          comparison_summary?: string | null
          completed_at?: string | null
          created_at?: string
          current_analysis?: Json | null
          id?: string
          predicted_overall_uplift?: number | null
          status?: string
          store_audit_id?: string | null
          store_url: string
          user_id: string
          variations?: Json | null
        }
        Update: {
          agency_id?: string | null
          best_variation_index?: number | null
          comparison_summary?: string | null
          completed_at?: string | null
          created_at?: string
          current_analysis?: Json | null
          id?: string
          predicted_overall_uplift?: number | null
          status?: string
          store_audit_id?: string | null
          store_url?: string
          user_id?: string
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ux_optimization_runs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ux_optimization_runs_store_audit_id_fkey"
            columns: ["store_audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_report_settings: {
        Row: {
          created_at: string
          custom_message: string | null
          enabled: boolean
          id: string
          last_report_at: string | null
          managed_store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          enabled?: boolean
          id?: string
          last_report_at?: string | null
          managed_store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          enabled?: boolean
          id?: string
          last_report_at?: string | null
          managed_store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_report_settings_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: true
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          ai_summary: string | null
          audit_id: string | null
          conversion_score: number | null
          created_at: string
          custom_message: string | null
          id: string
          issues_detected: Json | null
          managed_store_id: string
          previous_score: number | null
          recommendations: Json | null
          report_period_end: string
          report_period_start: string | null
          score_change: number | null
        }
        Insert: {
          ai_summary?: string | null
          audit_id?: string | null
          conversion_score?: number | null
          created_at?: string
          custom_message?: string | null
          id?: string
          issues_detected?: Json | null
          managed_store_id: string
          previous_score?: number | null
          recommendations?: Json | null
          report_period_end?: string
          report_period_start?: string | null
          score_change?: number | null
        }
        Update: {
          ai_summary?: string | null
          audit_id?: string | null
          conversion_score?: number | null
          created_at?: string
          custom_message?: string | null
          id?: string
          issues_detected?: Json | null
          managed_store_id?: string
          previous_score?: number | null
          recommendations?: Json | null
          report_period_end?: string
          report_period_start?: string | null
          score_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "store_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_reports_managed_store_id_fkey"
            columns: ["managed_store_id"]
            isOneToOne: false
            referencedRelation: "managed_stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _get_app_secret: { Args: { p_key: string }; Returns: string }
      _invoke_edge_function: {
        Args: { p_body?: Json; p_function_name: string }
        Returns: number
      }
      accept_agency_invite: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      accept_client_invite: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      can_manage_agency_team: {
        Args: { p_agency_id: string; p_user_id: string }
        Returns: boolean
      }
      check_and_deduct_credits: {
        Args: {
          p_credits_cost: number
          p_feature_name: string
          p_user_id: string
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: Json
      }
      create_agency_invite: {
        Args: {
          p_agency_id: string
          p_email: string
          p_raw_token: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      get_agency_context: { Args: { p_user_id: string }; Returns: Json }
      get_agency_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          agency_id: string
          agency_name: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }[]
      }
      get_ai_usage_summary: { Args: { p_user_id: string }; Returns: Json }
      get_benchmark_stats: { Args: never; Returns: Json }
      get_client_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          agency_user_id: string
          client_email: string
          id: string
          managed_store_id: string
          status: string
          store_name: string
          store_url: string
        }[]
      }
      get_geo_analytics: { Args: never; Returns: Json }
      get_leaderboard_top20: {
        Args: never
        Returns: {
          rank: number
          score: number
          store_name: string
          streak: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_invite_token: { Args: { p_token: string }; Returns: string }
      is_agency_member: {
        Args: { p_agency_id: string; p_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: string
      }
      refund_credits: {
        Args: {
          p_credits_amount: number
          p_feature_name: string
          p_user_id: string
        }
        Returns: Json
      }
      remove_agency_member: { Args: { p_personnel_id: string }; Returns: Json }
      revoke_agency_invite: { Args: { p_invite_id: string }; Returns: Json }
      rotate_agency_invite_token: {
        Args: { p_invite_id: string; p_new_raw_token: string }
        Returns: Json
      }
      search_function_errors: {
        Args: {
          p_from?: string
          p_limit?: number
          p_query?: string
          p_to?: string
        }
        Returns: {
          context: Json | null
          created_at: string
          error_message: string
          function_name: string
          id: string
          request_id: string | null
          status_code: number | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "function_errors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      user_managed_agency_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      user_member_agency_ids: { Args: { p_user_id: string }; Returns: string[] }
      verify_audit_chain: { Args: { p_limit?: number }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "client_user"
        | "agency_owner"
        | "agency_admin"
        | "agency_member"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "client_user",
        "agency_owner",
        "agency_admin",
        "agency_member",
      ],
    },
  },
} as const
