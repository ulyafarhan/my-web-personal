import { getAuth, isAdminEmail } from '@/lib/auth';

export class AuthMiddleware {
  static async verifyAdmin(request: Request, db: D1Database, env: any) {
    const auth = getAuth(db, env);
    const session = await auth.api.getSession({ headers: new Headers(request.headers) });

    if (!session || !isAdminEmail(session.user.email, env)) {
      return null;
    }

    return session;
  }
}
