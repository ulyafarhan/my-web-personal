type JsonPayload = Record<string, unknown>;

const json = (payload: JsonPayload, status: number) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const Success = (
  data: unknown = null,
  message: string = 'Berhasil',
  status: number = 200,
  extra: JsonPayload = {},
) => json({ data, message, ...extra }, status);

export const ValidationError = (
  errors: Record<string, string[]> | JsonPayload,
  message: string = 'Data yang dikirim belum valid',
) => json({ errors, message }, 422);

export const BadRequest = (message: string = 'Permintaan tidak valid') => json({ message }, 400);

export const Unauthorized = (message: string = 'Sesi tidak valid. Silakan masuk kembali.') => {
  return json({ message }, 401);
};

export const Forbidden = (message: string = 'Akun ini tidak memiliki akses admin') => {
  return json({ message }, 403);
};

export const NotFound = (message: string = 'Data tidak ditemukan') => json({ message }, 404);

export const ServerError = (message: string = 'Terjadi kesalahan pada server') => {
  return json({ message }, 500);
};

export const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/&/g, ' dan ')
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

export const parseJson = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
