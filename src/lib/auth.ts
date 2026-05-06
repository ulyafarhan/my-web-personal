import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";

const DEFAULT_SITE_URL = "http://localhost:4321";
const WEEK = 60 * 60 * 24 * 7;
const DAY = 60 * 60 * 24;
const TEN_MINUTES = 60 * 10;

export const getAdminEmails = (env: any): string[] => {
    const raw = env.ADMIN_EMAILS || "admin@admin.com";
    return String(raw)
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
};

export const isAdminEmail = (email: string | null | undefined, env: any) => {
    if (!email) return false;
    return getAdminEmails(env).includes(email.toLowerCase());
};

export const getAuth = (db: D1Database, env: any) => betterAuth({
    database: db,
    baseURL: env.SITE_URL || DEFAULT_SITE_URL,
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        minPasswordLength: 8
    },
    session: {
        expiresIn: WEEK,
        updateAge: DAY,
        freshAge: TEN_MINUTES
    },
    plugins: [
        username()
    ],
    secret: env.BETTER_AUTH_SECRET || env.SESSION_SECRET || "development-secret-change-me",
    trustedOrigins: [env.SITE_URL || DEFAULT_SITE_URL]
});
