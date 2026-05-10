# DOKUMENTASI TEKNIS SISTEM: ADVANCED PERSONAL PORTFOLIO & EXPERT SYSTEM

## 1. Deskripsi Sistem
Sistem ini merupakan platform portofolio digital tingkat lanjut yang dirancang khusus untuk mempublikasikan identitas profesional, pencapaian karier, dan katalog proyek. Lebih dari sekadar profil statis, sistem ini dibangun dengan mengintegrasikan mesin **Sistem Pakar (Expert System)** dan **Kecerdasan Buatan (AI Chatbot)**, serta dibekali dengan modul Sistem Manajemen Konten (CMS) kustom secara tertutup pada sisi administratif.

Sistem dirancang berorientasi pada kinerja tinggi dan arsitektur *serverless*, berfokus pada rendering cepat, interaktivitas visual tingkat tinggi (seperti simulasi *fluid WebGL*), dan tata kelola data yang aman.

## 2. Arsitektur dan Tumpukan Teknologi (Tech Stack)
Aplikasi ini menerapkan pola arsitektur *Clean Architecture* pada logika *backend* (menggunakan pemisahan *Models, DTOs, Repositories, Services, dan Controllers*) di dalam kerangka kerja *full-stack* modern:

▪ **Kerangka Kerja Utama:** Astro.js (Mode SSR / Server-Side Rendering) untuk menjembatani pembuatan antarmuka statis secepat kilat dengan kapabilitas rute API dinamis.
▪ **Antarmuka & Desain:** Tailwind CSS dipadukan dengan komponen reaktif Vue.js (pada elemen spesifik) dan pustaka animasi kustom.
▪ **Basis Data Relasional:** Cloudflare D1 (Sistem basis data *serverless* berbasis SQLite), dikelola menggunakan berkas migrasi SQL statis.
▪ **Penyimpanan Objek (Storage):** Cloudflare R2 Storage untuk menampung aset statis, dokumen sertifikat, dan media gambar proyek.
▪ **Mesin Kecerdasan Buatan:** Ekosistem Cloudflare Workers AI dan layanan eksternal (terangkum dalam modul `VectorService` dan `AIService`).
▪ **Penyebaran (Deployment) & CI/CD:** Terintegrasi secara langsung dengan infrastruktur Cloudflare Pages via GitHub Actions (`deploy.yml`) dan skrip PowerShell (`deploy.ps1`).

## 3. Fitur Utama Sistem
Berdasarkan struktur kode dan abstraksi basis data, sistem ini dibagi menjadi dua area antarmuka dengan kapabilitas sebagai berikut:

### A. Modul Publik (Public Portal)
❖ **Beranda Interaktif (Hero & Bento Grid):** Pendaratan visual yang kuat dengan dukungan simulasi partikel latar belakang (`Fluid/WebGL`) dan kursor interaktif (`SplashCursor`).
❖ **Katalog Proyek Terstruktur:** Etalase pameran karya (`ProjectShowcase`) yang menampilkan detail teknologi, tangkapan layar, dan metrik kinerja proyek.
❖ **Linimasa Karier & Pendidikan:** Komponen visualisasi interaktif untuk menelusuri rekam jejak pengalaman (`ExperienceFlow`) dan repositori kredensial sertifikasi.
❖ **Grafik Keahlian (Skill Analytics):** Menampilkan pemetaan kompetensi teknis melalui bagan dan indikator progres secara visual.
❖ **AI Chatbot:** Asisten virtual interaktif (`ChatbotButton`) yang mampu menjawab pertanyaan pengunjung mengenai profil, proyek, atau keahlian pemilik portofolio secara spesifik.

### B. Modul Tata Kelola (Custom Admin Panel)
Kawasan terotorisasi (`/admin`) yang sepenuhnya dibangun secara mandiri untuk mengelola *database* tanpa bergantung pada CMS eksternal.
❖ **Manajemen Akses & Keamanan:** Sistem masuk (*Login*) aman menggunakan metode berbasis Sesi (*Cookie/Session Based*) yang dilindungi oleh *Middleware* (`AuthMiddleware.ts`).
❖ **Manajemen Proyek Dinamis:** Mengoperasikan skema basis data `proyek`. Dilengkapi dengan integrasi penyunting teks tingkat lanjut (`tiptap-editor.ts`) untuk mendeskripsikan studi kasus proyek.
❖ **Manajemen Riwayat Profil:** Modul operasi CRUD (*Create, Read, Update, Delete*) terpisah untuk entitas Keahlian, Pengalaman, dan Sertifikat.
❖ **Manajemen Pengaturan Situs (Site Settings):** Fasilitas untuk mengubah profil SEO, nama situs, kontak, tanpa perlu melakukan perubahan variabel *environment* atau kode sumber.
❖ **Pusat Aset Cloudflare R2:** Orkestrasi pengunggahan gambar atau dokumen secara aman langsung menuju *bucket* Cloudflare R2 (`R2StorageService.ts`).
❖ **Dasbor Metrik Aktivitas:** Ringkasan analitik internal dan riwayat aksi pengelola web (`AnalyticsService.ts`).

### C. Mesin Sistem Pakar (Sistem Pakar Tersembunyi)
Sistem memiliki otak analitik kustom di direktori `src/lib/sistem-pakar/` yang berisi modul evaluator berbasis aturan (Rule-based) dan AI:
▪ *AICapabilityAssessor*, *CareerPathAdvisor*, *ConversionFunnelEngine*, *ProjectRiskAnalyzer*, *SEOStrategyEngine*, dan *TechStackValidator*.
Fungsionalitas ini berpotensi digunakan untuk menganalisis input proyek, meninjau metrik situs, atau memberikan rekayasa respons intelijen terhadap pengunjung.

## 4. Bagaimana Sistem Bekerja (Alur Eksekusi)

1. **Siklus Permintaan Klien (Client Request):**
   * Pengunjung memuat halaman utama. Astro merender halaman secara SSR di atas peladen *Cloudflare Workers*.
   * Skrip WebGL memicu animasi grafis tingkat tinggi sepenuhnya dari sisi peramban klien tanpa membebani server.
2. **Siklus Operasi Data Administrasi:**
   * Saat admin membuat entri proyek baru, form mengirimkan *payload* melalui *REST API* (`/api/admin/proyek`).
   * Rute API menerima data, memvalidasi dengan struktur `ProyekDTO.ts`.
   * *Controller* memanggil logika bisnis di `ProyekService.ts`.
   * Layanan menginstruksikan `D1ProyekRepository.ts` untuk mengeksekusi sintaks *SQL Binding* dan melakukan komit (penyimpanan) ke dalam *database* Cloudflare D1.
3. **Siklus Manajemen Media:**
   * Jika ada unggahan gambar, klien akan meminta URL pradesain (Presigned URL) atau mengirim ke rute *Upload Asset*.
   * Peladen memfasilitasi injeksi biner berkas ke dalam penyimpanan Cloudflare R2, kemudian mengembalikan tautan publik statis untuk disimpan pada basis data D1.

## 5. Struktur Direktori Utama
Pendekatan pengorganisasian repositori diatur sangat modular:
* `.github/` & `deploy.ps1` : Orkestrasi penerapan berkelanjutan (CI/CD).
* `docs/` : Rekaman dokumen arsitektur historis, kontrak API, dan pedoman.
* `migrations/` : Kumpulan berkas skema *Database SQL* untuk Cloudflare D1.
* `src/components/` : Modul antar-muka (*UI Components*), dipisah menjadi area `admin`, `public`, dan komponen desain sistem dasar (`ui`).
* `src/core/` : Pusat logika *backend*. Memisahkan kendali ke dalam *Controllers*, *DTOs* (Data Transfer Object), *Middleware*, *Models*, *Repositories*, dan *Services*.
* `src/lib/` : Pustaka fungsional spesifik, mencakup fungsi animasi antarmuka (`bento-animations.ts`, shader WebGL), *helper* autentikasi, serta seluruh arsitektur **Sistem Pakar**.
* `src/pages/` : Pemetaan perutean HTTP (*File-based routing*). Direktori `api` dikhususkan untuk *endpoint* fungsional *backend*, sementara direktori lain untuk representasi halaman HTML.
* `astro.config.mjs` & `wrangler.toml` : Inti konfigurasi lingkungan peladen kerangka kerja dan parameter instruksi Cloudflare.

## 6. Panduan Instalasi dan Pengembangan Lokal
Berikut prosedur pengaturan lingkungan lokal untuk teknisi perangkat lunak:

**Prasyarat Lingkungan:**
* Node.js versi 18.x atau mutakhir.
* Akun Cloudflare (untuk simulasi lingkungan *Wrangler*).

**Langkah Instalasi:**
1. Kloning (*clone*) repositori ke dalam penyimpanan lokal komputer.
2. Lakukan duplikasi berkas konfigurasi *environment*:
   `cp .env.example .env`
3. Lengkapi variabel kredensial autentikasi dan integrasi di dalam berkas `.env`.
4. Eksekusi pengunduhan dependensi modul NPM:
   `npm install`
5. Inisialisasi basis data lokal menggunakan layanan CLI Wrangler untuk D1 (merujuk pada berkas SQL di dalam direktori `migrations`):
   `npx wrangler d1 migrations apply my-web-personal-db --local`
6. Nyalakan layanan peladen eksperimental lokal:
   `npm run dev`
7. Sistem akan mengekspos aplikasi pada proksi lokal, umumnya di alamat `http://localhost:4321`.

## 7. Rencana Pengembangan Berikutnya (Roadmap)
Berdasarkan tinjauan komprehensif kapabilitas sistem terkini, rekomendasi arah pengembangan iterasi berikutnya difokuskan pada:

➢ **Ekspansi Sistem Pakar:** Memigrasikan luaran logika statis dari `ProjectRiskAnalyzer` dan `TechStackValidator` agar direpresentasikan langsung ke dalam dasbor analitik visual Admin, membantu meninjau rasio keberhasilan proyek portofolio secara komputasional.
➢ **Implementasi Redis / Cache Lapisan Akses Data:** Menerapkan arsitektur *Caching Layer* tingkat lanjutan (seperti Cloudflare KV) untuk permintaan *Read-Heavy* (seperti profil pengunjung publik) guna memangkas latensi latensi koneksi *database* D1.
➢ **Integrasi Pelokalan Berbasis Konteks (i18n):** Menyematkan arsitektur multilinkual dinamis (Misal: Pemetaan otomatis bahasa Inggris dan Indonesia) pada *frontend* publik yang deteksinya didasarkan pada zona IP pengunjung geografis.
➢ **Optimalisasi Profil Kinerja Peramban Gawai (Mobile WebGL):** Memodifikasi sistem pemuatan modul *Fluid Shaders WebGL* agar bersifat *Lazy Load* atau menyesuaikan skala resolusi render secara cerdas terhadap perangkat seluler berspesifikasi rendah untuk mencegah disipasi baterai.
