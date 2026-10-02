import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

type Handlers = ReturnType<ReturnType<typeof auth>["handler"]>;

// Created on first request, not at import: `next build` evaluates this module
// and CI builds without Neon Auth env vars.
let handlers: Handlers | null = null;
const getHandlers = (): Handlers => (handlers ??= auth().handler());

export const GET = (...args: Parameters<Handlers["GET"]>) => getHandlers().GET(...args);
export const POST = (...args: Parameters<Handlers["POST"]>) => getHandlers().POST(...args);
