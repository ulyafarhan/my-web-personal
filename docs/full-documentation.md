# THE BACKEND COMPENDIUM: Portofolio Farhan v2.0
**Software Requirements & System Design Specification (SR-SDS)**

---

## CHAPTER I: SYSTEM PHILOSOPHY & ARCHITECTURE

### 1.1 Design Philosophy: The Edge-First Manifesto
Sistem ini beroperasi dengan paradigma komputasi *Edge-First*, di mana eksekusi backend dan persistensi data didekatkan pada lapisan *edge network* (Cloudflare Workers/Pages).
*   **Zero Cold Start**: Memanfaatkan runtime *V8 Isolate* yang menghilangkan latensi inisialisasi yang lazim ditemukan pada fungsi Lambda tradisional.
*   **State at the Edge**: Menggunakan Cloudflare D1 (Serverless SQLite) untuk operasi relasional dengan latensi minimal.

### 1.2 Architecture Layering (Clean Architecture)
Struktur direktori `src/core/` memisahkan lapisan abstraksi untuk meminimalisir ketergantungan antara framework antarmuka pengguna (Astro) dengan logika bisnis:
1.  **Domain/Model Layer (`src/core/models/`)**: Representasi entitas data murni (misal: `proyek.ts`, `common.ts`). Bebas dari logika framework.
2.  **Infrastructure/Repository Layer (`src/core/repositories/`)**: Implementasi akses basis data menggunakan *Repository Pattern*. Abstraksi kontrak berada di `interfaces/IProyekRepository.ts`, sedangkan implementasi spesifik Cloudflare D1 berada di `D1ProyekRepository.ts` dan `D1AturanRepository.ts`.
3.  **Application/Service Layer (`src/core/services/`)**: Pengendali logika bisnis utama, pengolahan AI (`AIService.ts`), manipulasi objek (`ProyekService.ts`), dan manajemen berkas (`R2StorageService.ts`).
4.  **Presentation/API Layer (`src/pages/api/`)**: Antarmuka HTTP (RESTful) untuk komunikasi eksternal dan sistem admin.

---

## CHAPTER II: COMPREHENSIVE DATA DICTIONARY

Sistem persistensi menggunakan **Cloudflare D1 (SQLite)** dengan 10 tabel utama yang terbagi ke dalam 6 domain fungsional. Seluruh entitas utama menggunakan **ULID** (Universally Unique Lexicographically Sortable Identifier) sebagai Primary Key.

### 2.1 Domain Autentikasi Modern (Better Auth)
Domain ini dikendalikan sepenuhnya oleh pustaka *Better Auth* untuk manajemen sesi yang aman.

**Tabel: `user`**
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | ULID / CUID |
| `name` | TEXT | NOT NULL | Nama pengguna |
| `email` | TEXT | UNIQUE, NOT NULL| Alamat surel |
| `username` | TEXT | UNIQUE | Nama pengguna spesifik sistem |
| `emailVerified`| INTEGER | NOT NULL | Boolean (0/1) |
| `image` | TEXT | | URL Avatar |
| `createdAt` | DATETIME | NOT NULL | |
| `updatedAt` | DATETIME | NOT NULL | |

**Tabel: `session`**, **`account`**, dan **`verification`**
Berfungsi sebagai entitas pendukung untuk token akses, penyedia kredensial OAuth/lokal, dan manajemen token temporal untuk keamanan akun.

### 2.2 Domain Konten Portofolio IT
Sistem memberlakukan batasan domain ketat: entri pada tabel ini **mutlak** diperuntukkan bagi karya, pengalaman, dan sertifikasi di ranah rekayasa perangkat lunak, infrastruktur IT, dan informatika.

**Tabel: `proyek`**
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | ULID |
| `judul` | TEXT | NOT NULL | Nama arsitektur/perangkat lunak |
| `slug` | TEXT | UNIQUE, NOT NULL| URL-friendly string |
| `ringkasan` | TEXT | NOT NULL | Abstrak teknis |
| `konten_html` | TEXT | NOT NULL | Rincian komprehensif (algoritma/arsitektur) |
| `url_gambar_sampul`| TEXT | | URL absolut ke R2 Bucket |
| `status_publikasi` | INTEGER | | 0: Draft, 1: Published |
| `dipublikasikan_pada`| DATETIME| | |
| `meta_seo` | TEXT | | JSON (Title, description, keywords) |
| `meta_geo` | TEXT | | JSON (Lat, Lng, region) |
| `ai_tags` | TEXT | | JSON (Ekstraksi kata kunci untuk mesin inferensi) |
| `view_count` | INTEGER | | Atomic increment metrik tayangan |
| `created_at` | DATETIME | NOT NULL | |
| `updated_at` | DATETIME | NOT NULL | |

**Tabel: `pengalaman`**
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | ULID |
| `peran` | TEXT | NOT NULL | Jabatan rekayasa perangkat lunak |
| `organisasi` | TEXT | NOT NULL | Nama entitas/klien |
| `periode` | TEXT | NOT NULL | Rentang waktu pengerjaan teknis |
| `deskripsi` | TEXT | NOT NULL | Rincian implementasi sistem |
| `urutan` | INTEGER | | Prioritas tata letak UI |
| `metadata` | TEXT | | Penyimpanan properti ekstra (JSON) |

**Tabel: `sertifikat`**
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | ULID |
| `nama` | TEXT | NOT NULL | Judul sertifikasi IT |
| `penerbit` | TEXT | NOT NULL | Lembaga penerbit kredensial |
| `tahun` | TEXT | NOT NULL | Waktu penerbitan |
| `url_kredensial` | TEXT | | Tautan validasi eksternal |
| `urutan` | INTEGER | | Prioritas tata letak UI |

### 2.3 Domain Taksonomi & Relasi
**Tabel: `tag`** (ID, nama, slug) dan **Tabel: `proyek_tag`** (proyek_id, tag_id).
Sistem menggunakan *Junction Table* (`proyek_tag`) untuk relasi *Many-to-Many* antara proyek dan teknologi (framework, bahasa pemrograman). Kueri diwajibkan menggunakan *eager-loading* atau `JOIN` untuk mitigasi anomali *N+1 Query Problem*.

### 2.4 Domain Logika Pakar & Konfigurasi
**Tabel: `aturan_pakar`**
| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | ULID |
| `kondisi_tag` | TEXT | NOT NULL | Parameter premis komputasi (IF) |
| `rekomendasi` | TEXT | NOT NULL | Parameter konklusi (THEN) |
| `bobot` | INTEGER | | Parameter probabilitas / kalkulasi *certainty factor* |
| `aktif` | INTEGER | | Toggle eksekusi *rule* (0/1) |

**Tabel: `pengaturan_situs`** (kunci, nilai, grup) dan **Tabel: `admins`** (Data pengguna *legacy*).

---

## CHAPTER III: INTELLIGENCE SYSTEMS (AI & EXPERT SYSTEM)

Modul ini terisolasi di dalam direktori `src/lib/sistem-pakar/` untuk memisahkan algoritma berat dari logika standar CRUD.

### 3.1 AI Service Logic & Chatbot API
Dikelola melalui `AIService.ts` dan diakses publik via `/api/chatbot.ts`.
*   **Integrasi Model**: Menggunakan API pemrosesan bahasa alami (contoh: Llama 3 via Groq) untuk tugas generatif.
*   **Contextual Grounding (RAG)**: Objek *System Prompt* disuntikkan secara dinamis dengan hasil kueri D1 secara *real-time*, memastikan AI merespons metrik dan portofolio proyek teraktual.

### 3.2 Modul Analisis Sistem Pakar
Menggunakan pendekatan *Forward Chaining* dan matriks evaluasi deterministik. Terdapat beberapa kelas penganalisis khusus:
1.  **`AICapabilityAssessor.ts`**: Mengevaluasi kompleksitas integrasi kecerdasan buatan dalam sebuah proyek.
2.  **`CareerPathAdvisor.ts`**: Menghubungkan *tech stack* dari tabel `pengalaman` dan `proyek` untuk menghasilkan rekomendasi lintasan karir.
3.  **`TechStackValidator.ts`**: Menganalisis kompatibilitas dan relevansi penggunaan kombinasi teknologi (tag).
4.  **`SEOStrategyEngine.ts`** & **`ToneVoiceAnalyzer.ts`**: Penganalisis kualitas konten dan taksonomi *meta_seo*.
5.  **`ProjectRiskAnalyzer.ts`** & **`InfrastructureBudgeter.ts`**: Evaluator untuk estimasi skalabilitas arsitektur.
*Algoritma penggabungan (Inference Engine) utama dieksekusi melalui `mesin-inferensi.ts`.*

---

## CHAPTER IV: SECURITY, AUTHORIZATION & ADMIN ARCHITECTURE

### 4.1 Isolasi Lapisan (Layout & Middleware)
*   **Separation of Concerns UI**: Halaman publik di-render melalui `LayoutPublic.astro`, sementara CMS menggunakan `LayoutAdmin.astro`.
*   **Middleware Guard**: Berkas `src/middleware.ts` mengintersepsi rute yang mengarah ke `/admin` dan `/api/admin`. Permintaan yang tidak memiliki token sesi tervalidasi akan digagalkan dengan respons `401 Unauthorized` atau di-redirect ke `LayoutAuth.astro` (`/masuk`).

### 4.2 Standarisasi Respons REST API
Pustaka `src/lib/response.ts` menstandarisasi seluruh keluaran HTTP di bawah `/api/admin/*`:
*   **Success Payload**: `{ "success": true, "data": [...], "message": "..." }`
*   **Error Payload**: `{ "success": false, "error": "Diagnostic message", "code": 500 }`

---

## CHAPTER V: INFRASTRUCTURE & DEPLOYMENT PIPELINE

### 5.1 Cloudflare R2 (Asset Pipeline)
Logika manajemen berkas ditangani oleh `src/core/services/R2StorageService.ts`.
*   **Alur Kerja**: Klien meminta *presigned URL* atau mengunggah via rute `/api/admin/assets/upload.ts` (Multipart Form-Data) -> `R2StorageService` mengalihkan bit stream langsung ke *bucket* R2 -> URL pengarah disimpan pada entitas D1. Praktik ini memastikan arsitektur *serverless* tetap ringan tanpa beban *blob*.

### 5.2 Manajemen Migrasi (DDL)
Berkas migrasi SQL pada direktori `migrations/` menjadi *Source of Truth* perubahan skema:
*   `0001_initial` - `0006_seed_admin`: Konstruksi tabel relasional proyek, relasi *junction*, dan administrator awal.
*   `0007_better_auth_schema` - `0009_add_display_username`: Integrasi skema tabel *Better Auth* secara parsial untuk menangani autentikasi modern.
*   `0010_seed_public_settings`: Inisialisasi basis data `pengaturan_situs`.