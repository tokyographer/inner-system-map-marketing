/**
 * Browser-only persistence. Progress in localStorage (cleared on completion),
 * finished attempt in sessionStorage for the results page. Reads go through
 * a tiny external store so components can hydrate with useSyncExternalStore
 * without setting state inside effects. All access is wrapped so a blocked
 * storage never breaks the page.
 */
import { useMemo, useSyncExternalStore } from "react";
import type { Form } from "@/config/app";
import type { Responses } from "@/lib/scoring/types";

export const PROGRESS_KEY = "ism:progress:v2";
export const ATTEMPT_KEY = "ism:attempt:v2";
export const CONTACT_KEY = "ism:contact:v2";
export const SENT_KEY = "ism:sent:v2";

export interface Progress {
  seed: number;
  form: Form;
  startedAt: number;
  index: number;
  responses: Responses;
}

export interface Contact {
  name: string;
  email: string;
  newsletter: boolean;
  /** E.164, present only when the person also asked for WhatsApp delivery. */
  whatsapp?: string;
  policyVersion: string;
}

export interface CompletedAttempt {
  seed: number;
  form: Form;
  startedAt: number;
  completedAt: number;
  responses: Responses;
}

type Area = "local" | "session";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function storage(area: Area): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try { return area === "local" ? window.localStorage : window.sessionStorage; } catch { return undefined; }
}

function getRaw(area: Area, key: string): string | null {
  try { return storage(area)?.getItem(key) ?? null; } catch { return null; }
}

function write(area: Area, key: string, value: unknown): void {
  try { storage(area)?.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: continue without persistence */ }
  notify();
}

function remove(area: Area, key: string): void {
  try { storage(area)?.removeItem(key); } catch { /* ignore */ }
  notify();
}

function parse<T>(raw: string | null | undefined): T | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}

/** undefined before hydration, null when absent, otherwise the stored value. */
function useStored<T>(area: Area, key: string): T | null | undefined {
  const raw = useSyncExternalStore(subscribe, () => getRaw(area, key), () => undefined);
  return useMemo(() => parse<T>(raw), [raw]);
}

export const loadProgress = () => parse<Progress>(getRaw("local", PROGRESS_KEY)) ?? null;
export const saveProgress = (p: Progress) => write("local", PROGRESS_KEY, p);
export const clearProgress = () => remove("local", PROGRESS_KEY);
export const useProgress = () => useStored<Progress>("local", PROGRESS_KEY);

export const loadAttempt = () => parse<CompletedAttempt>(getRaw("session", ATTEMPT_KEY)) ?? null;
export const saveAttempt = (a: CompletedAttempt) => write("session", ATTEMPT_KEY, a);
export const clearAttempt = () => remove("session", ATTEMPT_KEY);
export const useAttempt = () => useStored<CompletedAttempt>("session", ATTEMPT_KEY);

export const loadContact = () => parse<Contact>(getRaw("session", CONTACT_KEY)) ?? null;
export const saveContact = (c: Contact) => write("session", CONTACT_KEY, c);
export const clearContact = () => remove("session", CONTACT_KEY);
export const useContact = () => useStored<Contact>("session", CONTACT_KEY);

/** Remembers which attempt (by completedAt) has already been emailed, so a refresh does not resend. */
export const markSent = (completedAt: number) => write("session", SENT_KEY, completedAt);
export const useSentFor = () => useStored<number>("session", SENT_KEY);
