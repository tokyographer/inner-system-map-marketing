/** Row shapes mirroring db/migrations. Keep in sync by hand; the migrations are the source of truth. */
export type AppRole = "admin" | "facilitator" | "participant";
export type ConsentKind = "store_results" | "facilitator_visibility" | "newsletter";
export type FormKind = "full" | "short";

export interface ProfileRow { id: string; display_name: string | null; role: AppRole; locale: string; created_at: string }
export interface CohortRow {
  id: string; name: string; level: string; language: string; starts_on: string | null; ends_on: string | null;
  access_code_expires_at: string; retention_months: number; created_by: string | null; created_at: string;
}
export interface CohortSummary { id: string; name: string; level: string; language: string }
export interface AttemptRow<Scores = unknown, Responses = unknown> {
  id: string; user_id: string; cohort_id: string; item_bank_version: string; scoring_version: string; form: FormKind; locale: string;
  seed: string; started_at: string; completed_at: string; duration_seconds: number; responses: Responses; scores: Scores; pattern: string;
  self_score: string; top_protectors: string[]; top_exile: string; quality_flags: string[]; care_flag: boolean;
}
export interface NoteRow { id: string; attempt_id: string; user_id: string; protector_key: string; body: string; shared_with_facilitator: boolean; updated_at: string }
export interface ConsentRow { id: string; user_id: string; cohort_id: string | null; kind: ConsentKind; granted: boolean; policy_version: string; locale: string; granted_at: string }
