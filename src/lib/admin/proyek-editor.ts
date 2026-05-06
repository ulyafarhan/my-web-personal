import { PusatPakarRealtime } from '@/lib/sistem-pakar/PusatPakar';
import type { Proyek, Tag } from '@/core/models/proyek';
import type { SaveResponse } from './proyek-editor-types';
import { AssetHelper } from './asset-helper';
import { TiptapEditor } from './tiptap-editor';
import { LinterUI } from './linter-ui';
import { FormHelper } from './form-helper';

export class ProyekEditor {
  private pakar = new PusatPakarRealtime();
  private tiptap?: TiptapEditor;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  private idParam: string | null;

  constructor(private form: HTMLFormElement) {
    this.idParam = new URLSearchParams(window.location.search).get('id');
    this.init();
  }

  private async init() {
    this.initTiptap();
    this.initEventListeners();
    this.runLinter();
  }

  private initTiptap() {
    const editorEl = this.form.querySelector<HTMLElement>('#editor');
    const inputEl = this.form.querySelector<HTMLTextAreaElement>('#konten_html');
    if (editorEl && inputEl) {
      this.tiptap = new TiptapEditor(editorEl, inputEl.value, (html) => {
        inputEl.value = html;
        this.runLinter();
      });
      this.initTiptapToolbar();
    }
  }

  private initTiptapToolbar() {
    const toolbar = this.form.querySelector('#editorToolbar');
    if (!toolbar) return;
    toolbar.querySelectorAll('[data-command]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-command');
        if (cmd === 'bold') this.tiptap?.chain()?.focus().toggleBold().run();
        if (cmd === 'italic') this.tiptap?.chain()?.focus().toggleItalic().run();
        if (cmd === 'bulletList') this.tiptap?.chain()?.focus().toggleBulletList().run();
        if (cmd === 'orderedList') this.tiptap?.chain()?.focus().toggleOrderedList().run();
      });
    });
  }

  private initEventListeners() {
    const judul = this.form.querySelector<HTMLInputElement>('#judul');
    const slug = this.form.querySelector<HTMLInputElement>('#slug');
    judul?.addEventListener('input', () => {
      if (slug && !slug.dataset.touched) {
        slug.value = FormHelper.makeSlug(judul.value);
        this.runLinter();
      }
    });
    slug?.addEventListener('input', () => {
      slug.dataset.touched = 'true';
      slug.value = FormHelper.makeSlug(slug.value);
      this.runLinter();
    });
    ['judul', 'slug', 'ringkasan', 'url_demo', 'url_repo', 'status'].forEach(id => {
      this.form.querySelector(`#${id}`)?.addEventListener('input', () => this.debounceLinter());
    });
    this.form.querySelectorAll('input[name="tag_ids"]').forEach(input => {
      input.addEventListener('change', () => this.runLinter());
    });
    this.form.querySelector('#coverFile')?.addEventListener('change', () => this.handleCoverPreview());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  private runLinter() {
    const linterResults = this.form.querySelector<HTMLDivElement>('#linterResults');
    const button = this.form.querySelector<HTMLButtonElement>('#btnSubmit');
    if (!linterResults || !button) return;

    const payload = this.getPayload();
    // Mocking Proyek object for analyzer
    const mockProyek: any = {
      ...payload,
      updated_at: new Date().toISOString(),
      tags: FormHelper.getSelectedTags(this.form).map(t => ({ nama: t } as Tag))
    };

    const hasil = this.pakar.analisaLengkap(mockProyek as Proyek);

    // Flatten and normalize results for UI
    const flattened: any[] = [];
    Object.entries(hasil).forEach(([key, res]: [string, any]) => {
      if (Array.isArray(res)) {
        res.forEach(item => flattened.push({ ...item, engine: key.toUpperCase() }));
      } else if (res && typeof res === 'object' && res.pesan) {
        flattened.push({ ...res, engine: key.toUpperCase() });
      }
    });

    LinterUI.render(flattened, linterResults, button);
    this.form.querySelector('#linterPanel')?.classList.remove('hidden');
  }

  private debounceLinter() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.runLinter(), 800);
  }

  private handleCoverPreview() {
    const coverFile = this.form.querySelector<HTMLInputElement>('#coverFile');
    const coverPreview = this.form.querySelector<HTMLImageElement>('#coverPreview');
    const coverEmpty = this.form.querySelector<HTMLDivElement>('#coverEmpty');
    const file = coverFile?.files?.[0];
    if (file && coverPreview && coverEmpty) AssetHelper.preview(file, coverPreview, coverEmpty);
  }

  private async uploadCover() {
    const file = this.form.querySelector<HTMLInputElement>('#coverFile')?.files?.[0];
    if (!file) return this.form.querySelector<HTMLInputElement>('#url_gambar_sampul')?.value || '';
    return AssetHelper.upload(file);
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    const button = this.form.querySelector<HTMLButtonElement>('#btnSubmit');
    const originalText = button?.textContent;
    if (button) { button.disabled = true; button.textContent = 'Memproses...'; }
    try {
      const imageUrl = await this.uploadCover();
      const res = await fetch(this.idParam ? `/api/admin/proyek/${this.idParam}` : '/api/admin/proyek', {
        method: this.idParam ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.getPayload(), url_gambar_sampul: imageUrl, tag_ids: FormHelper.getSelectedTagIds(this.form) }),
      });
      const data = await res.json() as SaveResponse;
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data');
      window.location.href = '/admin/proyek';
    } catch (err: any) {
      this.showMessage(err instanceof Error ? err.message : 'Error sistem');
      if (button) { button.disabled = false; button.textContent = originalText || 'Simpan'; }
    }
  }

  private getPayload() {
    const getVal = (id: string) => {
      const el = this.form.querySelector(id);
      return (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) ? el.value : '';
    };
    return {
      judul: getVal('#judul'),
      slug: getVal('#slug'),
      ringkasan: getVal('#ringkasan'),
      konten_html: this.tiptap?.getHTML() || getVal('#konten_html'),
      url_demo: getVal('#url_demo'),
      url_repo: getVal('#url_repo'),
      status_publikasi: Number(getVal('#status') || 0),
    };
  }

  private showMessage(text: string, type = 'error') {
    const message = this.form.querySelector<HTMLParagraphElement>('#formMessage');
    if (!message) return;
    message.textContent = text;
    message.className = `mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`;
    message.classList.remove('hidden');
  }
}
