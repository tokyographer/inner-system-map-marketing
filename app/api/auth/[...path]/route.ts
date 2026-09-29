import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

const handlers = auth().handler();
export const GET = handlers.GET;
export const POST = handlers.POST;
