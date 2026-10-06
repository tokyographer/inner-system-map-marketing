/**
 * Marketing settings for this repo. Values change with a deploy.
 */
import { CONSENT_POLICY_VERSION } from "@/config/app";

/** Version of the marketing additions to the privacy notice (the "marketing" privacy section). DRAFT pending legal review. */
export const MARKETING_POLICY_VERSION = "m2026-10-draft";

/** Recorded with public-mode consent: the core notice version plus the marketing additions, e.g. "2026-09-draft+m2026-10-draft". */
export const PUBLIC_POLICY_VERSION = `${CONSENT_POLICY_VERSION}+${MARKETING_POLICY_VERSION}`;
