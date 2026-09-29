/**
 * Read queries for the dashboard. Every function runs inside withUser(), so
 * RLS decides what a facilitator or admin can see. Nothing here bypasses it.
 */
import { withUser, type Db } from "@/lib/db";
import type { AppRole, CohortRow } from "@/lib/db/types";
import type { Result } from "@/lib/scoring/types";
import type { ParticipantRow } from "./aggregate";
import type { AttemptExportRow } from "./csv";

export async function roleOf(userId: string): Promise<AppRole | null> {
  return withUser(userId, async (db) => (await db.query<{ role: AppRole }>("select role from public.profiles where id = $1", [userId])).rows[0]?.role ?? null);
}

export type CohortListRow = Pick<CohortRow, "id" | "name" | "level" | "language" | "starts_on" | "ends_on" | "access_code_expires_at"> & { members: number; completed: number };

export async function listCohorts(userId: string): Promise<CohortListRow[]> {
  return withUser(userId, async (db) => (await db.query<CohortListRow>(
    `select c.id, c.name, c.level, c.language, c.starts_on, c.ends_on, c.access_code_expires_at,
            (select count(*) from public.cohort_members m where m.cohort_id = c.id)::int as members,
            (select count(distinct a.user_id) from public.attempts a where a.cohort_id = c.id)::int as completed
     from public.cohorts c order by c.created_at desc`)).rows);
}

export async function getCohort(userId: string, cohortId: string): Promise<CohortRow | null> {
  return withUser(userId, async (db) => (await db.query<CohortRow>("select * from public.cohorts where id = $1", [cohortId])).rows[0] ?? null);
}

async function participantRows(db: Db, cohortId: string, identified: boolean): Promise<ParticipantRow[]> {
  const { rows } = await db.query<{ user_id: string; pseudonym: string; display_name: string | null; joined_at: string; attempt_count: number; attempt_id: string | null; completed_at: string | null; scores: Result | null }>(
    `select m.user_id, m.pseudonym, p.display_name, m.joined_at,
            (select count(*) from public.attempts a where a.user_id = m.user_id and a.cohort_id = m.cohort_id)::int as attempt_count,
            la.id as attempt_id, la.completed_at, la.scores
     from public.cohort_members m
     left join public.profiles p on p.id = m.user_id
     left join lateral (select id, completed_at, scores from public.attempts a where a.user_id = m.user_id and a.cohort_id = m.cohort_id order by completed_at desc limit 1) la on true
     where m.cohort_id = $1 order by m.joined_at`, [cohortId]);
  let emails = new Map<string, string>();
  if (identified) {
    const { rows: e } = await db.query<{ id: string; email: string }>("select id, email from app.member_emails($1)", [cohortId]);
    emails = new Map(e.map((r) => [r.id, r.email]));
  }
  return rows.map((r) => ({
    userId: r.user_id, pseudonym: r.pseudonym, displayName: r.display_name, email: identified ? (emails.get(r.user_id) ?? null) : null, joinedAt: r.joined_at,
    attemptCount: r.attempt_count, latest: r.attempt_id && r.scores ? { attemptId: r.attempt_id, completedAt: r.completed_at!, result: r.scores } : null,
  }));
}

export async function listParticipants(userId: string, cohortId: string): Promise<ParticipantRow[]> {
  return withUser(userId, (db) => participantRows(db, cohortId, false));
}

export interface ParticipantProfile {
  pseudonym: string;
  displayName: string | null;
  attempts: { id: string; completedAt: string; result: Result }[];
  notes: { attemptId: string; protectorKey: string; body: string; updatedAt: string }[];
}

export async function getParticipant(userId: string, cohortId: string, participantId: string, logAction: string): Promise<ParticipantProfile | null> {
  return withUser(userId, async (db) => {
    const m = (await db.query<{ pseudonym: string; display_name: string | null }>(
      "select m.pseudonym, p.display_name from public.cohort_members m left join public.profiles p on p.id = m.user_id where m.cohort_id = $1 and m.user_id = $2", [cohortId, participantId])).rows[0];
    if (!m) return null;
    await db.query("select app.log_access($1, $2, $3)", [logAction, cohortId, participantId]);
    const attempts = (await db.query<{ id: string; completed_at: string; scores: Result }>(
      "select id, completed_at, scores from public.attempts where cohort_id = $1 and user_id = $2 order by completed_at desc", [cohortId, participantId])).rows;
    const notes = (await db.query<{ attempt_id: string; protector_key: string; body: string; updated_at: string }>(
      "select n.attempt_id, n.protector_key, n.body, n.updated_at from public.participant_notes n join public.attempts a on a.id = n.attempt_id where a.cohort_id = $1 and n.user_id = $2 order by n.updated_at desc", [cohortId, participantId])).rows;
    return {
      pseudonym: m.pseudonym, displayName: m.display_name,
      attempts: attempts.map((a) => ({ id: a.id, completedAt: a.completed_at, result: a.scores })),
      notes: notes.map((n) => ({ attemptId: n.attempt_id, protectorKey: n.protector_key, body: n.body, updatedAt: n.updated_at })),
    };
  });
}

export async function exportRows(userId: string, cohortId: string, identified: boolean): Promise<AttemptExportRow[]> {
  return withUser(userId, async (db) => {
    await db.query("select app.log_access($1, $2, null)", [identified ? "export_identified" : "export_pseudonymised", cohortId]);
    const { rows } = await db.query<{ id: string; pseudonym: string; display_name: string | null; user_id: string; cohort_id: string; form: string; locale: string; item_bank_version: string; scoring_version: string; completed_at: string; duration_seconds: number; responses: Record<string, number>; scores: Result }>(
      `select a.id, m.pseudonym, p.display_name, a.user_id, a.cohort_id, a.form, a.locale, a.item_bank_version, a.scoring_version, a.completed_at, a.duration_seconds, a.responses, a.scores
       from public.attempts a join public.cohort_members m on m.cohort_id = a.cohort_id and m.user_id = a.user_id
       left join public.profiles p on p.id = a.user_id where a.cohort_id = $1 order by a.completed_at`, [cohortId]);
    let emails = new Map<string, string>();
    if (identified) {
      const { rows: e } = await db.query<{ id: string; email: string }>("select id, email from app.member_emails($1)", [cohortId]);
      emails = new Map(e.map((r) => [r.id, r.email]));
    }
    return rows.map((r) => ({
      attemptId: r.id, pseudonym: r.pseudonym, email: identified ? emails.get(r.user_id) ?? null : undefined, displayName: identified ? r.display_name : undefined,
      cohortId: r.cohort_id, form: r.form, locale: r.locale, itemBankVersion: r.item_bank_version, scoringVersion: r.scoring_version, completedAt: r.completed_at,
      durationSeconds: r.duration_seconds, responses: r.responses, result: r.scores,
    }));
  });
}

export interface FacilitatorRow { userId: string; displayName: string | null; email: string | null }
export async function listFacilitators(userId: string, cohortId: string): Promise<FacilitatorRow[]> {
  return withUser(userId, async (db) => (await db.query<FacilitatorRow>(
    `select f.user_id as "userId", p.display_name as "displayName", e.email
     from public.cohort_facilitators f left join public.profiles p on p.id = f.user_id
     left join lateral (select email from app.facilitator_emails($1) fe where fe.id = f.user_id) e on true
     where f.cohort_id = $1`, [cohortId])).rows);
}

export interface AuditRow { id: number; actor: string | null; action: string; cohortId: string | null; subject: string | null; at: string }
export async function listAudit(userId: string, limit = 200): Promise<AuditRow[]> {
  return withUser(userId, async (db) => (await db.query<AuditRow>(
    `select l.id, coalesce(p.display_name, l.actor_id::text) as actor, l.action, l.cohort_id as "cohortId", l.subject_user_id::text as subject, l.at
     from public.audit_log l left join public.profiles p on p.id = l.actor_id order by l.at desc limit $1`, [limit])).rows);
}
