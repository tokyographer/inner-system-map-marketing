export const MANAGER_KEYS = ["PERF", "CRIT", "PLEA", "CTRL", "INTL", "AVOI", "CARE", "HYPV", "DIST"] as const;
export const FIREFIGHTER_KEYS = ["NUMB", "DISS", "ANGR", "IMPL"] as const;
export const MIXED_KEYS = ["REBL"] as const;
export const EXILE_KEYS = ["SHAM", "ABAN", "FEAR", "POWL", "LONE"] as const;
export const SELF_KEY = "SELF" as const;

export type ManagerKey = (typeof MANAGER_KEYS)[number];
export type FirefighterKey = (typeof FIREFIGHTER_KEYS)[number];
export type MixedKey = (typeof MIXED_KEYS)[number];
export type ExileKey = (typeof EXILE_KEYS)[number];
export type ProtectorKey = ManagerKey | FirefighterKey | MixedKey;
export type ScaleKey = ProtectorKey | ExileKey | typeof SELF_KEY;

export const PROTECTOR_KEYS: readonly ProtectorKey[] = [...MANAGER_KEYS, ...FIREFIGHTER_KEYS, ...MIXED_KEYS];
export const ALL_SCALE_KEYS: readonly ScaleKey[] = [SELF_KEY, ...PROTECTOR_KEYS, ...EXILE_KEYS];

export type Block = "self" | "managers" | "firefighters" | "mixed" | "exiles";
export type Group = "managers" | "firefighters" | "exiles";

export type Response = 1 | 2 | 3 | 4 | 5;
export type Responses = Record<string, Response>;

export type Band = "quiet" | "present" | "veryActive";
export type SelfBand = "hardToReach" | "availableAtTimes" | "oftenAvailable";

export type PatternKey = "SELF_LED" | "FLOODED" | "REACTIVE" | "MANAGED" | "POLARISED" | "QUIET_OR_GUARDED";
export type ModifierKey = "HIDDEN_EXILES" | "SELF_PRESENT";
export type QualityFlag = "STRAIGHT_LINING" | "TOO_FAST" | "ACQUIESCENCE";

export interface ScaleScore {
  key: ScaleKey;
  mean: number;
  display: number;
  itemCount: number;
  highCount: number;
}

export interface PartScaleScore extends ScaleScore {
  band: Band;
}

export interface SelfScore extends ScaleScore {
  band: SelfBand;
}

export interface Leads {
  manager: number;
  firefighter: number;
  exile: number;
  protectionLoad: number;
}

export interface Pattern {
  key: PatternKey;
  modifiers: ModifierKey[];
  evidence: { self: number } & Leads;
}

export interface Pairing {
  protector: ProtectorKey;
  exile: ExileKey;
}

export interface Result {
  itemBankVersion: string;
  scoringVersion: string;
  form: "full" | "short";
  self: SelfScore;
  scales: Record<ProtectorKey | ExileKey, PartScaleScore>;
  leads: Leads;
  pattern: Pattern;
  protectors: { ranked: ProtectorKey[]; leading: ProtectorKey | null; team: ProtectorKey[] };
  exiles: { ranked: ExileKey[] };
  pairings: Pairing[];
  qualityFlags: QualityFlag[];
  careFlag: boolean;
}

export interface ScoreInput {
  responses: Responses;
  form: "full" | "short";
  durationSeconds?: number;
}
