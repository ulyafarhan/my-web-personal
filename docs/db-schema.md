# Database Schema — my-web-personal

## Ringkasan Arsitektur Database
- **Sistem Database**: SQLite (Diimplementasikan di atas Cloudflare D1 / Kompatibel dengan Better Auth)
- **Format Primary Key**: ULID / TEXT (Format standar identifikasi Better Auth dan relasional internal)
- **Total Tabel**: 10 Tabel Relasional

## Pemetaan Domain Entitas (ERD Logis)
Sistem ini memisahkan entitas ke dalam 6 domain utama untuk menjaga integritas data dan pemisahan kekhawatiran (Separation of Concerns):
1. **Domain Autentikasi Modern (Better Auth):** `user`, `session`, `account`, `verification` (Mengelola akses pengguna, sesi, dan integrasi OAuth/kredensial).
2. **Domain Autentikasi Legacy:** `admins` (Menjaga kompatibilitas mundur untuk akun administrator sistem tahap awal).
3. **Domain Konten Portofolio:** `proyek`, `pengalaman`, `sertifikat` (Data rekam jejak teknis, dibatasi mutlak pada disiplin ilmu rekayasa perangkat lunak dan informatika).
4. **Domain Klasifikasi Taksonomi:** `tag`, `proyek_tag` (Sistem relasi Many-to-Many untuk pengelompokan teknologi pada proyek).
5. **Domain Sistem Pakar:** `aturan_pakar` (Penyimpanan basis pengetahuan untuk mesin inferensi kecerdasan buatan).
6. **Domain Konfigurasi:** `pengaturan_situs` (Penyimpanan persisten *Key-Value* untuk variabel global antarmuka publik).

---

## Spesifikasi Skema Tabel

### 1. Domain Autentikasi Modern (Better Auth)

#### Tabel `user`
Menyimpan identitas entitas pengguna utama dalam sistem.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID / CUID |
| `name` | TEXT | NOT NULL | Nama lengkap pengguna |
| `email` | TEXT | UNIQUE, NOT NULL | Alamat surel terdaftar |
| `username` | TEXT | UNIQUE | Nama identifikasi unik |
| `emailVerified` | INTEGER | NOT NULL | Status verifikasi surel (0/1) |
| `image` | TEXT | | URL avatar pengguna |
| `createdAt` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updatedAt` | DATETIME | NOT NULL | Timestamp pembaruan |

#### Tabel `session`
Manajemen token sesi pengguna untuk validasi akses.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Identifier sesi unik |
| `expiresAt` | DATETIME | NOT NULL | Waktu kedaluwarsa sesi |
| `token` | TEXT | UNIQUE, NOT NULL | String token otorisasi |
| `createdAt` | DATETIME | NOT NULL | Timestamp pembuatan sesi |
| `updatedAt` | DATETIME | NOT NULL | Timestamp aktivitas terakhir |
| `ipAddress` | TEXT | | Alamat IPv4/IPv6 klien |
| `userAgent` | TEXT | | String identifikasi peramban/klien |
| `userId` | TEXT | NOT NULL, FK | Relasi ke `user(id)` |

#### Tabel `account`
Menyimpan data otorisasi dari berbagai *provider* (OAuth, kredensial lokal).
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Identifier akun unik |
| `accountId` | TEXT | NOT NULL | ID dari provider eksternal |
| `providerId` | TEXT | NOT NULL | Nama provider (misal: github, google, credential) |
| `userId` | TEXT | NOT NULL, FK | Relasi ke `user(id)` |
| `accessToken` | TEXT | | Token akses OAuth |
| `refreshToken` | TEXT | | Token penyegaran OAuth |
| `idToken` | TEXT | | Identitas token OAuth |
| `accessTokenExpiresAt`| DATETIME | | Kedaluwarsa akses token |
| `refreshTokenExpiresAt`| DATETIME| | Kedaluwarsa penyegaran token |
| `scope` | TEXT | | Cakupan izin (scopes) OAuth |
| `password` | TEXT | | Hash kata sandi untuk provider kredensial lokal |
| `createdAt` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updatedAt` | DATETIME | NOT NULL | Timestamp pembaruan |

#### Tabel `verification`
Token temporal untuk alur verifikasi (lupa sandi, verifikasi surel).
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Identifier token unik |
| `identifier` | TEXT | NOT NULL | Parameter target (misal: surel pengguna) |
| `value` | TEXT | NOT NULL | Nilai token/hash verifikasi |
| `expiresAt` | DATETIME | NOT NULL | Batas waktu kedaluwarsa token |
| `createdAt` | DATETIME | | Timestamp pembuatan |
| `updatedAt` | DATETIME | | Timestamp pembaruan |

---

### 2. Domain Autentikasi Legacy

#### Tabel `admins`
Tabel administrator awal sistem (migrasi sistem lama).
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `username` | TEXT | UNIQUE, NOT NULL| Nama pengguna admin |
| `password_hash` | TEXT | NOT NULL | Hash kata sandi admin (Bcrypt/Argon2) |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

---

### 3. Domain Konfigurasi

#### Tabel `pengaturan_situs`
Penyimpanan parameter sistem secara dinamis tanpa mengubah file `.env`.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `kunci` | TEXT | PK | Identifier parameter (contoh: `site_title`) |
| `nilai` | TEXT | NOT NULL | Nilai konfigurasi |
| `grup` | TEXT | | Kategorisasi pengaturan (Default: 'publik') |

---

### 4. Domain Konten Portofolio

#### Tabel `proyek`
Rekam jejak implementasi rekayasa perangkat lunak, sistem, atau riset IT.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `judul` | TEXT | NOT NULL | Nama perangkat lunak atau infrastruktur |
| `slug` | TEXT | UNIQUE, NOT NULL| URL-friendly string untuk routing |
| `ringkasan` | TEXT | NOT NULL | Abstrak teknis proyek |
| `konten_html` | TEXT | NOT NULL | Rincian komprehensif arsitektur dan algoritma |
| `url_gambar_sampul` | TEXT | | URL aset statis/R2 Bucket |
| `status_publikasi`| INTEGER | | Kontrol visibilitas: 0 (Draft), 1 (Published) |
| `dipublikasikan_pada`| DATETIME| | Timestamp jadwal atau waktu rilis publik |
| `meta_seo` | TEXT | | Metadata optimasi mesin pencari (JSON format) |
| `meta_geo` | TEXT | | Metadata geografis atau lokasional (JSON format) |
| `ai_tags` | TEXT | | Parameter khusus untuk parsing mesin inferensi (JSON) |
| `view_count` | INTEGER | | Analitik metrik tayangan (Default: 0) |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

**Indeks Optimasi `proyek`:**
- `idx_proyek_slug` — Akses komputasi O(1) untuk pencarian berbasis URL.
- `idx_proyek_feed` — Akses cepat untuk query berdasarkan status publikasi.
- `idx_proyek_popularity` — Pengurutan heuristik berdasarkan `view_count`.

#### Tabel `pengalaman`
Dokumentasi karir atau proyek spesifik **hanya untuk bidang rekayasa perangkat lunak, IT, pemrograman, dan infrastruktur**. Sistem akan menolak entri organisasi non-teknis.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `peran` | TEXT | NOT NULL | Jabatan teknis (contoh: Fullstack Engineer, System Analyst) |
| `organisasi` | TEXT | NOT NULL | Nama instansi klien atau perusahaan IT terkait |
| `periode` | TEXT | NOT NULL | Rentang waktu pengerjaan teknis (contoh: Jan 2025 - Mar 2026) |
| `deskripsi` | TEXT | NOT NULL | Rincian implementasi arsitektur, kode, atau manajemen server |
| `urutan` | INTEGER | | Prioritas tata letak pada antarmuka pengguna |
| `metadata` | TEXT | | Penyimpanan struktur tambahan (JSON) |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

#### Tabel `sertifikat`
Validasi formal untuk kompentensi **khusus keilmuan informatika dan sertifikasi teknologi**.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `nama` | TEXT | NOT NULL | Judul sertifikasi teknis keahlian |
| `penerbit` | TEXT | NOT NULL | Institusi penerbit kredensial teknologi |
| `tahun` | TEXT | NOT NULL | Tahun penerbitan atau ekuivalensi |
| `url_kredensial` | TEXT | | Tautan sistem verifikasi sertifikat eksternal |
| `urutan` | INTEGER | | Prioritas tata letak |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

---

### 5. Domain Klasifikasi Taksonomi

#### Tabel `tag`
Inventarisasi bahasa pemrograman, framework, arsitektur, dan ekosistem IT.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `nama` | TEXT | UNIQUE, NOT NULL| Nama instrumen teknologi (contoh: Next.js, Cloudflare D1) |
| `slug` | TEXT | UNIQUE, NOT NULL| URL-friendly string |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

**Indeks Optimasi `tag`:**
- `idx_tag_slug` — Akses filter URL O(1).

#### Tabel `proyek_tag` (Junction Table)
Tabel perantara (Pivot) untuk merepresentasikan relasi Banyak-ke-Banyak antara Proyek dan Teknologi yang digunakan.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `proyek_id` | TEXT | PK, NOT NULL, FK| Referensi foreign key ke `proyek(id)` |
| `tag_id` | TEXT | PK, NOT NULL, FK| Referensi foreign key ke `tag(id)` |

**Indeks Optimasi `proyek_tag`:**
- `idx_proyek_tag_proyek_id` — Optimasi pencarian tag untuk satu proyek.
- `idx_proyek_tag_tag_id` — Optimasi pengumpulan proyek berdasarkan satu tag teknologi.

---

### 6. Domain Sistem Pakar

#### Tabel `aturan_pakar`
Basis Pengetahuan (Knowledge Base) untuk dieksekusi oleh mesin inferensi pada `src/lib/sistem-pakar`.
| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | TEXT | PK, NOT NULL | Format ULID |
| `kondisi_tag` | TEXT | NOT NULL | Konfigurasi logika premis (IF) berupa himpunan tag |
| `rekomendasi` | TEXT | NOT NULL | Konklusi (THEN) yang dihasilkan oleh mesin inferensi |
| `bobot` | INTEGER | | Parameter utilitas untuk kalkulasi *certainty factor* atau bobot prioritas algoritma |
| `aktif` | INTEGER | | Status eksekusi *rule* (1 = Aktif, 0 = Nonaktif). Default 1 |
| `created_at` | DATETIME | NOT NULL | Timestamp pembuatan |
| `updated_at` | DATETIME | NOT NULL | Timestamp pembaruan |

**Indeks Optimasi `aturan_pakar`:**
- `idx_aturan_pakar_aktif` — Optimasi *Query* pemindaian mesin inferensi yang hanya melintasi aturan aktif guna menekan waktu eksekusi.

---

## Analisis Arsitektural dan Relasional

### Mitigasi Relasi Risiko N+1
| Entitas Asal | Tipe Relasi | Objek Tujuan | Protokol Resolusi Wajib Diterapkan |
|---|---|---|---|
| `Proyek` | *belongsToMany* | `Tag` (via `proyek_tag`) | Akses daftar proyek di arsitektur Astro SSR/Layer Service **wajib** menggunakan strategi *eager-loading* (contoh di Drizzle/Kysely dengan klausa `with`) atau melakukan teknik SQL `JOIN` eksplisit. Mengabaikan ini akan memicu ledakan kueri linear berbanding lurus dengan jumlah data (*N+1 Query Problem*). |

### Strategi Analitik (OLAP)
Penggunaan OLAP (*Online Analytical Processing*) tidak diaplikasikan. Database transaksional SQLite (Cloudflare D1) pada sistem monolitik berbasis *Astro Server-Side Rendering* di *Edge Network* terbukti cukup mumpuni untuk menangani beban *read-heavy* yang tipikal terjadi pada infrastruktur situs portofolio dan CMS personal, tanpa memerlukan replikasi data ke gudang data analitik terpisah.