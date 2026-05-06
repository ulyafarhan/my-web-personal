-- Migration: 0001_initial_schema
-- Created at: 2026-04-27

-- 1. admins
CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. pengaturan_situs
CREATE TABLE pengaturan_situs (
    kunci TEXT PRIMARY KEY,
    nilai TEXT NOT NULL
);

-- 3. proyek
CREATE TABLE proyek (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    ringkasan TEXT NOT NULL,
    konten_html TEXT NOT NULL,
    url_gambar_sampul TEXT,
    status_publikasi INTEGER DEFAULT 0,
    dipublikasikan_pada DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proyek_slug ON proyek(slug);
CREATE INDEX idx_proyek_feed ON proyek(status_publikasi, dipublikasikan_pada DESC);

-- 4. tag
CREATE TABLE tag (
    id TEXT PRIMARY KEY,
    nama TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tag_slug ON tag(slug);

-- 5. proyek_tag (Junction table)
CREATE TABLE proyek_tag (
    proyek_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (proyek_id, tag_id),
    FOREIGN KEY (proyek_id) REFERENCES proyek(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

CREATE INDEX idx_proyek_tag_proyek_id ON proyek_tag(proyek_id);
CREATE INDEX idx_proyek_tag_tag_id ON proyek_tag(tag_id);

-- 6. aturan_pakar
CREATE TABLE aturan_pakar (
    id TEXT PRIMARY KEY,
    kondisi_tag TEXT NOT NULL,
    rekomendasi TEXT NOT NULL,
    bobot INTEGER DEFAULT 1,
    aktif INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aturan_pakar_aktif ON aturan_pakar(aktif);

-- Trigger untuk update updated_at (SQLite Specific)
CREATE TRIGGER trg_admins_updated_at
AFTER UPDATE ON admins
FOR EACH ROW
BEGIN
    UPDATE admins SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_proyek_updated_at
AFTER UPDATE ON proyek
FOR EACH ROW
BEGIN
    UPDATE proyek SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_tag_updated_at
AFTER UPDATE ON tag
FOR EACH ROW
BEGIN
    UPDATE tag SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_aturan_pakar_updated_at
AFTER UPDATE ON aturan_pakar
FOR EACH ROW
BEGIN
    UPDATE aturan_pakar SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
