# REKOMENDASI DAN CETAK BIRU OPTIMASI SISTEM
**Dokumen Arsitektur Lanjutan — my-web-personal v3.0 Roadmap**

Dokumen ini memaparkan rekomendasi teknis strategis untuk mengeskalasi infrastruktur web portofolio dari fase fungsional (V2.0) menuju fase *High-Performance & Fault-Tolerant* (V3.0). Semua rekomendasi dirancang untuk ekosistem Astro (Hybrid SSR), Cloudflare Workers/Pages, Cloudflare D1, dan Cloudflare R2.

---

## BAB I: OPTIMASI KINERJA EKSTRIM DAN MANAJEMEN DATA

### 1.1. Resolusi Bottleneck Kueri Database (Mitigasi N+1)
Pada arsitektur saat ini, skema *Junction Table* (`proyek_tag`) rentan memicu masalah *N+1 Query* jika *Layer Repository* dieksekusi melalui perulangan iteratif.
*   **Solusi:** Implementasi agregasi SQL tingkat basis data menggunakan fungsi JSON bawaan SQLite.
*   **Teknis Pelaksanaan:** Pada `D1ProyekRepository.ts`, hindari kueri terpisah untuk mengambil *tag*. Gunakan `json_group_array()` dan `json_object()` untuk menggabungkan relasi secara internal di dalam komputasi mesin D1, mengembalikan struktur data bersarang (nested) hanya dengan 1 kali transmisi HTTP.
*   **Dampak:** Mereduksi *round-trip time* (RTT) antara Cloudflare Worker dan D1 node hingga 90% pada rute indeks halaman publik.

### 1.2. Implementasi Multi-Tier Edge Caching
Karena sistem berjalan di atas Astro SSR hibrida, halaman tidak dirender secara statis (*pre-rendered*). Hal ini mengonsumsi waktu komputasi (*CPU time*) Workers untuk setiap kunjungan.
*   **Solusi:** Penerapan *Stale-While-Revalidate* (SWR) pada lapisan HTTP dan *Data Loader Caching* pada lapisan aplikasi.
*   **Teknis Pelaksanaan:**
    1.  Modifikasi injeksi *Header* respons pada *Middleware* atau *Controller* untuk halaman publik: `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.
    2.  Instruksi ini akan memaksa *Cloudflare Edge Nodes* (CDN) menyajikan versi *cache* instan kepada pengguna umum, sementara Worker memperbarui data secara asinkron di latar belakang.
*   **Dampak:** Penurunan latensi *Time to First Byte* (TTFB) dari ~300ms menjadi ~15ms untuk lalu lintas publik global.

### 1.3. Pipeline Optimasi Aset Visual (Image Resizing)
Penyajian gambar kover proyek langsung dari *bucket* R2 tanpa kompresi akan memicu degradasi skor *Largest Contentful Paint* (LCP).
*   **Solusi:** Integrasi *Cloudflare Image Resizing* terotentikasi di depan R2.
*   **Teknis Pelaksanaan:** Modifikasi `R2StorageService.ts` untuk tidak hanya mengembalikan tautan objek mentah, tetapi menyematkan parameter transformasi URL (`/cdn-cgi/image/width=800,format=avif,quality=85/url-gambar`).
*   **Dampak:** Mengonversi representasi *byte* gambar menjadi format AVIF atau WebP generasi terbaru secara dinamis, menghemat *bandwidth* hingga 70%.

---

## BAB II: SKALABILITAS DAN FAULT TOLERANCE (TOLERANSI KESALAHAN)

### 2.1. Pola Circuit Breaker untuk Layanan AI (LLM)
Modul chatbot dan analis sistem pakar bergantung pada ketersediaan API pihak ketiga (Groq / Llama 3). Jika *provider* mengalami pemadaman (outage) atau sistem terkena limitasi tarif (*rate limit* 429), halaman portofolio dapat membeku atau memunculkan *error* 500.
*   **Solusi:** Implementasi *Circuit Breaker Pattern* pada `AIService.ts`.
*   **Teknis Pelaksanaan:**
    1.  Bungkus panggilan API LLM dengan mekanisme pelacakan kegagalan beruntun.
    2.  Jika rasio kegagalan melewati ambang batas (misal: 3 kali gagal berturut-turut), "sirkuit" akan terbuka (*Open State*).
    3.  Aplikasi akan mengembalikan respons *Graceful Degradation* statis ("Sistem AI sedang menjalani pemeliharaan, silakan jelajahi portofolio secara manual") tanpa memblokir perenderan halaman utama.

### 2.2. Strategi Retri Database dengan Eksponensial (Exponential Backoff)
Lingkungan komputasi terdistribusi (Edge) rentan terhadap masalah koneksi mikro (micro-drops) saat menghubungi *node* D1.
*   **Solusi:** Pembungkus *wrapper* pada antarmuka *Repository*.
*   **Teknis Pelaksanaan:** Tambahkan algoritma percoba-ulang (retry) dengan waktu tunggu eksponensial (misal: 100ms, 200ms, 400ms) untuk setiap *Promise* kueri SQL yang mengembalikan *error* konektivitas (seperti *D1_ERROR* atau *network timeout*).

---

## BAB III: PEMISAHAN ARSITEKTUR DAN OBSERVABILITAS

### 3.1. Pemisahan Workers (Micro-frontend Concept)
Walaupun Astro sangat mumpuni sebagai *Monolith*, menggabungkan rute komputasi berat (AI) dengan rute antarmuka publik pada satu entitas pekerja membagi alokasi memori secara tidak efisien.
*   **Solusi:** Ekstraksi lapisan layanan cerdas ke dalam *Cloudflare Worker* sekunder.
*   **Teknis Pelaksanaan:**
    1.  Pindahkan logika `src/lib/sistem-pakar` dan `/api/chatbot` ke repositori atau ruang kerja (*workspace*) terpisah yang dideploy sebagai API Worker Murni (misal: `api.ulyafarhan.my.id`).
    2.  *Frontend* Astro (`ulyafarhan.my.id`) hanya bertindak sebagai konsumen (*consumer*) dari *Service Worker* ini.
*   **Dampak:** Isolasi kegagalan (*Failure Isolation*). *Crash* pada komputasi LLM tidak akan mematikan ketersediaan antarmuka *Landing Page*.

### 3.2. Implementasi Sistem Telemetri (Observability)
Saat ini sistem melakukan pelaporan *bug* atau *error* secara buta (*blind spot*), menyulitkan proses diagnosis asinkron.
*   **Solusi:** Integrasi *Application Performance Monitoring* (APM) ringan.
*   **Teknis Pelaksanaan:** 
    1. Menggunakan pustaka *Sentry for Cloudflare Workers* atau *OpenTelemetry* minimalis.
    2. Cegat (intercept) semua tangkapan *error* pada file `src/middleware.ts` untuk dicatat ke sistem eksternal beserta rekaman *trace ID*.
    3. Perekaman telemetri dibatasi hanya untuk lingkungan *Production*.

---

## BAB IV: EVOLUSI SISTEM PAKAR DAN KECERDASAN BUATAN

### 4.1. Migrasi dari Keyword ke Semantic Search (Cloudflare Vectorize)
Pencarian atau penalaran proyek saat ini bergantung pada tag statis yang di-pindah secara manual oleh admin.
*   **Solusi:** Implementasi *Retrieval-Augmented Generation* (RAG) berbasis pencarian vektor.
*   **Teknis Pelaksanaan:**
    1.  Setiap kali proyek baru disimpan, *hook* atau *trigger* di D1 akan mengirim teks *konten_html* ke model *Embedding* (misal: *BGE-m3* via Cloudflare AI).
    2.  Vektor yang dihasilkan disimpan ke dalam layanan **Cloudflare Vectorize**.
    3.  Saat pengunjung bertanya pada *Chatbot*, input diproses menjadi vektor untuk mencari proksimitas kedekatan (Cosign Similarity) dengan proyek yang ada. Ini memastikan AI merespons berdasarkan pemahaman kontekstual kode Anda, bukan sekadar tag pencocokan string.

### 4.2. Memoization dan Caching Basis Inferensi
Eksekusi fungsi `mesin-inferensi.ts` secara kontinu setiap kali sesi admin memuat halaman adalah pemborosan komputasi.
*   **Solusi:** Caching state persisten berbasis nilai biner.
*   **Teknis Pelaksanaan:** Simpan kalkulasi hasil *TechStackValidator* dan *ProjectRiskAnalyzer* pada kolom khusus (sebagai JSON *cache*) di D1. Analisis hanya dihitung ulang apabila ada entri baru pada tabel `pengalaman` atau perubahan atribut `proyek`.

---

## BAB V: OTOMATISASI REKAYASA PERANGKAT LUNAK (CI/CD)

### 5.1. Continuous Integration & Unit Testing Pipeline
Ketiadaan penjaminan mutu otomatis (QA) meningkatkan risiko regresi setiap kali struktur API dirombak.
*   **Solusi:** Integrasi GitHub Actions dengan Vitest.
*   **Teknis Pelaksanaan:**
    1.  Tulis skrip unit pengujian murni untuk setiap file dalam direktori `src/core/services/` dan `src/lib/sistem-pakar/` menggunakan data tiruan (Mock/Stub D1).
    2.  Konfigurasi `.github/workflows/main.yml` untuk memblokir *merge* ke cabang utama (main) apabila pengujian struktural atau tipe TypeScript (tsc) gagal.

### 5.2. E2E (End-to-End) Testing pada Antarmuka Publik
Untuk memastikan *Bento Grid* dan antarmuka responsif tidak rusak akibat pembaruan versi Tailwind v4.
*   **Teknis Pelaksanaan:** Gunakan Playwright untuk merender halaman secara *headless*, memastikan status rute `/` selalu mengembalikan kode HTTP 200, dan seluruh komponen visual terbebas dari *horizontal overflow* (WCAG validation).

---

## KESIMPULAN STRATEGIS
Evolusi menuju arsitektur yang tertera pada *rekomendasi.md* ini akan mentransformasi repositori Anda dari sekadar sistem manajemen konten (CMS) personal menjadi instrumen peraga kredibilitas rekayasa perangkat lunak. Prioritas eksekusi pertama harus difokuskan pada **Bab I (Resolusi Bottleneck)** dan **Bab II (Circuit Breaker)** guna memastikan fondasi sistem solid dan tahan banting sebelum berekspansi ke fitur pencarian berbasis vektor.