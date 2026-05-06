import { ProyekService } from '../services/ProyekService';
import { Success, ValidationError, ServerError } from '../../lib/response';
import type { ProyekPayload } from '../models/proyek';

export class ProyekController {
  constructor(private service: ProyekService) {}

  async listAdmin(url: URL) {
    try {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const result = await this.service.ambilSemua(page, limit);
      return Success(result.data, "Berhasil", 200, { meta: result.meta });
    } catch (e: any) {
      return ServerError(e.message);
    }
  }

  async create(request: Request) {
    try {
      const payload: ProyekPayload = await request.json();
      const result = await this.service.buatProyek(payload);
      return Success(result, "Proyek berhasil dibuat", 201);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        return ValidationError({ slug: ['Slug sudah digunakan'] });
      }
      return ServerError(e.message);
    }
  }

  async update(id: string, request: Request) {
    try {
      const payload: ProyekPayload = await request.json();
      const result = await this.service.perbaruiProyek(id, payload);
      return Success(result, "Proyek berhasil diperbarui");
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        return ValidationError({ slug: ['Slug sudah digunakan'] });
      }
      return ServerError(e.message);
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.service.hapusProyek(id);
      if (!deleted) throw new Error("Gagal menghapus");
      return Success(null, "Proyek berhasil dihapus");
    } catch (e: any) {
      return ServerError(e.message);
    }
  }

  async getTags() {
    try {
      const tags = await this.service.ambilSemuaTag();
      return Success(tags);
    } catch (e: any) {
      return ServerError(e.message);
    }
  }
}
