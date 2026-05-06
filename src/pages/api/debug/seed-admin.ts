import { getAuth } from "@/lib/auth";
import type { APIRoute } from "astro";
import { Forbidden, Success, ServerError } from '@/lib/response';
import { ulid } from "ulidx";

export const prerender = false;

export const GET: APIRoute = async (context) => {
    try {
        const env = context.locals.runtime.env;
        if (env.ALLOW_DEBUG_SEED_ADMIN !== 'true' && env.ENVIRONMENT !== 'development') {
            return Forbidden('Seed admin hanya boleh dipakai di development');
        }

        const db = env.DB;
        const auth = getAuth(db, env);
        const authContext = await auth.$context;
        const email = 'admin@admin.com';
        const password = 'admin12345';
        const userId = 'usr_' + ulid().toLowerCase();
        const accountId = 'acc_' + ulid().toLowerCase();
        const now = new Date().toISOString();

        const existing = await db.prepare('SELECT id FROM user WHERE email = ?').bind(email).first();
        const resolvedUserId = existing?.id || userId;

        if (!existing) {
            await db.prepare(`
                INSERT INTO user (id, name, email, username, displayUsername, emailVerified, image, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(resolvedUserId, 'Admin Portofolio', email, 'admin', 'admin', 1, null, now, now).run();
        }

        const hashedPassword = await authContext.password.hash(password);
        const existingAccount = await db.prepare(`
            SELECT id FROM account WHERE userId = ? AND providerId = 'credential'
        `).bind(resolvedUserId).first();

        if (existingAccount?.id) {
            await db.prepare('UPDATE account SET password = ?, updatedAt = ? WHERE id = ?')
                .bind(hashedPassword, now, existingAccount.id)
                .run();
        } else {
            await db.prepare(`
                INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(accountId, resolvedUserId, 'credential', resolvedUserId, hashedPassword, now, now).run();
        }

        return Success({ 
            username: 'admin', 
            password,
            email,
            note: 'Akun admin Better Auth berhasil dibuat atau diperbarui. Gunakan hanya untuk development.' 
        }, 'Admin seeded successfully');
    } catch (error: any) {
        return ServerError(error.message || "Gagal membuat user (mungkin sudah ada)");
    }
}
