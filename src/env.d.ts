/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: import("better-auth").User;
    session?: import("better-auth").Session;
  }
}

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  ENVIRONMENT?: string;
  GROQ_API_KEY: string;
  BETTER_AUTH_SECRET: string;
  SESSION_SECRET?: string;
  SITE_URL: string;
  ADMIN_EMAILS: string;
  PUBLIC_R2_URL: string;
  ALLOW_DEBUG_SEED_ADMIN?: string;
}
