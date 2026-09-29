
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "app_settings": {
                  Row: {
                    "default_cohort_retention_months": number,"id": number,"public_retention_months": number
                  }
                  Insert: {
                    "default_cohort_retention_months"?: number,"id"?: number,"public_retention_months"?: number
                  }
                  Update: {
                    "default_cohort_retention_months"?: number,"id"?: number,"public_retention_months"?: number
                  }
                  Relationships: [
                    
                  ]
                },"attempts": {
                  Row: {
                    "care_flag": boolean,"cohort_id": string,"completed_at": string,"duration_seconds": number,"form": Database["public"]['Enums']["form_kind"],"id": string,"item_bank_version": string,"locale": string,"pattern": string,"quality_flags": (string)[],"responses": NonNullable<Json>,"scores": NonNullable<Json>,"scoring_version": string,"seed": number,"self_score": number,"started_at": string,"top_exile": string,"top_protectors": (string)[],"user_id": string
                  }
                  Insert: {
                    "care_flag"?: boolean,"cohort_id": string,"completed_at"?: string,"duration_seconds": number,"form": Database["public"]['Enums']["form_kind"],"id"?: string,"item_bank_version": string,"locale": string,"pattern": string,"quality_flags"?: (string)[],"responses": NonNullable<Json>,"scores": NonNullable<Json>,"scoring_version": string,"seed": number,"self_score": number,"started_at": string,"top_exile": string,"top_protectors": (string)[],"user_id": string
                  }
                  Update: {
                    "care_flag"?: boolean,"cohort_id"?: string,"completed_at"?: string,"duration_seconds"?: number,"form"?: Database["public"]['Enums']["form_kind"],"id"?: string,"item_bank_version"?: string,"locale"?: string,"pattern"?: string,"quality_flags"?: (string)[],"responses"?: NonNullable<Json>,"scores"?: NonNullable<Json>,"scoring_version"?: string,"seed"?: number,"self_score"?: number,"started_at"?: string,"top_exile"?: string,"top_protectors"?: (string)[],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempts_cohort_id_fkey"
      columns: ["cohort_id"]
isOneToOne: false
      referencedRelation: "cohorts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"at": string,"cohort_id": string | null,"id": number,"subject_user_id": string | null
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"at"?: string,"cohort_id"?: string | null,"id"?: number,"subject_user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"at"?: string,"cohort_id"?: string | null,"id"?: number,"subject_user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"cohort_facilitators": {
                  Row: {
                    "cohort_id": string,"user_id": string
                  }
                  Insert: {
                    "cohort_id": string,"user_id": string
                  }
                  Update: {
                    "cohort_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cohort_facilitators_cohort_id_fkey"
      columns: ["cohort_id"]
isOneToOne: false
      referencedRelation: "cohorts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cohort_facilitators_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"cohort_members": {
                  Row: {
                    "cohort_id": string,"joined_at": string,"pseudonym": string,"user_id": string
                  }
                  Insert: {
                    "cohort_id": string,"joined_at"?: string,"pseudonym"?: string,"user_id": string
                  }
                  Update: {
                    "cohort_id"?: string,"joined_at"?: string,"pseudonym"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cohort_members_cohort_id_fkey"
      columns: ["cohort_id"]
isOneToOne: false
      referencedRelation: "cohorts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cohort_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"cohorts": {
                  Row: {
                    "access_code_expires_at": string,"access_code_hash": string,"created_at": string,"created_by": string | null,"ends_on": string | null,"id": string,"language": string,"level": string,"name": string,"retention_months": number,"starts_on": string | null
                  }
                  Insert: {
                    "access_code_expires_at": string,"access_code_hash": string,"created_at"?: string,"created_by"?: string | null,"ends_on"?: string | null,"id"?: string,"language"?: string,"level"?: string,"name": string,"retention_months"?: number,"starts_on"?: string | null
                  }
                  Update: {
                    "access_code_expires_at"?: string,"access_code_hash"?: string,"created_at"?: string,"created_by"?: string | null,"ends_on"?: string | null,"id"?: string,"language"?: string,"level"?: string,"name"?: string,"retention_months"?: number,"starts_on"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "cohorts_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "cohort_id": string | null,"granted": boolean,"granted_at": string,"id": string,"kind": Database["public"]['Enums']["consent_kind"],"locale": string,"policy_version": string,"user_id": string
                  }
                  Insert: {
                    "cohort_id"?: string | null,"granted": boolean,"granted_at"?: string,"id"?: string,"kind": Database["public"]['Enums']["consent_kind"],"locale": string,"policy_version": string,"user_id": string
                  }
                  Update: {
                    "cohort_id"?: string | null,"granted"?: boolean,"granted_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["consent_kind"],"locale"?: string,"policy_version"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_cohort_id_fkey"
      columns: ["cohort_id"]
isOneToOne: false
      referencedRelation: "cohorts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"participant_notes": {
                  Row: {
                    "attempt_id": string,"body": string,"id": string,"protector_key": string,"shared_with_facilitator": boolean,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "attempt_id": string,"body"?: string,"id"?: string,"protector_key": string,"shared_with_facilitator"?: boolean,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "attempt_id"?: string,"body"?: string,"id"?: string,"protector_key"?: string,"shared_with_facilitator"?: boolean,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "participant_notes_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "participant_notes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string | null,"id": string,"locale": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  Insert: {
                    "created_at"?: string,"display_name"?: string | null,"id": string,"locale"?: string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string | null,"id"?: string,"locale"?: string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Relationships: [
                    
                  ]
                },"public_results": {
                  Row: {
                    "created_at": string,"delete_token_hash": string,"email": string,"expires_at": string,"form": Database["public"]['Enums']["form_kind"],"id": string,"item_bank_version": string,"locale": string,"newsletter_opt_in": boolean,"policy_version": string,"responses": NonNullable<Json>,"scores": NonNullable<Json>,"scoring_version": string
                  }
                  Insert: {
                    "created_at"?: string,"delete_token_hash": string,"email": string,"expires_at": string,"form": Database["public"]['Enums']["form_kind"],"id"?: string,"item_bank_version": string,"locale": string,"newsletter_opt_in"?: boolean,"policy_version": string,"responses": NonNullable<Json>,"scores": NonNullable<Json>,"scoring_version": string
                  }
                  Update: {
                    "created_at"?: string,"delete_token_hash"?: string,"email"?: string,"expires_at"?: string,"form"?: Database["public"]['Enums']["form_kind"],"id"?: string,"item_bank_version"?: string,"locale"?: string,"newsletter_opt_in"?: boolean,"policy_version"?: string,"responses"?: NonNullable<Json>,"scores"?: NonNullable<Json>,"scoring_version"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "delete_my_account":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"has_consent":
{ Args: { "p_cohort": string,"p_kind": Database["public"]['Enums']["consent_kind"],"p_user": string }; Returns: boolean
                           },
"hash_access_code":
{ Args: { "p_code": string }; Returns: string
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_facilitator_of":
{ Args: { "p_cohort": string }; Returns: boolean
                           },
"is_member_of":
{ Args: { "p_cohort": string }; Returns: boolean
                           },
"join_cohort_with_code":
{ Args: { "p_code": string }; Returns: string
                           },
"log_access":
{ Args: { "p_action": string,"p_cohort": string,"p_subject": string }; Returns: undefined
                           },
"lookup_access_code":
{ Args: { "p_code": string }; Returns: {
              "id": string,"language": string,"level": string,"name": string
            }[]
                           },
"run_retention":
{ Args: Record<PropertyKey, never>; Returns: {
              "attempts_deleted": number,"public_results_deleted": number
            }[]
                           }
          }
          Enums: {
            "app_role": "admin"|"facilitator"|"participant","consent_kind": "store_results"|"facilitator_visibility"|"newsletter","form_kind": "full"|"short"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "app_role": ["admin", "facilitator", "participant"],"consent_kind": ["store_results", "facilitator_visibility", "newsletter"],"form_kind": ["full", "short"]
          }
        }
} as const

