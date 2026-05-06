# KODE ETIK & BATASAN REKAYASA PERANGKAT LUNAK (ENTERPRISE STANDARD)
**Dokumen Standar Arsitektur — my-web-personal**

Di lingkungan kerja tingkat tinggi (*FAANG / Big Tech*), kedisiplinan menulis kode sama pentingnya dengan logika bisnis itu sendiri. Batasan-batasan ini dirancang secara eksklusif untuk mencegah *spaghetti code*, mengurangi utang teknis (*technical debt*), dan memastikan setiap baris kode memiliki siklus hidup yang panjang dan stabil.

---

## 1. Kepatuhan Tipe Data Statis Absolut (Zero `any` Policy)
**Aturan:** Penggunaan tipe data `any` di dalam TypeScript diharamkan secara mutlak, kecuali terpaksa digunakan pada pustaka pihak ketiga yang tidak memiliki *Type Definitions*.
*   **Kenapa Ini Penting:** TypeScript kehilangan fungsinya jika Anda menggunakan `any`. Ini adalah sumber utama *runtime error*.
*   **Implementasi:** 
    *   Wajib mendefinisikan *Interface* atau *Type* (atau DTO - *Data Transfer Object*) untuk setiap *payload request*, *response API*, dan struktur data *database*.
    *   Gunakan tipe `unknown` jika Anda benar-benar tidak tahu data apa yang masuk, lalu lakukan pengecekan tipe (*Type Narrowing*) sebelum memanipulasinya.
    *   Aktifkan `"strict": true` dan `"noImplicitAny": true` di `tsconfig.json`.

## 2. Pemisahan Perhatian yang Tegas (Strict Separation of Concerns)
**Aturan:** Lapisan antarmuka (UI/Astro) tidak boleh mengetahui bagaimana basis data (Cloudflare D1) bekerja, dan sebaliknya.
*   **Kenapa Ini Penting:** Inilah penangkal utama *spaghetti code*. Jika Anda menulis kueri SQL langsung di dalam halaman UI (`.astro` atau `.vue`), sistem tidak bisa diuji dan sangat rapuh terhadap perubahan.
*   **Implementasi (Clean Architecture):**
    *   **Layer UI (`src/pages`)**: Hanya menangani rute, HTML, dan memanggil API/Service.
    *   **Layer Controller (`src/pages/api`)**: Hanya menerima *request*, memvalidasi *payload*, dan memanggil *Service*.
    *   **Layer Service (`src/core/services`)**: Otak bisnis. Algoritma AI, validasi logika, dan sistem pakar berada di sini.
    *   **Layer Repository (`src/core/repositories`)**: Satu-satunya tempat yang diizinkan untuk mengeksekusi kueri D1/SQL atau berbicara dengan penyimpanan R2.

## 3. Pola Pengembalian Awal (Guard Clauses & Early Returns)
**Aturan:** Dilarang keras menggunakan blok `if-else` yang bersarang lebih dari 2 tingkat (*Nested If / Arrow Anti-Pattern*).
*   **Kenapa Ini Penting:** *Nested if* membuat kode terlihat seperti piramida terbalik yang membingungkan. Sangat sulit melacak alur logika ketika *else* berada 50 baris di bawah *if*.
*   **Implementasi:** Evaluasi skenario terburuk atau kondisi tidak valid terlebih dahulu, lalu hentikan fungsi seketika (`return` atau `throw error`).
    ```typescript
    // TIDAK DISARANKAN (Spaghetti Style)
    if (user) {
      if (user.isAdmin) {
         // Lakukan sesuatu
      } else {
         return error("Bukan admin");
      }
    } else {
      return error("Tidak ada user");
    }

    // DIREKOMENDASIKAN (Enterprise Style - Guard Clauses)
    if (!user) return error("Tidak ada user");
    if (!user.isAdmin) return error("Bukan admin");
    
    // Lakukan sesuatu (tanpa indentasi bersarang)
    ```

## 4. Rute API Harus "Bodoh" (Thin Controllers, Fat Services)
**Aturan:** *Controller* (berkas di dalam folder `src/pages/api`) tidak boleh berisi logika bisnis lebih dari 15 baris kode fungsional.
*   **Kenapa Ini Penting:** API *endpoint* hanyalah sebuah pintu. Pintu tidak memproses dokumen; ia hanya memeriksa izin masuk dan meneruskannya ke ruang kerja (*Service*).
*   **Implementasi:** *Endpoint* `/api/chatbot.ts` hanya boleh berisi validasi bahwa `req.body.message` itu ada. Eksekusi pemanggilan Llama 3 dan injeksi konteks RAG harus dilempar ke kelas `AIService.executeChat(message)`.

## 5. Inversi Ketergantungan (Dependency Inversion Principle)
**Aturan:** Layanan tingkat tinggi tidak boleh bergantung pada implementasi tingkat rendah; keduanya harus bergantung pada abstraksi (*Interfaces*).
*   **Kenapa Ini Penting:** Jika besok Anda memutuskan untuk membuang Cloudflare D1 dan pindah ke PostgreSQL AWS, Anda tidak boleh menulis ulang seluruh sistem.
*   **Implementasi:** Terus gunakan struktur `IProyekRepository.ts`. *Service* Anda harus menerima `IProyekRepository`, bukan `D1ProyekRepository` secara spesifik. Ini memungkinkan Anda melakukan *mocking* (data tiruan) saat melakukan *Unit Testing* tanpa menyentuh *database* asli.

## 6. Kekebalan Data (Immutability & Pure Functions)
**Aturan:** Hindari memutasi (mengubah langsung) status objek atau *array* parameter yang diterima oleh sebuah fungsi. Selalu kembalikan salinan baru.
*   **Kenapa Ini Penting:** Di lingkungan komputasi *Edge* asinkron, memutasi objek global atau parameter fungsi dapat memicu kebocoran memori (*memory leaks*) dan *bug side-effect* yang sangat sulit dilacak.
*   **Implementasi:** Hindari `array.push()`, gunakan `[...array, newItem]`. Hindari `Object.assign()` yang memutasi target, gunakan operator *spread* `{ ...obj }`. Gunakan metode fungsional seperti `.map()`, `.filter()`, dan `.reduce()`.

## 7. Sentralisasi Penanganan Kesalahan (Global Error Handling)
**Aturan:** Tidak boleh ada satupun *error* yang lolos tanpa ditangkap (`Unhandled Promise Rejection`), dan tidak boleh mengembalikan teks *error* mentah dari basis data ke antarmuka pengguna.
*   **Kenapa Ini Penting:** Mengekspos *error SQL* atau *Trace Stack* ke peramban pengguna adalah celah keamanan tingkat tinggi.
*   **Implementasi:**
    *   Setiap rute API harus dibungkus dalam *try-catch* tingkat tertinggi.
    *   Gunakan standarisasi di `src/lib/response.ts`.
    *   Jika terjadi *error* internal sistem, *log* ke server (untuk Anda baca) tetapi kembalikan pesan generik ke klien: `{ success: false, error: "Terjadi kesalahan internal server. Silakan coba lagi." }`.

## 8. Anti "Magic Numbers" & Hardcoding (Single Source of Truth)
**Aturan:** Dilarang menulis nilai string atau angka secara langsung (*hardcode*) di dalam logika bisnis yang digunakan berulang kali.
*   **Kenapa Ini Penting:** Jika Anda menulis status publikasi `1` untuk "Published" di 14 file berbeda, dan besok Anda harus mengubahnya menjadi `2`, kegagalan sistem memastikan Anda akan melewatkan 1 file dan menyebabkan sistem *crash*.
*   **Implementasi:** Gunakan `Enum` atau konstan global.
    ```typescript
    // TIDAK DISARANKAN
    if (proyek.status === 1) { ... }

    // DIREKOMENDASIKAN
    export enum ProyekStatus { DRAFT = 0, PUBLISHED = 1 }
    if (proyek.status === ProyekStatus.PUBLISHED) { ... }
    ```

## 9. Komponen Antarmuka Mandiri (Atomic Component-Driven UI)
**Aturan:** Setiap komponen UI Astro atau Vue (tombol, *card*, *modal*) tidak boleh memiliki efek samping (*side effects*) yang bergantung pada konteks luar komponen tersebut.
*   **Kenapa Ini Penting:** Memastikan komponen bisa didaur ulang (*reusable*) di halaman manapun tanpa rusak.
*   **Implementasi:** *Bento Grid Card* pada portofolio Anda harus menerima data melalui `props` (parameter), bukan mengambil (*fetch*) data sendiri ke *database* dari dalam komponen UI. Komponen merender apa yang diberikan kepadanya (Prinsip *Dumb Component*).

## 10. Gatekeeper Otomatisasi (Linting & Formatting CI/CD)
**Aturan:** Komputer yang melakukan validasi kode, bukan manusia. Kode yang kotor tidak boleh masuk ke *branch* utama (*main*).
*   **Kenapa Ini Penting:** Aturan sehebat apa pun akan dilanggar jika hanya mengandalkan ingatan manusia saat lelah di malam hari.
*   **Implementasi:**
    *   Wajib menggunakan **ESLint** dan **Prettier**.
    *   Jika memungkinkan (via Husky atau GitHub Actions), atur agar Anda tidak bisa melakukan *git commit* atau *merge* jika terdapat *TypeScript Error*, tipe `any`, atau format yang tidak sesuai standar.

## 11. Standarisasi Ikonografi Profesional (SVG-First Iconography)
**Aturan:** Dilarang keras menggunakan *icon* bawaan sistem operasi (seperti karakter *emoji* *chat* WhatsApp atau sejenisnya) sebagai representasi visual pada antarmuka pengguna.
*   **Kenapa Ini Penting:** *Emoji* bawaan dirender secara berbeda di setiap sistem operasi (Windows, macOS, Android, iOS), merusak konsistensi *pixel-perfect* desain, dan secara drastis menurunkan kredibilitas serta persepsi profesionalisme platform di mata *Technical Recruiter* dan arsitek sistem lainnya.
*   **Implementasi:**
    *   Wajib menggunakan *Scalable Vector Graphics* (SVG) untuk semua kebutuhan piktogram atau ilustrasi ikonik.
    *   Gunakan pustaka ikon profesional berdesain bersih dan minimalis yang merujuk pada standar industri, seperti Material Design atau pustaka atomik sejenis.
    *   Pastikan pengimplementasian ikon memanfaatkan atribut vektor yang dapat dikontrol via CSS (seperti ukuran, *fill*, dan *stroke*) untuk konsistensi tema (*Dark/Light Mode*).

## 12. Standardisasi Format Logika Bisnis (Single-Function Processing Rule)
**Aturan:** Setiap *Service* di `src/core/services` harus dirancang untuk mengeksekusi satu tugas spesifik (One Function, One Job), menghindari fungsi monolitik yang mencakup berbagai skenario atau validasi tingkat tinggi.
*   **Kenapa Ini Penting:** Memastikan isolasi *error* dan memudahkan penggantian implementasi (*swapping strategy*) sesuai prinsip SOLID. Jika sebuah fungsi menjadi terlalu besar, ia cenderung mencampur logika validasi bisnis (aturan) dengan logika akses data (implementasi), sehingga sulit diuji dan rentan terhadap *side effects*.
*   **Implementasi:**
    *   **Tipe Fungsi yang Diizinkan:** `executeChat(message, options)`, `embedQuery(text)`, `saveToVectorStore(data)`.
    *   **Tipe Fungsi yang Dilarang:** `processAnyChatScenario(input)` yang berisi logika `if (input === 'draft') { saveAsDraft() } else if (input === 'published') { saveAsPublished() }`.
    *   **Pendekatan:** Gunakan *Factory Pattern* atau *Strategy Pattern*. Pisahkan logika "Apa yang harus dilakukan" (Strategy) dari "Bagaimana melakukannya" (Context), sehingga kode tetap modular dan mudah diuji per unit.

## 13. Standardisasi Penskalaan Gambar (Responsive Image Primitives)
**Aturan:** Dilarang memuat satu aset gambar statis untuk berbagai kebutuhan resolusi (Desktop, Tablet, Mobile), kecuali gambar tersebut telah melalui proses rekayasa aset yang terdistribusi.
*   **Kenapa Ini Penting:** Beban *render* halaman meningkat drastis, memperlambat waktu *Time To Interactive* (TTI). Pengiriman aset berukuran Desktop ke perangkat seluler adalah pemborosan bandwidth dan sumber daya pemrosesan pengguna, yang secara langsung merusak metrik Core Web Vitals dan persepsi kecepatan situs.
*   **Implementasi:**
    *   Selalu utamakan penggunaan *Vector Graphics* (SVG) untuk elemen grafis datar dan ikon.
    *   Untuk foto atau gambar kompleks, implementasikan *responsive images* menggunakan atribut `<picture>` atau properti `srcset` dan `sizes` pada tag `<img>`.
    *   Pastikan aset sumber (saat *upload*) telah di-generate ke beberapa *breakpoint* (misal: 300w, 600w, 1200w) untuk memanfaatkan kapabilitas optimasi bawaan seperti Cloudflare Image Resizing (`cdn-cgi/image`).

## 14. Standarisasi Bahasa Penelusuran Semantik (Semantic Query Language)
**Aturan:** Dilarang menggunakan teknik `OR` kualitatif yang mengandalkan variasi sintaksis informal manusia (misalnya: "Pengalaman Kerja OR Pengalaman Profesional") untuk mencari informasi yang merujuk pada entitas fundamental yang sama.
*   **Kenapa Ini Penting:** Mengandalkan variasi bahasa alami meningkatkan latensi *search* dan konsumsi *token* LLM karena menghasilkan *vector embedding* yang tersebar (tidak padat). Dalam konteks arsitektur sistem profesional, ini dianggap sebagai strategi penemuan informasi yang tidak efisien dan boros sumber daya.
*   **Implementasi:**
    *   Identifikasi entitas inti yang ingin dicari (misalnya: "Pengalaman Kerja").
    *   Pastikan entitas tersebut direpresentasikan sebagai *token* tunggal atau *embedding* yang dominan dalam data sumber.
    *   Jika variasi bahasa alami diperlukan (misalnya "React atau JavaScript"), gunakan *Boolean Logic* pada lapisan *vector database query* (misalnya Pinecone Metadata Filter), bukan dengan memperkaya *prompt* teks mentah yang akan dieksekusi oleh model bahasa.

## 15. Standardisasi Penanganan Konkurensi (Optimistic Locking for State Mutation)
**Aturan:** Dilarang memutasi data (misalnya mengubah status proyek) dengan asumsi tidak ada proses lain yang mengubah data tersebut pada saat yang bersamaan.
*   **Kenapa Ini Penting:** Dalam sistem *serverless* yang menangani banyak permintaan secara paralel, celah waktu (*race condition*) sangat mungkin terjadi. Jika dua pengguna (atau dua *request* dari pengguna yang sama) mencoba mengubah status item yang sama secara bersamaan tanpa validasi, data terbaru akan saling menimpa (*overwrite*), menyebabkan inkonsistensi data (misalnya data "Terhapus" namun di basis data statusnya masih "Aktif").
*   **Implementasi:**
    *   Gunakan teknik **Optimistic Locking** dengan menambahkan kolom metadata `_version` (nomor urut revisi) pada tabel database.
    *   **Proses:** Saat mengambil data, ambil juga `_version`. Saat mengirim update, sertakan `_version` yang diminta. Sistem harus memvalidasi: "Apakah `_version` di database masih sama dengan yang saya bawa?"
    *   Jika `_version` berbeda, artinya data sudah diubah oleh proses lain. Sistem harus menolak transaksi (`throw new ConflictError`) dan meminta pengguna memuat ulang data terbaru sebelum mencoba lagi.

## 16. Standardisasi Penanganan Status Fleksibel (Union Type for Publication States)
**Aturan:** Dilarang menggunakan nilai Boolean tunggal (`isPublic`, `isPublished`) atau Enum minimalis untuk merepresentasikan siklus hidup konten yang kompleks (Draf -> Tinjau -> Terbit -> Archive).
*   **Kenapa Ini Penting:** Model mental bisnis modern memerlukan fleksibilitas status yang lebih kaya. Menggunakan Boolean membatasi sistem hanya pada dua keadaan, memaksa developer membuat klasterisasi artifisial (misalnya menggabungkan "Archived" ke dalam "Private") yang secara semantik tidak akurat dan menghambat perluasan fitur di masa depan.
*   **Implementasi:**
    *   Definisikan tipe data menggunakan **Union Types** di TypeScript untuk mencerminkan spektrum status secara eksplisit.
    *   **Contoh Enum yang Direkomendasikan:**
        ```typescript
        export enum PublicationStatus {
          DRAFT = 'draft',
          IN_REVIEW = 'review', // Status transisi formal
          PUBLISHED = 'published',
          ARCHIVED = 'archived' // Status konten non-aktif
        }
        ```
    *   Implementasikan validasi di *Service Layer* yang mencegah transisi ilegal (misalnya dari `ARCHIVED` langsung ke `PUBLISHED` tanpa melalui `DRAFT` atau `IN_REVIEW`), sehingga menjaga integritas *workflow* editorial.

## 17. Standardisasi Isolasi Database dalam Ekosistem AI (Isolated Vector Store Schema)
**Aturan:** Dilarang keras menyimpan konteks non-teks (seperti `image_url` atau data biner) di dalam kolom embedding atau teks sumber pada tabel `vector_store` untuk tujuan semantik.
*   **Kenapa Ini Penting:** Metadata operasional seperti `image_url` atau `file_size` bersifat diskrit dan tidak korelatif dengan makna semantik atau "niat" pertanyaan pengguna. Menginjeksikan data tersebut ke dalam embedding akan mengkontaminasi ruang vektor, menurunkan akurasi retrieval (misalnya pertanyaan "Berapa harga sepatu?" malah mencocokkan dokumen yang punya gambar sepatu tapi membahas harga tanah), dan memboros *token* pemrosesan LLM.
*   **Implementasi:**
    *   Pastikan kolom `vector` hanya menyimpan representasi numerik dari teks murni (misalnya deskripsi proyek).
    *   Semua data pendukung yang bersifat non-tekstual harus disimpan secara terpisah dalam kolom metadata terstruktur (misalnya `metadata JSON` atau kolom khusus `image_url`, `file_size`).
    *   Gunakan fungsi `similarity_search` dengan filter metadata (misalnya `{image_url: null}`) pada lapisan *database query* untuk memastikan LLM hanya memproses konten tekstual yang relevan secara semantik.

## 18. Standardisasi Penanganan Query Semantik di API Layer (Semantic Query Decoupling)
**Aturan:** Dilarang membuat logika pencarian semantik (yang melibatkan `fetchEmbedding` dan `similaritySearch`) langsung di dalam *Controller* atau *Route Handler*.
*   **Kenapa Ini Penting:** Lapisan API (terutama *Cloudflare Functions*) harus bertindak sebagai *request router* dan validasi skema sederhana, bukan sebagai *business logic processor*. Mencampur logika LLM/Vector di sini melanggar prinsip separation of concerns, menyulitkan *unit testing* (karena tidak bisa meng-mock vector store di environment yang ringan), dan berisiko mengekspos kunci API eksternal ke lapisan presentasi.
*   **Implementasi:**
    *   **Controller (Contoh `search.ts`):** Menerima input (`{query: "..."}`), melakukan validasi dasar, lalu mendelegasikannya ke Service. Seharusnya hanya berisi maksimal 10-15 baris kode.
    *   **Service Layer (Contoh `SearchService.ts`):** Bertanggung jawab penuh mengorkestrasi pengambilan embedding, query ke Pinecone, dan formatting hasil. Service ini harus bisa diimpor dan diuji secara independen.
    *   **Pattern:** `Controller -> Service -> Repository (Vector DB)`. Ini memastikan bahwa jika di masa depan Anda ingin mengganti Cloudflare Functions menjadi Edge Workers biasa atau backend Express, Anda hanya perlu mengubah Controller tanpa mengubah logika inti retrieval.

## 19. Standardisasi Penanganan Image Caching di CDN (CDN-First Image Optimization)
**Aturan:** Dilarang mengandalkan optimasi gambar bawaan browser (`<picture>` atau `loading="lazy"`) sebagai satu-satunya strategi pengiriman gambar beresolusi tinggi, terutama untuk halaman yang memiliki metrik Core Web Vitals yang ketat.
*   **Kenapa Ini Penting:** Meskipun `loading="lazy"` penting untuk menghemat bandwidth pengguna, ia tidak menyelesaikan masalah **Largest Contentful Paint (LCP)**. Browser baru akan memuat gambar saat hampir terlihat (menggulir halaman), menyebabkan penundaan visual yang signifikan dan menurunkan skor LCP. Dalam konteks portofolio profesional, LCP yang buruk langsung berdampak negatif pada citra profesionalisme dan SEO.
*   **Implementasi:**
    *   Manfaatkan kapabilitas **Cloudflare Image Resizing** atau layanan CDN sejenis untuk melakukan *transformasi gambar* (penyesuaian lebar, fokus, format) pada lapisan edge.
    *   Gunakan atribut `srcset` yang mengarah ke URL gambar yang sudah dioptimalkan oleh CDN (misalnya: `https://cdn.example.com/images/my-project.jpg?width=400 400w, https://cdn.example.com/images/my-project.jpg?width=800 800w`).
    *   **Aturan Khusus SEO:** Pada halaman utama (Landing Page) dan halaman "Tentang", gunakan `fetchpriority="high"` pada tag gambar utama untuk memberi sinyal kepada browser agar memuatnya terlebih dahulu, memastikan skor LCP tetap prima.

## 20. Standardisasi Penanganan Aset Pihak Ketiga (Third-Party Asset Sanitization)
**Aturan:** Dilarang menyertakan URL aset pihak ketiga (seperti `jsdelivr`, `unpkg`, atau *untrusted CDNs*) di dalam atribut HTML `src` atau `href` tanpa proses *sanitasi* atau *proxy* terlebih dahulu.
*   **Kenapa Ini Penting:** Aset dari *Content Delivery Network* (CDN) pihak ketiga bersifat *immutable* (tidak bisa kita kontrol). Jika penyedia CDN tersebut mengubah konten mereka (misalnya mengganti ikon/library dengan versi berbahaya) atau mengalami *deface*, konten situs Anda akan ikut berubah seketika tanpa peringatan (*supply chain attack*). Selain itu, sumber eksternal sering kali gagal memuat dalam mode *dark mode* jika tidak menggunakan properti `currentColor`.
*   **Implementasi:**
    *   Prioritaskan penggunaan *Icons & Components* yang bersifat *self-hosted* (dihosting di domain Anda sendiri) atau library yang direkomendasikan oleh arsitektur (misalnya Lucide). Jika terpaksa menggunakan CDN eksternal, gunakan *Worker Proxy* (seperti Cloudflare Workers) untuk meng-cache dan mengaudit permintaan, sehingga Anda dapat memblokir atau memodifikasi konten yang mencurigakan di lapisan edge. 