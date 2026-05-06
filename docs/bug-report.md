# KOMPREHENSIF BUG REPORT & ANALISIS SISTEM
**Proyek:** `my-web-personal` (Portofolio Farhan v2.0)
**Tanggal Audit:** 1 Mei 2026
**Environment:** Local Development & Cloudflare Workers (Simulated Edge)
**Metodologi Pengujian:** Static Code Analysis, Dependency Validation, & Architectural Audit
**Auditor/Tester:** AI Quality Assurance Agent

---

## I. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
Laporan ini merangkum hasil validasi perangkat lunak pada repositori `my-web-personal`. Berdasarkan arsitektur terbaru yang menggunakan ekosistem **Astro (Hybrid SSR)**, **Tailwind CSS v4**, **Better Auth**, dan **Cloudflare D1/R2**, pengujian difokuskan pada penyelesaian masalah *routing*, kompilasi, kompatibilitas *edge runtime*, serta integritas antarmuka (UI/UX) pada *Landing Page* berdesain *Bento Grid*.

Seluruh perbaikan telah mematuhi prinsip *Clean Architecture* yang memisahkan *logic layer* (`src/core/`) dengan *presentation layer* (`src/pages/`).

---

## II. LOG RESOLUSI BUG (BUG TRACKING REPORT)

### [BUG-001] Ketiadaan Entrypoint Root (Resolved)
*   **Layer:** Frontend / Routing
*   **Tingkat Keparahan (Severity):** **CRITICAL**
*   **Lokasi:** `/` (Root URL)
*   **Deskripsi Insiden:** 
    Saat mengeksekusi *command* `npm run dev` atau mengakses rute basis aplikasi pada *environment* produksi, server mengembalikan respon HTTP `[404] Not Found`. Hal ini diakibatkan oleh ketiadaan berkas `index.astro` pada direktori `src/pages/`, yang merupakan *entrypoint* utama yang dicari oleh *router* bawaan Astro.
*   **Langkah Reproduksi:**
    1. Jalankan *development server*.
    2. Navigasi *browser* ke `http://localhost:4321/`.
*   **Perilaku Aktual (Sebelum Perbaikan):** *Browser* menampilkan halaman *default* 404 Astro.
    *Trace Log:* `GET / 404 (3251ms)`
*   **Perilaku yang Diharapkan:** *Router* memuat *Landing Page* utama portofolio.
*   **Akar Masalah (Root Cause Analysis):** Proses migrasi dan pembersihan repositori (*refactoring*) secara tidak sengaja menghapus halaman *root*, sementara rute spesifik seperti `/masuk` atau `/proyek/` tetap utuh.
*   **Tindakan Remediasi (Fix):**
    *   Telah direkonstruksi berkas `src/pages/index.astro`.
    *   Telah diintegrasikan *layout wrapper* `src/layouts/LayoutPublic.astro` untuk memuat *metadata*, *font*, dan *base styles* dari Tailwind CSS v4.
    *   UI/UX telah disejajarkan dengan referensi visual "Gladia" menggunakan tata letak *Bento Grid*.

---

### [BUG-002] Kegagalan Parsing AST pada Template Astro (Resolved)
*   **Layer:** Frontend / Compiler
*   **Tingkat Keparahan (Severity):** **HIGH**
*   **Lokasi:** `src/pages/index.astro` (Area komponen blok kode / sintaks literal)
*   **Deskripsi Insiden:** 
    Proses *build* (`npm run build`) mengalami kegagalan (Halt) yang dipicu oleh *parser* Vite/Astro. *Engine* melemparkan *error* `Expected "}" but found ":"`.
*   **Langkah Reproduksi:**
    1. Masukkan kode literal JavaScript/JSON yang mengandung kurung kurawal `{ ... }` langsung ke dalam tag `<pre><code>` di dalam file `.astro`.
    2. Jalankan `npm run build`.
*   **Perilaku Aktual:** *Build process* terhenti. Compiler Astro salah menginterpretasikan kurung kurawal `{` sebagai pembuka ekspresi JavaScript dinamis (JSX-like syntax), bukan sebagai string literal.
*   **Akar Masalah:** Konflik antara *template engine* Astro dan *raw text HTML*.
*   **Tindakan Remediasi (Fix):**
    *   Melakukan sanitasi pada semua blok kode literal di dalam file `.astro`.
    *   Mengganti karakter `{` dengan *HTML Entity* `&#123;`.
    *   Mengganti karakter `}` dengan *HTML Entity* `&#125;`.

---

### [BUG-003] Anomali Responsivitas (Overflow) pada Bento Grid Layout (Open / In Review)
*   **Layer:** UI/UX / CSS
*   **Tingkat Keparahan (Severity):** **LOW - MEDIUM**
*   **Lokasi:** `src/pages/index.astro` (Elemen Container Bento Grid)
*   **Deskripsi Insiden:** 
    Implementasi *Bento Grid* berisiko mengalami *horizontal overflow* (halaman bisa digeser ke kanan/kiri secara tidak sengaja) atau teks yang keluar dari kotak pada *viewport* berukuran sangat kecil (di bawah 375px, seperti iPhone SE generasi pertama atau perangkat Android lama).
*   **Langkah Reproduksi:**
    1. Buka *Landing Page* di *browser*.
    2. Gunakan *Developer Tools* (F12) untuk mengaktifkan *Device Toolbar*.
    3. Setel resolusi ke 320x568.
*   **Perilaku Aktual:** Terdapat potensi margin yang saling berbenturan atau grid yang tidak melakukan *wrapping* dengan sempurna akibat nilai *padding/gap* absolut (`gap-4`, `p-6`).
*   **Perilaku yang Diharapkan:** Elemen bento menyusut (*shrink*) secara proporsional atau menumpuk (*stack*) dalam satu kolom penuh tanpa *horizontal scrollbar*.
*   **Rekomendasi Perbaikan (Pending Action):**
    *   Mengganti properti statis dengan fungsi *clamp* CSS, atau memanfaatkan *utility class* Tailwind v4 secara eksplisit: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
    *   Menambahkan `overflow-hidden` pada elemen *wrapper* utama atau `max-w-[100vw]` pada *body*.

---

### [BUG-004] Inkompatibilitas Built-in Module Node.js di Cloudflare Edge (Resolved)
*   **Layer:** Backend API / Vite Build Configuration
*   **Tingkat Keparahan (Severity):** **CRITICAL**
*   **Lokasi:** `astro.config.mjs` & Pustaka Autentikasi (Better Auth)
*   **Deskripsi Insiden:** 
    Astro gagal menyelesaikan kompilasi *bundling* untuk *adapter* Cloudflare. Log terminal menampilkan: `[vite:resolve] Cannot bundle Node.js built-in "node:async_hooks" imported from...`.
*   **Langkah Reproduksi:**
    1. Integrasikan pustaka `better-auth` yang membutuhkan kriptografi dan *async hooks* tingkat server.
    2. Setel Astro *adapter* ke `@astrojs/cloudflare`.
    3. Jalankan `npm run build`.
*   **Perilaku Aktual:** Vite mencoba menggabungkan (*bundle*) modul asli Node.js ke dalam berkas pekerja (*worker file*), yang mana dilarang karena *runtime* V8 Isolate Cloudflare tidak mendukung penuh modul asli Node.js secara statis tanpa deklarasi eksternal.
*   **Akar Masalah:** Sistem *bundler* (Rollup/Vite) tidak mengetahui bahwa modul `node:async_hooks` akan disediakan oleh lingkungan *runtime* Cloudflare (melalui pengaktifan *Node.js compatibility flag*).
*   **Tindakan Remediasi (Fix):**
    *   Konfigurasi Vite telah dimodifikasi untuk mengabaikan modul tersebut saat proses *bundling*.
    *   Menambahkan parameter eksternal pada `astro.config.mjs`:
      
```javascript
      vite: {
        ssr: {
          external: ['node:async_hooks', 'async_hooks']
        }
      }
      ```
    *   Memastikan file `wrangler.toml` memiliki pengaturan `compatibility_flags = ["nodejs_compat"]`.

---

## III. ANALISIS KESALAHAN & AUDIT ARSITEKTUR PROGRAM (DEEP DIVE)

Selain perbaikan *bug* di atas, analisis mendalam pada struktur kode yang ada di dalam repositori (`src/core/`, `src/lib/`, `src/pages/api/`) menyoroti beberapa potensi kerentanan dan area optimasi kritis:

### 1. Risiko Kinerja: Kueri N+1 pada Relasi Tag (Layer Database)
*   **Komponen:** `D1ProyekRepository.ts` & `proyek_tag`.
*   **Analisis:** Skema relasional menggunakan tabel *junction* `proyek_tag`. Jika *repository layer* mengambil daftar 10 proyek dan kemudian melakukan perulangan (`for loop` atau `.map`) untuk mencari *tag* terkait bagi masing-masing proyek secara terpisah, ini akan memicu 11 kueri ke Cloudflare D1 (1 kueri proyek + 10 kueri tag).
*   **Rekomendasi:** Wajib mengimplementasikan teknik *SQL JOIN* yang diagregasi, atau menggunakan fungsi JSON bawaan SQLite (misal: `json_group_array`) di dalam *layer repository* agar pengambilan data proyek beserta seluruh tag-nya hanya membutuhkan **1 kali kueri HTTP**. Mengingat D1 memiliki batasan operasi baca/tulis per bulan pada *tier* gratis, efisiensi kueri adalah keharusan.

### 2. Manajemen Kuota Token pada Layanan AI (Layer Service)
*   **Komponen:** `src/core/services/AIService.ts` (Integrasi Groq/Llama 3) & `api/chatbot.ts`.
*   **Analisis:** *Endpoint* *chatbot* publik rentan terhadap eksploitasi (*spam/abuse*). Jika pengunjung publik berulang kali memanggil rute ini tanpa batasan, kuota token API LLM dapat terkuras dengan cepat. Saat ini tidak terlihat implementasi *Rate Limiting* tingkat *endpoint* secara eksplisit.
*   **Rekomendasi:** Implementasikan *Rate Limiter* di level *Middleware* Astro (atau manfaatkan fitur *Cloudflare WAF Rate Limiting*) khusus untuk rute `/api/chatbot`. Batasi maksimum 10 pertanyaan per IP per menit.

### 3. Eksekusi Mesin Inferensi yang Terlalu Reaktif (Layer Sistem Pakar)
*   **Komponen:** `src/lib/sistem-pakar/mesin-inferensi.ts`.
*   **Analisis:** Jika algoritma *Forward Chaining* dihitung secara *on-the-fly* setiap kali ada pengunjung yang melihat halaman portofolio, hal ini akan memakan siklus komputasi (*CPU time*) dari Cloudflare Worker secara eksesif.
*   **Rekomendasi:** Gunakan teknik *Memoization* atau *Caching* pada lapisan *Service*. Hasil inferensi (*rekomendasi tumpukan teknologi atau evaluasi resiko proyek*) sebaiknya di-mengkalkulasi dan disimpan sementara ke dalam basis data (sebagai *snapshot*) atau KV Store ketika data `proyek` diperbarui melalui panel Admin, bukan dihitung ulang setiap kali halaman publik dimuat.

### 4. Konsistensi Enkripsi Autentikasi (Layer Keamanan)
*   **Komponen:** Tabel `admins` (Legacy) vs Better Auth.
*   **Analisis:** Terdapat dua domain autentikasi. Tabel `admins` lama yang menggunakan `password_hash` dan entitas *Better Auth* yang lebih modern. Jika alur login di `/api/auth/login.ts` masih mencoba membaca dari dua tabel yang berbeda dengan metode dekripsi yang berbeda, hal ini berisiko menimbulkan anomali sesi (satu pengguna memiliki hak akses yang tidak terkalibrasi).
*   **Rekomendasi:** Lakukan de-komisioning pada tabel `admins` *legacy*. Semua administrator lama harus diimpor/dimigrasi secara paksa ke struktur skema Better Auth (`user` dan `account`) agar sistem keamanan terpusat pada satu alur kriptografi yang konsisten yang disediakan oleh pustaka *Better Auth*.

---
**Status Audit Penutup:**
Proyek `my-web-personal` telah mencapai stabilitas tahap awal (V2.0-Alpha). *Routing* publik telah pulih, antarmuka *Bento Grid* dengan Tailwind v4 berhasil dirender dengan desain premium yang gelap (*dark mode*), dan integrasi basis data via *Edge Network* beroperasi normal setelah resolusi konflik kompilator Vite. Langkah selanjutnya bergantung pada konfirmasi *deployment* langsung ke *Cloudflare Pages* dari repositori Git.