import type { VercelConfig } from "@vercel/config/v1";

/** EU data residency: all functions run in Frankfurt. */
export const config: VercelConfig = {
  framework: "nextjs",
  regions: ["fra1"],
};
