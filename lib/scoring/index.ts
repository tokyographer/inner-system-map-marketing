/**
 * Scoring engine entry point. Pure: no I/O, no Date, no randomness.
 * Thresholds come from config/scoring.ts; items from content/items.v2.ts.
 */
import { SCORING_VERSION } from "@/config/scoring";
import { ITEM_BANK_VERSION } from "@/content/items.v2";
import { careFlag, qualityFlags } from "./flags";
import { leads as computeLeads } from "./groups";
import { pairings as computePairings } from "./pairings";
import { systemPattern } from "./pattern";
import { leadingOrTeam, rankExiles, rankProtectors } from "./ranking";
import { assertComplete, partBand, scaleScore, selfBand } from "./scales";
import {
  EXILE_KEYS, PROTECTOR_KEYS, SELF_KEY,
  type ExileKey, type PartScaleScore, type ProtectorKey, type Result, type ScoreInput,
} from "./types";

export function score(input: ScoreInput): Result {
  const items = assertComplete(input.form, input.responses);

  const selfRaw = scaleScore(SELF_KEY, items, input.responses);
  const self = { ...selfRaw, band: selfBand(selfRaw.mean) };

  const scales = {} as Record<ProtectorKey | ExileKey, PartScaleScore>;
  for (const key of [...PROTECTOR_KEYS, ...EXILE_KEYS]) {
    const s = scaleScore(key, items, input.responses);
    scales[key] = { ...s, band: partBand(s.mean) };
  }

  const leads = computeLeads(scales);
  const pattern = systemPattern(self.mean, leads);
  const ranked = rankProtectors(scales);
  const { leading, team } = leadingOrTeam(ranked, scales);

  return {
    itemBankVersion: ITEM_BANK_VERSION,
    scoringVersion: SCORING_VERSION,
    form: input.form,
    self,
    scales,
    leads,
    pattern,
    protectors: { ranked, leading, team },
    exiles: { ranked: rankExiles(scales) },
    pairings: computePairings(ranked, scales),
    qualityFlags: qualityFlags({ items, responses: input.responses, form: input.form, durationSeconds: input.durationSeconds, self: self.mean, leads }),
    careFlag: careFlag(pattern.key, leads),
  };
}

export * from "./types";
