import type { VercelConfig } from "@vercel/config/v1";

/** EU data residency: all functions run in Frankfurt. Retention runs nightly. */
export const config: VercelConfig = {
  framework: "nextjs",
  regions: ["fra1"],
  crons: [{ path: "/api/cron/retention", schedule: "0 3 * * *" }],
};
