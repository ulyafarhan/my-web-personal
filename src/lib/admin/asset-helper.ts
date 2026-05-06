export class AssetHelper {
  static async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/assets/upload', { method: 'POST', body: formData });
    const data = await res.json().catch(() => ({})) as { success: boolean, data: { url: string }, message?: string, errors?: Record<string, string[]> };
    if (!res.ok) throw new Error(data.message || data.errors?.file?.[0] || 'Gagal mengunggah gambar');
    return data.data.url;
  }

  static preview(file: File, imgEl: HTMLImageElement, emptyEl: HTMLElement) {
    imgEl.src = URL.createObjectURL(file);
    imgEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
  }
}
