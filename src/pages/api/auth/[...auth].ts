import { getAuth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const prerender = false;

async function handleAuth(context: any) {
	const db = context.locals.runtime?.env?.DB;
	if (!db) return new Response("Configuration missing", { status: 500 });
	
	const auth = getAuth(db as any, context.locals.runtime.env);
	return auth.handler(context.request);
}

export const GET: APIRoute = handleAuth;
export const POST: APIRoute = handleAuth;
export const ALL: APIRoute = handleAuth;
