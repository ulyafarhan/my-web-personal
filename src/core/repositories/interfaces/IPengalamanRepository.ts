import type { Pengalaman, PengalamanPayload } from '../../models/pengalaman';

export interface IPengalamanRepository {
  getAll(): Promise<Pengalaman[]>;
  getById(id: string): Promise<Pengalaman | null>;
  create(payload: PengalamanPayload): Promise<Pengalaman>;
  update(id: string, payload: PengalamanPayload): Promise<Pengalaman>;
  delete(id: string): Promise<boolean>;
}
