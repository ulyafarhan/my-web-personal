-- Migration: 0002_add_experience_and_optimizations
-- Created at: 2026-04-27

-- 1. Update pengaturan_situs: Add 'grup' column
ALTER TABLE pengaturan_situs ADD COLUMN grup TEXT DEFAULT 'publik';

-- 2. Update proyek: Add SEO, GEO, AI Tags, and View Count
ALTER TABLE proyek ADD COLUMN meta_seo TEXT; -- JSON
ALTER TABLE proyek ADD COLUMN meta_geo TEXT; -- JSON
ALTER TABLE proyek ADD COLUMN ai_tags TEXT;  -- JSON
ALTER TABLE proyek ADD COLUMN view_count INTEGER DEFAULT 0;

CREATE INDEX idx_proyek_popularity ON proyek(view_count DESC);

-- 3. Create pengalaman table
CREATE TABLE pengalaman (
    id TEXT PRIMARY KEY,
    peran TEXT NOT NULL,
    organisasi TEXT NOT NULL,
    periode TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    urutan INTEGER DEFAULT 0,
    metadata TEXT, -- JSON for GEO/AI
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_pengalaman_updated_at
AFTER UPDATE ON pengalaman
FOR EACH ROW
BEGIN
    UPDATE pengalaman SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 4. Create sertifikat table
CREATE TABLE sertifikat (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    penerbit TEXT NOT NULL,
    tahun TEXT NOT NULL,
    url_kredensial TEXT,
    urutan INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_sertifikat_updated_at
AFTER UPDATE ON sertifikat
FOR EACH ROW
BEGIN
    UPDATE sertifikat SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
