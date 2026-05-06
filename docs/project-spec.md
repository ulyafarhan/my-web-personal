# Project Spec — my-web-personal

## Identitas Proyek
- **Nama:** `my-web-personal`
- **Tujuan Utama (Tahap Saat Ini):** Platform portofolio rekayasa perangkat lunak personal berskala *enterprise*. Fokus iterasi saat ini adalah memperbaiki anomali *routing* (404 pada *index root* `/`) sekaligus merevitalisasi UI/UX *Landing Page* agar berstandar premium (mengacu pada desain *Bento Grid* bergaya "Gladia") dengan penyesuaian *copywriting* Bahasa Indonesia yang profesional.
- **Target Pengguna:** Pengunjung publik, perekrut teknis (*Technical Recruiter*), dan profesional IT.

## Stack & Arsitektur Sistem
- **Ekosistem Runtime:** Cloudflare Workers / Cloudflare Pages (Filosofi *Edge-First* untuk *Zero Cold Start*).
- **Framework Antarmuka:** Astro (Hybrid Server-Side Rendering) terintegrasi dengan Tailwind CSS v4.
- **Layer Database:** Cloudflare D1 (Serverless SQLite) diakses melalui pola *Repository* (Dependency Inversion).
- **Layer Penyimpanan Berkas:** Cloudflare R2 (Object Storage) untuk efisiensi aset media.
- **Sistem Autentikasi:** Better Auth terisolasi pada ekosistem `/admin` dan `/api/auth`.
- **Arsitektur Utama:** Monolith Edge terstruktur dengan *Clean Architecture* (pemisahan *Models*, *Repositories*, *Services*, dan *Controllers/API*).
- **Primary Key Strategy:** ULID (Universally Unique Lexicographically Sortable Identifier) untuk efisiensi *indexing* dan pengurutan kronologis tanpa latensi komputasi beban berat.

## Scope Fitur (Fokus Iterasi v2.0)

### Prioritas Mutlak (Must Have)
- [ ] **Resolusi Routing:** Memperbaiki sistem *routing* pada *root* `/` (Landing Page) yang saat ini menghasilkan status `404 Not Found`.
- [ ] **Revitalisasi UI/UX:** Membangun antarmuka *Landing Page* baru yang bersifat *pixel-perfect* terhadap referensi desain.
- [ ] **Lokalisasi:** Menerapkan *copywriting* berbahasa Indonesia yang merepresentasikan portofolio keilmuan informatika.
- [ ] **Tema Estetik:** Implementasi *Dark Mode* persisten dengan *color grading* premium, tata letak *Bento Grid*, tipografi modern, dan *micro-animations*.
- [ ] **Integrasi Komponen:** Memastikan *Landing Page* baru terhubung mulus dengan modul-modul *backend* yang sudah matang (API Proyek, Sistem Pakar, dan Llama 3 Chatbot).

### Di Luar Cakupan (Out of Scope)
- Penambahan tabel atau entitas basis data baru yang tidak berkaitan langsung dengan optimasi *Landing Page* atau modul portofolio.
- Pengembangan modul *frontend* untuk CMS Admin (karena lapisan Bootstrap 5 pada `/admin` sudah stabil dan terisolasi).

## Batasan Domain & Eksekusi (Constraints)
1. **Domain Data Mutlak:** Seluruh konten (proyek, pengalaman, sertifikat) difokuskan secara eksklusif pada ranah rekayasa perangkat lunak, pemrograman, riset algoritma, dan manajemen infrastruktur IT.
2. **Kinerja & Responsivitas:** Wajib bersifat *fully responsive* (Mobile-First approach via Tailwind v4) dan tidak memicu masalah *N+1 Query* pada saat *render* Astro SSR.
3. **Isolasi Antarmuka:** Tidak mencampur aduk pustaka *styling* (menjaga Tailwind CSS murni untuk publik, dan Bootstrap untuk Admin).

## Peta Jalan Fase Pengembangan (Development Pipeline)
- **Fase 01: Fondasi Infrastruktur (Selesai):** Skema Cloudflare D1, Ekosistem Better Auth, dan Migrasi DDL (0001 - 0010).
- **Fase 02: Arsitektur Backend (Selesai):** *Clean Architecture*, integrasi AI Service (Llama 3), dan Mesin Inferensi (*Forward Chaining*).
- **Fase 03: CMS Administrator (Selesai):** Operasi CRUD terautentikasi dan Dasbor Analis Pakar.
- **Fase 04: Resolusi Antarmuka Publik (Selesai):** *Brief parsing*, perbaikan *bug 404*, integrasi desain UI/UX *Landing Page*, dan sinkronisasi *frontend-backend*.
- **Fase 05: Optimasi Kinerja V3.0 (Saat Ini):** Implementasi *SQL Aggregation*, *Multi-tier Edge Caching*, dan *Image Resizing Pipeline*.

## Sprint 01: Performance (Target Saat Ini)
- [ ] **SQL Aggregation:** Optimasi `D1ProyekRepository` menggunakan `json_group_array` untuk mitigasi N+1.
- [ ] **Image Resizing:** Integrasi *Cloudflare Image Resizing* pada `R2StorageService`.

## Pertanyaan Terbuka untuk Resolusi
1. Apakah ada batasan lebar maksimum (max-width) tertentu untuk optimasi gambar di Landing Page?
2. Apakah caching SWR akan diterapkan secara global via middleware atau hanya pada rute publik spesifik?