export class R2StorageService {
  constructor(private r2: R2Bucket, private publicUrl: string) {}

  /**
   * Mengoptimalkan URL gambar menggunakan Cloudflare Image Resizing.
   * Parameter: width=800, format=avif, quality=85
   */
  private getOptimizedUrl(key: string): string {
    // Gunakan format /cdn-cgi/image/ sesuai rekomendasi
    return `${this.publicUrl}/cdn-cgi/image/width=800,format=avif,quality=85/${key}`;
  }

  async upload(file: File, prefix: string = 'assets'): Promise<string> {
    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    
    await this.r2.put(filename, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });

    // Jika file adalah gambar, kembalikan URL yang sudah dioptimasi
    if (file.type.startsWith('image/')) {
      return this.getOptimizedUrl(filename);
    }

    return `${this.publicUrl}/${filename}`;
  }

  async deleteByUrl(url: string): Promise<boolean> {
    if (!url.includes(this.publicUrl)) return false;
    
    // Ekstrak key dari URL (mengatasi kemungkinan adanya prefix /cdn-cgi/image/...)
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const prefix = urlParts[urlParts.length - 2];
    const key = `${prefix}/${filename}`;

    try {
      await this.r2.delete(key);
      return true;
    } catch {
      return false;
    }
  }
}
